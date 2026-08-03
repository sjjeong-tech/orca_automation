const canonicalStageLabels = Object.freeze({
  RECEIVED: "요청 접수",
  INFORMATION_CHECK: "확인 필요",
  EVIDENCE_REVIEW: "확인 필요",
  HUMAN_CONFIRMATION: "사람 확인 필요",
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
const runStatus = document.querySelector("#run-status");
const emptyState = document.querySelector("#empty-state");
const consoleContent = document.querySelector("#console-content");
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

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined && text !== null) node.textContent = String(text);
  if (className) node.className = className;
  return node;
}

function bool(value) {
  return value ? "예" : "아니요";
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
  const tasks = payload?.tasks ?? [];
  if (payload?.scenario_id === "COMPOSITE-01") {
    return tasks.find((task) => task.process_id === "P07" && task.stage === "BLOCKED")
      ?? tasks.find((task) => task.stage === "BLOCKED")
      ?? tasks.at(-1);
  }
  return tasks[0];
}

function resetRequestScopedUi() {
  activePreview = null;
  activeMapping = null;
  document.querySelector("#approval-status").textContent = "검토 전 · 실제 Notion 반영: 0건";
  document.querySelector("#mapping-write-badge").textContent = "실제 반영 없음";
}

function renderBackendStatus(payload) {
  factList(document.querySelector("#backend-status-panel"), [
    ["Backend Mode", payload.backend_mode],
    ["Schema Read 시각", payload.schema_requery_kst],
    ["Read Transport", payload.schema_source],
    ["Request DB", payload.request_db],
    ["Task DB", payload.task_db],
    ["조합 DB", payload.dummy_fund_db],
    ["Notion Read", payload.notion_read_enabled],
    ["Notion Write", payload.notion_write_enabled],
    ["Notion Write Count", payload.notion_write_count ?? 0],
    ["Operational Write Count", payload.operational_write_count ?? 0]
  ]);
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
    button.append(element("span", `조합 · ${demo.dummy_fund_id}`, "inbox-meta"));
    button.append(element("span", `현재 판단 · ${demo.display_status}`, "inbox-meta"));
    button.append(element("span", `차단 항목 · ${demo.has_blocker ? "있음" : "없음"} · 담당 · ${demo.current_actor}`, "inbox-meta"));
    inbox.append(button);
  }
}

function taskCard(task) {
  const card = element("article", undefined, "task-card");
  card.append(element("p", "현재 Task", "card-kicker"));
  card.append(element("h3", task.process_id ? `${task.process_id} 업무` : "확인 필요"));
  card.append(element("p", canonicalStageLabels[task.stage] ?? "확인 필요", "task-meta"));
  const facts = document.createElement("dl");
  facts.className = "task-facts";
  for (const [label, value] of [["담당", task.actor], ["지금 할 일", task.next_action], ["막힌 이유", task.blocker || "없음"], ["상태", canonicalStageLabels[task.stage] ?? task.stage]]) {
    const pair = document.createElement("div");
    pair.append(element("dt", label), element("dd", valueOrDash(value)));
    facts.append(pair);
  }
  card.append(facts);
  const technical = document.createElement("details");
  technical.className = "task-technical";
  technical.append(element("summary", "업무 기술 정보"));
  technical.append(element("p", `Task ID: ${task.operational_task_id ?? "-"} · Process ID: ${task.process_id ?? "-"} · Canonical Stage: ${task.stage ?? "-"}`));
  card.append(technical);
  return card;
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
    else column.append(element("p", "현재 업무 없음", "empty-column"));
    board.append(column);
  }
}

function renderCurrentAction(view) {
  const panel = document.querySelector("#current-action-content");
  panel.replaceChildren();
  for (const [label, value] of [
    ["누가 확인해야 하는가", view.current_action.owner],
    ["무엇을 확인해야 하는가", view.current_action.next_action],
    ["왜 멈췄는가", view.current_action.blocker],
    ["확인 후 무엇이 달라지는가", view.current_action.db_confirmation],
    ["현재 업무 완료 가능", bool(view.current_action.completion_allowed)]
  ]) {
    const row = element("div", undefined, "action-row");
    row.append(element("span", label), element("strong", valueOrDash(value)));
    panel.append(row);
  }
}

