// Kernel — 외근 산출물 파일명 규약 파서. Agent B 실측(샘플 34건) 기반. Process 비의존.

export const PREFIX_SEMANTICS = {
  "##합본_": { meaning: "여러 서류를 1 PDF로 병합한 제출 본체", reliability: "MEDIUM", note: "접수증에도 오용된 사례 관측" },
  "##": { meaning: "접두 규칙 불안정 구간", reliability: "LOW", note: "접수증에 붙은 사례 관측" },
  "#": { meaning: "단일 문서 산출물(신청서류 또는 접수증)", reliability: "MEDIUM" },
  "": { meaning: "관공서·은행에서 수령한 결과물", reliability: "HIGH", note: "가장 신뢰도 높은 구분자" }
};

// 상태 한정어 — 후행 괄호
export const QUALIFIERS = {
  "취하 후 재접수": { supersedes_prior: true, verdict_for_prior: "STALE_OR_DUPLICATE" },
  "오타 정정": { supersedes_prior: true, verdict_for_prior: "STALE_OR_DUPLICATE" },
  "규약 미포함": { supersedes_prior: false, note: "구성 변형" },
  "은행전달 견본용": { supersedes_prior: false, note: "견본" }
};

const NAME_RE = /^(?<flag>##합본_|##|#|\[[^\]]+\]★?|\(x\))?(?<rest>.+?)(?:\((?<qual>[^)]+)\))?\.(?<ext>[A-Za-z0-9.]+)$/;

export function parseFieldworkFilename(filename = "") {
  const m = String(filename).match(NAME_RE);
  if (!m?.groups) return { parsed: false, filename };
  const { flag = "", rest = "", qual = null, ext = "" } = m.groups;
  const bracket = /^\[([^\]]+)\]/.exec(flag ?? "")?.[1] ?? null;
  const parts = rest.split("_");
  const fund = parts.length > 1 ? parts[0] : null;
  const task = parts.length > 1 ? parts.slice(1).join("_").trim() : rest.trim();
  return {
    parsed: true,
    prefix: bracket ? `[${bracket}]` : (flag ?? ""),
    prefix_meaning: bracket ? "분류 태그" : (PREFIX_SEMANTICS[flag ?? ""]?.meaning ?? null),
    prefix_reliability: bracket ? "MEDIUM" : (PREFIX_SEMANTICS[flag ?? ""]?.reliability ?? null),
    bracket_tag: bracket,
    fund_token: fund,
    task_token: task,
    qualifier: qual,
    qualifier_rule: qual ? (QUALIFIERS[qual] ?? { supersedes_prior: false, note: "미등록 한정어" }) : null,
    extension: (ext ?? "").toLowerCase(),
    double_extension: (ext ?? "").includes("."),
    discarded: flag === "(x)",
    // 제출↔접수 매칭 키: 같은 fund와 업무 어간을 공유한다.
    pair_key: fund && task ? `${fund}|${task.replace(/\s*(신청서류|접수증)\s*$/, "").trim()}` : null,
    is_institution_result: (flag ?? "") === "" && !bracket
  };
}

/** 제출서류와 접수증을 pair_key로 매칭한다. */
export function matchSubmissionToReceipt(files = []) {
  const parsed = files.map((f) => ({ file: f, meta: parseFieldworkFilename(f.name ?? "") }));
  const groups = new Map();
  for (const p of parsed) {
    if (!p.meta.pair_key) continue;
    const g = groups.get(p.meta.pair_key) ?? { submission: null, receipt: null, others: [] };
    const t = p.meta.task_token ?? "";
    if (t.includes("신청서류")) g.submission = p.file.name;
    else if (t.includes("접수증")) g.receipt = p.file.name;
    else g.others.push(p.file.name);
    groups.set(p.meta.pair_key, g);
  }
  return [...groups.entries()].map(([key, v]) => ({ pair_key: key, ...v, matched: Boolean(v.submission && v.receipt) }));
}

/**
 * 무효·열등 Evidence 검출 (Agent B 실측 규칙 1~7).
 * 파일 부재를 업무 미수행으로 확정하지 않는다 — 여기서는 '증빙 채택 여부'만 판정한다.
 */
export function detectInvalidEvidence(files = []) {
  const findings = [];
  const byName = new Map();
  const supersededKeys = new Set();

  for (const f of files) {
    const meta = parseFieldworkFilename(f.name ?? "");
    if (meta.discarded) findings.push({ file: f.name, rule: "DISCARDED_MARKER", verdict: "INVALID", detail: "(x) 접두 — 작성자 폐기 표기" });
    if (meta.double_extension) findings.push({ file: f.name, rule: "DOUBLE_EXTENSION", verdict: "NOT_EVIDENCE", detail: "변환본·서식 가능성" });
    if ((f.extension ?? "").toLowerCase() === "lnk") findings.push({ file: f.name, rule: "SHORTCUT", verdict: "INVALID", detail: ".lnk 바로가기" });
    if (Number(f.size ?? 0) === 0) findings.push({ file: f.name, rule: "ZERO_BYTE", verdict: "INVALID", detail: "0byte" });
    if ((f.extension ?? "").toLowerCase() === "xlsx" && /참조|대장|아이디/.test(f.name ?? "")) {
      findings.push({ file: f.name, rule: "MASTER_LEDGER", verdict: "OUT_OF_SCOPE", detail: "마스터 대장 — 증빙 아님, 민감정보 가능" });
    }
    if (meta.qualifier_rule?.supersedes_prior && meta.pair_key) supersededKeys.add(meta.pair_key);

    const key = f.name;
    if (byName.has(key)) {
      const prior = byName.get(key);
      const newer = String(f.modified ?? "") > String(prior.modified ?? "") ? f : prior;
      const older = newer === f ? prior : f;
      findings.push({ file: older.name, rule: "SAME_NAME_DIFFERENT_VERSION", verdict: "STALE_OR_DUPLICATE", detail: `최신본은 modified=${newer.modified ?? "unknown"}`, human_check_required: true });
    } else byName.set(key, f);
  }

  // 한정어가 선행본을 무효화하는 경우
  for (const f of files) {
    const meta = parseFieldworkFilename(f.name ?? "");
    if (!meta.pair_key || meta.qualifier) continue;
    if (supersededKeys.has(meta.pair_key)) {
      findings.push({ file: f.name, rule: "SUPERSEDED_BY_QUALIFIER", verdict: "STALE_OR_DUPLICATE", detail: "후속 한정어본이 존재", human_check_required: true });
    }
  }
  return findings;
}

/** 작업 폴더 중간 산출물 vs 날짜 폴더 정본 (규칙 4). */
export function preferDatedFolderCopy(files = []) {
  const byName = new Map();
  for (const f of files) (byName.get(f.name) ?? byName.set(f.name, []).get(f.name)).push(f);
  const decisions = [];
  for (const [name, list] of byName) {
    if (list.length < 2) continue;
    const dated = list.find((f) => f.source_layer === "DAILY_FIELDWORK_FOLDER");
    if (dated) decisions.push({ name, canonical_source: "DAILY_FIELDWORK_FOLDER", others_marked: "INTERMEDIATE" });
  }
  return decisions;
}
