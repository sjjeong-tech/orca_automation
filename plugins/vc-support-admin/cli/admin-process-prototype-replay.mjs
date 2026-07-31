#!/usr/bin/env node

import fs from "node:fs";
import { normalizePrototypeRequest, replayAdminProcessPrototype } from "../kernel/admin-process-prototype-replay.mjs";

const arg = (name) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const scenarioPath = arg("--scenario");
const scenarioId = arg("--scenario-id");
const requestText = arg("--request-text");
const preview = process.argv.includes("--preview");
const allowedFlags = new Set(["--scenario", "--scenario-id", "--request-text", "--preview", "--emit-snapshots", "--help"]);
const helpText = `admin-process-prototype-replay (preview-only)\n\nSupported scenarios: 3/6\n- Implemented: SINGLE-P03-01, SINGLE-P03-02, COMPOSITE-01\n- Not implemented: SINGLE-P07-01, SINGLE-P08-01, COMPOSITE-02\n\nUsage:\n  node plugins/vc-support-admin/cli/admin-process-prototype-replay.mjs --scenario <fixture.json> --scenario-id <id> [--request-text <text>] --preview [--emit-snapshots]\n\n--request-text supports only the minimal synthetic P03 missing-stamped-original adapter. Ambiguous input returns clarification metadata and never selects a scenario.\n\nThe skill emits synthetic preview JSON only. It does not write Notion, Drive, Slack, files, or operational records.`;

try {
  for (const token of process.argv.slice(2)) if (token.startsWith("--") && !allowedFlags.has(token)) throw Object.assign(new Error(`Unsupported preview CLI option: ${token}`), { code: "UNSUPPORTED_CLI_OPTION" });
  if (process.argv.includes("--help")) {
    console.log(helpText);
  } else {
    if (!preview) throw Object.assign(new Error("--preview is required; this prototype has no write mode."), { code: "PREVIEW_REQUIRED" });
    const requestContext = requestText ? normalizePrototypeRequest(requestText) : null;
    if (requestContext?.missing_information.length) {
      console.log(JSON.stringify({ skill_id: "admin-process-prototype-replay", request: requestContext, interaction: { clarification_required: true, human_confirmation_required: false, questions: [requestContext.clarification_question] }, execution: { operational_write_allowed: false, operational_write_count: 0, request_completion_allowed: false, downstream_auto_completion: false }, write_count: 0, operational_write_count: 0, cli: { preview: true, emit_snapshots: process.argv.includes("--emit-snapshots"), source: "REQUEST_TEXT_CLARIFICATION" } }, null, 2));
    } else {
      if (!scenarioPath || !scenarioId) throw Object.assign(new Error("--scenario and --scenario-id are required after request normalization."), { code: "SCENARIO_ARGUMENT_REQUIRED" });
      if (requestContext && requestContext.scenario_id !== scenarioId) throw Object.assign(new Error("Request text does not map to the requested scenario_id."), { code: "REQUEST_SCENARIO_MISMATCH" });
    const parsed = JSON.parse(fs.readFileSync(scenarioPath, "utf8").replace(/^\uFEFF/, ""));
    if (parsed.scenario_id !== scenarioId) throw Object.assign(new Error("Requested scenario_id is not present in the selected scenario fixture."), { code: "SCENARIO_ID_NOT_FOUND" });
      const output = replayAdminProcessPrototype(parsed, { requestContext });
      console.log(JSON.stringify({ ...output, cli: { preview: true, emit_snapshots: process.argv.includes("--emit-snapshots"), source: requestContext ? "REQUEST_TEXT_WITH_SCENARIO_FIXTURE" : "SCENARIO_FIXTURE" } }, null, 2));
    }
  }
} catch (error) {
  console.error(JSON.stringify({ ok: false, error_code: error.code ?? "PROTOTYPE_REPLAY_FAILED", message: error.message, actual_write_count: 0, operational_write_count: 0 }, null, 2));
  process.exitCode = 1;
}
