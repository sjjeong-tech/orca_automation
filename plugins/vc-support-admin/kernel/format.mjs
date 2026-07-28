// Kernel — 사용자 친화적 Result Formatter.
// 내부 Provider 응답·개발 객체를 그대로 노출하지 않는다. 최종 문자열은 항상 마스킹을 통과한다.

import { maskString } from "./sanitize.mjs";
import { INTENT, INTENT_LABEL } from "./intent.mjs";

const bullet = (lines, mark = "-") => lines.filter(Boolean).map((l) => `${mark} ${l}`).join("\n");
const numbered = (lines) => lines.filter(Boolean).map((l, i) => `${i + 1}. ${l}`).join("\n");
const none = (v, fallback = "없음") => (v && v.length ? v : null) ?? fallback;

const VERDICT_LABEL = {
  VERIFIED: "확인됨",
  CANDIDATE: "판단 보류(사람 확인 필요)",
  HUMAN_CONFIRMATION_REQUIRED: "사람 확인 필요",
  INVALID_SHORTCUT: "바로가기 — 증빙 불인정",
  UNVERIFIED_SHORTCUT: "바로가기 — 증빙 불인정",
  ZERO_BYTE: "0byte — 증빙 불인정",
  DUPLICATE_OR_STALE: "중복·구버전 가능 — 최신본 확인 필요",
  STALE_OR_DUPLICATE: "중복·구버전 가능 — 최신본 확인 필요",
  OUT_OF_SCOPE: "이 업무 범위 밖",
  MISSING: "없음",
  ACCESS_BLOCKED: "접근 불가"
};

const TYPE_LABEL = {
  SUBMISSION_PACKAGE: "신청서류(합본)",
  RECEIPT: "세무서 접수증",
  RESULT_DOCUMENT: "고유번호증 발급본",
  SUPPLEMENT: "보완서류",
  SECURITY_CARD: "보안카드(후속 업무)",
  BANKBOOK_COPY: "통장사본(후속 업무)"
};

export const label = { verdict: (v) => VERDICT_LABEL[v] ?? v, type: (t) => TYPE_LABEL[t] ?? t ?? "미분류" };

const WRITE_FOOTER = "Notion 변경:\n실제 변경하지 않았으며 Preview만 생성했습니다.";

function fundLine(view) {
  const f = view.resolved_fund;
  if (!f) return "조합:\n확정되지 않음";
  const extra = [f.fund_type, f.tax_id ? `고유번호 등록됨` : "고유번호 미등록"].filter(Boolean).join(" / ");
  return `조합:\n${f.name}${extra ? ` (${extra})` : ""}`;
}

function fundUnresolvedBlock(view) {
  if (view.fund_match === "NOT_FOUND") {
    return [
      "조합 확정 실패",
      "",
      `찾은 조합:\n없음 (검색어: ${view.fund_query ?? "-"})`,
      "",
      `다음 Action:\n${numbered(["조합 정식명칭을 알려주세요.", "정식명칭을 모르면 조합명 일부와 결성연도를 알려주세요."])}`,
      "",
      WRITE_FOOTER
    ].join("\n");
  }
  return [
    "조합이 여러 건 일치합니다",
    "",
    `검색어:\n${view.fund_query ?? "-"}`,
    "",
    `후보:\n${bullet(view.fund_candidates)}`,
    "",
    `다음 Action:\n${numbered(["대상 조합 1건을 지정해주세요."])}`,
    "",
    WRITE_FOOTER
  ].join("\n");
}

function statusBlock(view) {
  const s = view.current_status ?? {};
  const stages = [];
  if (s.done?.length) stages.push(`완료: ${s.done.join(", ")}`);
  if (s.active?.length) stages.push(`진행 중: ${s.active.join(", ")}`);
  if (s.pending?.length) stages.push(`시작 전: ${s.pending.join(", ")}`);
  return [
    `${view.process_name ?? "업무"} 현황`,
    "",
    fundLine(view),
    "",
    `현재 판단:\n${s.headline ?? "판단 근거가 부족합니다."}`,
    "",
    `현재 단계:\n${bullet(stages)}`,
    "",
    `현재 Actor:\n${s.actor ?? "미지정"}`,
    "",
    `다음 Action:\n${numbered(view.next_actions ?? [])}`,
    "",
    `Blocker:\n${bullet((view.blockers ?? []).map((b) => `${b.task} ${b.task_name ?? ""} — ${b.blocker}`.trim()))}`,
    "",
    evidenceShortBlock(view),
    "",
    `사람 확인사항:\n${bullet((view.human_confirmations ?? []).map((h) => `${h.task} — ${h.confirm}`))}`,
    "",
    diffBlock(view),
    "",
    WRITE_FOOTER
  ].join("\n");
}

