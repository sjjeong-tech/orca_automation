const canonicalStageLabels = Object.freeze({
  RECEIVED: "요청 접수",
  INFORMATION_CHECK: "확인 필요",
  EVIDENCE_REVIEW: "확인 필요",
  HUMAN_CONFIRMATION: "확인 필요",
  EXTERNAL_WAIT: "외부 대기",
  RESULT_REVIEW: "진행 가능",
  NEXT_PROCESS: "진행 가능",
  COMPLETION_CANDIDATE: "완료 후보",
  BLOCKED: "중단"
});

const kanbanColumns = Object.freeze([
  ["RECEIVED", "요청 접수"],
  ["CHECK", "확인 필요"],
  ["ACTIVE", "진행 가능"],
  ["EXTERNAL_WAIT", "외부 대기"],
  ["COMPLETION_CANDIDATE", "완료 후보"],
  ["BLOCKED", "중단"]
]);

const input = document.querySelector("#request-text");
const runButton = document.querySelector("#preview-button");
const mappingButton = document.querySelector("#mapping-preview-button");
const runStatus = document.querySelector("#run-status");
const emptyState = document.querySelector("#empty-state");
const consoleContent = document.querySelector("#console-content");
const mappingSection = document.querySelector("#mapping-section");
const approvalDrawer = document.querySelector("#approval-drawer");
let demoRequests = [];
let selectedRequest = null;
let selectedRequestId = null;
let activePreview = null;
let activeMapping = null;
let selectionSequence = 0;

function findDemoRequest(requestId) {
  return demoRequests.find((demo) => demo.request_id === requestId) ?? null;
}

function selectionIsCurrent(requestId, sequence) {
  return selectedRequestId === requestId && selectionSequence === sequence;
}

function resetRequestScopedUi() {
  activePreview = null;
  activeMapping = null;
  mappingSection.hidden = true;
  mappingButton.disabled = true;
  if (approvalDrawer.open) approvalDrawer.close();
  document.querySelector("#approval-status").textContent = "승인 상태: NOT_REVIEWED · Write Count 0";
  document.querySelector("#mapping-write-badge").textContent = "WRITE NOT EXECUTED";
  document.querySelector("#drawer-write-badge").textContent = "WRITE NOT EXECUTED";
}

function renderBackendStatus(payload) {
  factList(document.querySelector("#backend-status-panel"), [
    ["Backend Mode", payload.backend_mode],
    ["Schema Requery KST", payload.schema_requery_kst],
    ["Read Transport", payload.schema_source],
    ["Request DB", payload.request_db],
    ["Task DB", payload.task_db],
    ["Dummy Fund DB", payload.dummy_fund_db],
    ["Notion Read Enabled", bool(payload.notion_read_enabled)],
    ["Notion Write Enabled", bool(payload.notion_write_enabled)],
    ["Notion Write Count", payload.notion_write_count ?? 0],
    ["Operational Write Count", payload.operational_write_count ?? 0]
  ]);
}

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined && text !== null) node.textContent = String(text);
  if (className) node.className = className;
  return node;
}

function bool(value) {
  return value ? "true" : "false";
}

function valueOrDash(value) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  if (typeof value === "object" && value) return JSON.stringify(value);
  return value === undefined || value === null || value === "" ? "-" : value;
}

function factList(target, items) {
  target.replaceChildren();
  for (const [label, value] of items) {
    const pair = document.createElement("div");
    pair.append(element("dt", label), element("dd", valueOrDash(value)));
    target.append(pair);
  }
}

function displayColumn(stage) {
  if (["INFORMATION_CHECK", "EVIDENCE_REVIEW", "HUMAN_CONFIRMATION"].includes(stage)) return "CHECK";
  if (["RESULT_REVIEW", "NEXT_PROCESS"].includes(stage)) return "ACTIVE";
  return stage ?? "CHECK";
}

function currentTask(payload) {
  const tasks = payload.tasks ?? [];
  if (payload.scenario_id === "COMPOSITE-01") {
    return tasks.find((task) => task.process_id === "P07" && task.stage === "BLOCKED") ?? tasks.find((task) => task.stage === "BLOCKED") ?? tasks.at(-1);
  }
  return tasks[0];
}

