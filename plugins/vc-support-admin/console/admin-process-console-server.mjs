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
const humanConfirmationFixture = path.resolve(
  here,
  "../fixtures/prototype-single-p03-human-confirmation.json"
);

export const CONSOLE_VERSION = "PILOT v0.1";
export const SUPPORTED_SCENARIOS = Object.freeze(["SINGLE-P03-02"]);
export const DEFAULT_SCENARIO_ID = "SINGLE-P03-02";

const contentTypes = Object.freeze({
  "/": "text/html; charset=utf-8",
  "/index.html": "text/html; charset=utf-8",
  "/console.js": "text/javascript; charset=utf-8",
  "/console.css": "text/css; charset=utf-8"
});

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
    backend_mode: "LOCAL_PREVIEW",
    notion_schema: "REFERENCE_ONLY",
    execution: {
      operational_write_allowed: false,
      operational_write_count: 0,
      request_completion_allowed: false,
      downstream_auto_completion: false
    },
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

export async function buildConsolePreview({ request_text: requestText, scenario_id: scenarioId } = {}) {
  if (typeof requestText !== "string" || !requestText.trim()) {
    const error = new Error("request_text is required.");
    error.code = "REQUEST_TEXT_REQUIRED";
    throw error;
  }

  if (!SUPPORTED_SCENARIOS.includes(scenarioId)) {
    const error = new Error("This pilot supports SINGLE-P03-02 only.");
    error.code = "UNSUPPORTED_SCENARIO";
    throw error;
  }

  const request = normalizePrototypeRequest(requestText);
  if (request.missing_information.length > 0) {
    return {
      ok: false,
      error_code: "REQUEST_CLARIFICATION_REQUIRED",
      message: "현재 지원 Scenario에 필요한 정보가 부족합니다.",
      supported_scenarios: [...SUPPORTED_SCENARIOS],
      request,
      interaction: {
        clarification_required: true,
        human_confirmation_required: false,
        questions: [request.clarification_question]
      },
      execution: {
        operational_write_allowed: false,
        operational_write_count: 0,
        request_completion_allowed: false,
        downstream_auto_completion: false
      },
      write_count: 0,
      operational_write_count: 0,
      backend_mode: "LOCAL_PREVIEW",
      notion_schema: "REFERENCE_ONLY"
    };
  }

  if (request.scenario_id !== scenarioId) {
    const error = new Error("Request text does not map to the requested scenario.");
    error.code = "REQUEST_SCENARIO_MISMATCH";
    throw error;
  }

  const fixture = JSON.parse((await readFile(humanConfirmationFixture, "utf8")).replace(/^\uFEFF/, ""));
  const output = replayAdminProcessPrototype(fixture, { requestContext: request });

  return {
    ok: true,
    ...output,
    evidence: output.evidence_decisions,
    manifest: output.conformance_claim,
    backend_mode: "LOCAL_PREVIEW",
    notion_schema: "REFERENCE_ONLY",
    console_version: CONSOLE_VERSION
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

      if (request.method === "POST" && url.pathname === "/api/preview") {
        const input = await readJsonBody(request);
        const preview = await buildConsolePreview(input);
        sendJson(response, preview.ok === false ? 422 : 200, preview);
        return;
      }

      sendError(response, 404, "NOT_FOUND", "Console route not found.");
    } catch (error) {
      const code = error.code ?? "CONSOLE_PREVIEW_FAILED";
      const status = code === "REQUEST_BODY_TOO_LARGE" ? 413 : code === "INVALID_JSON" || code === "REQUEST_TEXT_REQUIRED" || code === "UNSUPPORTED_SCENARIO" || code === "REQUEST_SCENARIO_MISMATCH" ? 400 : 500;
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
  console.log("BACKEND_MODE=LOCAL_PREVIEW | NOTION_SCHEMA=REFERENCE_ONLY | OPERATIONAL_WRITE_COUNT=0");
}

const invokedAsScript = typeof globalThis.process !== "undefined" && globalThis.process.argv[1] && path.resolve(globalThis.process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedAsScript) {
  main().catch((error) => {
    console.error(`Console startup failed: ${error.message}`);
    globalThis.process.exitCode = 1;
  });
}
