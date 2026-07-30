import { evaluateEvidenceState, SUPPORTED_TYPES } from "./evidence-state.mjs";

const STAGES = new Set([
  "RECEIVED", "INFORMATION_CHECK", "EVIDENCE_REVIEW", "HUMAN_CONFIRMATION",
  "EXTERNAL_WAIT", "RESULT_REVIEW", "NEXT_PROCESS", "COMPLETION_CANDIDATE", "BLOCKED"
]);
const CONTRACT_REFERENCE = Object.freeze({
  manifest_id: "PROTOTYPE-SCENARIO-CONTRACT-V0.1",
  manifest_hash: "3cb20f707649e3d628bdc0e2ce2d32c67cb27430a0de47a1bafc5a806be3402d",
  batch_id: "A-CP25-B18",
  contract_scenario_coverage: 6,
  implemented_scenario_coverage: 3,
  implemented_scenarios: Object.freeze(["SINGLE-P03-01", "SINGLE-P03-02", "COMPOSITE-01"]),
  not_implemented_scenarios: Object.freeze(["SINGLE-P07-01", "SINGLE-P08-01", "COMPOSITE-02"]),
  reference_recorded_for_traceability: true,
  conformance_claimed: false
});
const UI_AUXILIARY_STATE = Object.freeze({
  notion_status_values: Object.freeze(["진행 중"]),
  notion_status_classification: "TASK_OR_UI_AUXILIARY_STATE",
  is_canonical_skill_stage: false
});
const FIXTURE_STATES = new Set(["PRESENT_VALID", "ABSENT", "PRESENT_NEEDS_HUMAN", "PRESENT_REJECTED"]);
const MAPPING_STATES = new Set(["CONFIRMED", "CANDIDATE_CONFIRMATION_REQUIRED"]);
const FORBIDDEN_INPUT_KEYS = new Set(["raw_mcp_payload", "raw_response", "credential", "token", "password"]);
const ROOT_KEYS = new Set(["schema_version", "scenario_id", "transaction_id", "mode", "lanes", "expectations"]);
const LANE_KEYS = new Set(["lane_id", "process_id", "mapping_status", "depends_on", "operational_task_id", "allow_completion_candidate", "task_projection", "evidence", "decision_markers", "human_confirmation_question"]);
const EVIDENCE_KEYS = new Set(["evidence_id", "evidence_type", "fixture_state", "required_for_completion", "operational_task_id", "storage_confirmed", "delivery_confirmed"]);
const PROJECTION_KEYS = new Set(["actor", "next_action", "blocker"]);
const EXPECTATION_ROOT_KEYS = new Set(["lanes"]);
const EXPECTATION_KEYS = new Set([
  "stage", "completion_candidate", "completion_allowed", "request_completion_allowed",
  "mapping_status", "operational_relation", "task.actor", "task.next_action", "task.blocker",
  "human_confirmation.question"
]);

const fail = (code, detail) => {
  const error = new Error(detail ?? code);
  error.code = code;
  throw error;
};

const clone = (value) => JSON.parse(JSON.stringify(value));

function assertOnlyKeys(value, allowed, path) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("SCHEMA_OBJECT_REQUIRED", path);
  for (const key of Object.keys(value)) if (!allowed.has(key)) fail("SCHEMA_UNKNOWN_PROPERTY", `${path}.${key}`);
}

function walkSanitized(value, path = "$") {
  if (typeof value === "string") {
    if (/https?:\/\//i.test(value)) fail("UNSANITIZED_EXTERNAL_URL", path);
    if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(value)) fail("UNSANITIZED_EMAIL", path);
    if (/\b\d{6}-?\d{7}\b/.test(value)) fail("UNSANITIZED_PERSONAL_IDENTIFIER", path);
    if (/(?:[A-Za-z]:\\|\\\\|\/Users\/|\/home\/)/.test(value)) fail("UNSANITIZED_LOCAL_PATH", path);
    return;
  }
  if (Array.isArray(value)) return value.forEach((item, index) => walkSanitized(item, `${path}[${index}]`));
  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (FORBIDDEN_INPUT_KEYS.has(key)) fail("FORBIDDEN_RAW_INPUT", `${path}.${key}`);
      walkSanitized(item, `${path}.${key}`);
    }
  }
}