function taskCard(task) {
  const card = element("article", undefined, "task-card");
  card.append(element("p", "현재 Task", "card-kicker"));
  card.append(element("h3", `${task.process_id ?? "-"} · ${task.operational_task_id ?? "확인 필요"}`));
  card.append(element("p", `${canonicalStageLabels[task.stage] ?? task.stage} · ${task.stage ?? "-"}`, "task-meta"));
  const facts = document.createElement("dl");
  facts.className = "task-facts";
  for (const [label, value] of [
    ["Actor", task.actor], ["다음 Action", task.next_action], ["Blocker", task.blocker || "없음"],
    ["완료조건", task.completion_condition], ["완료증빙", task.completion_evidence],
    ["Completion Candidate", bool(task.completion_candidate)], ["Completion Allowed", bool(task.completion_allowed)]
  ]) {
    const pair = document.createElement("div");
    pair.append(element("dt", label), element("dd", valueOrDash(value)));
    facts.append(pair);
  }
  card.append(facts);
  return card;
}

function renderInbox() {
  const inbox = document.querySelector("#request-inbox");
  inbox.replaceChildren();
  for (const demo of demoRequests) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.requestId = demo.request_id;
    button.className = `inbox-item${selectedRequestId === demo.request_id ? " selected" : ""}`;
    button.setAttribute("aria-pressed", String(selectedRequestId === demo.request_id));
    button.append(element("span", demo.request_id, "inbox-id"));
    button.append(element("strong", demo.title));
    button.append(element("span", `${demo.dummy_fund_id} · ${demo.display_status}`, "inbox-meta"));
    button.append(element("span", `Actor ${demo.current_actor} · Blocker ${demo.has_blocker ? "있음" : "없음"}`, "inbox-meta"));
    button.append(element("span", demo.source_mode, "mode-label"));
    inbox.append(button);
  }
}

function renderKanban(payload) {
  const board = document.querySelector("#kanban");
  board.replaceChildren();
  const task = currentTask(payload);
  const activeColumn = displayColumn(task?.stage);
  for (const [columnId, label] of kanbanColumns) {
    const column = element("section", undefined, "kanban-column");
    column.append(element("h3", label));
    if (task && activeColumn === columnId) column.append(taskCard(task));
    else column.append(element("p", columnId === "COMPLETION_CANDIDATE" ? "현재 완료 후보 없음" : "현재 Task 없음", "empty-column"));
    board.append(column);
  }
}

function renderCurrentAction(payload) {
  const panel = document.querySelector("#current-action-content");
  panel.replaceChildren();
  const task = currentTask(payload) ?? {};
  const interaction = payload.interaction ?? {};
  for (const [label, value] of [
    ["현재 Actor", task.actor], ["지금 해야 할 일", task.next_action], ["Blocker", task.blocker || "없음"],
    ["사람 확인 질문", interaction.human_confirmation_required ? interaction.questions?.[0] : "없음"],
    ["Task 완료 가능", bool(task.completion_allowed)],
    ["운영 Write", `${bool(payload.execution?.operational_write_allowed)} · Count ${payload.execution?.operational_write_count ?? 0}`]
  ]) {
    const row = element("div", undefined, "action-row");
    row.append(element("span", label), element("strong", valueOrDash(value)));
    panel.append(row);
  }
}

function renderCompositeSummary(payload) {
  const container = document.querySelector("#composite-summary");
  container.replaceChildren();
  const composite = payload.scenario_id === "COMPOSITE-01";
  container.hidden = !composite;
  if (!composite) return;
  container.append(element("h3", "복합 Process 상태"), element("p", "P03·P04 결과는 보존하고 P07만 제출서류 미확보로 중단됩니다.", "muted"));
  const list = document.createElement("ul");
  list.className = "process-summary";
  for (const task of payload.tasks ?? []) {
    const label = task.stage === "BLOCKED" ? "중단" : "보존";
    list.append(element("li", `${task.process_id} · ${task.operational_task_id} · ${label} · ${canonicalStageLabels[task.stage] ?? task.stage}`));
  }
  container.append(list);
}

