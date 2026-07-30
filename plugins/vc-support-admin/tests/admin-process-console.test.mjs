import assert from "node:assert/strict";
import { once } from "node:events";
import fs from "node:fs";

import {
  CONSOLE_VERSION,
  DEFAULT_REQUEST_TEXT,
  DEMO_REQUESTS,
  buildConsolePreview,
  createConsoleServer
} from "../console/admin-process-console-server.mjs";

const plugin = JSON.parse(fs.readFileSync("plugins/vc-support-admin/plugin.yaml", "utf8"));
const htmlSource = fs.readFileSync("plugins/vc-support-admin/console/public/index.html", "utf8");
const jsSource = fs.readFileSync("plugins/vc-support-admin/console/public/console.js", "utf8");
const cssSource = fs.readFileSync("plugins/vc-support-admin/console/public/console.css", "utf8");
const standaloneHtml = fs.readFileSync("plugins/vc-support-admin/reports/console-pilot/request-task-console-v0.2.html", "utf8");
const outputSample = JSON.parse(fs.readFileSync("plugins/vc-support-admin/reports/console-pilot/request-task-console-v0.2-output.json", "utf8"));
const demoGuide = fs.readFileSync("plugins/vc-support-admin/reports/console-pilot/request-task-console-v0.2-demo.md", "utf8");

assert.equal(CONSOLE_VERSION, "PILOT v0.2");
assert.equal(plugin.entry_points.admin_process_console, "console/admin-process-console-server.mjs");
assert.ok(plugin.interfaces.includes("local_console"));
assert.equal(DEMO_REQUESTS.length, 3);
assert.deepEqual(DEMO_REQUESTS.map((item) => item.request_id), ["REQ-DEMO-001", "REQ-DEMO-002", "REQ-DEMO-003"]);
assert.deepEqual(DEMO_REQUESTS.map((item) => item.scenario_id), ["SINGLE-P03-02", "SINGLE-P03-01", "COMPOSITE-01"]);
assert.deepEqual(DEMO_REQUESTS.map((item) => item.source_mode), ["NATURAL_LANGUAGE_PREVIEW", "FIXTURE_PRESET", "FIXTURE_PRESET"]);

