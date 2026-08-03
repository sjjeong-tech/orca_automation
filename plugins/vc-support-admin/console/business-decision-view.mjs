/**
 * Presentation-only adapter for Console v0.4.1.
 *
 * It translates existing read-only mapping evidence into user-facing Korean
 * decision text. It does not amend the Skill output, schema snapshot, mapping
 * rules, approval rules, or any write capability.
 */

export const BUSINESS_FUNCTION_GOAL = "선택한 요청을 Notion TEST DB에 반영할 수 있는지 검토하고, 부족한 조건과 다음 확인 업무를 안내합니다.";

export const KOREAN_TERMINOLOGY = Object.freeze({
  APPROVAL_BLOCKED: "반영 전 확인 필요",
  READY_FOR_APPROVAL: "TEST 반영 승인 가능",
  READY_FOR_TEST_WRITE_APPROVAL: "TEST 반영 승인 가능",
  NOT_REVIEWED: "검토 전",
  NO_MATCH: "연결 대상 없음",
  EXACT_MATCH_ONE: "연결 대상 확인",
  MULTIPLE_MATCH: "연결 대상 중복",
  LOOKUP_AVAILABLE_WITH_PROXY: "임시 기준으로 중복 조회 가능",
  UNMAPPED: "저장 위치 미확정",
  NOT_WRITTEN: "아직 생성하지 않음",
  PASS: "확인 완료",
  BLOCKING_GAP: "반영 차단 항목",
  READ_ONLY: "읽기 전용",
  WRITE_NOT_EXECUTED: "실제 반영 없음",
  OPERATIONAL_WRITE: "운영 데이터 반영",
  COMPLETION_CANDIDATE: "완료 후보",
  BLOCKED: "중단",
  HUMAN_CONFIRMATION: "사람 확인 필요"
});

export function koreanLabel(value, fallback = "확인 필요") {
  if (value === undefined || value === null || value === "") return fallback;
  return KOREAN_TERMINOLOGY[value] ?? String(value);
}

function currentTask(preview) {
  const tasks = preview?.tasks ?? [];
  if (preview?.scenario_id === "COMPOSITE-01") {
    return tasks.find((task) => task.process_id === "P07" && task.stage === "BLOCKED")
      ?? tasks.find((task) => task.stage === "BLOCKED")
      ?? tasks.at(-1)
      ?? {};
  }
  return tasks[0] ?? {};
}

function readinessItem(id, label, status, detail, canonical) {
  return { id, label, status, detail, canonical };
}

function blockingReason({ id, title, problem, impact, nextAction, technicalValue }) {
  return {
    id,
    title,
    problem,
    impact,
    next_action: nextAction,
    owner_candidate: "[담당 확인 필요]",
    blocking: true,
    technical_value: technicalValue
  };
}

function blockingReasons(mapping) {
  const preview = mapping.preview_output ?? {};
  const relation = mapping.relation_preview ?? {};
  const duplicate = mapping.duplicate_preview ?? {};
  const reasons = [];

  if (relation.relation_ready === false || relation.result === "NO_MATCH") {
    reasons.push(blockingReason({
      id: "fund-relation",
      title: "조합 연결 대상 없음",
      problem: `${preview.request?.dummy_fund_id ?? relation.dummy_fund_id ?? "선택 조합"}와 일치하는 Notion 조합 Record가 없습니다.`,
      impact: "생성 예정 Request와 Task를 올바른 조합에 연결할 수 없습니다.",
      nextAction: "조합 DB의 식별 기준과 대상 Record를 확인하세요.",
      technicalValue: `${relation.result ?? "NO_MATCH"} / Match Count ${relation.exact_match_count ?? 0}`
    }));
  }

  if (duplicate.semantic_gap || mapping.property_mappings?.some((row) => row.console_field === "transaction_id" && row.validation === "BLOCKING_GAP")) {
    reasons.push(blockingReason({
      id: "transaction-duplicate",
      title: "중복 방지 기준 미확정",
      problem: "동일 요청의 재생성을 막을 전용 거래 식별 Property가 확인되지 않았습니다.",
      impact: "동일 Transaction을 다시 실행했을 때 중복 생성을 안정적으로 차단할 수 없습니다.",
      nextAction: "기존 Property 중 Transaction ID 저장 위치를 확정하세요.",
      technicalValue: `${duplicate.result ?? "LOOKUP_AVAILABLE_WITH_PROXY"} / ${duplicate.semantic_gap ?? "DURABLE_DUPLICATE_PROTECTION_UNCONFIRMED"}`
    }));
  }

  if (preview.scenario_id === "COMPOSITE-01" && mapping.property_mappings?.some((row) => row.console_field === "process_ids" && row.validation === "BLOCKING_GAP")) {
    reasons.push(blockingReason({
      id: "composite-process",
      title: "복합 업무 분류 기준 미확정",
      problem: "복합 요청의 여러 Process를 Request DB의 단일 업무 값으로 안전하게 표현하는 기준이 확인되지 않았습니다.",
      impact: "P03·P04·P07의 관계를 축약하는 과정에서 업무 상태가 왜곡될 수 있습니다.",
      nextAction: "복합 요청의 Process ID와 요청 업무 유형 Mapping을 확인하세요.",
      technicalValue: "BLOCKING_GAP / process_ids"
    }));
  }

  return reasons;
}

