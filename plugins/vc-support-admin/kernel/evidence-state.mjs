const SUPPORTED_TYPES = new Set([
  "REQUEST_INFO", "SUBMISSION_PACKAGE", "STAMPED_DOCUMENT", "RECEIPT",
  "SUPPLEMENT", "RESULT_DOCUMENT", "STORAGE_COPY", "DELIVERY_EVIDENCE"
]);

const invalid = new Set(["INVALID_SHORTCUT", "ZERO_BYTE"]);

function base(event) {
  const task = event.operational_task_id ?? "";
  return {
    test_case_id: event.test_case_id ?? null,
    process_id: event.process_id ?? "P03",
    operational_task_id: task,
    evidence_judgment: "UNCLASSIFIED",
    // 완료는 실제 Notion 상태 변경이 아니라 사람 확인용 후보 상태다.
    proposed_task_status: event.current_task_status ?? "진행 중",
    proposed_actor: event.current_actor ?? "지원팀",
    proposed_next_action: event.current_next_action ?? "Evidence와 Task 상태 확인",
    proposed_blocker: event.current_blocker ?? "",
    human_confirmation_required: true,
    completion_candidate: false,
    request_completion_allowed: false,
    change_preview: { planned_write_count: 0, operations: [], actual_write_count: 0 },
    reason_codes: []
  };
}

export function evaluateEvidenceState(event = {}) {
  const out = base(event);
  const type = event.evidence_type;
  const validity = event.evidence_validity;
  if (!SUPPORTED_TYPES.has(type)) {
    out.reason_codes.push("UNSUPPORTED_EVIDENCE_TYPE");
    return out;
  }
  if (invalid.has(validity)) {
    out.evidence_judgment = "불인정";
    out.proposed_next_action = "유효한 Evidence 재수집";
    out.proposed_blocker = "유효하지 않은 Evidence";
    out.reason_codes.push(validity, "TASK_COMPLETION_BLOCKED");
    return out;
  }

  const human = event.human_confirmation !== false;
  if (type === "RECEIPT" && human) {
    out.evidence_judgment = "사람 확인 필요";
    out.proposed_next_action = "접수증 본문 대조";
    out.reason_codes.push("RECEIPT_BODY_CONFIRMATION_REQUIRED");
  } else if (type === "RESULT_DOCUMENT" && human) {
    out.evidence_judgment = "사람 확인 필요";
    out.proposed_next_action = "최신본·실물 수령 확인";
    out.reason_codes.push("RESULT_CURRENCY_AND_RECEIPT_REQUIRED");
  } else if (type === "DELIVERY_EVIDENCE" && (!event.storage_confirmed || !event.delivery_confirmed)) {
    out.evidence_judgment = "일부 확인";
    out.proposed_next_action = "관리역 전달 여부 확인";
    out.reason_codes.push("DELIVERY_CONFIRMATION_REQUIRED");
  } else if (validity === "VERIFIED" && !human) {
    out.evidence_judgment = "확인됨";
    out.human_confirmation_required = false;
    out.completion_candidate = true;
    out.proposed_task_status = "완료";
    out.proposed_next_action = "다음 Task 확인";
    out.reason_codes.push("VERIFIED_EVIDENCE");
  } else {
    out.evidence_judgment = validity === "VERIFIED" ? "사람 확인 필요" : "확인 필요";
    out.reason_codes.push(validity === "VERIFIED" ? "HUMAN_CONFIRMATION_REQUIRED" : "EVIDENCE_VALIDITY_NOT_VERIFIED");
  }
  // 행동 안내는 Next Action에만 둔다. 같은 문구를 장애 사유로 복제하지 않는다.
  if (out.proposed_blocker && out.proposed_blocker === out.proposed_next_action) out.proposed_blocker = "";
  const requiredTasksComplete = event.all_required_tasks_complete === true;
  const noOpenBlocker = out.proposed_blocker === "";
  out.request_completion_allowed = requiredTasksComplete && !out.human_confirmation_required && noOpenBlocker &&
    (out.operational_task_id !== "P03-T06" || (event.storage_confirmed === true && event.delivery_confirmed === true));
  return out;
}

export function parseEvidenceText(text = {}) {
  if (typeof text !== "string") return evaluateEvidenceState(text);
  const task = /P03-(?:T?0?([1-6]))/.exec(text)?.[1];
  const operational_task_id = task ? `P03-T0${task}` : null;
  const type = text.includes("접수증") ? "RECEIPT" : text.includes("고유번호증") ? "RESULT_DOCUMENT" : text.includes("저장") ? "DELIVERY_EVIDENCE" : "REQUEST_INFO";
  const event = { process_id: "P03", operational_task_id, evidence_type: type, evidence_validity: "VERIFIED", human_confirmation: true, current_task_status: "진행 중" };
  if (type === "DELIVERY_EVIDENCE") event.storage_confirmed = true;
  return evaluateEvidenceState(event);
}

export { SUPPORTED_TYPES };