function renderCompositeSummary(payload) {
  const container = document.querySelector("#composite-summary");
  container.replaceChildren();
  const composite = payload?.scenario_id === "COMPOSITE-01";
  container.hidden = !composite;
  if (!composite) return;
  container.append(element("h3", "복합 업무 상태"), element("p", "P03·P04 결과는 보존하고 P07만 제출서류 미확보로 중단됩니다.", "muted"));
  const list = document.createElement("ul");
  list.className = "process-summary";
  for (const task of payload.tasks ?? []) {
    const state = task.stage === "BLOCKED" ? "중단" : "보존";
    list.append(element("li", `${task.process_id} · ${state} · ${canonicalStageLabels[task.stage] ?? "확인 필요"}`));
  }
  container.append(list);
}

function renderInteraction(payload) {
  const panel = document.querySelector("#interaction-panel");
  panel.replaceChildren();
  const interaction = payload.interaction ?? {};
  panel.append(element("p", interaction.human_confirmation_required ? "사람 확인 필요" : "현재 사람 확인 없음", interaction.human_confirmation_required ? "callout" : "callout neutral"));
  const questions = interaction.questions?.filter(Boolean) ?? [];
  panel.append(element("h3", "확인 질문"));
  if (questions.length) {
    const list = document.createElement("ul");
    for (const question of questions) list.append(element("li", question));
    panel.append(list);
  } else panel.append(element("p", "추가 확인 질문 없음", "muted"));
  panel.append(element("p", interaction.clarification_required ? "추가 정보 확인이 필요합니다." : "현재 추가 정보 확인은 필요하지 않습니다.", "muted"));
}

function renderEvidence(payload) {
  const panel = document.querySelector("#evidence-panel");
  panel.replaceChildren();
  const table = document.createElement("table");
  const header = document.createElement("tr");
  for (const label of ["자료 유형", "확인 결과", "보조 정보"]) header.append(element("th", label));
  const head = document.createElement("thead"); head.append(header);
  const body = document.createElement("tbody");
  for (const item of payload.evidence ?? payload.evidence_decisions ?? []) {
    const row = document.createElement("tr");
    row.append(element("td", item.evidence_type), element("td", item.evidence_result), element("td", `${item.legacy_evidence_type ?? "-"} / ${item.legacy_fixture_state ?? "-"}`));
    body.append(row);
  }
  table.append(head, body); panel.append(table);
}

function renderTimeline(payload) {
  const timeline = document.querySelector("#timeline");
  timeline.replaceChildren();
  const task = currentTask(payload) ?? {};
  for (const snapshot of payload.snapshot_timeline ?? []) {
    const item = document.createElement("li");
    item.className = `timeline-item ${snapshot.stage === task.stage ? "current" : ""}`;
    item.dataset.canonicalStage = snapshot.stage ?? "";
    item.append(element("strong", canonicalStageLabels[snapshot.stage] ?? "확인 필요"));
    const detail = snapshot.question ? `질문 · ${snapshot.question}` : snapshot.evidence_type ? `확인 자료 · ${snapshot.evidence_type} / ${snapshot.evidence_result}` : `대상 업무 · ${snapshot.process_id ?? task.process_id ?? "-"}`;
    item.append(element("p", detail));
    if (snapshot.actor) item.append(element("p", `담당 · ${snapshot.actor}`));
    if (snapshot.blocker) item.append(element("p", `차단 사유 · ${snapshot.blocker}`, "timeline-blocker"));
    if (snapshot.next_action) item.append(element("p", `다음 조치 · ${snapshot.next_action}`));
    timeline.append(item);
  }
}