function plannedRequest(record) {
  return {
    title: record?.record_title ?? "확인 필요",
    fund: record?.properties?.["FUND 업무"] === "NOT_WRITTEN" ? "아직 생성하지 않음" : record?.properties?.["FUND 업무"] ?? "저장 위치 미확정",
    process: record?.properties?.["Process ID"] === "NOT_WRITTEN" ? "저장 위치 미확정" : record?.properties?.["Process ID"] ?? "저장 위치 미확정",
    status: record?.properties?.["요청 상태"] ?? "확인 필요",
    request_text: record?.properties?.["요청 배경"] ?? "-",
    preview_only: record?.properties?.["LAB 여부"] === true,
    write_status: koreanLabel(record?.write_status)
  };
}

function plannedTask(record) {
  return {
    title: record?.record_title ?? "확인 필요",
    status: record?.ui_status ?? koreanLabel(record?.canonical_stage),
    actor: record?.actor ?? "[담당 확인 필요]",
    next_action: record?.next_action ?? "확인 필요",
    blocker: record?.blocker || "없음",
    completion_condition: record?.completion_condition ?? "확인 필요",
    completion_evidence: record?.completion_evidence?.length ? record.completion_evidence.join(", ") : "없음",
    completion_candidate: Boolean(record?.completion_candidate),
    completion_allowed: Boolean(record?.completion_allowed),
    write_status: koreanLabel(record?.write_status),
    technical: {
      operational_task_id: record?.operational_task_id,
      process_id: record?.process_id,
      canonical_stage: record?.canonical_stage
    }
  };
}

/**
 * Builds a UI-only model from the existing read-only mapping payload.
 */
