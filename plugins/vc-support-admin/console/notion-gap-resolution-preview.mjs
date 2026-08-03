/**
 * Read-only candidate model for Console v0.4.2.
 *
 * This module contains sanitized conclusions from approved schema reads.  It
 * never calls Notion and intentionally cannot create, update, or delete a
 * record/property.  Values marked CONFIRM_REQUIRED were not promoted to fact.
 */

export const GAP_RESOLUTION_SCHEMA_READ_AT_KST = "2026-08-03 11:10:02 KST";
export const GAP_RESOLUTION_VERSION = "PILOT v0.4.2";

const fundIds = ["DUMMY-FUND-A", "DUMMY-FUND-B", "DUMMY-FUND-E"];

function fundCandidate(dummyFundId) {
  return {
    dummy_fund_id: dummyFundId,
    candidate_db: "[TEST LAB] 전체관리조합",
    candidate_property: "조합명 / 테스트 케이스 ID",
    match_query: "Exact match only",
    match_count: 0,
    matched_page_id: "NOT_FOUND",
    candidates: [
      { id: "existing_exact", label: "기존 TEST Record Exact Match", result: "NO_MATCH", relation_safe: false, schema_change_required: false, write_required: false },
      { id: "test_identifier", label: "기존 테스트 식별 Property", result: "CONFIRM_REQUIRED", relation_safe: false, schema_change_required: false, write_required: false, note: "추가 SQL 조회는 workspace usage limit으로 미실행" },
      { id: "text_only", label: "Relation 없이 Text Snapshot", result: "TEXT_ONLY_FALLBACK_CANDIDATE", relation_safe: false, schema_change_required: false, write_required: false, note: "Relation 검증 완료를 의미하지 않음" },
      { id: "new_test_record", label: "새 TEST Dummy Fund Record", result: "NEW_TEST_RECORD_REQUIRED", relation_safe: true, schema_change_required: false, write_required: true, note: "사용자 승인 전 생성 금지" }
    ],
    recommendation: "NEW_TEST_RECORD_REQUIRED",
    blocking: true,
    required_approval: "TEST Dummy Fund Record 생성 및 Exact Relation 대상 승인"
  };
}

export const FUND_RELATION_CANDIDATES = Object.freeze(Object.fromEntries(fundIds.map((id) => [id, Object.freeze(fundCandidate(id))])));

export const TRANSACTION_CANDIDATES = Object.freeze([
  Object.freeze({ id: "test_case_id", property: "Request/Task 테스트 케이스 ID", type: "text", result: "CONFIRM_REQUIRED", durable: false, reason: "기존 Text지만 Transaction ID 용도로 확정되지 않음", schema_change_required: false }),
  Object.freeze({ id: "title_prefix", property: "Request 요청명", type: "title", result: "TITLE_PREFIX_FALLBACK", durable: false, reason: "표시명 수정으로 손상될 수 있어 durable key가 아님", schema_change_required: false }),
  Object.freeze({ id: "task_proxy", property: "Operational Task ID + 상위 요청", type: "text + relation", result: "COMPOSITE_PROXY_ONLY", durable: false, reason: "Request 재실행을 단일 키로 Exact query할 수 없음", schema_change_required: false }),
  Object.freeze({ id: "new_transaction_id", property: "전용 Transaction ID", type: "text", result: "NEW_PROPERTY_REQUIRED", durable: true, reason: "Persistent exact query 및 Request-Task 추적에 필요한 전용 식별자", schema_change_required: true })
]);