function renderInteraction(payload) {
  const panel = document.querySelector("#interaction-panel");
  panel.replaceChildren();
  const interaction = payload.interaction ?? {};
  panel.append(element("p", interaction.human_confirmation_required ? "사람 확인 필요" : "사람 확인 없음", interaction.human_confirmation_required ? "callout" : "callout neutral"));
  const questions = interaction.questions?.filter(Boolean) ?? [];
  panel.append(element("h3", "확인 질문"));
  if (questions.length) {
    const list = document.createElement("ul");
    for (const question of questions) list.append(element("li", question));
    panel.append(list);
  } else panel.append(element("p", "현재 사람 확인 질문 없음", "muted"));
  panel.append(element("p", `Clarification: ${bool(interaction.clarification_required)}`, "muted"));
}

function renderEvidence(payload) {
  const panel = document.querySelector("#evidence-panel");
  panel.replaceChildren();
  const table = document.createElement("table");
  const head = document.createElement("thead");
  const headerRow = document.createElement("tr");
  for (const label of ["Evidence Type", "Result", "Legacy Compatibility"]) headerRow.append(element("th", label));
  head.append(headerRow);
  const body = document.createElement("tbody");
  for (const item of payload.evidence ?? payload.evidence_decisions ?? []) {
    const row = document.createElement("tr");
    row.append(element("td", item.evidence_type), element("td", item.evidence_result), element("td", `${item.legacy_evidence_type ?? "-"} / ${item.legacy_fixture_state ?? "-"}`));
    body.append(row);
  }
  table.append(head, body);
  panel.append(table);
}

function renderTimeline(payload) {
  const timeline = document.querySelector("#timeline");
  timeline.replaceChildren();
  const task = currentTask(payload) ?? {};
  for (const snapshot of payload.snapshot_timeline ?? []) {
    const item = document.createElement("li");
    item.className = `timeline-item ${snapshot.stage === task.stage ? "current" : ""}`;
    item.append(element("strong", canonicalStageLabels[snapshot.stage] ?? snapshot.stage), element("span", snapshot.stage, "canonical-stage"));
    const detail = snapshot.question ? `질문: ${snapshot.question}` : snapshot.evidence_type ? `Evidence: ${snapshot.evidence_type} / ${snapshot.evidence_result}` : `Process: ${snapshot.process_id ?? task.process_id ?? "-"}`;
    item.append(element("p", detail));
    if (snapshot.actor) item.append(element("p", `Actor: ${snapshot.actor}`));
    if (snapshot.blocker) item.append(element("p", `Blocker: ${snapshot.blocker}`, "timeline-blocker"));
    if (snapshot.next_action) item.append(element("p", `다음 Action: ${snapshot.next_action}`));
    timeline.append(item);
  }
}

function renderPayload(payload) {
  activePreview = payload;
  emptyState.hidden = true;
  consoleContent.hidden = false;
  document.querySelector("#skill-commit").textContent = payload.audit?.skill_commit?.slice(0, 7) ?? "976b582";
  const request = payload.request ?? {};
  const status = selectedRequest?.display_status ?? request.overall_status ?? "확인 필요";
  const statusBadge = document.querySelector("#overall-status");
  statusBadge.textContent = status;
  statusBadge.className = `badge ${status.includes("중단") ? "status-blocked" : ""}`;
  factList(document.querySelector("#request-panel"), [["Request ID", payload.request_id], ["요청명", selectedRequest?.title], ["조합", request.dummy_fund_id], ["Process", request.process_ids], ["전체 상태", status], ["처리 방식", payload.source_mode], ["Preview-only", bool(request.preview_only)]]);
  factList(document.querySelector("#metadata-panel"), [["Transaction ID", request.transaction_id ?? payload.transaction_id], ["Scenario ID", request.scenario_id ?? payload.scenario_id], ["Skill Manifest", payload.manifest?.manifest_id], ["Schema Source", payload.schema_source]]);
  renderCurrentAction(payload); renderKanban(payload); renderCompositeSummary(payload); renderInteraction(payload); renderEvidence(payload);
  factList(document.querySelector("#execution-panel"), [["Request 완료 가능", bool(payload.execution?.request_completion_allowed)], ["Task 완료 가능", bool(payload.completion_allowed)], ["후속 자동 진행", bool(payload.execution?.downstream_auto_completion)], ["Notion Write Enabled", bool(payload.execution?.notion_write_enabled)], ["실제 Write Count", payload.execution?.operational_write_count ?? 0]]);
  renderTimeline(payload);
  document.querySelector("#raw-json").textContent = JSON.stringify({ preview: payload, mapping_preview: activeMapping }, null, 2);
  mappingButton.disabled = false;
}