function renderHero(view) {
  document.querySelector("#readiness-title").textContent = view.hero.status;
  document.querySelector("#readiness-description").textContent = view.hero.description;
  const stats = document.querySelector("#readiness-stats");
  factList(stats, [
    ["반영 가능 여부", view.hero.status],
    ["차단 항목", `${view.hero.blocking_count}건`],
    ["생성 예정 Request", `${view.hero.planned_request_count}건`],
    ["생성 예정 Task", `${view.hero.planned_task_count}건`],
    ["실제 Write", `${view.hero.actual_write_count}건`],
    ["현재 승인 상태", view.hero.approval_status]
  ]);
  const badge = document.querySelector("#blocking-count-badge");
  badge.textContent = `차단 ${view.hero.blocking_count}건`;
}

function renderBlockingReasons(view) {
  const target = document.querySelector("#blocking-reasons");
  target.replaceChildren();
  for (const reason of view.blockers) {
    const card = element("article", undefined, "blocking-card");
    card.append(element("h3", reason.title));
    const facts = document.createElement("dl"); facts.className = "blocking-facts";
    for (const [label, value] of [["문제", reason.problem], ["영향", reason.impact], ["다음 조치", reason.next_action], ["확인 담당 후보", reason.owner_candidate], ["차단 여부", reason.blocking ? "차단" : "확인 필요"]]) {
      const pair = document.createElement("div"); pair.append(element("dt", label), element("dd", value)); facts.append(pair);
    }
    card.append(facts);
    target.append(card);
  }
}

function renderRequestSummary(view) {
  const summary = view.request_summary;
  const statusBadge = document.querySelector("#overall-status");
  statusBadge.textContent = summary.status;
  statusBadge.className = `badge ${summary.status.includes("중단") ? "status-blocked" : ""}`;
  factList(document.querySelector("#request-panel"), [["요청명", summary.title], ["조합", summary.fund], ["대상 업무", summary.process], ["현재 상태", summary.status], ["현재 담당", summary.owner], ["지금 해야 할 일", summary.next_action]]);
  factList(document.querySelector("#metadata-panel"), [["Request ID", summary.request_id], ["Scenario ID", summary.technical.scenario_id], ["Transaction ID", summary.technical.transaction_id], ["Skill Manifest", summary.technical.manifest_id], ["Schema Source", summary.technical.schema_source], ["Skill Commit", summary.technical.skill_commit?.slice(0, 7)]]);
}

function renderPlannedRecords(view) {
  const request = view.planned.request;
  factList(document.querySelector("#request-record-preview"), [["요청명", request.title], ["조합", request.fund], ["업무", request.process], ["상태", request.status], ["원문", request.request_text], ["Preview 여부", bool(request.preview_only)], ["반영 상태", request.write_status]]);
  const target = document.querySelector("#task-record-previews"); target.replaceChildren();
  for (const task of view.planned.tasks) {
    const card = element("article", undefined, "planned-task-card");
    card.append(element("h4", task.title));
    const facts = document.createElement("dl"); facts.className = "task-facts";
    for (const [label, value] of [["현재 상태", task.status], ["담당", task.actor], ["다음 Action", task.next_action], ["Blocker", task.blocker], ["완료조건", task.completion_condition], ["완료증빙", task.completion_evidence], ["완료 후보", bool(task.completion_candidate)], ["완료 가능", bool(task.completion_allowed)], ["반영 상태", task.write_status]]) {
      const pair = document.createElement("div"); pair.append(element("dt", label), element("dd", valueOrDash(value))); facts.append(pair);
    }
    target.append(card);
  }
}

function renderChecklist(view) {
  const target = document.querySelector("#readiness-checklist"); target.replaceChildren();
  for (const item of view.checklist) {
    const row = element("article", undefined, `check-item ${item.status === "차단" ? "is-blocked" : ""}`);
    row.append(element("strong", item.label), element("span", item.status, "check-status"), element("p", item.detail));
    target.append(row);
  }
}

function renderApproval(view) {
  const button = document.querySelector("#approval-button");
  button.textContent = view.approval.label;
  button.disabled = view.approval.disabled;
  button.setAttribute("aria-disabled", String(view.approval.disabled));
  document.querySelector("#approval-disabled-reason").textContent = view.approval.reason;
  document.querySelector("#approval-status").textContent = `${view.approval.status} · ${view.approval.actual_write_label}`;
  document.querySelector("#mapping-write-badge").textContent = "실제 반영 없음";
}

