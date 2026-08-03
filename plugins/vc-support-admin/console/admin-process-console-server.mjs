#!/usr/bin/env node

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { once } from "node:events";

import {
  normalizePrototypeRequest,
  replayAdminProcessPrototype
} from "../kernel/admin-process-prototype-replay.mjs";
import {
  NOTION_READINESS_SNAPSHOT,
  notionReadinessMetadata
} from "./notion-readiness-snapshot.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(here, "public");
const fixturePaths = Object.freeze({
  "SINGLE-P03-01": path.resolve(here, "../fixtures/prototype-single-p03-normal.json"),
  "SINGLE-P03-02": path.resolve(here, "../fixtures/prototype-single-p03-human-confirmation.json"),
  "COMPOSITE-01": path.resolve(here, "../fixtures/prototype-composite-p03-p04-p07.json")
});

export const CONSOLE_VERSION = "PILOT v0.4";
export const SUPPORTED_SCENARIOS = Object.freeze(Object.keys(fixturePaths));
export const DEFAULT_SCENARIO_ID = "SINGLE-P03-02";
export const DEFAULT_REQUEST_TEXT = "DUMMY-FUND-B의 고유번호증 신청 건을 확인해줘.\n신청서 초안은 있지만 날인본 원본은 아직 준비되지 않았어.";
export const SKILL_BASELINE_COMMIT = "2814ce0c067bf448e35ca6c14fddd0d38123fa07";
export const SCHEMA_SOURCE = "APPROVED_SESSION_TOOL_READ_ONLY_2026-08-03";
export const BATCH_ID = "A-CP25-B25";

const requestDb = "[TEST LAB] 지원팀 업무요청";
const taskDb = "[TEST LAB] 지원팀 Task";
const stageDisplayMapping = Object.freeze({
  RECEIVED: "요청 접수",
  INFORMATION_CHECK: "확인 필요",
  EVIDENCE_REVIEW: "확인 필요",
  HUMAN_CONFIRMATION: "확인 필요",
  EXTERNAL_WAIT: "외부 대기",
  RESULT_REVIEW: "진행 가능",
  NEXT_PROCESS: "진행 가능",
  COMPLETION_CANDIDATE: "완료 후보",
  BLOCKED: "중단"
});

export const DEMO_REQUESTS = Object.freeze([
  Object.freeze({
    request_id: "REQ-DEMO-001",
    title: "고유번호증 신청 — 날인본 확인 필요",
    scenario_id: "SINGLE-P03-02",
    dummy_fund_id: "DUMMY-FUND-B",
    display_status: "확인 필요",
    source_mode: "NATURAL_LANGUAGE_PREVIEW",
    current_actor: "사람 확인",
    has_blocker: true,
    request_text: DEFAULT_REQUEST_TEXT
  }),
  Object.freeze({
    request_id: "REQ-DEMO-002",
    title: "고유번호증 신청 — 결과물 검토",
    scenario_id: "SINGLE-P03-01",
    dummy_fund_id: "DUMMY-FUND-A",
    display_status: "완료 후보",
    source_mode: "FIXTURE_PRESET",
    current_actor: "지원팀",
    has_blocker: false
  }),
  Object.freeze({
    request_id: "REQ-DEMO-003",
    title: "고유번호증·홈택스·계좌개설 복합 요청",
    scenario_id: "COMPOSITE-01",
    dummy_fund_id: "DUMMY-FUND-E",
    display_status: "부분 중단",
    source_mode: "FIXTURE_PRESET",
    current_actor: "지원팀",
    has_blocker: true
  })
]);

const contentTypes = Object.freeze({
  "/": "text/html; charset=utf-8",
  "/index.html": "text/html; charset=utf-8",
  "/console.js": "text/javascript; charset=utf-8",
  "/console.css": "text/css; charset=utf-8"
});

function publicDemoRequest(demo) {
  const { request_text, ...publicDemo } = demo;
  return {
    ...publicDemo,
    // This pilot's one supported natural-language request is non-sensitive fixture text.
    // The client needs it to initialize the Preview without inventing missing evidence.
    request_text: demo.source_mode === "NATURAL_LANGUAGE_PREVIEW" ? request_text : undefined
  };
}

function findDemoRequest(requestId) {
  return DEMO_REQUESTS.find((demo) => demo.request_id === requestId) ?? null;
}

function kstNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date()).reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second} KST`;
}

function safeExecution() {
  return {
    notion_write_enabled: false,
    notion_write_count: 0,
    operational_write_allowed: false,
    operational_write_count: 0,
    request_completion_allowed: false,
    downstream_auto_completion: false
  };
}

function backendStatus() {
  return {
    ...notionReadinessMetadata(),
    notion_schema: "LIVE_READ_ONLY_SESSION_SNAPSHOT",
    notion_backend: "READ_ONLY",
    request_db: NOTION_READINESS_SNAPSHOT.databases.request.label,
    task_db: NOTION_READINESS_SNAPSHOT.databases.task.label,
    dummy_fund_db: NOTION_READINESS_SNAPSHOT.databases.fund_work.label
  };
}

function sendJson(response, status, value) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(value, null, 2));
}

function sendError(response, status, errorCode, message, extra = {}) {
  sendJson(response, status, {
    ok: false,
    error_code: errorCode,
    message,
    supported_scenarios: [...SUPPORTED_SCENARIOS],
    schema_source: SCHEMA_SOURCE,
    ...backendStatus(),
    execution: safeExecution(),
    write_count: 0,
    operational_write_count: 0,
    ...extra
  });
}

async function readJsonBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body, "utf8") > 64 * 1024) {
      const error = new Error("Request body exceeds 64 KiB.");
      error.code = "REQUEST_BODY_TOO_LARGE";
      throw error;
    }
  }
  try {
    return JSON.parse(body || "{}");
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.code = "INVALID_JSON";
    throw error;
  }
}

async function readStatic(route) {
  const filename = route === "/" ? "index.html" : route.slice(1);
  return readFile(path.join(publicDir, filename));
}

async function loadFixture(scenarioId) {
  const fixturePath = fixturePaths[scenarioId];
  if (!fixturePath) {
    const error = new Error("This pilot supports implemented scenarios only.");
    error.code = "UNSUPPORTED_SCENARIO";
    throw error;
  }
  return JSON.parse((await readFile(fixturePath, "utf8")).replace(/^\uFEFF/, ""));
}

function fixtureRequestContext(demo, fixture) {
  return {
    request_text: demo.title,
    transaction_id: fixture.transaction_id,
    scenario_id: fixture.scenario_id,
    dummy_fund_id: demo.dummy_fund_id,
    process_ids: [...new Set((fixture.lanes ?? []).map((lane) => lane.process_id).filter(Boolean))],
    preview_only: true,
    missing_information: [],
    clarification_question: null
  };
}

function enrichPreview(output, demo) {
  return {
    ok: true,
    ...output,
    request_id: demo.request_id,
    demo_request: publicDemoRequest(demo),
    source_mode: demo.source_mode,
    evidence: output.evidence_decisions,
    manifest: output.conformance_claim,
    schema_source: SCHEMA_SOURCE,
    ...backendStatus(),
    display_mapping: stageDisplayMapping,
    console_version: CONSOLE_VERSION,
    execution: { ...output.execution, notion_write_enabled: false, notion_write_count: 0, operational_write_count: 0 }
  };
}

export async function buildConsolePreview({ request_id: requestId, request_text: requestText, scenario_id: scenarioId } = {}) {
  const demo = requestId ? findDemoRequest(requestId) : DEMO_REQUESTS[0];
  if (!demo) {
    const error = new Error("The requested demo request is not available in this pilot.");
    error.code = "UNSUPPORTED_DEMO_REQUEST";
    throw error;
  }

  const selectedScenarioId = scenarioId ?? demo.scenario_id;
  if (!SUPPORTED_SCENARIOS.includes(selectedScenarioId)) {
    const error = new Error("This pilot supports implemented scenarios only.");
    error.code = "UNSUPPORTED_SCENARIO";
    throw error;
  }
  if (selectedScenarioId !== demo.scenario_id) {
    const error = new Error("The selected request must use its registered scenario.");
    error.code = "REQUEST_SCENARIO_MISMATCH";
    throw error;
  }

  const fixture = await loadFixture(selectedScenarioId);
  if (demo.source_mode === "NATURAL_LANGUAGE_PREVIEW") {
    const effectiveRequestText = requestText ?? demo.request_text;
    if (typeof effectiveRequestText !== "string" || !effectiveRequestText.trim()) {
      const error = new Error("request_text is required for NATURAL_LANGUAGE_PREVIEW.");
      error.code = "REQUEST_TEXT_REQUIRED";
      throw error;
    }
    const normalizedRequest = normalizePrototypeRequest(effectiveRequestText);
    if (normalizedRequest.missing_information.length > 0) {
      return {
        ok: false,
        error_code: "REQUEST_CLARIFICATION_REQUIRED",
        message: "현재 지원 Scenario에 필요한 정보가 부족합니다.",
        request_id: demo.request_id,
        demo_request: publicDemoRequest(demo),
        source_mode: demo.source_mode,
        supported_scenarios: [...SUPPORTED_SCENARIOS],
        request: normalizedRequest,
        interaction: {
          clarification_required: true,
          human_confirmation_required: false,
          questions: [normalizedRequest.clarification_question]
        },
        schema_source: SCHEMA_SOURCE,
        ...backendStatus(),
        execution: safeExecution(),
        write_count: 0,
        operational_write_count: 0,
        console_version: CONSOLE_VERSION
      };
    }
    if (normalizedRequest.scenario_id !== selectedScenarioId) {
      const error = new Error("Request text does not map to the selected scenario.");
      error.code = "REQUEST_SCENARIO_MISMATCH";
      throw error;
    }
    return enrichPreview(replayAdminProcessPrototype(fixture, { requestContext: normalizedRequest }), demo);
  }

  return enrichPreview(replayAdminProcessPrototype(fixture, {
    requestContext: fixtureRequestContext(demo, fixture)
  }), demo);
}

function mappingRow({ consoleField, sourceValue, targetDb, targetProperty, mappingRule, propertyType = "UNMAPPED", validation = "PASS", writeValue = "NOT_WRITTEN", gap = "", blocking = false }) {
  return {
    console_field: consoleField,
    source_value: sourceValue,
    target_db: targetDb,
    target_property: targetProperty,
    property_type: propertyType,
    mapping_rule: mappingRule,
    validation,
    write_value: writeValue,
    gap,
    blocking
  };
}

function requestTypeFor(processIds) {
  if (processIds.length !== 1) return null;
  return { P03: "고유번호증 신청", P04: "보안카드·홈택스", P07: "계좌개설", P08: "계좌개설 보완" }[processIds[0]] ?? null;
}

function taskStatusForStage() {
  return "진행 중";
}

function evidenceForTask(preview, task) {
  return (preview.evidence ?? []).filter((evidence) => evidence.lane_id?.endsWith(`/${task.process_id}`));
}

function evidenceJudgment(taskEvidence) {
  return taskEvidence.some((item) => item.evidence_result === "MISSING" || item.human_confirmation_required)
    ? "사람 확인 필요"
    : "확인 완료";
}

function evidenceSource(taskEvidence) {
  return [...new Set(taskEvidence.map((item) => item.source).filter(Boolean))].join(", ") || "NOT_WRITTEN";
}

function propertyType(database, property) {
  return NOTION_READINESS_SNAPSHOT.databases[database]?.properties?.[property] ?? "UNMAPPED";
}

function duplicatePreviewFor(transactionId) {
  const result = NOTION_READINESS_SNAPSHOT.transaction_duplicate_lookup.results[transactionId];
  return {
    transaction_id: transactionId,
    ...(result ?? { request_match_count: 0, task_match_count: 0, result: "LOOKUP_UNAVAILABLE", proposed_action: "BLOCK_TEST_WRITE" }),
    lookup_properties: NOTION_READINESS_SNAPSHOT.transaction_duplicate_lookup.lookup_properties,
    semantic_gap: NOTION_READINESS_SNAPSHOT.transaction_duplicate_lookup.semantic_gap,
    write_count: 0
  };
}

function relationPreviewFor(dummyFundId) {
  const result = NOTION_READINESS_SNAPSHOT.dummy_fund_exact_matches[dummyFundId];
  return {
    dummy_fund_id: dummyFundId,
    ...(result ?? { result: "NO_MATCH", exact_match_count: 0, matched_record: "NOT_FOUND", relation_ready: false }),
    target_property: "FUND 업무",
    target_data_source_id: NOTION_READINESS_SNAPSHOT.databases.fund_work.data_source_id,
    write_count: 0
  };
}

function requestMapping(preview, demo) {
  const request = preview.request;
  const processIds = request.process_ids ?? [];
  const requestType = requestTypeFor(processIds);
  const relationPreview = relationPreviewFor(request.dummy_fund_id);
  const mappings = [
    mappingRow({ consoleField: "request_title", sourceValue: demo.title, targetDb: requestDb, targetProperty: "요청명", propertyType: propertyType("request", "요청명"), mappingRule: "Live title property", writeValue: demo.title }),
    mappingRow({ consoleField: "request_text", sourceValue: request.request_text, targetDb: requestDb, targetProperty: "요청 배경", propertyType: propertyType("request", "요청 배경"), mappingRule: "Live text property", writeValue: request.request_text }),
    mappingRow({ consoleField: "transaction_id", sourceValue: request.transaction_id, targetDb: requestDb, targetProperty: "UNMAPPED", propertyType: "UNMAPPED", mappingRule: "No dedicated live Transaction ID property; do not overload another property without approval.", validation: "BLOCKING_GAP", gap: "Durable transaction duplicate protection cannot be established.", blocking: true }),
    mappingRow({ consoleField: "dummy_fund_id", sourceValue: request.dummy_fund_id, targetDb: requestDb, targetProperty: "FUND 업무", propertyType: propertyType("request", "FUND 업무"), mappingRule: "Live relation requires one exact matched target record.", validation: relationPreview.relation_ready ? "PASS" : "BLOCKING_GAP", gap: relationPreview.relation_ready ? "" : `${relationPreview.result}: exact matched Dummy Fund relation is required.`, blocking: !relationPreview.relation_ready }),
    mappingRow({ consoleField: "process_ids", sourceValue: processIds.join(", "), targetDb: requestDb, targetProperty: "Process ID", propertyType: propertyType("request", "Process ID"), mappingRule: "Live select supports a single process only.", validation: processIds.length === 1 ? "PASS" : "BLOCKING_GAP", writeValue: processIds.length === 1 ? processIds[0] : "NOT_WRITTEN", gap: processIds.length === 1 ? "" : "Composite request cannot be reduced to one process without a confirmed mapping.", blocking: processIds.length !== 1 }),
    mappingRow({ consoleField: "request_type", sourceValue: requestType ?? processIds.join(", "), targetDb: requestDb, targetProperty: "요청 업무 유형", propertyType: propertyType("request", "요청 업무 유형"), mappingRule: "Live select option reused only when a single process maps exactly.", validation: requestType ? "PASS" : "CONFIRM_REQUIRED", writeValue: requestType ?? "NOT_WRITTEN", gap: requestType ? "" : "Composite request type needs a user-confirmed mapping." }),
    mappingRow({ consoleField: "overall_status", sourceValue: demo.display_status, targetDb: requestDb, targetProperty: "요청 상태", propertyType: propertyType("request", "요청 상태"), mappingRule: "Use live in-progress status; never map a candidate to complete.", writeValue: "진행 중" }),
    mappingRow({ consoleField: "preview_only", sourceValue: true, targetDb: requestDb, targetProperty: "UNMAPPED", propertyType: "UNMAPPED", mappingRule: "The live Request schema has no Preview flag; no new property is proposed.", validation: "UNMAPPED", gap: "Preview-only remains console metadata, not a Notion property." }),
    mappingRow({ consoleField: "request_task_relation", sourceValue: `${preview.tasks?.length ?? 0} Task`, targetDb: taskDb, targetProperty: "상위 요청", propertyType: propertyType("task", "상위 요청"), mappingRule: "Task-side live relation is populated only after the Request create/requery step.", validation: "PASS_SEQUENTIAL_RELATION", writeValue: "POST_CREATE_REQUEST_PAGE_ID" })
  ];
  return {
    mappings,
    record_preview: {
      target_db: requestDb,
      planned_record_count: 1,
      record_title: demo.title,
      transaction_id: request.transaction_id,
      properties: {
        "요청명": demo.title,
        "요청 배경": request.request_text,
        "Process ID": processIds.length === 1 ? processIds[0] : "NOT_WRITTEN",
        "요청 업무 유형": requestType ?? "NOT_WRITTEN",
        "요청 상태": "진행 중",
        "LAB 여부": true,
        "FUND 업무": relationPreview.relation_ready ? relationPreview.matched_record : "NOT_WRITTEN"
      },
      unmapped_properties: ["transaction_id", "preview_only"],
      write_status: "NOT_WRITTEN"
    }
  };
}

function taskMapping(preview, task, requestTransactionId) {
  const evidence = evidenceForTask(preview, task);
  const confirmation = task.actor === "사람 확인" ? preview.interaction?.questions?.[0] ?? "NOT_WRITTEN" : "NOT_WRITTEN";
  const title = `${task.process_id} · ${task.operational_task_id}`;
  const mappings = [
    mappingRow({ consoleField: "task_title", sourceValue: title, targetDb: taskDb, targetProperty: "Task명", propertyType: propertyType("task", "Task명"), mappingRule: "Live title property", writeValue: title }),
    mappingRow({ consoleField: "operational_task_id", sourceValue: task.operational_task_id, targetDb: taskDb, targetProperty: "Operational Task ID", propertyType: propertyType("task", "Operational Task ID"), mappingRule: "Live text property", writeValue: task.operational_task_id }),
    mappingRow({ consoleField: "process_id", sourceValue: task.process_id, targetDb: taskDb, targetProperty: "Process ID", propertyType: propertyType("task", "Process ID"), mappingRule: "Live select option", writeValue: task.process_id }),
    mappingRow({ consoleField: "canonical_stage", sourceValue: task.stage, targetDb: taskDb, targetProperty: "UNMAPPED", mappingRule: "Canonical Stage는 Console/Skill Vocabulary; Notion에는 새 Property를 만들지 않음", validation: "UNMAPPED", writeValue: "NOT_WRITTEN", gap: "Task 상태와 UI Label로만 표시" }),
    mappingRow({ consoleField: "ui_status", sourceValue: stageDisplayMapping[task.stage] ?? task.stage, targetDb: taskDb, targetProperty: "Task 상태", propertyType: propertyType("task", "Task 상태"), mappingRule: "Use live in-progress status; never complete a candidate.", writeValue: taskStatusForStage(task.stage) }),
    mappingRow({ consoleField: "actor", sourceValue: task.actor, targetDb: taskDb, targetProperty: "현재 Actor", propertyType: propertyType("task", "현재 Actor"), mappingRule: "Live select option", writeValue: task.actor }),
    mappingRow({ consoleField: "next_action", sourceValue: task.next_action, targetDb: taskDb, targetProperty: "다음 Action", propertyType: propertyType("task", "다음 Action"), mappingRule: "Live text property", writeValue: task.next_action }),
    mappingRow({ consoleField: "blocker", sourceValue: task.blocker || "", targetDb: taskDb, targetProperty: "Blocker", propertyType: propertyType("task", "Blocker"), mappingRule: "Live text property", writeValue: task.blocker || "" }),
    mappingRow({ consoleField: "completion_condition", sourceValue: task.completion_condition, targetDb: taskDb, targetProperty: "완료조건", propertyType: propertyType("task", "완료조건"), mappingRule: "Live text property", writeValue: task.completion_condition }),
    mappingRow({ consoleField: "completion_evidence", sourceValue: task.completion_evidence?.join(", ") || "", targetDb: taskDb, targetProperty: "완료증빙", propertyType: propertyType("task", "완료증빙"), mappingRule: "Live text property", writeValue: task.completion_evidence?.join(", ") || "" }),
    mappingRow({ consoleField: "evidence_judgment", sourceValue: evidenceJudgment(evidence), targetDb: taskDb, targetProperty: "Evidence 판정", propertyType: propertyType("task", "Evidence 판정"), mappingRule: "Live select option", writeValue: evidenceJudgment(evidence) }),
    mappingRow({ consoleField: "evidence_source", sourceValue: evidenceSource(evidence), targetDb: taskDb, targetProperty: "Evidence Source", propertyType: propertyType("task", "Evidence Source"), mappingRule: "Live text property", writeValue: evidenceSource(evidence) }),
    mappingRow({ consoleField: "evidence_confirmation", sourceValue: confirmation, targetDb: taskDb, targetProperty: "Evidence 확인사항", propertyType: propertyType("task", "Evidence 확인사항"), mappingRule: "Human question only when present.", validation: confirmation === "NOT_WRITTEN" ? "NOT_WRITTEN" : "PASS", writeValue: confirmation }),
    mappingRow({ consoleField: "related_fund", sourceValue: preview.request?.dummy_fund_id, targetDb: taskDb, targetProperty: "관련 조합", propertyType: "text", mappingRule: "Live text field retains the non-sensitive fixture key.", writeValue: preview.request?.dummy_fund_id }),
    mappingRow({ consoleField: "parent_request_transaction", sourceValue: requestTransactionId, targetDb: taskDb, targetProperty: "상위 요청", propertyType: propertyType("task", "상위 요청"), mappingRule: "Bind the actual Request page ID only after the Request create/requery step.", validation: "PASS_SEQUENTIAL_RELATION", writeValue: "POST_CREATE_REQUEST_PAGE_ID" }),
    mappingRow({ consoleField: "preview_only", sourceValue: true, targetDb: taskDb, targetProperty: "LAB 여부", propertyType: propertyType("task", "LAB 여부"), mappingRule: "Live TEST LAB checkbox", writeValue: true })
  ];
  return {
    mappings,
    record_preview: {
      target_db: taskDb,
      planned_record_count: 1,
      record_title: title,
      operational_task_id: task.operational_task_id,
      process_id: task.process_id,
      canonical_stage: task.stage,
      ui_status: stageDisplayMapping[task.stage] ?? task.stage,
      actor: task.actor,
      next_action: task.next_action,
      blocker: task.blocker || "",
      completion_condition: task.completion_condition,
      completion_evidence: task.completion_evidence ?? [],
      completion_candidate: task.completion_candidate,
      completion_allowed: task.completion_allowed,
      parent_request_transaction_id: requestTransactionId,
      properties: Object.fromEntries(mappings.filter((row) => row.target_property !== "UNMAPPED").map((row) => [row.target_property, row.write_value])),
      write_status: "NOT_WRITTEN"
    }
  };
}

export async function buildMappingPreview({ request_id: requestId, scenario_id: scenarioId, preview_output: previewOutput } = {}) {
  const demo = findDemoRequest(requestId);
  if (!demo) {
    const error = new Error("The requested demo request is not available in this pilot.");
    error.code = "UNSUPPORTED_DEMO_REQUEST";
    throw error;
  }
  if (scenarioId && scenarioId !== demo.scenario_id) {
    const error = new Error("The selected request must use its registered scenario.");
    error.code = "REQUEST_SCENARIO_MISMATCH";
    throw error;
  }
  const preview = await buildConsolePreview({
    request_id: demo.request_id,
    scenario_id: demo.scenario_id,
    request_text: demo.source_mode === "NATURAL_LANGUAGE_PREVIEW" ? previewOutput?.request?.request_text ?? demo.request_text : undefined
  });
  if (preview.ok === false) {
    const error = new Error("Mapping preview requires a successful Skill Preview.");
    error.code = "PREVIEW_OUTPUT_REQUIRED";
    throw error;
  }

  const requestPreview = requestMapping(preview, demo);
  const taskPreviews = (preview.tasks ?? []).map((task) => taskMapping(preview, task, preview.request.transaction_id));
  const propertyMappings = [...requestPreview.mappings, ...taskPreviews.flatMap((task) => task.mappings)];
  const relationPreview = relationPreviewFor(preview.request.dummy_fund_id);
  const duplicatePreview = duplicatePreviewFor(preview.request.transaction_id);
  const gaps = propertyMappings.filter((mapping) => ["UNMAPPED", "CONFIRM_REQUIRED", "BLOCKING_GAP"].includes(mapping.validation));
  const blockingGaps = propertyMappings.filter((mapping) => mapping.blocking || mapping.validation === "BLOCKING_GAP");
  const passed = propertyMappings.filter((mapping) => mapping.validation.startsWith("PASS")).length;
  const validationSummary = {
    status: blockingGaps.length === 0 ? "READY_FOR_TEST_WRITE_APPROVAL" : "APPROVAL_BLOCKED",
    required_mapping: propertyMappings.length,
    passed,
    gaps: gaps.length,
    blocking_gaps: blockingGaps.length,
    gap_details: gaps.map((mapping) => ({ console_field: mapping.console_field, target_property: mapping.target_property, validation: mapping.validation, gap: mapping.gap })),
    duplicate_check: duplicatePreview.result,
    duplicate_check_plan: duplicatePreview.proposed_action,
    request_task_relation: "PASS_SEQUENTIAL_RELATION",
    write_allowed: false,
    notion_write_enabled: false,
    note: blockingGaps.length === 0
      ? "This is a local approval simulation. A separate TEST Write TAP remains required."
      : "TEST Write is blocked: live schema relation and/or durable transaction mapping need confirmation."
  };
  const audit = {
    preview_generated_at_kst: kstNow(),
    skill_commit: SKILL_BASELINE_COMMIT,
    console_version: CONSOLE_VERSION,
    manifest_id: preview.manifest?.manifest_id ?? "PROTOTYPE-SCENARIO-CONTRACT-V0.1",
    batch_id: BATCH_ID,
    transaction_id: preview.request.transaction_id,
    approval_status: validationSummary.status === "APPROVAL_BLOCKED" ? "APPROVAL_BLOCKED" : "NOT_REVIEWED",
    approved_by: "NOT_WRITTEN",
    write_count: 0
  };
  return {
    ok: true,
    console_version: CONSOLE_VERSION,
    schema_source: SCHEMA_SOURCE,
    ...backendStatus(),
    request_id: demo.request_id,
    scenario_id: preview.scenario_id,
    preview_output: preview,
    request_record_preview: requestPreview.record_preview,
    task_record_previews: taskPreviews.map((task) => task.record_preview),
    property_mappings: propertyMappings,
    relation_preview: relationPreview,
    duplicate_preview: duplicatePreview,
    notion_readiness: NOTION_READINESS_SNAPSHOT,
    request_payload_preview: requestPreview.record_preview,
    task_payload_previews: taskPreviews.map((task) => task.record_preview),
    write_plan: [
      "Duplicate requery using the confirmed transaction mapping.",
      "Confirm one exact Dummy Fund relation target.",
      "Create one TEST Request record, then requery its page ID.",
      "Create Tasks sequentially with the Task-side 상위 요청 relation.",
      "Requery relations and compare Expected–Actual.",
      "Stop later Task creation on any failure; never auto-complete.",
      "Replay the same transaction only after durable duplicate protection is confirmed."
    ],
    atomicity_preview: {
      composite_request: preview.scenario_id === "COMPOSITE-01",
      task_create_order: (preview.tasks ?? []).map((task) => task.process_id),
      failure_policy: "STOP_AFTER_FIRST_TASK_FAILURE",
      existing_record_mutation: "PROHIBITED",
      automatic_completion: false
    },
    validation_summary: validationSummary,
    approval_state: audit.approval_status,
    approval_preview: {
      approval_status: audit.approval_status,
      next_step: validationSummary.status === "APPROVAL_BLOCKED" ? "RESOLVE_BLOCKING_SCHEMA_GAPS" : "SEPARATE_TEST_WRITE_TAP",
      write_count: 0
    },
    expected_actual: {
      expected: { request_record_preview: requestPreview.record_preview, task_record_previews: taskPreviews.map((task) => task.record_preview) },
      actual: "NOT_WRITTEN",
      result: "PREVIEW_ONLY"
    },
    audit,
    execution: safeExecution(),
    write_count: 0,
    operational_write_count: 0
  };
}

export async function buildApprovalPreview({ request_id: requestId, scenario_id: scenarioId, action = "approve", preview_output: previewOutput } = {}) {
  const mappingPreview = await buildMappingPreview({ request_id: requestId, scenario_id: scenarioId, preview_output: previewOutput });
  const approvalStatus = action === "approve" && mappingPreview.validation_summary.blocking_gaps === 0
    ? "APPROVED_FOR_SEPARATE_TEST_WRITE_TAP"
    : action === "approve" ? "APPROVAL_BLOCKED" : action === "needs_changes" ? "NEEDS_USER_CHANGES" : "CANCELLED_LOCAL_SIMULATION";
  return {
    ok: true,
    request_id: mappingPreview.request_id,
    scenario_id: mappingPreview.scenario_id,
    approval_status: approvalStatus,
    approved_by: approvalStatus === "APPROVED_FOR_SEPARATE_TEST_WRITE_TAP" ? "LOCAL_DEMO_USER" : "NOT_WRITTEN",
    next_step: approvalStatus === "APPROVAL_BLOCKED" ? "RESOLVE_BLOCKING_SCHEMA_GAPS" : approvalStatus === "APPROVED_FOR_SEPARATE_TEST_WRITE_TAP" ? "SEPARATE_TEST_WRITE_TAP" : "REVIEW_MAPPING_PREVIEW",
    validation_summary: mappingPreview.validation_summary,
    audit: { ...mappingPreview.audit, approval_status: approvalStatus, approved_by: approvalStatus === "APPROVED_FOR_SEPARATE_TEST_WRITE_TAP" ? "LOCAL_DEMO_USER" : "NOT_WRITTEN" },
    execution: safeExecution(),
    write_count: 0,
    operational_write_count: 0
  };
}

export function buildNotionSchemaReadiness() {
  return {
    ok: true,
    console_version: CONSOLE_VERSION,
    schema_source: SCHEMA_SOURCE,
    readiness: NOTION_READINESS_SNAPSHOT,
    ...backendStatus(),
    execution: safeExecution(),
    notion_write_count: 0,
    operational_write_count: 0
  };
}

async function previewForNotionInput({ request_id: requestId, scenario_id: scenarioId, preview_output: previewOutput } = {}) {
  const demo = findDemoRequest(requestId);
  if (!demo) {
    const error = new Error("The requested demo request is not available in this pilot.");
    error.code = "UNSUPPORTED_DEMO_REQUEST";
    throw error;
  }
  return buildConsolePreview({
    request_id: demo.request_id,
    scenario_id: scenarioId ?? demo.scenario_id,
    request_text: demo.source_mode === "NATURAL_LANGUAGE_PREVIEW" ? previewOutput?.request?.request_text ?? demo.request_text : undefined
  });
}

export async function buildDuplicatePreview(input = {}) {
  const preview = await previewForNotionInput(input);
  return {
    ok: true,
    request_id: preview.request_id,
    scenario_id: preview.scenario_id,
    duplicate_preview: duplicatePreviewFor(preview.request.transaction_id),
    ...backendStatus(),
    execution: safeExecution(),
    notion_write_count: 0,
    operational_write_count: 0
  };
}

export async function buildRelationPreview(input = {}) {
  const preview = await previewForNotionInput(input);
  return {
    ok: true,
    request_id: preview.request_id,
    scenario_id: preview.scenario_id,
    relation_preview: relationPreviewFor(preview.request.dummy_fund_id),
    ...backendStatus(),
    execution: safeExecution(),
    notion_write_count: 0,
    operational_write_count: 0
  };
}

export async function buildTestWritePayloadPreview(input = {}) {
  const mapping = await buildMappingPreview(input);
  return {
    ok: true,
    ...mapping,
    request_payload_preview: mapping.request_record_preview,
    task_payload_previews: mapping.task_record_previews,
    ...backendStatus(),
    execution: safeExecution(),
    notion_write_count: 0,
    operational_write_count: 0
  };
}

export function createConsoleServer() {
  return createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    try {
      if (request.method === "GET" && url.pathname === "/favicon.ico") {
        response.writeHead(204, { "cache-control": "no-store" });
        response.end();
        return;
      }
      if (request.method === "GET" && Object.hasOwn(contentTypes, url.pathname)) {
        response.writeHead(200, { "content-type": contentTypes[url.pathname], "cache-control": "no-store" });
        response.end(await readStatic(url.pathname));
        return;
      }
      if (request.method === "GET" && url.pathname === "/api/demo-requests") {
        sendJson(response, 200, {
          ok: true,
          console_version: CONSOLE_VERSION,
          demo_requests: DEMO_REQUESTS.map(publicDemoRequest),
          supported_scenarios: [...SUPPORTED_SCENARIOS],
          schema_source: SCHEMA_SOURCE,
          ...backendStatus(),
          execution: safeExecution()
        });
        return;
      }
      if (request.method === "GET" && url.pathname === "/api/notion/schema-readiness") {
        sendJson(response, 200, buildNotionSchemaReadiness());
        return;
      }
      if (request.method === "POST" && url.pathname === "/api/preview") {
        const input = await readJsonBody(request);
        const preview = await buildConsolePreview(input);
        sendJson(response, preview.ok === false ? 422 : 200, preview);
        return;
      }
      if (request.method === "POST" && url.pathname === "/api/mapping-preview") {
        const preview = await buildMappingPreview(await readJsonBody(request));
        sendJson(response, 200, preview);
        return;
      }
      if (request.method === "POST" && url.pathname === "/api/notion/duplicate-preview") {
        sendJson(response, 200, await buildDuplicatePreview(await readJsonBody(request)));
        return;
      }
      if (request.method === "POST" && url.pathname === "/api/notion/relation-preview") {
        sendJson(response, 200, await buildRelationPreview(await readJsonBody(request)));
        return;
      }
      if (request.method === "POST" && url.pathname === "/api/notion/test-write-payload-preview") {
        sendJson(response, 200, await buildTestWritePayloadPreview(await readJsonBody(request)));
        return;
      }
      if (request.method === "POST" && url.pathname === "/api/approval-preview") {
        const approval = await buildApprovalPreview(await readJsonBody(request));
        sendJson(response, 200, approval);
        return;
      }
      sendError(response, 404, "NOT_FOUND", "Console route not found.");
    } catch (error) {
      const code = error.code ?? "CONSOLE_PREVIEW_FAILED";
      const status = code === "REQUEST_BODY_TOO_LARGE" ? 413 : code === "INVALID_JSON" || code === "REQUEST_TEXT_REQUIRED" || code === "UNSUPPORTED_SCENARIO" || code === "UNSUPPORTED_DEMO_REQUEST" || code === "REQUEST_SCENARIO_MISMATCH" || code === "PREVIEW_OUTPUT_REQUIRED" ? 400 : 500;
      sendError(response, status, code, error.message);
    }
  });
}

async function listen(server, port, host) {
  server.listen({ port, host });
  await once(server, "listening");
}

const configuredPort = typeof globalThis.process === "undefined" ? 4173 : Number(globalThis.process.env.PORT ?? 4173);

export async function startConsoleServer({ port = configuredPort, host = "127.0.0.1" } = {}) {
  const server = createConsoleServer();
  try {
    await listen(server, port, host);
  } catch (error) {
    if (error.code !== "EADDRINUSE") throw error;
    await listen(server, 0, host);
  }
  const address = server.address();
  return { server, host, port: address.port, url: `http://${host}:${address.port}` };
}

async function main() {
  const running = await startConsoleServer();
  console.log(`Admin process console ready: ${running.url}`);
  console.log("BACKEND_MODE=NOTION_LIVE_READ_PREVIEW | NOTION_SCHEMA=LIVE_READ_ONLY_SESSION_SNAPSHOT | NOTION_BACKEND=READ_ONLY | NOTION_WRITE_ENABLED=false | OPERATIONAL_WRITE_COUNT=0");
}

const invokedAsScript = typeof globalThis.process !== "undefined" && globalThis.process.argv[1] && path.resolve(globalThis.process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedAsScript) {
  main().catch((error) => {
    console.error(`Console startup failed: ${error.message}`);
    globalThis.process.exitCode = 1;
  });
}
