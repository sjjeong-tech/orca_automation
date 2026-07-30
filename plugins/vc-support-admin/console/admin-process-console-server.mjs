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

export const CONSOLE_VERSION = "PILOT v0.2";
export const SUPPORTED_SCENARIOS = Object.freeze(Object.keys(fixturePaths));
export const DEFAULT_SCENARIO_ID = "SINGLE-P03-02";
export const DEFAULT_REQUEST_TEXT = "DUMMY-FUND-B의 고유번호증 신청 건을 확인해줘.\n신청서 초안은 있지만 날인본 원본은 아직 준비되지 않았어.";

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

function sendJson(response, status, value) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(value, null, 2));
}

function safeExecution() {
  return {
    operational_write_allowed: false,
    operational_write_count: 0,
    request_completion_allowed: false,
    downstream_auto_completion: false
  };
}

function sendError(response, status, errorCode, message, extra = {}) {
  sendJson(response, status, {
    ok: false,
    error_code: errorCode,
    message,
    supported_scenarios: [...SUPPORTED_SCENARIOS],
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
    backend_mode: "LOCAL_PREVIEW",
    notion_schema: "VALIDATED_REFERENCE",
    notion_backend: "NOT_CONNECTED",
    display_mapping: stageDisplayMapping,
    console_version: CONSOLE_VERSION
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

      sendError(response, 404, "NOT_FOUND", "Console route not found.");
    } catch (error) {
      const code = error.code ?? "CONSOLE_PREVIEW_FAILED";
      const status = code === "REQUEST_BODY_TOO_LARGE" ? 413 : code === "INVALID_JSON" || code === "REQUEST_TEXT_REQUIRED" || code === "UNSUPPORTED_SCENARIO" || code === "UNSUPPORTED_DEMO_REQUEST" || code === "REQUEST_SCENARIO_MISMATCH" ? 400 : 500;
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
  return {
    server,
    host,
    port: address.port,
    url: `http://${host}:${address.port}`
  };
}

async function main() {
  const running = await startConsoleServer();
  console.log(`Admin process console ready: ${running.url}`);
  console.log("BACKEND_MODE=LOCAL_PREVIEW | NOTION_SCHEMA=VALIDATED_REFERENCE | NOTION_BACKEND=NOT_CONNECTED | OPERATIONAL_WRITE_COUNT=0");
}

const invokedAsScript = typeof globalThis.process !== "undefined" && globalThis.process.argv[1] && path.resolve(globalThis.process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedAsScript) {
  main().catch((error) => {
    console.error(`Console startup failed: ${error.message}`);
    globalThis.process.exitCode = 1;
  });
}