function validateDependencies(lanes) {
  const ids = new Set(lanes.map((lane) => lane.lane_id));
  const visiting = new Set();
  const visited = new Set();
  const visit = (id) => {
    if (visiting.has(id)) fail("DEPENDENCY_CYCLE", id);
    if (visited.has(id)) return;
    const lane = lanes.find((candidate) => candidate.lane_id === id);
    if (!lane) fail("UNKNOWN_DEPENDENCY", id);
    visiting.add(id);
    for (const dependency of lane.depends_on ?? []) {
      if (!ids.has(dependency)) fail("UNKNOWN_DEPENDENCY", dependency);
      visit(dependency);
    }
    visiting.delete(id);
    visited.add(id);
  };
  lanes.forEach((lane) => visit(lane.lane_id));
}

export function validatePrototypeScenario(input = {}) {
  walkSanitized(input);
  assertOnlyKeys(input, ROOT_KEYS, "$");
  if (input.schema_version !== "prototype-replay/1") fail("SCENARIO_SCHEMA_VERSION_INVALID");
  if (!input.scenario_id || !input.transaction_id) fail("SCENARIO_ID_OR_TRANSACTION_REQUIRED");
  if (!["single", "composite"].includes(input.mode)) fail("SCENARIO_MODE_INVALID");
  if (!Array.isArray(input.lanes) || input.lanes.length === 0) fail("SCENARIO_LANES_REQUIRED");
  if (new Set(input.lanes.map((lane) => lane.lane_id)).size !== input.lanes.length) fail("DUPLICATE_LANE_ID");
  for (const lane of input.lanes) {
    assertOnlyKeys(lane, LANE_KEYS, `$.lanes[${lane.lane_id ?? "?"}]`);
    if (!lane.lane_id || !lane.process_id || !Array.isArray(lane.evidence)) fail("LANE_CONTRACT_INVALID", lane.lane_id);
    if (!Array.isArray(lane.depends_on ?? [])) fail("DEPENDENCY_LIST_INVALID", lane.lane_id);
    if (!MAPPING_STATES.has(lane.mapping_status)) fail("MAPPING_STATUS_INVALID", lane.lane_id);
    for (const evidence of lane.evidence) {
      assertOnlyKeys(evidence, EVIDENCE_KEYS, `$.lanes[${lane.lane_id}].evidence[${evidence.evidence_id ?? "?"}]`);
      if (!SUPPORTED_TYPES.has(evidence.evidence_type)) fail("UNSUPPORTED_EVIDENCE_TYPE", evidence.evidence_type);
      if (!FIXTURE_STATES.has(evidence.fixture_state)) fail("EVIDENCE_FIXTURE_STATE_INVALID", evidence.fixture_state);
    }
    if (lane.task_projection) assertOnlyKeys(lane.task_projection, PROJECTION_KEYS, `$.lanes[${lane.lane_id}].task_projection`);
  }
  validateDependencies(input.lanes);
  if (input.expectations !== undefined) {
    assertOnlyKeys(input.expectations, EXPECTATION_ROOT_KEYS, "$.expectations");
    if (!input.expectations.lanes || typeof input.expectations.lanes !== "object" || Array.isArray(input.expectations.lanes)) {
      fail("EXPECTATION_LANES_REQUIRED");
    }
    const laneIds = new Set(input.lanes.map((lane) => lane.lane_id));
    for (const [laneId, expectation] of Object.entries(input.expectations.lanes)) {
      if (!laneIds.has(laneId)) fail("EXPECTATION_UNKNOWN_LANE", laneId);
      assertOnlyKeys(expectation, EXPECTATION_KEYS, `$.expectations.lanes[${laneId}]`);
    }
  }
  return clone(input);
}

function toEvaluatorEvent(lane, evidence) {
  const state = evidence.fixture_state;
  return {
    process_id: lane.process_id,
    operational_task_id: evidence.operational_task_id ?? lane.operational_task_id ?? null,
    evidence_type: evidence.evidence_type,
    evidence_validity: state === "PRESENT_REJECTED" ? "INVALID_SHORTCUT" : state === "PRESENT_VALID" ? "VERIFIED" : "MISSING",
    human_confirmation: state === "PRESENT_VALID" ? false : true,
    storage_confirmed: evidence.storage_confirmed === true,
    delivery_confirmed: evidence.delivery_confirmed === true,
    all_required_tasks_complete: false
  };
}

