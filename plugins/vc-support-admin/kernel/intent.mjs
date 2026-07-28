// Kernel — 자연어 Intent Router.
// 사용자가 Intent 이름을 입력하지 않는다. 발화에서 판정하고, 모호하면 확인 질문 1회만 한다.

export const INTENT = {
  FUND_STATUS: "get_fund_process_status",
  FIELDWORK_EVIDENCE: "inspect_fieldwork_evidence",
  NOTION_PREVIEW: "build_notion_preview",
  MANAGER_UPDATE: "build_manager_update",
  CLARIFY: "clarification_required",
  UNSUPPORTED: "unsupported_process"
};

export const INTENT_LABEL = {
  [INTENT.FUND_STATUS]: "조합별 업무상태 조회",
  [INTENT.FIELDWORK_EVIDENCE]: "외근 산출물 검토",
  [INTENT.NOTION_PREVIEW]: "Notion 변경 Preview 생성",
  [INTENT.MANAGER_UPDATE]: "매니저 공유문 생성"
};

// strong=3, weak=1. weak는 같은 Intent에 strong이 하나도 없을 때만 센다.
const SIGNALS = {
  [INTENT.FUND_STATUS]: {
    strong: ["어디까지", "진행됐", "진행 됐", "진행상황", "진행 상황", "업무상태", "업무 상태",
      "진행상태", "진행 상태", "현재 상태", "현황", "다음 할 일", "다음 업무", "현재 actor", "담당이 누구"],
    weak: ["상태", "진행", "알려줘", "어때"]
  },
  [INTENT.FIELDWORK_EVIDENCE]: {
    strong: ["외근", "산출물", "폴더", "파일", "증빙", "스캔본", "결과물 정리"],
    weak: ["확인해", "정리해", "들어온"]
  },
  [INTENT.NOTION_PREVIEW]: {
    strong: ["노션", "notion", "변경안", "변경 안", "프리뷰", "preview", "바꿔야", "바꾸면",
      "반영안", "수정안", "변경 preview"],
    weak: ["변경", "수정", "반영"]
  },
  [INTENT.MANAGER_UPDATE]: {
    strong: ["공유할", "공유문", "공유 문구", "슬랙", "slack", "메시지로", "메시지 로",
      "전달할 문구", "문구로", "보고용", "보고 문구"],
    weak: ["매니저", "담당자", "공유", "보고"]
  }
};

const norm = (s) => String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim();

export function scoreIntents(userMessage) {
  const t = norm(userMessage);
  const scores = {};
  for (const [intent, sig] of Object.entries(SIGNALS)) {
    const strong = sig.strong.filter((k) => t.includes(norm(k)));
    const weak = strong.length ? [] : sig.weak.filter((k) => t.includes(norm(k)));
    scores[intent] = { score: strong.length * 3 + weak.length, matched: [...strong, ...weak] };
  }
  return scores;
}

/**
 * Intent 판정. 최고점이 3 미만이거나 동점이면 확인 질문 1회.
 * intent_hint가 주어지면 그대로 사용한다(다른 Agent 재사용 경로).
 */
export function routeIntent(userMessage, { intent_hint = null, folder_hint = null } = {}) {
  if (intent_hint && INTENT_LABEL[intent_hint]) {
    return { intent: intent_hint, score: null, source: "hint", matched: [], scores: {} };
  }
  const scores = scoreIntents(userMessage);
  const ranked = Object.entries(scores).sort((a, b) => b[1].score - a[1].score);
  const [topId, top] = ranked[0];
  const [, second] = ranked[1];

  if (top.score >= 3 && top.score > second.score) {
    return { intent: topId, score: top.score, source: "message", matched: top.matched, scores };
  }
  // 폴더·날짜를 명시했으면 외근 검토로 본다.
  if (folder_hint && top.score < 3) {
    return { intent: INTENT.FIELDWORK_EVIDENCE, score: top.score, source: "folder_hint", matched: [], scores };
  }
  const tiedTop = ranked.filter(([, v]) => v.score === top.score && v.score > 0).map(([k]) => k);
  const options = (tiedTop.length >= 2 ? tiedTop : [INTENT.FUND_STATUS, INTENT.FIELDWORK_EVIDENCE]).slice(0, 2);
  return {
    intent: INTENT.CLARIFY,
    score: top.score,
    source: "ambiguous",
    matched: [],
    scores,
    options,
    question: `${INTENT_LABEL[options[0]]}과 ${INTENT_LABEL[options[1]]} 중 어느 작업을 진행할까요?`
  };
}