for (const panelId of ["request-inbox", "request-panel", "current-action-panel", "kanban", "interaction-panel", "evidence-panel", "timeline", "execution-panel", "raw-json"]) {
  assert.match(htmlSource, new RegExp(`id="${panelId}"`));
}
assert.match(htmlSource, /<details class="card raw-json">/);
assert.match(htmlSource, /기술 상세 보기/);
assert.match(htmlSource, /NOTION_BACKEND=NOT_CONNECTED/);
assert.match(jsSource, /function currentTask/);
assert.match(jsSource, /current Task 없음|현재 Task 없음/);
assert.match(jsSource, /NATURAL_LANGUAGE_PREVIEW/);
assert.match(jsSource, /FIXTURE_PRESET/);
assert.match(cssSource, /grid-template-columns: repeat\(6, minmax\(175px, 1fr\)\)/);
assert.match(cssSource, /@media \(max-width: 950px\)/);
assert.match(cssSource, /@media \(max-width: 640px\)/);
assert.ok(standaloneHtml.length > 0);
assert.doesNotMatch(standaloneHtml, /https?:\/\//i);
for (const text of ["REQ-DEMO-001", "REQ-DEMO-002", "REQ-DEMO-003", "현재 Task Kanban", "사람 확인", "기술 상세 보기", "Operational Write", "STAMPED_ORIGINAL"]) {
  assert.ok(standaloneHtml.includes(text));
}
assert.equal(outputSample.console_version, "PILOT v0.2");
assert.equal(outputSample.demo_requests.length, 3);
assert.equal(outputSample.scenario_outputs["REQ-DEMO-002"].current_task.completion_candidate, true);
assert.equal(outputSample.scenario_outputs["REQ-DEMO-003"].current_task.blocker, "P07 제출서류 미확보");
assert.match(demoGuide, /SINGLE-P03-02/);
assert.match(demoGuide, /Operational Write Count/);

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
assert.equal(human.tasks[0].actor, "사람 확인");
assert.equal(human.tasks[0].blocker, "날인본 원본 미확보");
assert.equal(human.tasks[0].next_action, "유효한 날인본 원본 재수집");
assert.deepEqual(human.snapshot_timeline.map((entry) => entry.stage), ["RECEIVED", "EVIDENCE_REVIEW", "HUMAN_CONFIRMATION", "BLOCKED"]);
assert.equal(human.execution.operational_write_allowed, false);
assert.equal(human.execution.operational_write_count, 0);

const normal = await buildConsolePreview({ request_id: "REQ-DEMO-002", scenario_id: "SINGLE-P03-01" });
assert.equal(normal.ok, true);
assert.equal(normal.source_mode, "FIXTURE_PRESET");
assert.equal(normal.request.dummy_fund_id, "DUMMY-FUND-A");
assert.equal(normal.tasks[0].stage, "COMPLETION_CANDIDATE");
assert.equal(normal.tasks[0].actor, "지원팀");
assert.equal(normal.tasks[0].next_action, "저장·전달 Evidence 확인");
assert.equal(normal.tasks[0].completion_candidate, true);
assert.equal(normal.tasks[0].completion_allowed, false);
assert.equal(normal.execution.request_completion_allowed, false);

const composite = await buildConsolePreview({ request_id: "REQ-DEMO-003", scenario_id: "COMPOSITE-01" });
assert.equal(composite.ok, true);
assert.equal(composite.source_mode, "FIXTURE_PRESET");
assert.equal(composite.request.dummy_fund_id, "DUMMY-FUND-E");
assert.deepEqual(composite.tasks.map((task) => task.process_id), ["P03", "P04", "P07"]);
const blocked = composite.tasks.find((task) => task.process_id === "P07");
assert.equal(blocked.stage, "BLOCKED");
assert.equal(blocked.actor, "지원팀");
assert.equal(blocked.blocker, "P07 제출서류 미확보");
assert.equal(blocked.next_action, "계좌개설 제출서류 수집");
assert.equal(composite.execution.operational_write_count, 0);

const clarification = await buildConsolePreview({
  request_id: "REQ-DEMO-001",
  scenario_id: "SINGLE-P03-02",
  request_text: "DUMMY-FUND-B의 고유번호증 신청 건을 확인해줘."
});
assert.equal(clarification.ok, false);
assert.equal(clarification.error_code, "REQUEST_CLARIFICATION_REQUIRED");
assert.equal(clarification.interaction.clarification_required, true);
assert.equal(clarification.execution.operational_write_count, 0);

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
assert.match(await html.text(), /지원팀 행정업무 Console/);

const demos = await fetch(`${origin}/api/demo-requests`);
assert.equal(demos.status, 200);
const demoPayload = await demos.json();
assert.equal(demoPayload.demo_requests.length, 3);
assert.equal(demoPayload.notion_backend, "NOT_CONNECTED");

const response = await fetch(`${origin}/api/preview`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ request_id: "REQ-DEMO-003", scenario_id: "COMPOSITE-01" })
});
assert.equal(response.status, 200);
const responseBody = await response.json();
assert.equal(responseBody.tasks.find((task) => task.process_id === "P07").blocker, "P07 제출서류 미확보");
assert.equal(responseBody.execution.request_completion_allowed, false);

const unsupported = await fetch(`${origin}/api/preview`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ request_id: "REQ-UNKNOWN", scenario_id: "SINGLE-P03-02" })
});
assert.equal(unsupported.status, 400);
assert.equal((await unsupported.json()).error_code, "UNSUPPORTED_DEMO_REQUEST");

await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
console.log("admin-process-console-v0.2: PASS");
