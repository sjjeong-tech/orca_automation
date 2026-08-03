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
  buildDuplicatePreview,
  buildMappingPreview,
  buildNotionSchemaReadiness,
  buildRelationPreview,
  buildTestWritePayloadPreview,
  createConsoleServer
} from "../console/admin-process-console-server.mjs";
import { BUSINESS_FUNCTION_GOAL, KOREAN_TERMINOLOGY } from "../console/business-decision-view.mjs";

const plugin = JSON.parse(fs.readFileSync("plugins/vc-support-admin/plugin.yaml", "utf8"));
const htmlSource = fs.readFileSync("plugins/vc-support-admin/console/public/index.html", "utf8");
const jsSource = fs.readFileSync("plugins/vc-support-admin/console/public/console.js", "utf8");
const staticHtml = fs.readFileSync("plugins/vc-support-admin/reports/console-pilot/request-task-console-v0.4.1.html", "utf8");
const outputSample = JSON.parse(fs.readFileSync("plugins/vc-support-admin/reports/console-pilot/request-task-console-v0.4.1-output.json", "utf8"));
const uxValidation = JSON.parse(fs.readFileSync("plugins/vc-support-admin/reports/console-pilot/request-task-console-v0.4.1-ux-validation.json", "utf8"));
const demoGuide = fs.readFileSync("plugins/vc-support-admin/reports/console-pilot/request-task-console-v0.4.1-demo.md", "utf8");

assert.equal(CONSOLE_VERSION, "PILOT v0.4.1");
assert.equal(BATCH_ID, "A-CP25-B25");
assert.equal(SCHEMA_SOURCE, "APPROVED_SESSION_TOOL_READ_ONLY_2026-08-03");
assert.equal(plugin.entry_points.admin_process_console, "console/admin-process-console-server.mjs");
assert.ok(plugin.interfaces.includes("local_console"));
assert.deepEqual(DEMO_REQUESTS.map((item) => item.request_id), ["REQ-DEMO-001", "REQ-DEMO-002", "REQ-DEMO-003"]);
assert.match(htmlSource, /지원팀 행정업무 반영 검토/);
assert.match(htmlSource, /반영 가능 여부/);
assert.match(htmlSource, /기술 검증 상세/);
for (const panelId of ["request-inbox", "backend-status-panel", "request-panel", "current-action-panel", "readiness-hero", "blocking-reasons", "readiness-checklist", "approval-button", "kanban", "interaction-panel", "evidence-panel", "timeline", "execution-panel", "mapping-section", "relation-preview-panel", "duplicate-preview-panel", "property-mappings", "raw-json"]) assert.match(htmlSource, new RegExp(`id="${panelId}"`));
for (const endpoint of ["/api/notion/schema-readiness", "/api/notion/duplicate-preview", "/api/notion/relation-preview", "/api/notion/test-write-payload-preview"]) assert.match(jsSource + fs.readFileSync("plugins/vc-support-admin/console/admin-process-console-server.mjs", "utf8"), new RegExp(endpoint.replace(/[/?]/g, "\\$&")));

const readiness = buildNotionSchemaReadiness();
assert.equal(readiness.backend_mode, "NOTION_LIVE_READ_PREVIEW");
assert.equal(readiness.notion_read_enabled, true);
assert.equal(readiness.notion_write_enabled, false);
assert.equal(readiness.notion_write_count, 0);
assert.equal(readiness.readiness.databases.request.properties["요청명"], "title");
assert.equal(readiness.readiness.databases.task.properties["상위 요청"], "relation");
assert.equal(readiness.readiness.dummy_fund_exact_matches["DUMMY-FUND-B"].result, "NO_MATCH");
assert.equal(readiness.readiness.transaction_duplicate_lookup.results["PROTO-SINGLE-P03-02"].request_match_count, 0);

const human = await buildConsolePreview({ request_id: "REQ-DEMO-001", scenario_id: "SINGLE-P03-02", request_text: DEFAULT_REQUEST_TEXT });
assert.equal(human.ok, true);
assert.equal(human.request.dummy_fund_id, "DUMMY-FUND-B");
assert.deepEqual(human.snapshot_timeline.map((entry) => entry.stage), ["RECEIVED", "EVIDENCE_REVIEW", "HUMAN_CONFIRMATION", "BLOCKED"]);
assert.equal(human.execution.notion_write_enabled, false);
assert.equal(human.execution.operational_write_count, 0);

const composite = await buildConsolePreview({ request_id: "REQ-DEMO-003", scenario_id: "COMPOSITE-01" });
assert.equal(composite.tasks.length, 3);
assert.equal(composite.tasks.find((task) => task.process_id === "P07").stage, "BLOCKED");
assert.equal(composite.execution.request_completion_allowed, false);

