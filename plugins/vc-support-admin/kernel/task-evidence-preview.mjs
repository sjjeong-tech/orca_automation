import { evaluateEvidenceState } from "./evidence-state.mjs";

const blockedStatuses = new Set(["MULTIPLE", "NOT_FOUND", "NOT_RESOLVED"]);

export function buildTaskEvidencePreview({ evidence_candidate = null, task_candidate = null, current_task_values = {}, target_match_status = "NOT_RESOLVED", fund_candidate = null, process_candidate = "P03", inventory_reference = null, preview_only = true } = {}) {
  const guardBlocked = !preview_only || blockedStatuses.has(target_match_status) || !task_candidate || !process_candidate;
  if (guardBlocked) return { target_task_candidate: task_candidate, target_match_status, current_values: current_task_values, proposed_values: {}, unchanged_values: current_task_values, evidence_reference: inventory_reference ?? null, reason_codes: ["PREVIEW_BLOCKED_BY_TARGET_GUARD"], confirmation_questions: ["정확히 하나의 운영 또는 TEST Task와 Process를 지정해주세요."], completion_candidate: false, request_completion_allowed: false, approval_required: false, actual_notion_write_count: 0, change_preview_status: "BLOCKED" };
  const c = evidence_candidate ?? {};
  const evidence_type = c.evidence_type ?? "REQUEST_INFO";
  const validity = c.validity ?? (c.reason === "ZERO_BYTE" ? "ZERO_BYTE" : c.reason === "INVALID_SHORTCUT" ? "INVALID_SHORTCUT" : "VERIFIED");
  const state = evaluateEvidenceState({ process_id: process_candidate, operational_task_id: task_candidate, evidence_type, evidence_validity: validity, human_confirmation: c.human_confirmation_required !== false, current_task_status: current_task_values.task_status ?? "진행 중", current_actor: current_task_values.actor ?? "지원팀", current_next_action: current_task_values.next_action ?? "Evidence 확인", current_blocker: current_task_values.blocker ?? "", storage_confirmed: c.storage_confirmed === true, delivery_confirmed: c.delivery_confirmed === true, all_required_tasks_complete: false });
  const proposed_values = { evidence_source: c.inventory_id ?? inventory_reference ?? `${evidence_type} 후보`, evidence_confirmation: (c.confirmation_questions ?? ["본문·최신본·실물 또는 전달 여부 확인"]).join(" / "), evidence_judgment: state.evidence_judgment, next_action: state.proposed_next_action, blocker: state.proposed_blocker, task_status: state.proposed_task_status, completion_evidence: c.completion_evidence ?? null };
  const unchanged_values = Object.fromEntries(Object.entries(current_task_values).filter(([key]) => !(key in proposed_values)));
  return { target_task_candidate: task_candidate, target_match_status, current_values: current_task_values, proposed_values, unchanged_values, evidence_reference: inventory_reference ?? c.name ?? evidence_type, reason_codes: state.reason_codes, confirmation_questions: c.confirmation_questions ?? ["본문·최신본·실물 또는 전달 여부 확인"], completion_candidate: state.completion_candidate, request_completion_allowed: state.request_completion_allowed, approval_required: true, actual_notion_write_count: 0, change_preview_status: "READY_PREVIEW" };
}
