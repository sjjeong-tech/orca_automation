import assert from "node:assert/strict";
import { once } from "node:events";
import fs from "node:fs";

import {
  BATCH_ID,
  CONSOLE_VERSION,
  DEFAULT_REQUEST_TEXT,
  DEMO_REQUESTS,
  SCHEMA_SOURCE,
  buildApprovalPreview,
  buildConsolePreview,
  buildMappingPreview,
  createConsoleServer
} from "../console/admin-process-console-server.mjs";

const plugin = JSON.parse(fs.readFileSync("plugins/vc-support-admin/plugin.yaml", "utf8"));
const htmlSource = fs.readFileSync("plugins/vc-support-admin/console/public/index.html", "utf8");
const jsSource = fs.readFileSync("plugins/vc-support-admin/console/public/console.js", "utf8");
const cssSource = fs.readFileSync("plugins/vc-support-admin/console/public/console.css", "utf8");
const standaloneHtml = fs.readFileSync("plugins/vc-support-admin/reports/console-pilot/request-task-console-v0.3.html", "utf8");
const outputSample = JSON.parse(fs.readFileSync("plugins/vc-support-admin/reports/console-pilot/request-task-console-v0.3-output.json", "utf8"));
const demoGuide = fs.readFileSync("plugins/vc-support-admin/reports/console-pilot/request-task-console-v0.3-demo.md", "utf8");

const humanActor = "\uC0AC\uB78C \uD655\uC778";
const humanBlocker = "\uB0A0\uC778\uBCF8 \uC6D0\uBCF8 \uBBF8\uD655\uBCF4";
const humanNextAction = "\uC720\uD6A8\uD55C \uB0A0\uC778\uBCF8 \uC6D0\uBCF8 \uC7AC\uC218\uC9D1";
const supportActor = "\uC9C0\uC6D0\uD300";
const p07Blocker = "P07 \uC81C\uCD9C\uC11C\uB958 \uBBF8\uD655\uBCF4";
const p07NextAction = "\uACC4\uC88C\uAC1C\uC124 \uC81C\uCD9C\uC11C\uB958 \uC218\uC9D1";

assert.equal(CONSOLE_VERSION, "PILOT v0.3");
assert.equal(BATCH_ID, "A-CP25-B23");
assert.equal(SCHEMA_SOURCE, "LIVE_READ_ONLY_SCHEMA_2026-07-31");
assert.equal(plugin.entry_points.admin_process_console, "console/admin-process-console-server.mjs");
assert.ok(plugin.interfaces.includes("local_console"));
assert.deepEqual(DEMO_REQUESTS.map((item) => item.request_id), ["REQ-DEMO-001", "REQ-DEMO-002", "REQ-DEMO-003"]);
assert.deepEqual(DEMO_REQUESTS.map((item) => item.scenario_id), ["SINGLE-P03-02", "SINGLE-P03-01", "COMPOSITE-01"]);
assert.deepEqual(DEMO_REQUESTS.map((item) => item.source_mode), ["NATURAL_LANGUAGE_PREVIEW", "FIXTURE_PRESET", "FIXTURE_PRESET"]);