const mapping = await buildMappingPreview({ request_id: "REQ-DEMO-001", scenario_id: "SINGLE-P03-02", preview_output: human });
assert.equal(mapping.relation_preview.result, "NO_MATCH");
assert.equal(mapping.duplicate_preview.result, "LOOKUP_AVAILABLE_WITH_PROXY");
assert.equal(mapping.validation_summary.status, "APPROVAL_BLOCKED");
assert.ok(mapping.validation_summary.blocking_gaps >= 2);
assert.equal(mapping.request_record_preview.properties["FUND 업무"], "NOT_WRITTEN");
assert.ok(mapping.property_mappings.some((row) => row.console_field === "transaction_id" && row.validation === "BLOCKING_GAP"));
assert.ok(mapping.property_mappings.some((row) => row.console_field === "request_task_relation" && row.validation === "PASS_SEQUENTIAL_RELATION"));
assert.equal(mapping.business_decision_view.function_goal, BUSINESS_FUNCTION_GOAL);
assert.equal(mapping.business_decision_view.hero.status, "반영 전 확인 필요");
assert.equal(mapping.business_decision_view.hero.actual_write_count, 0);
assert.equal(mapping.business_decision_view.blockers.length, 2);
assert.equal(mapping.business_decision_view.approval.disabled, true);
assert.equal(mapping.business_decision_view.approval.actual_write_label, "실제 Notion 반영: 0건");
assert.equal(mapping.business_decision_view.checklist.find((item) => item.id === "fund-relation").status, "차단");
assert.equal(KOREAN_TERMINOLOGY.NOT_WRITTEN, "아직 생성하지 않음");

const duplicate = await buildDuplicatePreview({ request_id: "REQ-DEMO-002", scenario_id: "SINGLE-P03-01" });
assert.equal(duplicate.duplicate_preview.transaction_id, "PROTO-SINGLE-P03-01");
assert.equal(duplicate.duplicate_preview.task_match_count, 0);
const relation = await buildRelationPreview({ request_id: "REQ-DEMO-003", scenario_id: "COMPOSITE-01" });
assert.equal(relation.relation_preview.dummy_fund_id, "DUMMY-FUND-E");
assert.equal(relation.relation_preview.relation_ready, false);
const payload = await buildTestWritePayloadPreview({ request_id: "REQ-DEMO-003", scenario_id: "COMPOSITE-01" });
assert.equal(payload.task_payload_previews.length, 3);
assert.equal(payload.atomicity_preview.failure_policy, "STOP_AFTER_FIRST_TASK_FAILURE");
assert.equal(payload.execution.notion_write_count, 0);
assert.equal(payload.business_decision_view.hero.planned_task_count, 3);

const approval = await buildApprovalPreview({ request_id: "REQ-DEMO-001", scenario_id: "SINGLE-P03-02", action: "approve" });
assert.equal(approval.approval_status, "APPROVAL_BLOCKED");
assert.equal(approval.approved_by, "NOT_WRITTEN");
assert.equal(approval.write_count, 0);

assert.equal(outputSample.console_version, "PILOT v0.4.1");
assert.equal(outputSample.selected_request, "REQ-DEMO-001");
assert.equal(outputSample.mapping_preview.validation_summary.status, "APPROVAL_BLOCKED");
assert.equal(outputSample.execution.notion_write_count, 0);
assert.equal(outputSample.business_decision_view.hero.status, "반영 전 확인 필요");
assert.equal(uxValidation.questions_per_request.length, 3);
assert.equal(uxValidation.questions_per_request[0].answers.length, 7);
assert.equal(uxValidation.notion_write_count, 0);
assert.doesNotMatch(staticHtml, /https?:\/\//i);
for (const text of ["REQ-DEMO-001", "REQ-DEMO-002", "REQ-DEMO-003", "반영 가능 여부", "차단 사유와 다음 조치", "실제 Notion 반영: 0건"]) assert.ok(staticHtml.includes(text));
assert.match(demoGuide, /전용 Transaction ID Property/);
assert.match(demoGuide, /Write 0/);

const server = createConsoleServer();
server.listen({ host: "127.0.0.1", port: 0 });
await once(server, "listening");
const origin = `http://127.0.0.1:${server.address().port}`;
try {
  const schemaResponse = await fetch(`${origin}/api/notion/schema-readiness`);
  assert.equal(schemaResponse.status, 200);
  assert.equal((await schemaResponse.json()).notion_write_count, 0);
  const demos = await fetch(`${origin}/api/demo-requests`);
  const demosPayload = await demos.json();
  assert.equal(demosPayload.demo_requests.length, 3);
  assert.equal(demosPayload.notion_backend, "READ_ONLY");
  for (const [route, requestId, scenarioId] of [["/api/notion/duplicate-preview", "REQ-DEMO-001", "SINGLE-P03-02"], ["/api/notion/relation-preview", "REQ-DEMO-002", "SINGLE-P03-01"], ["/api/notion/test-write-payload-preview", "REQ-DEMO-003", "COMPOSITE-01"]]) {
    const response = await fetch(`${origin}${route}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ request_id: requestId, scenario_id: scenarioId }) });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.notion_write_enabled, false);
    assert.equal(body.notion_write_count, 0);
    assert.equal(body.operational_write_count, 0);
  }
  const approvalResponse = await fetch(`${origin}/api/approval-preview`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ request_id: "REQ-DEMO-001", scenario_id: "SINGLE-P03-02", action: "approve" }) });
  assert.equal((await approvalResponse.json()).approval_status, "APPROVAL_BLOCKED");
} finally { await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); }

const serverSource = fs.readFileSync("plugins/vc-support-admin/console/admin-process-console-server.mjs", "utf8");
assert.doesNotMatch(serverSource, /notion_create_pages|notion_update_page|notion_delete_page|api\/notion\/(?:create|update|delete)/i);
assert.doesNotMatch(serverSource, /mcp__codex_apps__notion/i);
console.log("admin-process-console-v0.4.1: PASS");
