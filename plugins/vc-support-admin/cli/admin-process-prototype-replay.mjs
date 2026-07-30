#!/usr/bin/env node

import fs from "node:fs";
import { replayAdminProcessPrototype } from "../kernel/admin-process-prototype-replay.mjs";

const arg = (name) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const scenarioPath = arg("--scenario");
const scenarioId = arg("--scenario-id");
const preview = process.argv.includes("--preview");
const allowedFlags = new Set(["--scenario", "--scenario-id", "--preview", "--emit-snapshots"]);

try {
  for (const token of process.argv.slice(2)) if (token.startsWith("--") && !allowedFlags.has(token)) throw Object.assign(new Error(`Unsupported preview CLI option: ${token}`), { code: "UNSUPPORTED_CLI_OPTION" });
  if (!preview) throw Object.assign(new Error("--preview is required; this prototype has no write mode."), { code: "PREVIEW_REQUIRED" });
  if (!scenarioPath || !scenarioId) throw Object.assign(new Error("--scenario and --scenario-id are required."), { code: "SCENARIO_ARGUMENT_REQUIRED" });
  const parsed = JSON.parse(fs.readFileSync(scenarioPath, "utf8").replace(/^\uFEFF/, ""));
  if (parsed.scenario_id !== scenarioId) throw Object.assign(new Error("Requested scenario_id is not present in the selected scenario fixture."), { code: "SCENARIO_ID_NOT_FOUND" });
  const output = replayAdminProcessPrototype(parsed);
  console.log(JSON.stringify({ ...output, cli: { preview: true, emit_snapshots: process.argv.includes("--emit-snapshots"), source: "SCENARIO_FIXTURE" } }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ ok: false, error_code: error.code ?? "PROTOTYPE_REPLAY_FAILED", message: error.message, actual_write_count: 0, operational_write_count: 0 }, null, 2));
  process.exitCode = 1;
}