function renderTechnicalMapping(mapping) {
  const validation = mapping.validation_summary;
  const summary = document.querySelector("#mapping-summary"); summary.replaceChildren();
  for (const [label, value] of [["필수 Mapping", validation.required_mapping], ["확인 완료", validation.passed], ["확인 필요", validation.gaps], ["반영 차단", validation.blocking_gaps], ["중복 조회", validation.duplicate_check], ["Write Allowed", validation.write_allowed]]) {
    const item = element("div", undefined, "mapping-stat"); item.append(element("span", label), element("strong", value)); summary.append(item);
  }
  factList(document.querySelector("#relation-preview-panel"), [["Dummy Fund", mapping.relation_preview?.dummy_fund_id], ["Exact Match", mapping.relation_preview?.result], ["Match Count", mapping.relation_preview?.exact_match_count], ["Relation Ready", mapping.relation_preview?.relation_ready], ["Write Count", mapping.relation_preview?.write_count ?? 0]]);
  factList(document.querySelector("#duplicate-preview-panel"), [["Transaction ID", mapping.duplicate_preview?.transaction_id], ["Request Match Count", mapping.duplicate_preview?.request_match_count], ["Task Match Count", mapping.duplicate_preview?.task_match_count], ["Result", mapping.duplicate_preview?.result], ["Proposed Action", mapping.duplicate_preview?.proposed_action], ["Semantic Gap", mapping.duplicate_preview?.semantic_gap]]);
  const body = document.querySelector("#property-mappings tbody"); body.replaceChildren();
  for (const rowData of mapping.property_mappings) {
    const row = document.createElement("tr");
    for (const field of ["console_field", "source_value", "target_db", "target_property", "property_type", "mapping_rule", "validation", "write_value", "gap"]) row.append(element("td", valueOrDash(rowData[field])));
    body.append(row);
  }
  factList(document.querySelector("#expected-actual"), [["Expected", "생성 예정 Request/Task Payload"], ["Actual", mapping.expected_actual.actual], ["Result", mapping.expected_actual.result], ["Notion Write", mapping.write_count]]);
  factList(document.querySelector("#audit-panel"), [["Preview Generated At", mapping.audit.preview_generated_at_kst], ["Skill Commit", mapping.audit.skill_commit.slice(0, 7)], ["Console Version", mapping.audit.console_version], ["Manifest ID", mapping.audit.manifest_id], ["Batch ID", mapping.audit.batch_id], ["Transaction ID", mapping.audit.transaction_id], ["Approval Status", mapping.audit.approval_status], ["Write Count", mapping.audit.write_count]]);
}

function renderBusinessDecision(mapping) {
  activeMapping = mapping;
  const view = mapping.business_decision_view;
  renderHero(view); renderBlockingReasons(view); renderRequestSummary(view); renderCurrentAction(view); renderPlannedRecords(view); renderChecklist(view); renderApproval(view);
  renderTechnicalMapping(mapping);
  document.querySelector("#raw-json").textContent = JSON.stringify({ preview: activePreview, mapping_preview: mapping }, null, 2);
}

function renderPayload(payload) {
  activePreview = payload;
  emptyState.hidden = true;
  consoleContent.hidden = false;
  renderKanban(payload); renderCompositeSummary(payload); renderInteraction(payload); renderEvidence(payload);
  factList(document.querySelector("#execution-panel"), [["요청 완료 가능", bool(payload.execution?.request_completion_allowed)], ["현재 업무 완료 가능", bool(payload.completion_allowed)], ["후속 자동 진행", bool(payload.execution?.downstream_auto_completion)], ["Notion 반영 가능", bool(payload.execution?.notion_write_enabled)], ["실제 반영 수", payload.execution?.operational_write_count ?? 0]]);
  renderTimeline(payload);
}

function renderError(payload) {
  emptyState.hidden = false;
  consoleContent.hidden = true;
  emptyState.replaceChildren(element("strong", "지원 범위 밖 / 확인 필요"), element("p", payload.message ?? "현재 요청은 안전하게 Preview할 수 없습니다."), element("p", `현재 지원 Scenario: ${(payload.supported_scenarios ?? []).join(", ")}`));
}

