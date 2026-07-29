import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import { calculateRuntimeSnapshotHash, evaluateRuntimeSnapshot } from "../kernel/runtime-snapshot-bridge.mjs";

const fixturePath = "plugins/vc-support-admin/fixtures/growthbridge-runtime-test-lab-snapshot.json";
const base = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
const clone = () => JSON.parse(JSON.stringify(base));
const evaluate = (snapshot, transactionId = "GB-P03-001") => evaluateRuntimeSnapshot(snapshot, { transactionId });

// Unit guards are direct calls; CLI coverage below exercises the permanent entry point.
const ok = evaluate(base);
assert.equal(ok.ok, true); assert.equal(ok.source, "RUNTIME_SNAPSHOT");
assert.equal(ok.result, "NO_OP_ALREADY_COMMITTED"); assert.equal(ok.fund_count, 1); assert.equal(ok.request_count, 1); assert.equal(ok.task_count, 6);
assert.equal(ok.relation_pass, true); assert.equal(ok.actual_notion_write_count, 0); assert.equal(ok.operational_write_count, 0);
assert.deepEqual(ok.human_confirmation.map((item) => `${item.operational_task_id}:${item.comparison}:${item.priority}`), ["P03-T03:NEEDS_WORDING_FIX:P1", "P03-T04:SEMANTIC_MATCH:P0", "P03-T05:SEMANTIC_MATCH:P0"]);
assert.equal(ok.human_confirmation.every((item) => item.completion_allowed === false && item.approval_required === true), true);

const environment = clone(); environment.environment = "OPERATIONAL";
assert.equal(evaluate(environment).error_code, "ENVIRONMENT_NOT_TEST_LAB");
const dataSource = clone(); dataSource.data_source_id = "collection://00000000-0000-0000-0000-000000000000";
assert.equal(evaluate(dataSource).error_code, "DATA_SOURCE_NOT_ALLOWLISTED");
assert.equal(evaluate(clone(), "OTHER-TX").error_code, "TRANSACTION_ID_MISMATCH");
const count = clone(); count.tasks.pop();
assert.equal(evaluate(count).error_code, "RECORD_COUNT_INVALID");
const relation = clone(); relation.tasks[0].request_relation = "MISSING";
assert.equal(evaluate(relation).error_code, "RELATION_INVALID");
const sensitive = clone(); sensitive.human_confirmation[0].evidence_source = "https://unapproved.example/item";
assert.equal(evaluate(sensitive).error_code, "SNAPSHOT_SANITIZATION_FAILED");
const hash = clone(); hash.snapshot_hash = "0".repeat(64);
assert.equal(evaluate(hash).error_code, "SNAPSHOT_HASH_MISMATCH");
assert.equal(calculateRuntimeSnapshotHash(base), base.snapshot_hash);

const cli = "plugins/vc-support-admin/cli/test-lab-write-requery.mjs";
const runtimeOutput = execFileSync("node", [cli, "--runtime-snapshot", fixturePath, "--transaction", "GB-P03-001", "--preview"], { encoding: "utf8" });
const runtime = JSON.parse(runtimeOutput);
assert.equal(runtime.source, "RUNTIME_SNAPSHOT"); assert.equal(runtime.result, "NO_OP_ALREADY_COMMITTED"); assert.equal(runtime.actual_notion_write_count, 0);
const stdin = spawnSync("node", [cli, "--runtime-snapshot", "-", "--transaction", "GB-P03-001", "--preview"], { input: JSON.stringify(base), encoding: "utf8" });
assert.equal(stdin.status, 0); assert.equal(JSON.parse(stdin.stdout).result, "NO_OP_ALREADY_COMMITTED");
const tampered = spawnSync("node", [cli, "--runtime-snapshot", "-", "--transaction", "GB-P03-001", "--preview"], { input: JSON.stringify(hash), encoding: "utf8" });
assert.notEqual(tampered.status, 0); assert.equal(JSON.parse(tampered.stdout).error_code, "SNAPSHOT_HASH_MISMATCH");

const schema = JSON.parse(fs.readFileSync("plugins/vc-support-admin/schemas/runtime-test-lab-snapshot.schema.json", "utf8"));
assert.equal(schema.properties.environment.const, "TEST_LAB"); assert.equal(schema.properties.tasks.minItems, 6);
console.log("runtime-snapshot-bridge: PASS (schema, allowlist, sanitation, integrity, CLI, stdin, tamper)");