function evidenceShortBlock(view) {
  const e = view.evidence_summary;
  if (!e) return "Evidence:\n조회하지 않았습니다.";
  if (e.unavailable) return `Evidence:\n조회 불가 — ${e.unavailable}`;
  const counted = (e.counted ?? []).map((c) => `${label.type(c.type)} ${c.files.length}건`);
  const rejected = (e.rejected ?? []).length;
  return `Evidence:\n${bullet([
    counted.length ? `인정: ${counted.join(", ")}` : "인정: 없음",
    rejected ? `불인정: ${rejected}건 (${[...new Set(e.rejected.map((r) => label.verdict(r.verdict)))].join(", ")})` : null,
    e.source_label ? `조회 위치: ${e.source_label}` : null
  ])}`;
}

function diffBlock(view) {
  const diffs = (view.task_summary ?? []).filter((t) => t.differs);
  if (!diffs.length) return "Notion 기록과 Evidence 판단 차이:\n없음";
  return `Notion 기록과 Evidence 판단 차이:\n${bullet(diffs.map((t) => `${t.task} ${t.name} — Notion "${t.actual_state ?? "기록 없음"}" / Evidence 판단 "${t.computed_state}"`))}`;
}

function evidenceBlock(view) {
  const e = view.evidence_summary ?? {};
  const rows = e.classified ?? [];
  const grouped = {};
  for (const r of rows) (grouped[r.display_verdict] ??= []).push(r);
  const order = ["VERIFIED", "CANDIDATE", "HUMAN_CONFIRMATION_REQUIRED", "INVALID_SHORTCUT", "ZERO_BYTE", "DUPLICATE_OR_STALE", "OUT_OF_SCOPE"];
  const sections = order.filter((k) => grouped[k]?.length).map((k) => {
    const items = grouped[k].map((r) => {
      const bits = [label.type(r.type), r.task_candidates?.length ? `연결 후보 ${r.task_candidates.join("·")}` : null].filter(Boolean);
      return `${r.name}${bits.length ? ` — ${bits.join(" / ")}` : ""}`;
    });
    return `[${label.verdict(k)}] ${grouped[k].length}건\n${bullet(items, "  ·")}`;
  });

  return [
    "외근 산출물 검토 결과",
    "",
    `조회 위치:\n${e.source_label ?? "미지정"}`,
    "",
    view.resolved_fund ? fundLine(view) : `조합 후보:\n${none((e.fund_candidates ?? []).map((f) => `${f.name} (${f.hits}건)`), "파일명에서 조합을 특정하지 못했습니다.")}`,
    "",
    sections.length ? sections.join("\n\n") : "분류 대상 파일이 없습니다.",
    "",
    `연결 Task 후보:\n${bullet((e.task_candidates ?? []).map((t) => `${t.task} ${t.task_name} ← ${t.evidence.join(", ")}`))}`,
    "",
    `사람 확인사항:\n${bullet((view.human_confirmations ?? []).map((h) => `${h.task} — ${h.confirm}`))}`,
    "",
    `다음 Action:\n${numbered(view.next_actions ?? [])}`,
    "",
    "판정 원칙:\n파일이 있다는 사실만으로 Task를 완료 처리하지 않습니다.",
    "",
    WRITE_FOOTER
  ].join("\n");
}

function previewBlock(view) {
  const p = view.notion_preview;
  if (!p || !p.rows?.length) {
    const reason = p?.suppressed_reason === "FUND_NOT_RESOLVED"
      ? "대상 조합이 확정되지 않아 변경 대상을 특정할 수 없습니다."
      : "Notion 기록과 Evidence 판단이 일치합니다. 완료로의 전이는 Evidence만으로 제안하지 않습니다.";
    const pending = p?.pending_human_confirmation ?? [];
    return [
      "Notion 변경 Preview",
      "",
      fundLine(view),
      "",
      `변경 제안:\n없음 — ${reason}`,
      "",
      pending.length
        ? `사람 확인 후 완료로 바꿀 수 있는 단계:\n${bullet(pending.map((t) => `${t.task} ${t.task_name} — 확인 필요: ${t.requires}`))}`
        : "사람 확인 후 변경 가능한 단계:\n없음",
      "",
      WRITE_FOOTER
    ].join("\n");
  }
  const rows = p.rows.map((r) => bullet([
    `대상 Request: ${r.request_ref ?? "미해소"}`,
    `대상 Task: ${r.task_ref}`,
    `대상 Property: ${r.target_property}`,
    `현재값: ${r.current_value ?? "기록 없음"}`,
    `제안값: ${r.proposed_value}`,
    `근거 Evidence: ${none(r.evidence, "없음 — 사람 확인 필요")}`,
    `신뢰도: ${r.confidence}`,
    `사람 확인사항: ${r.human_confirmation}`,
    `승인 필요: ${r.approval_required ? "예" : "아니오"}`,
    `자동 반영 가능: ${r.auto_apply_allowed ? "예" : "아니오"}`
  ], "  ·"));
  return [
    "Notion 변경 Preview",
    "",
    fundLine(view),
    "",
    `변경 제안 ${p.rows.length}건 (실제 반영 0건)`,
    "",
    p.rows.map((r, i) => `[${i + 1}] ${r.task_ref}\n${rows[i]}`).join("\n\n"),
    "",
    `승인 방식:\n${bullet([
      `Preview ID와 preview_hash를 포함한 Typed 승인이 필요합니다.`,
      `"네", "진행해주세요" 같은 발화만으로는 반영되지 않습니다.`,
      `현재 write_mode = ${p.mode} — 승인해도 이 모드에서는 반영되지 않습니다.`
    ])}`,
    "",
    WRITE_FOOTER
  ].join("\n");
}