function evidenceDecision(lane, evidence, evaluateEvidence) {
  const evaluated = evaluateEvidence(toEvaluatorEvent(lane, evidence));
  const state = evidence.fixture_state;
  return {
    evidence_id: evidence.evidence_id,
    evidence_type: evidence.evidence_type,
    fixture_state: state,
    required_for_completion: evidence.required_for_completion === true,
    evidence_judgment: state === "ABSENT" ? "MISSING" : evaluated.evidence_judgment,
    validity: state === "PRESENT_VALID" ? "VALID" : state === "PRESENT_REJECTED" ? "REJECTED" : state === "PRESENT_NEEDS_HUMAN" ? "NEEDS_HUMAN" : "MISSING",
    human_confirmation_required: state !== "PRESENT_VALID" || evaluated.human_confirmation_required,
    source: "SYNTHETIC_FIXTURE"
  };
}

function predecessorReady(lane, completed) {
  return (lane.depends_on ?? []).every((dependency) => {
    const state = completed.get(dependency)?.stage;
    return state === "RESULT_REVIEW" || state === "NEXT_PROCESS" || state === "COMPLETION_CANDIDATE";
  });
}

function projectLane(lane, completed, evaluateEvidence) {
  const decisions = lane.evidence.map((evidence) => evidenceDecision(lane, evidence, evaluateEvidence));
  const absent = decisions.find((decision) => decision.fixture_state === "ABSENT");
  const rejected = decisions.find((decision) => decision.fixture_state === "PRESENT_REJECTED");
  const needsHuman = decisions.find((decision) => decision.fixture_state === "PRESENT_NEEDS_HUMAN");
  const gateReady = predecessorReady(lane, completed);
  const projection = { ...(lane.task_projection ?? {}) };
  let stage = "EVIDENCE_REVIEW";
  let error = null;

  if (!gateReady) {
    stage = "BLOCKED";
    error = { code: "PREDECESSOR_NOT_READY", lane_id: lane.lane_id };
    projection.actor = projection.actor ?? "사람 확인";
    projection.next_action = projection.next_action ?? "선행 Process 결과 확인";
    projection.blocker = projection.blocker ?? "선행 Process 미완료";
  } else if (absent || rejected) {
    stage = "BLOCKED";
    const reason = absent ? "MISSING_REQUIRED_EVIDENCE" : "REJECTED_EVIDENCE";
    error = { code: reason, evidence_id: (absent ?? rejected).evidence_id };
    projection.actor = projection.actor ?? "사람 확인";
    projection.next_action = projection.next_action ?? (absent ? "필수 Evidence 재수집 또는 확인" : "유효한 Evidence 재수집");
    projection.blocker = projection.blocker ?? (absent ? "필수 Evidence 미확보" : "불인정 Evidence");
  } else if (needsHuman) {
    stage = "HUMAN_CONFIRMATION";
    projection.actor = projection.actor ?? "사람 확인";
    projection.next_action = projection.next_action ?? "사람 확인 수행";
    projection.blocker = projection.blocker ?? "";
  } else if (lane.process_id === "P04") {
    stage = "NEXT_PROCESS";
  } else if (lane.process_id === "P03" && lane.allow_completion_candidate === true) {
    stage = "COMPLETION_CANDIDATE";
  } else if (lane.process_id === "P03") {
    stage = "RESULT_REVIEW";
  } else {
    stage = "EVIDENCE_REVIEW";
  }

  const question = lane.human_confirmation_question ?? null;
  const completionCandidate = stage === "COMPLETION_CANDIDATE";
  const candidateReason = completionCandidate ? "저장·전달 Evidence 확인 필요" : null;
  return {
    lane_id: lane.lane_id,
    process_id: lane.process_id,
    mapping_status: lane.mapping_status,
    operational_relation: "NONE",
    depends_on: [...(lane.depends_on ?? [])],
    stage,
    evidence_decisions: decisions,
    task_projection: {
      operational_task_id: lane.operational_task_id ?? null,
      actor: projection.actor ?? "지원팀",
      next_action: projection.next_action ?? "Evidence 검토",
      blocker: projection.blocker ?? ""
    },
    human_confirmation: question ? [{
      operational_task_id: lane.operational_task_id ?? null,
      question,
      actor: projection.actor ?? "사람 확인",
      approval_required: true,
      completion_allowed: false
    }] : [],
    completion_candidate: completionCandidate,
    candidate_reason: candidateReason,
    completion_allowed: false,
    request_completion_allowed: false,
    resume: {
      resume_scope: lane.lane_id,
      allowed: stage === "BLOCKED" || stage === "HUMAN_CONFIRMATION",
      reason: stage === "BLOCKED" ? error?.code ?? "BLOCKED" : stage === "HUMAN_CONFIRMATION" ? "HUMAN_CONFIRMATION_REQUIRED" : "NO_RESUME_REQUIRED"
    },
    error
  };
}