async function runMappingPreview(sequence = selectionSequence) {
  const requestId = selectedRequestId;
  const demo = selectedRequest;
  const preview = activePreview;
  if (!requestId || !demo || !preview) return;
  try {
    const response = await fetch("/api/notion/test-write-payload-preview", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ request_id: demo.request_id, scenario_id: demo.scenario_id, preview_output: preview }) });
    const payload = await response.json();
    if (!selectionIsCurrent(requestId, sequence)) return;
    if (!response.ok || payload.ok === false) throw new Error(payload.message ?? payload.error_code ?? "반영 검토 결과를 불러오지 못했습니다.");
    renderBusinessDecision(payload);
    runStatus.textContent = `반영 검토 완료 · 차단 ${payload.business_decision_view.hero.blocking_count}건 · 실제 Notion 반영 0건`;
  } catch (error) {
    if (selectionIsCurrent(requestId, sequence)) runStatus.textContent = `반영 검토 오류: ${error.message}`;
  }
}

async function runPreview(sequence = selectionSequence) {
  const requestId = selectedRequestId;
  const demo = selectedRequest;
  if (!requestId || !demo) return;
  runButton.disabled = true;
  runStatus.textContent = "기존 Skill Preview와 읽기 전용 반영 검토를 불러오는 중입니다.";
  try {
    const body = { request_id: demo.request_id, scenario_id: demo.scenario_id };
    if (demo.source_mode === "NATURAL_LANGUAGE_PREVIEW") body.request_text = input.value;
    const response = await fetch("/api/preview", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const payload = await response.json();
    if (!selectionIsCurrent(requestId, sequence)) return;
    if (!response.ok || payload.ok === false) { renderError(payload); runStatus.textContent = `실행 중단 · ${payload.error_code ?? "확인 필요"} · 실제 반영 0건`; return; }
    renderPayload(payload);
    await runMappingPreview(sequence);
  } catch (error) {
    if (selectionIsCurrent(requestId, sequence)) { renderError({ message: "로컬 Console 서버와 통신하지 못했습니다." }); runStatus.textContent = `통신 오류: ${error.message}`; }
  } finally {
    if (selectionIsCurrent(requestId, sequence)) runButton.disabled = false;
  }
}

async function selectRequest(requestId) {
  const demo = findDemoRequest(requestId);
  if (!demo) return;
  const sequence = ++selectionSequence;
  selectedRequestId = demo.request_id;
  selectedRequest = demo;
  resetRequestScopedUi();
  input.value = demo.request_text ?? demo.title;
  input.readOnly = demo.source_mode !== "NATURAL_LANGUAGE_PREVIEW";
  document.querySelector("#mode-note").textContent = demo.source_mode === "NATURAL_LANGUAGE_PREVIEW" ? "입력 원문을 기존 Skill Preview에 전달합니다." : "이 요청은 검증된 Fixture Scenario 결과를 표시합니다.";
  renderInbox();
  await runPreview(sequence);
}

async function initialize() {
  try {
    const [readinessResponse, response] = await Promise.all([fetch("/api/notion/schema-readiness"), fetch("/api/demo-requests")]);
    const readiness = await readinessResponse.json();
    if (!readinessResponse.ok || readiness.ok === false) throw new Error(readiness.message ?? "Notion 읽기 전용 기준을 불러오지 못했습니다.");
    renderBackendStatus(readiness);
    const payload = await response.json();
    if (!response.ok || payload.ok === false) throw new Error(payload.message ?? "Demo Request 목록을 불러오지 못했습니다.");
    demoRequests = payload.demo_requests ?? [];
    renderInbox();
    await selectRequest(demoRequests[0]?.request_id);
  } catch (error) {
    renderError({ message: `Console 초기화 오류: ${error.message}`, supported_scenarios: [] });
    runStatus.textContent = "Demo Request 목록을 불러오지 못했습니다.";
  }
}

runButton.addEventListener("click", () => void runPreview());
document.querySelector("#request-inbox").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-request-id]");
  if (button) void selectRequest(button.dataset.requestId);
});
initialize();