// ---- 조합명 추출 -------------------------------------------------------------

const FUND_SUFFIX = /[가-힣A-Za-z][가-힣A-Za-z0-9]*(?:[-·][가-힣A-Za-z0-9]+)*(?:벤처투자조합|개인투자조합|투자조합|사모투자합자회사|조합|펀드)(?:\s?제?\d+호)?/g;
const GENERIC_FUND = /^(이|그|저|해당|대상|전체관리|관리|우리|본)?(투자조합|조합|펀드)$/;
const LEADING_STOP = new Set(["오늘", "어제", "최근", "이번", "지난", "현재", "다음", "이", "그", "저", "해당", "우리", "전체"]);

export function extractFundName(userMessage, { fund_hint = null } = {}) {
  if (fund_hint) return { name: String(fund_hint).trim(), source: "hint" };
  const text = String(userMessage ?? "");
  const matches = (text.match(FUND_SUFFIX) ?? [])
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && !GENERIC_FUND.test(s));
  if (matches.length) {
    return { name: matches.sort((a, b) => b.length - a.length)[0], source: "message" };
  }
  const first = text.trim().split(/\s+/)[0] ?? "";
  const cleaned = first.replace(/[의는은이가을를,.]$/u, "");
  if (cleaned.length >= 3 && !LEADING_STOP.has(cleaned) && !/^\d/.test(cleaned)) {
    return { name: cleaned, source: "leading_token" };
  }
  return { name: null, source: "none" };
}

// ---- 외근 폴더 힌트 추출 ------------------------------------------------------

/**
 * 외근 폴더는 `YYYY.MM` 월 폴더 아래 `MMDD` 일 폴더 구조다.
 * 상대 표현(오늘·최근)은 날짜를 추정하지 않고 RELATIVE로 남겨 후보 제시로 넘긴다.
 */
export function extractFolderHint(userMessage, { folder_hint = null } = {}) {
  if (folder_hint && typeof folder_hint === "object") return { ...folder_hint, source: "hint" };
  if (folder_hint) return { raw: String(folder_hint), monthly: null, daily: null, source: "hint" };

  const t = String(userMessage ?? "");
  const ymd = t.match(/(20\d{2})[.\-/年\s]?\s?(\d{1,2})[.\-/月\s]?\s?(\d{1,2})\s?일?/);
  if (ymd) {
    const [, y, m, d] = ymd;
    return { raw: ymd[0], monthly: `${y}.${String(m).padStart(2, "0")}`, daily: `${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`, source: "message" };
  }
  const ym = t.match(/(20\d{2})[.\-/年\s]?\s?(\d{1,2})\s?월/);
  if (ym) return { raw: ym[0], monthly: `${ym[1]}.${String(ym[2]).padStart(2, "0")}`, daily: null, source: "message" };

  const md = t.match(/(\d{1,2})\s?월\s?(\d{1,2})\s?일/);
  if (md) return { raw: md[0], monthly: null, daily: `${String(md[1]).padStart(2, "0")}${String(md[2]).padStart(2, "0")}`, source: "message" };

  if (/오늘|금일|최근|어제|저번|지난/.test(t)) {
    return { raw: t.match(/오늘|금일|최근|어제|저번|지난/)[0], monthly: null, daily: null, relative: true, source: "message" };
  }
  return { raw: null, monthly: null, daily: null, source: "none" };
}

/** 발화 1건을 구조화 입력으로 바꾼다. Provider 호출 없음. */
export function parseUserMessage(userMessage, hints = {}) {
  const routed = routeIntent(userMessage, hints);
  return {
    intent: routed.intent,
    intent_source: routed.source,
    intent_score: routed.score,
    clarifying_question: routed.question ?? null,
    clarify_options: routed.options ?? null,
    fund: extractFundName(userMessage, hints),
    folder: extractFolderHint(userMessage, hints)
  };
}