export const COMPOSITE_PROCESS_CANDIDATES = Object.freeze([
  Object.freeze({ id: "representative_process", result: "BLOCKED", request_process: "대표 Process 1개", task_process: "P03/P04/P07", data_loss: true, schema_change_required: true, reason: "Request Process ID는 단일 Select이고 복합 Option이 확인되지 않음" }),
  Object.freeze({ id: "task_level_process", result: "TASK_LEVEL_PROCESS_SOURCE_OF_TRUTH", request_process: "NOT_WRITTEN; 요청명/요약에 복합 업무 표기", task_process: "P03/P04/P07 each on Task Process ID", data_loss: false, schema_change_required: false, reason: "Task Process ID와 상위 요청 Relation을 기존 구조로 재사용" }),
  Object.freeze({ id: "text_snapshot", result: "TEXT_SNAPSHOT_FALLBACK", request_process: "요청 배경 Text", task_process: "P03/P04/P07", data_loss: true, schema_change_required: false, reason: "필터·집계의 구조적 Process 값은 보장하지 않음" }),
  Object.freeze({ id: "new_multiselect", result: "NEW_PROPERTY_REQUIRED", request_process: "새 Multi-select", task_process: "P03/P04/P07", data_loss: false, schema_change_required: true, reason: "이번 TAP에서는 생성 금지" })
]);

export function buildGapResolutionPreview({ requestId, scenarioId, preview } = {}) {
  const fundId = preview?.request?.dummy_fund_id ?? "DUMMY-FUND-B";
  const fund = FUND_RELATION_CANDIDATES[fundId] ?? fundCandidate(fundId);
  const composite = scenarioId === "COMPOSITE-01";
  const comparison = [
    { gap: "Fund Relation", candidate: fund.recommendation, existing_structure_reused: "Relation target DB only", data_loss: "None after new TEST record", duplicate_safety: "N/A", relation_safety: "BLOCKED", schema_change_required: false, write_required: true, operational_risk: "Low TEST-only after approval", recommendation: fund.recommendation, user_approval_required: true },
    { gap: "Durable Duplicate", candidate: "전용 Transaction ID", existing_structure_reused: "No", data_loss: "None", duplicate_safety: "DURABLE_READY only after property", relation_safety: "Request-Task relation reusable", schema_change_required: true, write_required: true, operational_risk: "Schema semantic decision", recommendation: "NEW_PROPERTY_REQUIRED", user_approval_required: true },
    { gap: "Composite Process", candidate: "Task-level Process source of truth", existing_structure_reused: "Task Process ID + 상위 요청 Relation", data_loss: "Request-level direct Process filter unavailable", duplicate_safety: "N/A", relation_safety: "PASS_PLANNED_RELATION", schema_change_required: false, write_required: false, operational_risk: "User decision required", recommendation: "TASK_LEVEL_PROCESS_SOURCE_OF_TRUTH", user_approval_required: composite }
  ];
  const blocking = ["fund_relation", "durable_duplicate", ...(composite ? ["composite_mapping_decision"] : [])];
  return {
    ok: true,
    console_version: GAP_RESOLUTION_VERSION,
    schema_read_at_kst: GAP_RESOLUTION_SCHEMA_READ_AT_KST,
    schema_source: "LIVE_READ_ONLY_SCHEMA_PLUS_SANITIZED_REFERENCE",
    request_id: requestId,
    scenario_id: scenarioId,
    fund_relation: fund,
    transaction_candidates: TRANSACTION_CANDIDATES,
    durable_duplicate_result: "NOT_READY_PROXY_ONLY",
    composite_process_candidates: COMPOSITE_PROCESS_CANDIDATES,
    composite_process_recommendation: "TASK_LEVEL_PROCESS_SOURCE_OF_TRUTH",
    composite_data_loss_result: "REQUEST_LEVEL_DIRECT_PROCESS_FILTER_NOT_AVAILABLE",
    candidate_comparison: comparison,
    required_approvals: [fund.required_approval, "전용 Transaction ID Property 생성 승인", ...(composite ? ["Request Process를 비우고 Task-level Process를 source of truth로 사용할지 결정"] : [])],
    blocking_gaps: blocking,
    blocking_gap_count: blocking.length,
    approval_status: "MAPPING_DECISION_REQUIRED",
    test_write_readiness: "TEST_WRITE_BLOCKED",
    proposed_decisions: {
      fund_relation: "DECISION_PENDING",
      durable_duplicate: "DECISION_PENDING",
      composite_process: composite ? "DECISION_PENDING" : "NOT_APPLICABLE"
    },
    write_count: 0,
    notion_write_count: 0,
    operational_write_count: 0,
    operational_write_allowed: false
  };
}
