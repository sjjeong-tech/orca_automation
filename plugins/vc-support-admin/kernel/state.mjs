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

/**
 * 운영 Instance마다 Task ID 체계가 다르다(실측: `P03-T01`, `OT-P03-01`, `CI1-P03-01`).
 * 정확일치 → 말미 순번 대응 순으로 현행 ID에 붙인다. 대응 실패는 조용히 버리지 않고 보고한다.
 */
export function reconcileTaskIds(existingTasks = [], canonicalIds = []) {
  const byCanonical = new Map();
  const unmapped = [];
  let renamed = 0;

  for (const t of existingTasks) {
    const raw = String(t.operational_task_id ?? "");
    if (canonicalIds.includes(raw)) { byCanonical.set(raw, { ...t, id_source: "EXACT" }); continue; }
    const seq = Number(raw.match(/(\d{1,2})\s*$/)?.[1] ?? NaN);
    const target = Number.isInteger(seq) && seq >= 1 && seq <= canonicalIds.length ? canonicalIds[seq - 1] : null;
    if (target && !byCanonical.has(target)) {
      byCanonical.set(target, { ...t, operational_task_id: target, id_source: "SEQUENCE_MAPPED", original_task_id: raw });
      renamed += 1;
    } else unmapped.push(raw);
  }
  return {
    byCanonical,
    id_scheme: renamed && renamed === existingTasks.length ? "NON_CANONICAL" : renamed ? "MIXED" : "CANONICAL",
    sequence_mapped_count: renamed,
    unmapped
  };
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
