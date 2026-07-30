import assert from "node:assert/strict";
import { once } from "node:events";
import fs from "node:fs";
import { createConsoleServer, buildConsolePreview } from "../console/admin-process-console-server.mjs";

const requestText = "DUMMY-FUND-B의 고유번호증 신청 건을 확인해줘. 신청서 초안은 있지만 날인본 원본은 아직 준비되지 않았어.";
const plugin = JSON.parse(fs.readFileSync("plugins/vc-support-admin/plugin.yaml", "utf8"));
const outputSample = JSON.parse(fs.readFileSync("plugins/vc-support-admin/reports/console-pilot/request-task-console-v0.1-output.json", "utf8"));
const htmlSource = fs.readFileSync("plugins/vc-support-admin/console/public/index.html", "utf8");
const cssSource = fs.readFileSync("plugins/vc-support-admin/console/public/console.css", "utf8");
const standaloneHtml = fs.readFileSync("plugins/vc-support-admin/reports/console-pilot/request-task-console-v0.1.html", "utf8");
assert.equal(plugin.entry_points.admin_process_console, "console/admin-process-console-server.mjs");
assert.ok(plugin.interfaces.includes("local_console"));
for (const panelId of ["request-panel", "kanban", "interaction-panel", "evidence-panel", "timeline", "execution-panel", "raw-json"]) {
  assert.match(htmlSource, new RegExp(`id="${panelId}"`));
}
assert.match(htmlSource, /<details class="card raw-json">/);
assert.match(cssSource, /@media \(max-width: 950px\)/);
assert.match(cssSource, /@media \(max-width: 640px\)/);
assert.ok(standaloneHtml.length > 0);
assert.doesNotMatch(standaloneHtml, /https?:\/\//i);
for (const text of [
  "지원팀 행정업무 Console",
  "Request Summary",
  "Task Kanban",
  "HUMAN_CONFIRMATION",
  "BLOCKED",
  "Operational Write Count",
  "상세 Raw JSON 보기",
  outputSample.request.dummy_fund_id,
  outputSample.tasks[0].next_action,
  outputSample.tasks[0].blocker
]) assert.ok(standaloneHtml.includes(text));

const direct = await buildConsolePreview({ request_text: requestText, scenario_id: "SINGLE-P03-02" });
assert.equal(direct.ok, true);
assert.equal(direct.request.dummy_fund_id, "DUMMY-FUND-B");
assert.deepEqual(direct.request.process_ids, ["P03"]);
assert.equal(direct.tasks[0].operational_task_id, "P03-T03");
assert.equal(direct.tasks[0].actor, "사람 확인");
assert.equal(direct.tasks[0].blocker, "날인본 원본 미확보");
assert.equal(direct.tasks[0].next_action, "유효한 날인본 원본 재수집");
assert.deepEqual(direct.snapshot_timeline.map((entry) => entry.stage), ["RECEIVED", "EVIDENCE_REVIEW", "HUMAN_CONFIRMATION", "BLOCKED"]);
assert.equal(direct.execution.operational_write_allowed, false);
assert.equal(direct.execution.operational_write_count, 0);
assert.equal(direct.backend_mode, "LOCAL_PREVIEW");
assert.equal(direct.notion_schema, "REFERENCE_ONLY");
assert.equal(outputSample.request.dummy_fund_id, direct.request.dummy_fund_id);
assert.equal(outputSample.tasks[0].next_action, direct.tasks[0].next_action);
assert.deepEqual(outputSample.snapshot_timeline.map((entry) => entry.stage), direct.snapshot_timeline.map((entry) => entry.stage));
assert.equal(outputSample.execution.operational_write_count, direct.execution.operational_write_count);

const clarification = await buildConsolePreview({
  request_text: "DUMMY-FUND-B의 고유번호증 신청 건을 확인해줘.",
  scenario_id: "SINGLE-P03-02"
});
assert.equal(clarification.ok, false);
assert.equal(clarification.error_code, "REQUEST_CLARIFICATION_REQUIRED");
assert.equal(clarification.interaction.clarification_required, true);
assert.equal(clarification.execution.operational_write_count, 0);

await assert.rejects(
  () => buildConsolePreview({ request_text: requestText, scenario_id: "SINGLE-P03-01" }),
  { code: "UNSUPPORTED_SCENARIO" }
);

const server = createConsoleServer();
server.listen({ host: "127.0.0.1", port: 0 });
await once(server, "listening");
const address = server.address();
const origin = `http://127.0.0.1:${address.port}`;

const html = await fetch(origin);
assert.equal(html.status, 200);
assert.match(await html.text(), /지원팀 행정업무 Console/);

const response = await fetch(`${origin}/api/preview`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ request_text: requestText, scenario_id: "SINGLE-P03-02" })
});
assert.equal(response.status, 200);
const responseBody = await response.json();
assert.equal(responseBody.tasks[0].completion_allowed, false);
assert.equal(responseBody.execution.request_completion_allowed, false);

const unsupported = await fetch(`${origin}/api/preview`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ request_text: requestText, scenario_id: "COMPOSITE-01" })
});
assert.equal(unsupported.status, 400);
assert.equal((await unsupported.json()).error_code, "UNSUPPORTED_SCENARIO");

await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
console.log("admin-process-console: PASS");