function stageSnapshots(lane) {
  const snapshots = [{ stage: "RECEIVED", lane_id: lane.lane_id }];
  if (lane.stage === "BLOCKED" && lane.error?.code === "PREDECESSOR_NOT_READY") {
    snapshots.push({ stage: "INFORMATION_CHECK", lane_id: lane.lane_id });
  } else {
    snapshots.push({ stage: "EVIDENCE_REVIEW", lane_id: lane.lane_id });
  }
  if (lane.stage === "HUMAN_CONFIRMATION") snapshots.push({ stage: "HUMAN_CONFIRMATION", lane_id: lane.lane_id });
  if (lane.stage === "RESULT_REVIEW") snapshots.push({ stage: "RESULT_REVIEW", lane_id: lane.lane_id });
  if (lane.stage === "NEXT_PROCESS") snapshots.push({ stage: "NEXT_PROCESS", lane_id: lane.lane_id });
  if (lane.stage === "COMPLETION_CANDIDATE") snapshots.push({ stage: "COMPLETION_CANDIDATE", lane_id: lane.lane_id });
  if (lane.stage === "BLOCKED") snapshots.push({ stage: "BLOCKED", lane_id: lane.lane_id, error_code: lane.error?.code ?? "BLOCKED" });
  return snapshots;
}

function actualForExpectation(lane, property) {
  if (property in lane) return lane[property];
  if (property.startsWith("task.")) return lane.task_projection[property.slice("task.".length)];
  if (property === "human_confirmation.question") return lane.human_confirmation[0]?.question ?? null;
  return undefined;
}

function expectedActual(scenario, lanes) {
  const entries = [];
  for (const lane of lanes) {
    const expected = scenario.expectations?.lanes?.[lane.lane_id] ?? {};
    for (const [property, expectedValue] of Object.entries(expected)) {
      const actualValue = actualForExpectation(lane, property);
      entries.push({ check_id: `${lane.lane_id}:${property}`, lane_id: lane.lane_id, property, expected: expectedValue, actual: actualValue, comparison_mode: "EXACT", result: expectedValue === actualValue ? "EXACT_MATCH" : "MISMATCH" });
    }
  }
  return {
    source: "SYNTHETIC_FIXTURE_EXPECTATIONS",
    expected_source: "scenario.expectations",
    comparison_ready: true,
    entries,
    mismatch_count: entries.filter((entry) => entry.result !== "EXACT_MATCH").length
  };
}

function assertSafetyInvariants(lanes) {
  for (const lane of lanes) {
    if (lane.completion_allowed !== false || lane.request_completion_allowed !== false) {
      fail("INTERNAL_COMPLETION_GUARD_ERROR", lane.lane_id);
    }
    if (lane.stage === "BLOCKED" && lane.completion_candidate) {
      fail("INTERNAL_BLOCKED_CANDIDACY_ERROR", lane.lane_id);
    }
  }
}

/**
 * Pure preview-only reducer. It performs no I/O, connector calls, writes, or clock reads.
 */
