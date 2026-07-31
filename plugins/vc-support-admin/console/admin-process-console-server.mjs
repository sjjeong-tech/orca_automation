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

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(here, "public");
const fixturePaths = Object.freeze({
  "SINGLE-P03-01": path.resolve(here, "../fixtures/prototype-single-p03-normal.json"),
  "SINGLE-P03-02": path.resolve(here, "../fixtures/prototype-single-p03-human-confirmation.json"),
  "COMPOSITE-01": path.resolve(here, "../fixtures/prototype-composite-p03-p04-p07.json")
});

export const CONSOLE_VERSION = "PILOT v0.3";
export const SUPPORTED_SCENARIOS = Object.freeze(Object.keys(fixturePaths));
export const DEFAULT_SCENARIO_ID = "SINGLE-P03-02";
export const DEFAULT_REQUEST_TEXT = "DUMMY-FUND-B의 고유번호증 신청 건을 확인해줘.\n신청서 초안은 있지만 날인본 원본은 아직 준비되지 않았어.";
export const SKILL_BASELINE_COMMIT = "976b582d61ceaad27eb10569d774593bf3eb6907";
export const SCHEMA_SOURCE = "LIVE_READ_ONLY_SCHEMA_2026-07-31";
export const BATCH_ID = "A-CP25-B23";

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
  const { request_text: _requestText, ...publicDemo } = demo;
  return publicDemo;
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
    operational_write_allowed: false,
    operational_write_count: 0,
    request_completion_allowed: false,
    downstream_auto_completion: false
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
    backend_mode: "LOCAL_PREVIEW",
    notion_schema: "VALIDATED_REFERENCE",
    notion_backend: "NOT_CONNECTED",
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
    backend_mode: "LOCAL_PREVIEW",
    notion_schema: "VALIDATED_REFERENCE",
    notion_backend: "NOT_CONNECTED",
    display_mapping: stageDisplayMapping,
    console_version: CONSOLE_VERSION,
    execution: { ...output.execution, notion_write_enabled: false, operational_write_count: 0 }
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
        execution: safeExecution(),
        write_count: 0,
        operational_write_count: 0,
        backend_mode: "LOCAL_PREVIEW",
        notion_schema: "VALIDATED_REFERENCE",
        notion_backend: "NOT_CONNECTED",
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

function mappingRow({ consoleField, sourceValue, targetDb, targetProperty, mappingRule, validation = "PASS", writeValue = "NOT_WRITTEN", gap = "" }) {
  return {
    console_field: consoleField,
    source_value: sourceValue,
    target_db: targetDb,
    target_property: targetProperty,
    mapping_rule: mappingRule,
    validation,
    write_value: writeValue,
    gap
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

function requestMapping(preview, demo) {
  const request = preview.request;
  const processIds = request.process_ids ?? [];
  const requestType = requestTypeFor(processIds);
  const currentSummary = `Transaction ID: ${request.transaction_id} | UI 상태: ${demo.display_status} | Process: ${processIds.join(", ")}`;
  const mappings = [
    mappingRow({ consoleField: "request_title", sourceValue: demo.title, targetDb: requestDb, targetProperty: "요청명", mappingRule: "기존 Title Property", writeValue: demo.title }),
    mappingRow({ consoleField: "request_text", sourceValue: request.request_text, targetDb: requestDb, targetProperty: "요청 배경", mappingRule: "기존 Text Property", writeValue: request.request_text }),
    mappingRow({ consoleField: "transaction_id", sourceValue: request.transaction_id, targetDb: requestDb, targetProperty: "현재 요약", mappingRule: "전용 Transaction ID Property 부재: 기존 현재 요약에 Preview 식별자로 조합", validation: "CONFIRM_REQUIRED", writeValue: currentSummary, gap: "전용 Transaction ID Property가 없어 Persistent Store 중복 조회 전 확인 필요" }),
    mappingRow({ consoleField: "dummy_fund_id", sourceValue: request.dummy_fund_id, targetDb: requestDb, targetProperty: "FUND 업무", mappingRule: "기존 Relation의 TEST LAB FUND Work를 별도 Exact Match로 선택", validation: "CONFIRM_REQUIRED", writeValue: "NOT_WRITTEN", gap: "DUMMY Fund Key만으로 Relation Page를 자동 선택하지 않음" }),
    mappingRow({ consoleField: "process_ids", sourceValue: processIds.join(", "), targetDb: requestDb, targetProperty: "Process ID", mappingRule: "기존 Select; 단일 Process는 직접, 복합은 대표 P03과 현재 요약으로 보조", validation: processIds.length === 1 ? "PASS" : "CONFIRM_REQUIRED", writeValue: processIds[0] ?? "NOT_WRITTEN", gap: processIds.length === 1 ? "" : "기존 Select가 복수 Process를 직접 표현하지 못함" }),
    mappingRow({ consoleField: "request_type", sourceValue: requestType ?? processIds.join(", "), targetDb: requestDb, targetProperty: "요청 업무 유형", mappingRule: "기존 Select 옵션 재사용", validation: requestType ? "PASS" : "CONFIRM_REQUIRED", writeValue: requestType ?? "NOT_WRITTEN", gap: requestType ? "" : "복합 요청은 하나의 요청 업무 유형으로 자동 축약하지 않음" }),
    mappingRow({ consoleField: "overall_status", sourceValue: demo.display_status, targetDb: requestDb, targetProperty: "요청 상태", mappingRule: "기존 Status 옵션 중 진행 중만 사용; UI 상태 상세는 현재 요약에 보존", writeValue: "진행 중" }),
    mappingRow({ consoleField: "preview_only", sourceValue: true, targetDb: requestDb, targetProperty: "LAB 여부", mappingRule: "TEST LAB Checkbox", writeValue: true }),
    mappingRow({ consoleField: "request_task_relation", sourceValue: `${preview.tasks?.length ?? 0} Task`, targetDb: taskDb, targetProperty: "상위 요청", mappingRule: "Request 생성 Preview를 Relation 대상으로 참조", validation: "PASS_PLANNED_RELATION", writeValue: `PLANNED_REQUEST:${request.transaction_id}` })
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
        "현재 요약": currentSummary,
        "Process ID": processIds[0] ?? "NOT_WRITTEN",
        "요청 업무 유형": requestType ?? "NOT_WRITTEN",
        "요청 상태": "진행 중",
        "LAB 여부": true,
        "FUND 업무": "NOT_WRITTEN"
      },
      write_status: "NOT_WRITTEN"
    }
  };
}