for (const panelId of ["request-inbox", "request-panel", "current-action-panel", "kanban", "interaction-panel", "evidence-panel", "timeline", "execution-panel", "raw-json", "mapping-section", "mapping-summary", "request-record-preview", "task-record-previews", "property-mappings", "expected-actual", "audit-panel"]) {
  assert.match(htmlSource, new RegExp(`id="${panelId}"`));
}
assert.match(htmlSource, /id="approval-drawer"/);
assert.match(htmlSource, /WRITE NOT EXECUTED/);
assert.match(htmlSource, /NOTION_WRITE_ENABLED=false/);
assert.match(htmlSource, /NOTION_BACKEND=NOT_CONNECTED/);
assert.match(jsSource, /\/api\/mapping-preview/);
assert.match(jsSource, /\/api\/approval-preview/);
assert.match(jsSource, /function renderMapping\(/);
assert.match(cssSource, /\.mapping-section/);
assert.match(cssSource, /\.drawer-content/);
assert.ok(standaloneHtml.length > 0);
assert.doesNotMatch(standaloneHtml, /https?:\/\//i);
for (const text of ["REQ-DEMO-001", "REQ-DEMO-002", "REQ-DEMO-003", "DB Mapping Preview", "WRITE NOT EXECUTED", "Operational Write", "STAMPED_ORIGINAL"]) {
  assert.ok(standaloneHtml.includes(text));
}
assert.equal(outputSample.console_version, "PILOT v0.3");
assert.equal(outputSample.request.request_id, "REQ-DEMO-001");
assert.equal(outputSample.execution.operational_write_count, 0);
assert.equal(outputSample.mapping_preview.validation_summary.duplicate_check, "NOT_RUN_PERSISTENT_STORE");
assert.match(demoGuide, /SINGLE-P03-02/);
assert.match(demoGuide, /Write Count 0/);

const human = await buildConsolePreview({
  request_id: "REQ-DEMO-001",
  scenario_id: "SINGLE-P03-02",
  request_text: DEFAULT_REQUEST_TEXT
});
assert.equal(human.ok, true);
assert.equal(human.source_mode, "NATURAL_LANGUAGE_PREVIEW");
assert.equal(human.request.dummy_fund_id, "DUMMY-FUND-B");
assert.deepEqual(human.request.process_ids, ["P03"]);
assert.equal(human.tasks[0].operational_task_id, "P03-T03");
assert.equal(human.tasks[0].actor, humanActor);
assert.equal(human.tasks[0].blocker, humanBlocker);
assert.equal(human.tasks[0].next_action, humanNextAction);
assert.deepEqual(human.snapshot_timeline.map((entry) => entry.stage), ["RECEIVED", "EVIDENCE_REVIEW", "HUMAN_CONFIRMATION", "BLOCKED"]);
assert.equal(human.execution.operational_write_allowed, false);
assert.equal(human.execution.operational_write_count, 0);

const normal = await buildConsolePreview({ request_id: "REQ-DEMO-002", scenario_id: "SINGLE-P03-01" });
assert.equal(normal.ok, true);
assert.equal(normal.source_mode, "FIXTURE_PRESET");
assert.equal(normal.request.dummy_fund_id, "DUMMY-FUND-A");
assert.equal(normal.tasks[0].stage, "COMPLETION_CANDIDATE");
assert.equal(normal.tasks[0].actor, supportActor);
assert.equal(normal.tasks[0].completion_candidate, true);
assert.equal(normal.tasks[0].completion_allowed, false);
assert.equal(normal.execution.request_completion_allowed, false);

const composite = await buildConsolePreview({ request_id: "REQ-DEMO-003", scenario_id: "COMPOSITE-01" });
assert.equal(composite.ok, true);
assert.deepEqual(composite.tasks.map((task) => task.process_id), ["P03", "P04", "P07"]);
const blocked = composite.tasks.find((task) => task.process_id === "P07");
assert.equal(blocked.stage, "BLOCKED");
assert.equal(blocked.actor, supportActor);
assert.equal(blocked.blocker, p07Blocker);
assert.equal(blocked.next_action, p07NextAction);
assert.equal(composite.execution.operational_write_count, 0);

const clarification = await buildConsolePreview({
  request_id: "REQ-DEMO-001",
  scenario_id: "SINGLE-P03-02",
  request_text: "DUMMY-FUND-B\uC758 \uACE0\uC720\uBC88\uD638\uC99D \uC2E0\uCCAD \uAC74\uC744 \uD655\uC778\uD574\uC918."
});
assert.equal(clarification.ok, false);
assert.equal(clarification.error_code, "REQUEST_CLARIFICATION_REQUIRED");
assert.equal(clarification.interaction.clarification_required, true);
assert.equal(clarification.execution.operational_write_count, 0);

const humanMapping = await buildMappingPreview({ request_id: "REQ-DEMO-001", scenario_id: "SINGLE-P03-02", preview_output: human });
assert.equal(humanMapping.ok, true);
assert.equal(humanMapping.request_record_preview.planned_record_count, 1);
assert.equal(humanMapping.task_record_previews.length, 1);
assert.equal(humanMapping.validation_summary.status, "READY_FOR_APPROVAL");
assert.equal(humanMapping.validation_summary.blocking_gaps, 0);
assert.equal(humanMapping.validation_summary.duplicate_check, "NOT_RUN_PERSISTENT_STORE");
assert.ok(humanMapping.property_mappings.some((row) => row.console_field === "transaction_id" && row.validation === "CONFIRM_REQUIRED"));
assert.ok(humanMapping.property_mappings.some((row) => row.console_field === "canonical_stage" && row.validation === "UNMAPPED"));
assert.ok(humanMapping.property_mappings.some((row) => row.console_field === "parent_request_transaction" && row.validation === "PASS_PLANNED_RELATION"));
assert.equal(humanMapping.execution.operational_write_allowed, false);
assert.equal(humanMapping.write_count, 0);

const compositeMapping = await buildMappingPreview({ request_id: "REQ-DEMO-003", scenario_id: "COMPOSITE-01" });
assert.equal(compositeMapping.request_record_preview.planned_record_count, 1);
assert.equal(compositeMapping.task_record_previews.length, 3);
assert.deepEqual(compositeMapping.task_record_previews.map((task) => task.process_id), ["P03", "P04", "P07"]);
assert.equal(compositeMapping.task_record_previews.find((task) => task.process_id === "P07").blocker, p07Blocker);
assert.equal(compositeMapping.validation_summary.blocking_gaps, 0);
assert.ok(compositeMapping.validation_summary.gaps > humanMapping.validation_summary.gaps);

const approval = await buildApprovalPreview({ request_id: "REQ-DEMO-001", scenario_id: "SINGLE-P03-02", action: "approve" });
assert.equal(approval.approval_status, "APPROVED_FOR_TEST_WRITE");
assert.equal(approval.approved_by, "LOCAL_DEMO_USER");
assert.equal(approval.next_step, "SEPARATE_TEST_WRITE_TAP");
assert.equal(approval.execution.notion_write_enabled, false);
assert.equal(approval.execution.operational_write_count, 0);
assert.equal(approval.write_count, 0);

await assert.rejects(
  () => buildConsolePreview({ request_id: "REQ-UNKNOWN", scenario_id: "SINGLE-P03-02" }),
  { code: "UNSUPPORTED_DEMO_REQUEST" }
);
await assert.rejects(
  () => buildConsolePreview({ request_id: "REQ-DEMO-002", scenario_id: "COMPOSITE-01" }),
  { code: "REQUEST_SCENARIO_MISMATCH" }
);

const server = createConsoleServer();
server.listen({ host: "127.0.0.1", port: 0 });
await once(server, "listening");
const address = server.address();
const origin = `http://127.0.0.1:${address.port}`;

const html = await fetch(origin);
assert.equal(html.status, 200);
assert.match(await html.text(), /DB Mapping Preview/);

const demos = await fetch(`${origin}/api/demo-requests`);
assert.equal(demos.status, 200);
const demoPayload = await demos.json();
assert.equal(demoPayload.demo_requests.length, 3);
assert.equal(demoPayload.notion_backend, "NOT_CONNECTED");
assert.equal(demoPayload.execution.operational_write_count, 0);

const previewResponse = await fetch(`${origin}/api/preview`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ request_id: "REQ-DEMO-003", scenario_id: "COMPOSITE-01" })
});
assert.equal(previewResponse.status, 200);
const previewResponseBody = await previewResponse.json();
assert.equal(previewResponseBody.tasks.find((task) => task.process_id === "P07").blocker, p07Blocker);
assert.equal(previewResponseBody.execution.request_completion_allowed, false);