export function replayAdminProcessPrototype(input = {}, { evaluateEvidence = evaluateEvidenceState } = {}) {
  const scenario = validatePrototypeScenario(input);
  const completed = new Map();
  const lanes = [];
  for (const lane of scenario.lanes) {
    const result = projectLane(lane, completed, evaluateEvidence);
    completed.set(lane.lane_id, result);
    lanes.push(result);
  }
  const timeline = lanes.flatMap(stageSnapshots);
  if (!timeline.every((snapshot) => STAGES.has(snapshot.stage))) fail("INTERNAL_STAGE_VOCABULARY_ERROR");
  assertSafetyInvariants(lanes);
  const comparison = expectedActual(scenario, lanes);
  const errors = lanes.filter((lane) => lane.error).map((lane) => ({ lane_id: lane.lane_id, ...lane.error }));
  return {
    skill_id: "admin-process-prototype-replay",
    schema_version: "prototype-replay/1",
    scenario_id: scenario.scenario_id,
    transaction_id: scenario.transaction_id,
    mode: scenario.mode,
    conformance_claim: {
      contract_id: CONTRACT_REFERENCE.manifest_id,
      manifest_hash: CONTRACT_REFERENCE.manifest_hash,
      batch_id: CONTRACT_REFERENCE.batch_id,
      contract_scenario_coverage: CONTRACT_REFERENCE.contract_scenario_coverage,
      implemented_scenario_coverage: CONTRACT_REFERENCE.implemented_scenario_coverage,
      implemented_scenarios: [...CONTRACT_REFERENCE.implemented_scenarios],
      not_implemented_scenarios: [...CONTRACT_REFERENCE.not_implemented_scenarios],
      reference_recorded_for_traceability: CONTRACT_REFERENCE.reference_recorded_for_traceability,
      prototype_scope: CONTRACT_REFERENCE.implemented_scenario_coverage,
      claimed: false,
      reason: "Three of six contract scenarios are implemented; the manifest reference is traceability metadata, not a conformance certification."
    },
    ui_auxiliary_state: { ...UI_AUXILIARY_STATE, notion_status_values: [...UI_AUXILIARY_STATE.notion_status_values] },
    process_instances: lanes.map((lane) => ({ lane_id: lane.lane_id, process_id: lane.process_id, stage: lane.stage, mapping_status: lane.mapping_status, operational_relation: lane.operational_relation, completion_candidate: lane.completion_candidate, candidate_reason: lane.candidate_reason })),
    request_instances: lanes.map((lane) => ({ lane_id: lane.lane_id, process_id: lane.process_id, request_completion_allowed: false })),
    task_instances: lanes.map((lane) => ({ lane_id: lane.lane_id, ...lane.task_projection, stage: lane.stage, completion_allowed: false })),
    evidence_decisions: lanes.flatMap((lane) => lane.evidence_decisions.map((decision) => ({ lane_id: lane.lane_id, ...decision }))),
    evidence_validity: lanes.flatMap((lane) => lane.evidence_decisions.map((decision) => ({ lane_id: lane.lane_id, evidence_id: decision.evidence_id, validity: decision.validity }))),
    human_confirmation: lanes.flatMap((lane) => lane.human_confirmation.map((entry) => ({ lane_id: lane.lane_id, ...entry }))),
    actor_transitions: lanes.map((lane) => ({ lane_id: lane.lane_id, actor: lane.task_projection.actor, stage: lane.stage })),
    next_actions: lanes.map((lane) => ({ lane_id: lane.lane_id, next_action: lane.task_projection.next_action })),
    blockers: lanes.filter((lane) => lane.task_projection.blocker).map((lane) => ({ lane_id: lane.lane_id, blocker: lane.task_projection.blocker })),
    snapshot_timeline: timeline,
    expected_actual: comparison,
    completion_candidate: lanes.some((lane) => lane.completion_candidate),
    completion_allowed: false,
    request_completion_allowed: false,
    next_process_candidates: lanes.filter((lane) => lane.stage === "NEXT_PROCESS").map((lane) => ({ lane_id: lane.lane_id, process_id: lane.process_id, mapping_status: lane.mapping_status })),
    duplicate_result: {
      replay_key: scenario.transaction_id,
      result: "NO_NEW_RECORDS_PREVIEW_ONLY",
      validation_scope: "PASS_IN_PREVIEW_FIXTURE",
      persistent_store_duplicate_observation: "PERSISTENT_STORE_DUPLICATE_OBSERVATION_NOT_RUN",
      duplicates_created: 0,
      new_records: 0,
      new_duplicates: 0,
      limitation: "Pure preview reducer does not observe a persistent record store."
    },
    resume_contract: lanes.map((lane) => ({ lane_id: lane.lane_id, ...lane.resume })),
    errors,
    write_plan: { mode: "preview_only", approval_required_for_future_write: true, operations: [], actual_write_count: 0 },
    write_counts: { notion: 0, drive: 0, slack: 0, file: 0, total: 0 },
    connector_calls: { notion: 0, drive: 0, slack: 0, total: 0 },
    write_count: 0,
    operational_write_count: 0
  };
}

export const PROTOTYPE_REPLAY_STAGES = Object.freeze([...STAGES]);
export const PROTOTYPE_REPLAY_CONTRACT_REFERENCE = CONTRACT_REFERENCE;
export const PROTOTYPE_REPLAY_UI_AUXILIARY_STATE = UI_AUXILIARY_STATE;