function managerBlock(view) {
  const m = view.manager_message;
  if (!m) return ["매니저 공유문", "", "생성 실패 — 상태를 계산하지 못했습니다.", "", WRITE_FOOTER].join("\n");
  return [
    "매니저 공유문 (초안 — 발송하지 않음)",
    "",
    "----------------------------------------",
    m.text,
    "----------------------------------------",
    "",
    `발송 상태:\n실제 Slack·메일 발송은 하지 않았습니다. (send_enabled=false)`,
    "",
    WRITE_FOOTER
  ].join("\n");
}

function clarifyBlock(view) {
  return [
    "요청을 한 가지로 확정하지 못했습니다.",
    "",
    view.clarifying_question,
    "",
    `선택지:\n${bullet((view.clarify_options ?? []).map((o) => INTENT_LABEL[o] ?? o))}`
  ].join("\n");
}

function unsupportedBlock(view) {
  return [
    "이 요청은 고유번호증 신청(E2E-03) 업무가 아닙니다.",
    "",
    `현재 지원 범위:\n${bullet(["고유번호증 신청·접수·수령·전달 (P03-T01~T06)"])}`,
    "",
    `미지원:\n${bullet(["보안카드·홈택스(P04)", "계좌개설(P07)", "계좌개설 보완(P08)"])}`,
    "",
    `다음 Action:\n${numbered(["해당 업무 담당자에게 인계가 필요합니다."])}`
  ].join("\n");
}

export function formatUserResult(view) {
  let body;
  if (view.intent === INTENT.CLARIFY) body = clarifyBlock(view);
  else if (view.intent === INTENT.UNSUPPORTED) body = unsupportedBlock(view);
  else if (view.fund_required && (view.fund_match === "NOT_FOUND" || view.fund_match === "MULTIPLE")) body = fundUnresolvedBlock(view);
  else if (view.intent === INTENT.FIELDWORK_EVIDENCE) body = evidenceBlock(view);
  else if (view.intent === INTENT.NOTION_PREVIEW) body = previewBlock(view);
  else if (view.intent === INTENT.MANAGER_UPDATE) body = managerBlock(view);
  else body = statusBlock(view);

  const warn = (view.errors ?? []).filter((e) => e.user_visible !== false);
  const tail = warn.length ? `\n\n확인이 필요한 문제:\n${bullet(warn.map((e) => e.detail ?? e.code))}` : "";
  return maskString(`${body}${tail}`.replace(/\n{3,}/g, "\n\n").trim());
}

/** 매니저 공유용 본문. Slack Preview·CLI 양쪽에서 같은 문자열을 쓴다. */
const DOWNSTREAM = new Set(["SECURITY_CARD", "BANKBOOK_COPY"]);

export function buildManagerMessageText(view) {
  const s = view.current_status ?? {};
  const counted = view.evidence_summary?.counted ?? [];
  const evidence = counted.filter((c) => !DOWNSTREAM.has(c.type)).map((c) => `${label.type(c.type)} ${c.files.length}건`);
  const downstream = counted.filter((c) => DOWNSTREAM.has(c.type)).map((c) => label.type(c.type));
  const multiActive = (s.active ?? []).length > 1;
  return maskString([
    `[고유번호증 신청 진행 공유] ${view.resolved_fund?.name ?? "조합 미확정"}`,
    "",
    `현재 단계: ${s.stage_current ?? "확인 필요"}${multiActive ? " (미완료 단계 중 가장 앞선 단계)" : ""}`,
    `확인된 Evidence: ${evidence.length ? evidence.join(", ") : "없음"}`,
    downstream.length ? `후속 업무 관련 자료: ${downstream.join(", ")}` : null,
    `필요한 확인: ${(view.human_confirmations ?? []).slice(0, 3).map((h) => h.confirm).join(" / ") || "없음"}`,
    `다음 Action: ${(view.next_actions ?? [])[0] ?? "확인 필요"}`,
    "",
    `요청사항: 위 확인 항목을 확인해주시면 Notion 상태를 갱신하겠습니다. (현재 자동 변경 없음)`
  ].filter((l) => l !== null).join("\n"));
}