function renderError(payload) {
  emptyState.hidden = false;
  consoleContent.hidden = true;
  mappingButton.disabled = true;
  emptyState.replaceChildren(element("strong", "지원 범위 밖 / 확인 필요"), element("p", payload.message ?? "현재 요청은 안전하게 Preview할 수 없습니다."), element("p", `현재 지원 Scenario: ${(payload.supported_scenarios ?? []).join(", ")}`));
}

function renderRecordPreview(target, record) {
  const properties = Object.entries(record.properties ?? {}).map(([key, value]) => [key, value]);
  factList(target, [["대상 DB", record.target_db], ["Record Title", record.record_title], ["Transaction ID", record.transaction_id ?? record.parent_request_transaction_id], ["Write Status", record.write_status], ...properties]);
}

function renderMappingSummary(mapping) {
  const summary = document.querySelector("#mapping-summary");
  summary.replaceChildren();
  const validation = mapping.validation_summary;
  for (const [label, value] of [["Required Mapping", validation.required_mapping], ["Passed", validation.passed], ["Gaps", validation.gaps], ["Blocking Gaps", validation.blocking_gaps], ["Duplicate Check", validation.duplicate_check], ["Write Allowed", bool(validation.write_allowed)]]) {
    const item = element("div", undefined, "mapping-stat");
    item.append(element("span", label), element("strong", value));
    summary.append(item);
  }
}

function renderTaskRecordPreviews(records) {
  const target = document.querySelector("#task-record-previews");
  target.replaceChildren();
  for (const record of records) {
    const card = element("article", undefined, "planned-task-card");
    card.append(element("h4", record.record_title), element("p", `${record.canonical_stage} · ${record.ui_status}`, "task-meta"));
    const facts = document.createElement("dl");
    facts.className = "task-facts";
    for (const [label, value] of [["Operational Task ID", record.operational_task_id], ["Process ID", record.process_id], ["Actor", record.actor], ["다음 Action", record.next_action], ["Blocker", record.blocker || "없음"], ["Completion Candidate", bool(record.completion_candidate)], ["Completion Allowed", bool(record.completion_allowed)], ["상위 Request", record.parent_request_transaction_id]]) {
      const pair = document.createElement("div"); pair.append(element("dt", label), element("dd", valueOrDash(value))); facts.append(pair);
    }
    card.append(facts); target.append(card);
  }
}

function renderPropertyMappings(mappings) {
  const body = document.querySelector("#property-mappings tbody");
  body.replaceChildren();
  for (const mapping of mappings) {
    const row = document.createElement("tr");
    for (const field of ["console_field", "source_value", "target_db", "target_property", "property_type", "mapping_rule", "validation", "write_value", "gap"]) row.append(element("td", valueOrDash(mapping[field])));
    body.append(row);
  }
}

function renderReadOnlyValidation(mapping) {
  factList(document.querySelector("#relation-preview-panel"), [
    ["Dummy Fund", mapping.relation_preview?.dummy_fund_id],
    ["Exact Match", mapping.relation_preview?.result],
    ["Match Count", mapping.relation_preview?.exact_match_count],
    ["Matched Record", mapping.relation_preview?.matched_record],
    ["Relation Ready", bool(mapping.relation_preview?.relation_ready)],
    ["Write Count", mapping.relation_preview?.write_count ?? 0]
  ]);
  factList(document.querySelector("#duplicate-preview-panel"), [
    ["Transaction ID", mapping.duplicate_preview?.transaction_id],
    ["Request Match Count", mapping.duplicate_preview?.request_match_count],
    ["Task Match Count", mapping.duplicate_preview?.task_match_count],
    ["Result", mapping.duplicate_preview?.result],
    ["Proposed Action", mapping.duplicate_preview?.proposed_action],
    ["Semantic Gap", mapping.duplicate_preview?.semantic_gap]
  ]);
}

function renderExpectedActual(mapping) {
  const target = document.querySelector("#expected-actual");
  target.replaceChildren();
  factList(target, [["Expected", "생성 예정 Request/Task Payload"], ["Actual", mapping.expected_actual.actual], ["Result", mapping.expected_actual.result], ["Notion Write", mapping.write_count]]);
}