const mappingResponse = await fetch(`${origin}/api/mapping-preview`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ request_id: "REQ-DEMO-003", scenario_id: "COMPOSITE-01", preview_output: { request: { request_text: "untrusted-client-data" } } })
});
assert.equal(mappingResponse.status, 200);
const mappingResponseBody = await mappingResponse.json();
assert.equal(mappingResponseBody.task_record_previews.length, 3);
assert.equal(mappingResponseBody.validation_summary.duplicate_check, "NOT_RUN_PERSISTENT_STORE");
assert.equal(mappingResponseBody.execution.operational_write_count, 0);

const approvalResponse = await fetch(`${origin}/api/approval-preview`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ request_id: "REQ-DEMO-001", scenario_id: "SINGLE-P03-02", action: "approve" })
});
assert.equal(approvalResponse.status, 200);
const approvalResponseBody = await approvalResponse.json();
assert.equal(approvalResponseBody.approval_status, "APPROVED_FOR_TEST_WRITE");
assert.equal(approvalResponseBody.write_count, 0);
assert.equal(approvalResponseBody.execution.notion_write_enabled, false);

const unsupported = await fetch(`${origin}/api/preview`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ request_id: "REQ-UNKNOWN", scenario_id: "SINGLE-P03-02" })
});
assert.equal(unsupported.status, 400);
assert.equal((await unsupported.json()).error_code, "UNSUPPORTED_DEMO_REQUEST");

const serverSource = fs.readFileSync("plugins/vc-support-admin/console/admin-process-console-server.mjs", "utf8");
assert.doesNotMatch(serverSource, /mcp__codex_apps__notion|notion_create_pages|notion_update_page/i);

await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
console.log("admin-process-console-v0.3: PASS");
