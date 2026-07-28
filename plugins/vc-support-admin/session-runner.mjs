#!/usr/bin/env node

// Session Runner — Node Runtime과 MCP Connector 사이의 실행 경계.
//
//   1) Plugin이 필요한 Tool 호출을 산출한다 (아래 pending)
//   2) Claude 세션이 실제 Notion·Drive Tool을 호출한다
//   3) 응답을 그대로 results 파일에 넣고 다시 실행한다
//   4) Provider Normalizer가 응답을 정규화한다
//   5) 사용자 결과를 반환한다
//
// 개발자가 이 조립을 손으로 하지 않도록 (1)(3)(4)(5)를 이 파일이 담당한다.
// Write Tool은 이 Runner에서 영구 차단된다 — 읽기와 Preview만 수행한다.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { runUserRequest, buildProviders } from "./index.mjs";

const WRITE_TOOLS = new Set([
  "notion-create-pages", "notion-update-page", "notion-update-data-source",
  "notion-create-database", "notion-create-view", "notion-update-view",
  "notion-duplicate-page", "notion-move-pages", "notion-create-comment",
  "create_file", "copy_file", "slack_send_message", "slack_schedule_message"
]);

const stable = (v) => {
  if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`;
  if (v && typeof v === "object") return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}`;
  return JSON.stringify(v ?? null);
};

/** 세션이 실행할 Tool 호출을 식별하는 결정적 Key. 같은 호출은 같은 Key를 갖는다. */
export function toolKey(tool, params) {
  return `${tool}::${crypto.createHash("sha1").update(stable(params)).digest("hex").slice(0, 12)}`;
}

/**
 * results에 있으면 응답을 돌려주고, 없으면 pending에 적재하고 거절한다.
 * Provider는 거절을 transport 오류로 정규화하므로, Runner가 pending을 먼저 확인한다.
 */
export function createSessionInvoker({ results = {}, pending = [], provider = "unknown" } = {}) {
  return async (tool, params) => {
    if (WRITE_TOOLS.has(tool)) {
      const err = new Error("WRITE_BRIDGE_DISABLED");
      err.code = "WRITE_BRIDGE_DISABLED";
      throw err;
    }
    const key = toolKey(tool, params);
    if (Object.prototype.hasOwnProperty.call(results, key)) return results[key];
    if (!pending.some((p) => p.key === key)) pending.push({ key, provider, tool, params });
    const err = new Error("TOOL_RESULT_PENDING");
    err.code = "TOOL_RESULT_PENDING";
    throw err;
  };
}

/**
 * 사용자 요청 1건을 실행한다.
 * 아직 세션이 실행하지 않은 Tool 호출이 남아 있으면 NEEDS_TOOL_RESULTS를 반환한다.
 * 세션은 pending을 실행해 results에 채운 뒤 같은 input으로 다시 호출한다(보통 2~3회).
 */
export async function runSessionWorkflow({ input = {}, tool_results = {}, logger = () => {} } = {}) {
  const pending = [];
  const runtime_config = input.runtime_config ?? {};
  const providers = buildProviders({
    runtime_config,
    invokers: {
      notion: createSessionInvoker({ results: tool_results, pending, provider: "notion" }),
      drive: createSessionInvoker({ results: tool_results, pending, provider: "drive" })
    },
    logger
  });

  const view = await runUserRequest({ ...input, providers });

  if (pending.length) {
    return { status: "NEEDS_TOOL_RESULTS", pending, view: null, display: null, tool_call_count: Object.keys(tool_results).length };
  }
  return { status: "COMPLETE", pending: [], view, display: view.display, tool_call_count: Object.keys(tool_results).length };
}

/** 1회차 호출 계획만 뽑는다(실제 호출 없음). */
export async function planSession(input) {
  const r = await runSessionWorkflow({ input, tool_results: {} });
  return r.pending;
}

// ---- CLI ---------------------------------------------------------------------

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith("--")) continue;
    const k = argv[i].slice(2);
    const v = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
    out[k] = v;
  }
  return out;
}

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input) {
    console.error([
      "사용법:",
      "  node plugins/vc-support-admin/session-runner.mjs --input <input.json> [--results <results.json>] [--out <out.json>]",
      "",
      "input.json  : { user_message, fund_hint?, folder_hint?, intent_hint?, interface?, runtime_config }",
      "results.json: { \"<tool>::<hash>\": <MCP 원본 응답> }  — pending 목록의 key를 그대로 쓴다",
      "",
      "실제 ID가 담긴 input·results는 저장소에 Commit하지 않는다."
    ].join("\n"));
    process.exit(2);
  }
  const input = readJson(args.input);
  const results = args.results && fs.existsSync(args.results) ? readJson(args.results) : {};
  const r = await runSessionWorkflow({ input, tool_results: results });

  if (r.status === "NEEDS_TOOL_RESULTS") {
    console.log("STATUS=NEEDS_TOOL_RESULTS");
    console.log(`PENDING=${r.pending.length}`);
    console.log(JSON.stringify(r.pending, null, 2));
    process.exit(0);
  }
  console.log("STATUS=COMPLETE");
  console.log(`NOTION_READ=${r.view.reads.notion} DRIVE_READ=${r.view.reads.drive}`);
  console.log(`NOTION_WRITE=${r.view.writes.notion} DRIVE_WRITE=${r.view.writes.drive} SLACK_SEND=${r.view.writes.slack}`);
  console.log("---");
  console.log(r.display);
  if (args.out) {
    fs.writeFileSync(args.out, JSON.stringify(r.view, null, 2), "utf8");
    console.log(`\n[saved] ${args.out}`);
  }
}

const invokedDirectly = process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  main().catch((e) => { console.error(`RUNNER_FAILED: ${e.message}`); process.exit(1); });
}
