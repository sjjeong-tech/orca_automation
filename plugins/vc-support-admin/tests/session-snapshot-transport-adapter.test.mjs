import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import { adaptSessionReadPacket } from "../kernel/session-snapshot-transport-adapter.mjs";
import { evaluateRuntimeSnapshot } from "../kernel/runtime-snapshot-bridge.mjs";

const fixturePath = "plugins/vc-support-admin/fixtures/growthbridge-session-read-packet.json";
const base = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
const clone = () => JSON.parse(JSON.stringify(base));
const adapt = (packet, transactionId = "GB-P03-001") => adaptSessionReadPacket(packet, { transactionId });

const normal = adapt(base);
assert.equal(normal.ok, true);
assert.equal(normal.source, "SESSION_TOOL_BRIDGE");
assert.equal(normal.sanitized, true);
assert.equal(normal.runtime_snapshot.source, "SESSION_TOOL_BRIDGE");
assert.equal(normal.runtime_snapshot.record_counts.task, 6);
assert.equal(normal.runtime_result.result, "NO_OP_ALREADY_COMMITTED");
assert.equal(normal.runtime_result.actual_notion_write_count, 0);
assert.equal(normal.runtime_result.operational_write_count, 0);
assert.deepEqual(normal.runtime_result.human_confirmation.map((item) => `${item.operational_task_id}:${item.comparison}:${item.priority}`), ["P03-T03:NEEDS_WORDING_FIX:P1", "P03-T04:SEMANTIC_MATCH:P0", "P03-T05:SEMANTIC_MATCH:P0"]);
assert.equal(evaluateRuntimeSnapshot(normal.runtime_snapshot, { transactionId: "GB-P03-001" }).ok, true);

const environment = clone(); environment.environment = "OPERATIONAL";
assert.equal(adapt(environment).error_code, "ENVIRONMENT_NOT_TEST_LAB");
const dataSource = clone(); dataSource.data_sources.task = "collection://00000000-0000-0000-0000-000000000000";
assert.equal(adapt(dataSource).error_code, "DATA_SOURCE_NOT_ALLOWLISTED");
const relation = clone(); relation.relations.request_to_tasks = "MISSING";
assert.equal(adapt(relation).error_code, "RELATION_INVALID");
const count = clone(); count.tasks.pop();
assert.equal(adapt(count).error_code, "RECORD_COUNT_INVALID");
const unknown = clone(); unknown.tasks[5].properties["Operational Task ID"] = "P03-T99";
assert.equal(adapt(unknown).error_code, "UNKNOWN_RECORD");
const rawPayload = clone(); rawPayload.source_metadata.raw_response = "not stored";
assert.equal(adapt(rawPayload).error_code, "SESSION_PACKET_SANITIZATION_FAILED");
assert.equal(adapt(clone(), "OTHER-TX").error_code, "TRANSACTION_ID_MISMATCH");

const cli = "plugins/vc-support-admin/cli/test-lab-write-requery.mjs";
const output = JSON.parse(execFileSync("node", [cli, "--session-snapshot", fixturePath, "--transaction", "GB-P03-001", "--preview"], { encoding: "utf8" }));
assert.equal(output.source, "SESSION_TOOL_BRIDGE");
assert.equal(output.runtime_snapshot_source, "SESSION_TOOL_BRIDGE");
assert.equal(output.session_transport, "READ_ONLY");
assert.equal(output.result, "NO_OP_ALREADY_COMMITTED");
assert.equal(output.actual_notion_write_count, 0);
const stdin = spawnSync("node", [cli, "--session-snapshot", "-", "--transaction", "GB-P03-001", "--preview"], { input: JSON.stringify(base), encoding: "utf8" });
assert.equal(stdin.status, 0); assert.equal(JSON.parse(stdin.stdout).result, "NO_OP_ALREADY_COMMITTED");
const tampered = clone(); tampered.data_sources.task = "collection://00000000-0000-0000-0000-000000000000";
const rejected = spawnSync("node", [cli, "--session-snapshot", "-", "--transaction", "GB-P03-001", "--preview"], { input: JSON.stringify(tampered), encoding: "utf8" });
assert.notEqual(rejected.status, 0); assert.equal(JSON.parse(rejected.stdout).error_code, "DATA_SOURCE_NOT_ALLOWLISTED");

const inputSchema = JSON.parse(fs.readFileSync("plugins/vc-support-admin/schemas/session-tool-read-packet.schema.json", "utf8"));
assert.equal(inputSchema.properties.environment.const, "TEST_LAB");
assert.equal(inputSchema.properties.source.const, "SESSION_TOOL_READ");
console.log("session-snapshot-transport-adapter: PASS (schema, sanitization, session-to-runtime, CLI, stdin, tamper)");