export function buildBusinessDecisionView(mapping) {
  const preview = mapping?.preview_output ?? {};
  const request = preview.request ?? {};
  const demo = preview.demo_request ?? {};
  const task = currentTask(preview);
  const validation = mapping?.validation_summary ?? {};
  const reasons = blockingReasons(mapping ?? {});
  const approvalBlocked = validation.status === "APPROVAL_BLOCKED" || validation.write_allowed === false;
  const relationReady = mapping?.relation_preview?.relation_ready === true;
  const transactionMapped = !mapping?.property_mappings?.some((row) => row.console_field === "transaction_id" && row.validation === "BLOCKING_GAP");
  const processMappingBlocked = preview.scenario_id === "COMPOSITE-01" && mapping?.property_mappings?.some((row) => row.console_field === "process_ids" && row.validation === "BLOCKING_GAP");
  const execution = preview.execution ?? mapping?.execution ?? {};

  return {
    function_goal: BUSINESS_FUNCTION_GOAL,
    header_badges: ["읽기 전용", "승인 전", "실제 반영 없음"],
    request_summary: {
      title: demo.title ?? mapping?.request_record_preview?.record_title ?? "선택 요청",
      fund: request.dummy_fund_id ?? demo.dummy_fund_id ?? "확인 필요",
      process: request.process_ids?.join(", ") ?? "확인 필요",
      status: demo.display_status ?? koreanLabel(request.overall_status),
      owner: task.actor ?? demo.current_actor ?? "[담당 확인 필요]",
      next_action: task.next_action ?? "확인 필요",
      request_id: mapping?.request_id ?? demo.request_id,
      technical: {
        scenario_id: preview.scenario_id ?? mapping?.scenario_id,
        transaction_id: request.transaction_id,
        manifest_id: preview.manifest?.manifest_id,
        schema_source: mapping?.schema_source,
        skill_commit: mapping?.audit?.skill_commit,
        console_version: mapping?.console_version
      }
    },
    hero: {
      status: koreanLabel(validation.status),
      description: approvalBlocked
        ? "현재 요청은 아래 조건이 해결되기 전에는 Notion TEST DB에 반영할 수 없습니다."
        : "현재 확인된 조건에서는 별도 TEST Write TAP을 위한 승인 범위를 검토할 수 있습니다.",
      blocking_count: validation.blocking_gaps ?? reasons.length,
      planned_request_count: mapping?.request_record_preview?.planned_record_count ?? 0,
      planned_task_count: mapping?.task_record_previews?.length ?? 0,
      actual_write_count: mapping?.write_count ?? 0,
      approval_status: koreanLabel(mapping?.approval_state ?? "NOT_REVIEWED"),
      canonical_status: validation.status,
      write_allowed: false
    },
    blockers: reasons,
    current_action: {
      owner: task.actor ?? "[담당 확인 필요]",
      next_action: task.next_action ?? "확인 필요",
      blocker: task.blocker || "없음",
      human_question: preview.interaction?.human_confirmation_required ? preview.interaction.questions?.[0] ?? "확인 필요" : "없음",
      completion_allowed: Boolean(task.completion_allowed),
      db_confirmation: approvalBlocked ? "조합 관계 대상 및 거래 식별 Property 확정" : "별도 TEST Write 범위 승인 확인"
    },
    planned: {
      request: plannedRequest(mapping?.request_record_preview),
      tasks: (mapping?.task_record_previews ?? []).map(plannedTask)
    },
    checklist: [
      readinessItem("request-db", "Request DB 연결", "확인 완료", "기존 TEST LAB Request DB Schema를 읽기 전용으로 확인했습니다.", "PASS"),
      readinessItem("task-db", "Task DB 연결", "확인 완료", "기존 TEST LAB Task DB Schema를 읽기 전용으로 확인했습니다.", "PASS"),
      readinessItem("fund-relation", "조합 관계 대상 확인", relationReady ? "확인 완료" : "차단", relationReady ? "정확히 하나의 조합 대상이 확인되었습니다." : "정확히 일치하는 조합 대상이 없어 관계를 만들 수 없습니다.", mapping?.relation_preview?.result),
      readinessItem("duplicate", "중복 식별 기준 확인", transactionMapped ? "확인 완료" : "차단", transactionMapped ? "전용 거래 식별 기준이 확인되었습니다." : "전용 Transaction ID 저장 위치가 확인되지 않았습니다.", mapping?.duplicate_preview?.result),
      readinessItem("request-task", "Request–Task Relation 확인", "확인 완료", "Request 생성 후 Task를 순차적으로 연결하는 계획이 확인되었습니다.", validation.request_task_relation),
      readinessItem("properties", "필수 Property Mapping", processMappingBlocked ? "차단" : validation.gaps ? "확인 필요" : "확인 완료", processMappingBlocked ? "복합 요청의 Process Mapping을 확정해야 합니다." : "확인되지 않은 저장 위치는 상세 검증에서 분리해 표시합니다.", validation.status),
      readinessItem("completion", "자동 완료 차단", execution.downstream_auto_completion === false && execution.request_completion_allowed === false ? "확인 완료" : "확인 필요", "자동 완료와 Request 완료는 허용되지 않습니다.", "COMPLETION_GUARD"),
      readinessItem("write", "승인 전 Write 0", (mapping?.write_count ?? 0) === 0 && execution.operational_write_count === 0 ? "확인 완료" : "차단", "실제 Notion 및 운영 데이터 반영은 실행하지 않았습니다.", "WRITE_NOT_EXECUTED")
    ],
    approval: {
      disabled: approvalBlocked,
      label: "TEST 반영 범위 검토",
      reason: approvalBlocked ? "조합 연결 대상과 거래 식별 기준이 확정되어야 승인할 수 있습니다." : "별도 TEST Write TAP의 범위와 대상을 검토하세요.",
      actual_write_label: "실제 Notion 반영: 0건",
      status: koreanLabel(mapping?.approval_state ?? "NOT_REVIEWED")
    },
    technical: {
      canonical: {
        validation_status: validation.status,
        relation_result: mapping?.relation_preview?.result,
        duplicate_result: mapping?.duplicate_preview?.result,
        duplicate_semantic_gap: mapping?.duplicate_preview?.semantic_gap,
        request_task_relation: validation.request_task_relation,
        actual: mapping?.expected_actual?.actual,
        result: mapping?.expected_actual?.result
      },
      mapping_headers: ["화면 데이터", "원본 값", "대상 DB", "실제 Notion Property", "Property 유형", "Mapping 규칙", "검증 결과", "생성 예정 값", "확인 필요 사항"]
    }
  };
}
