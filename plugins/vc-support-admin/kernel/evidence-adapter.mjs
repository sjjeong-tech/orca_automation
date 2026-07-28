import { evaluateEvidenceState } from "./evidence-state.mjs";

const patterns = [
  { type: "RECEIPT", task: "P03-T04", terms: ["접수증"] },
  { type: "STAMPED_DOCUMENT", task: "P03-T03", terms: ["날인본", "날인"] },
  { type: "RESULT_DOCUMENT", task: "P03-T05", terms: ["발급본", "고유번호증 PDF", "고유번호증"] },
  { type: "DELIVERY_EVIDENCE", task: "P03-T06", terms: ["관리역", "전달"] },
  { type: "STORAGE_COPY", task: "P03-T06", terms: ["저장", "조합 폴더"] },
];

function includesAny(text, terms) { return terms.some((term) => text.includes(term)); }

export function normalizeEvidenceInput({ text = "", fund_name = null, case_id = null, process_id = "P03", current_request = null, current_task = null } = {}) {
  const raw = String(text);
  const matched = patterns.find((candidate) => includesAny(raw, candidate.terms));
  const invalid = raw.includes("바로가기") || raw.includes("원본은 열리지") || raw.includes("0byte");
  const task = current_task ?? matched?.task ?? null;
  const evidence_type = invalid ? "SUBMISSION_PACKAGE" : (matched?.type ?? "REQUEST_INFO");
  const evidence_validity = invalid ? (raw.includes("0byte") ? "ZERO_BYTE" : "INVALID_SHORTCUT") : "VERIFIED";
  const human_confirmation = !raw.includes("확인 완료") && !raw.includes("확인했어") && !raw.includes("전달했어");
  const event = {
    test_case_id: case_id,
    process_id,
    operational_task_id: task,
    evidence_type,
    evidence_validity,
    human_confirmation,
    current_task_status: "진행 중",
    current_actor: "지원팀",
    current_next_action: "Evidence와 Task 상태 확인",
    current_blocker: "",
    storage_confirmed: matched?.type === "STORAGE_COPY" || raw.includes("저장했어"),
    delivery_confirmed: raw.includes("전달했어") || raw.includes("전달 완료"),
  };
  const missing_information = [];
  if (!fund_name) missing_information.push("fund_name");
  if (!task) missing_information.push("operational_task_id");
  return {
    extracted_facts: { fund_name, case_id, process_id, operational_task_id: task, evidence_type, evidence_validity },
    evidence_type,
    evidence_validity,
    human_confirmation,
    missing_information,
    process_candidate: process_id === "P03" ? "P03" : null,
    task_candidate: task,
    ambiguity: task ? null : "EVIDENCE_TASK_UNRESOLVED",
    normalized_evidence_event: event,
  };
}

export function buildEvidencePreview(input = {}) {
  const normalized = normalizeEvidenceInput(input);
  const state = evaluateEvidenceState(normalized.normalized_evidence_event);
  const target_match_status = input.current_request && input.current_task ? "EXACT_1" : "NOT_FOUND";
  return {
    ...normalized,
    state,
    notion_change_preview: {
      database_layer: "Request·Task",
      target_record_candidate: input.current_request ?? null,
      target_match_status,
      current_values: {},
      proposed_values: {
        task_status: state.proposed_task_status,
        actor: state.proposed_actor,
        next_action: state.proposed_next_action,
        blocker: state.proposed_blocker,
      },
      reason_codes: state.reason_codes,
      evidence_reference: normalized.evidence_type,
      approval_required: true,
      actual_write_count: 0,
    },
    approval_required: true,
  };
}
