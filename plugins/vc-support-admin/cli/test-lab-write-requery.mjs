import fs from "node:fs";
import { evaluateRuntimeSnapshot } from "../kernel/runtime-snapshot-bridge.mjs";
import { adaptSessionReadPacket } from "../kernel/session-snapshot-transport-adapter.mjs";

const arg = (name) => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
};
const runtimeFile = arg("--runtime-snapshot");
const sessionFile = arg("--session-snapshot");
const file = sessionFile ?? runtimeFile ?? arg("--snapshot") ?? arg("--fixture");
if (!file || !process.argv.includes("--preview")) throw new Error("Use --snapshot <sanitized snapshot>, --runtime-snapshot <path|->, or --session-snapshot <sanitized read packet> with --transaction <id> --preview");
const snapshot = JSON.parse((file === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(file, "utf8")).replace(/^\uFEFF/, ""));
const transaction = arg("--transaction");
if (sessionFile) {
  const adapted = adaptSessionReadPacket(snapshot, { transactionId: transaction });
  const output = adapted.ok
    ? { ...adapted.runtime_result, source: "SESSION_TOOL_BRIDGE", runtime_snapshot_source: adapted.runtime_snapshot.source, sanitized: true, session_transport: "READ_ONLY", actual_notion_write_count: 0, operational_write_count: 0 }
    : adapted;
  console.log(JSON.stringify(output, null, 2));
  if (!adapted.ok) process.exitCode = 1;
  process.exit();
}
if (runtimeFile) {
  const runtime = evaluateRuntimeSnapshot(snapshot, { transactionId: transaction });
  console.log(JSON.stringify(runtime, null, 2));
  if (!runtime.ok) process.exitCode = 1;
  process.exit();
}
const relationPass = snapshot.fund_work?.master_match === "EXACT_1" && snapshot.request?.fund_relation === "EXACT_1" && snapshot.tasks?.length === 6 && snapshot.tasks.every((task) => task.request_relation === "EXACT_1");
const result = {
  skill_id: "test-lab-write-requery",
  environment: snapshot.environment,
  transaction_id: transaction,
  duplicate_status: transaction === snapshot.transaction_id ? "EXACT_1" : "NOT_FOUND",
  result: transaction === snapshot.transaction_id && relationPass ? "NO_OP_ALREADY_COMMITTED" : "BLOCKED_BY_SNAPSHOT",
  fund_count: snapshot.fund_work?.count ?? 0,
  request_count: snapshot.request?.count ?? 0,
  task_count: snapshot.tasks?.length ?? 0,
  relation_pass: relationPass,
  expected_actual: relationPass ? "PASS" : "MISMATCH",
  request_completion_allowed: snapshot.request?.completion_allowed === true,
  intended_write_count: 0,
  committed_write_count: 0,
  actual_notion_write_count: 0,
  operational_write_count: 0,
  runtime_provider_gap: "READ_ONLY_RUNTIME_PROVIDER_GAP"
};
console.log(JSON.stringify(result, null, 2));