function renderAudit(mapping) {
  factList(document.querySelector("#audit-panel"), [["Preview Generated At", mapping.audit.preview_generated_at_kst], ["Skill Commit", mapping.audit.skill_commit.slice(0, 7)], ["Console Version", mapping.audit.console_version], ["Manifest ID", mapping.audit.manifest_id], ["Batch ID", mapping.audit.batch_id], ["Transaction ID", mapping.audit.transaction_id], ["Approval Status", mapping.audit.approval_status], ["Approved By", mapping.audit.approved_by], ["Write Count", mapping.audit.write_count]]);
}

function renderApprovalDrawer(mapping) {
  const target = document.querySelector("#approval-drawer-content");
  target.replaceChildren();
  const validation = mapping.validation_summary;
  const counts = [["대상 Request DB", mapping.request_record_preview.target_db], ["대상 Task DB", mapping.task_record_previews[0]?.target_db], ["Transaction ID", mapping.audit.transaction_id], ["생성 예정 Request", mapping.request_record_preview.planned_record_count], ["생성 예정 Task", mapping.task_record_previews.length], ["수정 예정 Record", 0], ["중복 후보", validation.duplicate_check], ["Unmapped Field", validation.gaps], ["승인 상태", mapping.approval_state]];
  const list = document.createElement("dl"); list.className = "drawer-facts";
  for (const [label, value] of counts) { const pair = document.createElement("div"); pair.append(element("dt", label), element("dd", valueOrDash(value))); list.append(pair); }
  target.append(list, element("p", validation.note, "muted"));
}

function renderMapping(mapping) {
  activeMapping = mapping;
  mappingSection.hidden = false;
  document.querySelector("#mapping-write-badge").textContent = mapping.approval_state === "NOT_REVIEWED" ? "WRITE NOT EXECUTED" : mapping.approval_state;
  document.querySelector("#drawer-write-badge").textContent = document.querySelector("#mapping-write-badge").textContent;
  renderMappingSummary(mapping); renderRecordPreview(document.querySelector("#request-record-preview"), mapping.request_record_preview); renderTaskRecordPreviews(mapping.task_record_previews); renderPropertyMappings(mapping.property_mappings); renderReadOnlyValidation(mapping); renderExpectedActual(mapping); renderAudit(mapping); renderApprovalDrawer(mapping);
  document.querySelector("#raw-json").textContent = JSON.stringify({ preview: activePreview, mapping_preview: mapping }, null, 2);
}

async function runPreview(sequence = selectionSequence) {
  const requestId = selectedRequestId;
  const demo = selectedRequest;
  if (!requestId || !demo) return;
  runButton.disabled = true; mappingButton.disabled = true; mappingSection.hidden = true; activeMapping = null;
  runStatus.textContent = "기존 Skill을 Preview-only로 실행 중입니다.";
  try {
    const body = { request_id: demo.request_id, scenario_id: demo.scenario_id };
    if (demo.source_mode === "NATURAL_LANGUAGE_PREVIEW") body.request_text = input.value;
    const response = await fetch("/api/preview", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const payload = await response.json();
    if (!selectionIsCurrent(requestId, sequence)) return;
    if (!response.ok || payload.ok === false) { renderError(payload); runStatus.textContent = `실행 중단: ${payload.error_code ?? "확인 필요"} · Write 0`; return; }
    renderPayload(payload); runStatus.textContent = `Preview 완료 · ${payload.request?.dummy_fund_id ?? "-"} · Notion Write 0`;
  } catch (error) {
    if (selectionIsCurrent(requestId, sequence)) { renderError({ message: "로컬 Console 서버와 통신하지 못했습니다." }); runStatus.textContent = `통신 오류: ${error.message}`; }
  } finally { if (selectionIsCurrent(requestId, sequence)) runButton.disabled = false; }
}

async function runMappingPreview(sequence = selectionSequence) {
  const requestId = selectedRequestId;
  const demo = selectedRequest;
  const preview = activePreview;
  if (!requestId || !demo || !preview) return;
  mappingButton.disabled = true; runStatus.textContent = "기존 TEST LAB Schema에 대한 Mapping Preview를 생성 중입니다.";
  try {
    const response = await fetch("/api/notion/test-write-payload-preview", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ request_id: demo.request_id, scenario_id: demo.scenario_id, preview_output: preview }) });
    const payload = await response.json();
    if (!selectionIsCurrent(requestId, sequence)) return;
    if (!response.ok || payload.ok === false) throw new Error(payload.message ?? payload.error_code ?? "Mapping Preview 실패");
    renderMapping(payload); runStatus.textContent = `DB Mapping Preview 완료 · Task ${payload.task_record_previews.length}건 · Notion Write 0`;
  } catch (error) { if (selectionIsCurrent(requestId, sequence)) runStatus.textContent = `Mapping Preview 오류: ${error.message}`; }
  finally { if (selectionIsCurrent(requestId, sequence)) mappingButton.disabled = false; }
}