function taskMapping(preview, task, requestTransactionId) {
  const evidence = evidenceForTask(preview, task);
  const confirmation = task.actor === "사람 확인" ? preview.interaction?.questions?.[0] ?? "NOT_WRITTEN" : "NOT_WRITTEN";
  const title = `${task.process_id} · ${task.operational_task_id}`;
  const mappings = [
    mappingRow({ consoleField: "task_title", sourceValue: title, targetDb: taskDb, targetProperty: "Task명", mappingRule: "기존 Process ID + Operational Task ID로 결정적 Preview Title", writeValue: title }),
    mappingRow({ consoleField: "operational_task_id", sourceValue: task.operational_task_id, targetDb: taskDb, targetProperty: "Operational Task ID", mappingRule: "기존 Text Property", writeValue: task.operational_task_id }),
    mappingRow({ consoleField: "process_id", sourceValue: task.process_id, targetDb: taskDb, targetProperty: "Process ID", mappingRule: "기존 Select Option", writeValue: task.process_id }),
    mappingRow({ consoleField: "canonical_stage", sourceValue: task.stage, targetDb: taskDb, targetProperty: "UNMAPPED", mappingRule: "Canonical Stage는 Console/Skill Vocabulary; Notion에는 새 Property를 만들지 않음", validation: "UNMAPPED", writeValue: "NOT_WRITTEN", gap: "Task 상태와 UI Label로만 표시" }),
    mappingRow({ consoleField: "ui_status", sourceValue: stageDisplayMapping[task.stage] ?? task.stage, targetDb: taskDb, targetProperty: "Task 상태", mappingRule: "기존 Status 옵션 중 진행 중 사용; 완료 후보도 완료로 쓰지 않음", writeValue: taskStatusForStage(task.stage) }),
    mappingRow({ consoleField: "actor", sourceValue: task.actor, targetDb: taskDb, targetProperty: "현재 Actor", mappingRule: "기존 Select Option", writeValue: task.actor }),
    mappingRow({ consoleField: "next_action", sourceValue: task.next_action, targetDb: taskDb, targetProperty: "다음 Action", mappingRule: "기존 Text Property", writeValue: task.next_action }),
    mappingRow({ consoleField: "blocker", sourceValue: task.blocker || "", targetDb: taskDb, targetProperty: "Blocker", mappingRule: "기존 Text Property", writeValue: task.blocker || "" }),
    mappingRow({ consoleField: "completion_condition", sourceValue: task.completion_condition, targetDb: taskDb, targetProperty: "완료조건", mappingRule: "기존 Text Property", writeValue: task.completion_condition }),
    mappingRow({ consoleField: "completion_evidence", sourceValue: task.completion_evidence?.join(", ") || "", targetDb: taskDb, targetProperty: "완료증빙", mappingRule: "기존 Text Property", writeValue: task.completion_evidence?.join(", ") || "" }),
    mappingRow({ consoleField: "evidence_judgment", sourceValue: evidenceJudgment(evidence), targetDb: taskDb, targetProperty: "Evidence 판정", mappingRule: "기존 Select Option", writeValue: evidenceJudgment(evidence) }),
    mappingRow({ consoleField: "evidence_source", sourceValue: evidenceSource(evidence), targetDb: taskDb, targetProperty: "Evidence Source", mappingRule: "기존 Text Property", writeValue: evidenceSource(evidence) }),
    mappingRow({ consoleField: "evidence_confirmation", sourceValue: confirmation, targetDb: taskDb, targetProperty: "Evidence 확인사항", mappingRule: "사람 확인 질문이 있는 경우만 기존 Text Property에 표시", validation: confirmation === "NOT_WRITTEN" ? "NOT_WRITTEN" : "PASS", writeValue: confirmation }),
    mappingRow({ consoleField: "related_fund", sourceValue: preview.request?.dummy_fund_id, targetDb: taskDb, targetProperty: "관련 조합", mappingRule: "기존 Text Property에 Dummy Fund Key 표시", writeValue: preview.request?.dummy_fund_id }),
    mappingRow({ consoleField: "parent_request_transaction", sourceValue: requestTransactionId, targetDb: taskDb, targetProperty: "상위 요청", mappingRule: "생성 예정 Request Record와 기존 Relation 연결", validation: "PASS_PLANNED_RELATION", writeValue: `PLANNED_REQUEST:${requestTransactionId}` }),
    mappingRow({ consoleField: "preview_only", sourceValue: true, targetDb: taskDb, targetProperty: "LAB 여부", mappingRule: "TEST LAB Checkbox", writeValue: true })
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
  const gaps = propertyMappings.filter((mapping) => ["UNMAPPED", "CONFIRM_REQUIRED"].includes(mapping.validation));
  const passed = propertyMappings.filter((mapping) => mapping.validation.startsWith("PASS")).length;
  const validationSummary = {
    status: "READY_FOR_APPROVAL",
    required_mapping: propertyMappings.length,
    passed,
    gaps: gaps.length,
    blocking_gaps: 0,
    gap_details: gaps.map((mapping) => ({ console_field: mapping.console_field, target_property: mapping.target_property, validation: mapping.validation, gap: mapping.gap })),
    duplicate_check: "NOT_RUN_PERSISTENT_STORE",
    duplicate_check_plan: `Transaction ID '${preview.request.transaction_id}' is reviewed in the planned Request summary before a separate TEST Write TAP.`,
    request_task_relation: "PASS_PLANNED_RELATION",
    write_allowed: false,
    notion_write_enabled: false,
    note: "READY_FOR_APPROVAL means local approval simulation only; CONFIRM_REQUIRED fields remain a separate TEST Write gate."
  };
  const audit = {
    preview_generated_at_kst: kstNow(),
    skill_commit: SKILL_BASELINE_COMMIT,
    console_version: CONSOLE_VERSION,
    manifest_id: preview.manifest?.manifest_id ?? "PROTOTYPE-SCENARIO-CONTRACT-V0.1",
    batch_id: BATCH_ID,
    transaction_id: preview.request.transaction_id,
    approval_status: "PENDING_LOCAL_SIMULATION",
    approved_by: "NOT_WRITTEN",
    write_count: 0
  };
  return {
    ok: true,
    console_version: CONSOLE_VERSION,
    schema_source: SCHEMA_SOURCE,
    request_id: demo.request_id,
    scenario_id: preview.scenario_id,
    preview_output: preview,
    request_record_preview: requestPreview.record_preview,
    task_record_previews: taskPreviews.map((task) => task.record_preview),
    property_mappings: propertyMappings,
    validation_summary: validationSummary,
    approval_state: "PENDING_LOCAL_SIMULATION",
    approval_preview: {
      approval_status: "PENDING_LOCAL_SIMULATION",
      next_step: "REVIEW_MAPPING_THEN_SEPARATE_TEST_WRITE_TAP",
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
  const approvalStatus = action === "approve" ? "APPROVED_FOR_TEST_WRITE" : action === "needs_changes" ? "NEEDS_USER_CHANGES" : "CANCELLED_LOCAL_SIMULATION";
  return {
    ok: true,
    request_id: mappingPreview.request_id,
    scenario_id: mappingPreview.scenario_id,
    approval_status: approvalStatus,
    approved_by: action === "approve" ? "LOCAL_DEMO_USER" : "NOT_WRITTEN",
    next_step: action === "approve" ? "SEPARATE_TEST_WRITE_TAP" : "REVIEW_MAPPING_PREVIEW",
    validation_summary: mappingPreview.validation_summary,
    audit: { ...mappingPreview.audit, approval_status: approvalStatus, approved_by: action === "approve" ? "LOCAL_DEMO_USER" : "NOT_WRITTEN" },
    execution: safeExecution(),
    write_count: 0,
    operational_write_count: 0
  };
}

export function createConsoleServer() {
  return createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    try {
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
          backend_mode: "LOCAL_PREVIEW",
          notion_schema: "VALIDATED_REFERENCE",
          notion_backend: "NOT_CONNECTED",
          execution: safeExecution()
        });
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
  console.log("BACKEND_MODE=LOCAL_PREVIEW | NOTION_SCHEMA=VALIDATED_REFERENCE | NOTION_BACKEND=NOT_CONNECTED | NOTION_WRITE_ENABLED=false | OPERATIONAL_WRITE_COUNT=0");
}

const invokedAsScript = typeof globalThis.process !== "undefined" && globalThis.process.argv[1] && path.resolve(globalThis.process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedAsScript) {
  main().catch((error) => {
    console.error(`Console startup failed: ${error.message}`);
    globalThis.process.exitCode = 1;
  });
}
