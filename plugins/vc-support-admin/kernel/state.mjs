// Kernel — Task State Engine. Process 규칙은 Skill Contract에서 주입한다.

export function determineHumanConfirmation(rule = {}) {
  return {
    required: rule.auto_complete === false || rule.human_confirmation != null,
    reason: rule.human_confirmation ?? null
  };
}

/**
 * Evidence와 기존 Task 상태로 Task 상태 후보를 계산한다.
 * 계약이 auto_complete=false이면 어떤 경우에도 "완료"를 생성하지 않는다.
 */
export function calculateTaskState({ taskIds = [], rules = [], evidenceSummary = {}, existingTasks = [], maxAutoState = "진행 중" }) {
  const counted = new Set(evidenceSummary.counted_types ?? []);
  const existingById = new Map(existingTasks.map((t) => [t.operational_task_id, t]));

  return taskIds.map((taskId, index) => {
    const rule = rules.find((r) => r.task === taskId) ?? {};
    const support = (rule.supporting_evidence ?? []).filter((t) => counted.has(t));
    const hasSupport = support.length > 0;
    const existing = existingById.get(taskId) ?? null;
    const hc = determineHumanConfirmation(rule);

    const active = hasSupport || index === 0;
    const state = active ? maxAutoState : "시작 전";

    const blocker = active
      ? `HUMAN_CONFIRMATION_REQUIRED — ${hc.reason ?? "사람 확인 필요"}`
      : `${taskIds[index - 1]} 미완료`;

    return {
      operational_task_id: taskId,
      state_candidate: state,
      auto_complete_allowed: rule.auto_complete === true,
      supporting_evidence: support,
      requires_human_confirmation: hc.required,
      human_confirmation: hc.reason,
      blocker,
      existing_state: existing ? existing.state : null
    };
  });
}

export function buildManagerShare(taskStates = [], { fund_name, process_id } = {}) {
  const active = taskStates.filter((t) => t.state_candidate === "진행 중");
  return {
    fund: fund_name ?? null,
    process_id: process_id ?? null,
    active_tasks: active.map((t) => ({ task: t.operational_task_id, next_action: t.human_confirmation, blocker: t.blocker })),
    human_confirmation_count: taskStates.filter((t) => t.requires_human_confirmation).length,
    send_enabled: false
  };
}

export function buildFundTracking({ fund_name, process_id, existingRequest, taskStates = [], evidenceSummary = {} }) {
  return {
    fund: fund_name ?? null,
    process_id: process_id ?? null,
    request_present: Boolean(existingRequest),
    request_kind: existingRequest ? (existingRequest.is_shadow ? "TEST_SHADOW" : "TEST") : "NONE",
    operating_request_present: false,
    task_summary: taskStates.map((t) => ({ task: t.operational_task_id, state: t.state_candidate, blocker: t.blocker })),
    evidence_types: evidenceSummary.counted_types ?? [],
    note: "Shadow·TEST Record는 운영 상태를 대체하지 않는다."
  };
}

export function buildHandoff({ duplicateKey, humanConfirmation = [], nextOwner = "USER" }) {
  return {
    next_owner: nextOwner,
    resume_key: duplicateKey ?? null,
    open_items: humanConfirmation.map((h) => h.task),
    operating_write_performed: false
  };
}