async function simulateApproval(action) {
  const requestId = selectedRequestId;
  const sequence = selectionSequence;
  const demo = selectedRequest;
  const preview = activePreview;
  const mapping = activeMapping;
  if (!requestId || !demo || !preview || !mapping) return;
  const response = await fetch("/api/approval-preview", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ request_id: demo.request_id, scenario_id: demo.scenario_id, preview_output: preview, action }) });
  const approval = await response.json();
  if (!selectionIsCurrent(requestId, sequence)) return;
  if (!response.ok || approval.ok === false) { document.querySelector("#approval-status").textContent = `승인 시뮬레이션 오류: ${approval.error_code ?? "확인 필요"}`; return; }
  activeMapping = { ...mapping, approval_state: approval.approval_status, approval_preview: approval, audit: approval.audit };
  renderMapping(activeMapping);
  document.querySelector("#approval-status").textContent = `승인 상태: ${approval.approval_status} · Approved By: ${approval.approved_by} · Write Count ${approval.write_count}`;
  runStatus.textContent = `${approval.approval_status} · Notion Write 0 · 다음 단계: ${approval.next_step}`;
}

async function selectRequest(requestId) {
  const demo = findDemoRequest(requestId);
  if (!demo) return;
  const sequence = ++selectionSequence;
  selectedRequestId = demo.request_id;
  selectedRequest = demo;
  resetRequestScopedUi();
  input.value = demo.request_text ?? ""; input.readOnly = demo.source_mode !== "NATURAL_LANGUAGE_PREVIEW";
  input.placeholder = demo.source_mode === "NATURAL_LANGUAGE_PREVIEW" ? "자연어 요청을 입력하세요." : "FIXTURE_PRESET은 검증된 Scenario 결과를 표시합니다.";
  document.querySelector("#source-mode").textContent = demo.source_mode;
  document.querySelector("#mode-note").textContent = demo.source_mode === "NATURAL_LANGUAGE_PREVIEW" ? "자연어 요청을 기존 Skill에 전달합니다. 지원 범위 밖 입력은 안전하게 중단합니다." : "FIXTURE_PRESET: 자연어 Parser 결과가 아니라 검증된 Fixture Scenario를 표시합니다.";
  renderInbox(); await runPreview(sequence);
}

async function initialize() {
  try {
    const [readinessResponse, response] = await Promise.all([fetch("/api/notion/schema-readiness"), fetch("/api/demo-requests")]);
    const readiness = await readinessResponse.json();
    if (!readinessResponse.ok || readiness.ok === false) throw new Error(readiness.message ?? "Notion Read-only readiness를 불러오지 못했습니다.");
    renderBackendStatus(readiness);
    const payload = await response.json();
    if (!response.ok || payload.ok === false) throw new Error(payload.message ?? "Demo Request 목록을 불러오지 못했습니다.");
    demoRequests = payload.demo_requests ?? []; renderInbox(); await selectRequest(demoRequests[0]?.request_id);
  } catch (error) { renderError({ message: `Console 초기화 오류: ${error.message}`, supported_scenarios: [] }); runStatus.textContent = "Demo Request 목록을 불러오지 못했습니다."; }
}

runButton.addEventListener("click", () => void runPreview());
mappingButton.addEventListener("click", () => void runMappingPreview());
document.querySelector("#request-inbox").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-request-id]");
  if (button) void selectRequest(button.dataset.requestId);
});
document.querySelector("#open-approval-drawer").addEventListener("click", () => approvalDrawer.showModal());
document.querySelector("#close-approval-drawer").addEventListener("click", () => approvalDrawer.close());
document.querySelector("#approval-button").addEventListener("click", () => simulateApproval("approve"));
document.querySelector("#needs-changes-button").addEventListener("click", () => simulateApproval("needs_changes"));
document.querySelector("#cancel-approval-button").addEventListener("click", () => simulateApproval("cancel"));
initialize();
