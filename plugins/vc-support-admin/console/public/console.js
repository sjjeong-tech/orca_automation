const stageLabels = Object.freeze({
  RECEIVED: "요청 접수",
  INFORMATION_CHECK: "정보 확인",
  EVIDENCE_REVIEW: "Evidence 검토",
  HUMAN_CONFIRMATION: "사람 확인",
  EXTERNAL_WAIT: "외부 대기",
  RESULT_REVIEW: "결과 검토",
  NEXT_PROCESS: "후속 Process",
  COMPLETION_CANDIDATE: "완료 후보",
  BLOCKED: "중단"
});

const kanbanStages = ["RECEIVED", "EVIDENCE_REVIEW", "HUMAN_CONFIRMATION", "BLOCKED", "COMPLETION_CANDIDATE"];
const input = document.querySelector("#request-text");
const scenario = document.querySelector("#scenario-id");
const runButton = document.querySelector("#preview-button");
const runStatus = document.querySelector("#run-status");
const emptyState = document.querySelector("#empty-state");
const consoleContent = document.querySelector("#console-content");

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined && text !== null) node.textContent = String(text);
  if (className) node.className = className;
  return node;
}

function factList(target, items) {
  target.replaceChildren();
  for (const [label, value] of items) {
    const pair = document.createElement("div");
    pair.append(element("dt", label), element("dd", value ?? "-"));
    target.append(pair);
  }
}

function bool(value) {
  return value ? "true" : "false";
}

function stageLabel(stage) {
  return stageLabels[stage] ?? stage ?? "확인 필요";
}

function taskCard(task, { history = false } = {}) {
  const card = element("article", undefined, `task-card${history ? " history" : ""}`);
  card.append(element("p", history ? "이전 Snapshot" : "현재 Task", "card-kicker"));
  card.append(element("h4", `${task.process_id ?? "-"} 업무 · ${task.operational_task_id ?? "확인 필요"}`));
  card.append(element("p", `${stageLabel(task.stage)} · ${task.operational_task_id ?? "-"}`, "task-meta"));
  if (!history) {
    const grid = document.createElement("dl");
    grid.className = "task-facts";
    const items = [
      ["Actor", task.actor],
      ["다음 Action", task.next_action],
      ["Blocker", task.blocker || "없음"],
      ["완료조건", task.completion_condition],
      ["완료증빙", (task.completion_evidence ?? []).join(", ") || "미확정"],
      ["Completion Candidate", bool(task.completion_candidate)],
      ["Completion Allowed", bool(task.completion_allowed)]
    ];
    for (const [label, value] of items) {
      const pair = document.createElement("div");
      pair.append(element("dt", label), element("dd", value));
      grid.append(pair);
    }
    card.append(grid);
  }
  return card;
}

function renderKanban(payload) {
  const board = document.querySelector("#kanban");
  board.replaceChildren();
  const task = payload.tasks?.[0];
  const timelineStages = new Set((payload.snapshot_timeline ?? []).map((snapshot) => snapshot.stage));
  for (const stage of kanbanStages) {
    const column = element("section", undefined, "kanban-column");
    column.append(element("h3", stageLabel(stage)));
    const active = task && task.stage === stage;
    const reached = timelineStages.has(stage);
    if (active) {
      column.append(taskCard(task));
    } else if (reached && task) {
      column.append(taskCard({ ...task, stage }, { history: true }));
    } else {
      column.append(element("p", stage === "COMPLETION_CANDIDATE" ? "완료 후보 없음" : "표시할 Task 없음", "empty-column"));
    }
    board.append(column);
  }
}

function renderInteraction(payload) {
  const panel = document.querySelector("#interaction-panel");
  panel.replaceChildren();
  const interaction = payload.interaction ?? {};
  const status = element("p", interaction.human_confirmation_required ? "사람 확인 필요" : "사람 확인 불필요", "callout");
  panel.append(status);
  panel.append(element("h3", "질문"));
  const questions = interaction.questions?.length ? interaction.questions : [payload.request?.clarification_question ?? "없음"];
  const list = document.createElement("ul");
  for (const question of questions) list.append(element("li", question));
  panel.append(list);
  panel.append(element("p", `Clarification: ${bool(interaction.clarification_required)}`, "muted"));
}

function renderEvidence(payload) {
  const panel = document.querySelector("#evidence-panel");
  panel.replaceChildren();
  const table = document.createElement("table");
  table.innerHTML = "<thead><tr><th>Evidence Type</th><th>Result</th><th>Legacy Compatibility</th></tr></thead>";
  const body = document.createElement("tbody");
  for (const item of payload.evidence ?? payload.evidence_decisions ?? []) {
    const row = document.createElement("tr");
    row.append(
      element("td", item.evidence_type),
      element("td", item.evidence_result),
      element("td", `${item.legacy_evidence_type ?? "-"} / ${item.legacy_fixture_state ?? "-"}`)
    );
    body.append(row);
  }
  table.append(body);
  panel.append(table);
}

function renderTimeline(payload) {
  const timeline = document.querySelector("#timeline");
  timeline.replaceChildren();
  const task = payload.tasks?.[0] ?? {};
  for (const snapshot of payload.snapshot_timeline ?? []) {
    const item = document.createElement("li");
    item.className = `timeline-item ${snapshot.stage === task.stage ? "current" : ""}`;
    item.append(element("strong", stageLabel(snapshot.stage)));
    const detail = snapshot.question
      ? `질문: ${snapshot.question}`
      : snapshot.evidence_type
        ? `Evidence: ${snapshot.evidence_type} / ${snapshot.evidence_result}`
        : `Request: ${payload.request?.dummy_fund_id ?? "확인 필요"} · ${task.process_id ?? "-"}`;
    item.append(element("p", detail));
    if (snapshot.blocker) item.append(element("p", `Blocker: ${snapshot.blocker}`, "timeline-blocker"));
    if (snapshot.next_action) item.append(element("p", `다음 Action: ${snapshot.next_action}`));
    timeline.append(item);
  }
}

function renderPayload(payload) {
  emptyState.hidden = true;
  consoleContent.hidden = false;
  document.querySelector("#skill-commit").textContent = payload.manifest?.manifest_hash?.slice(0, 7) ?? "504ca85";
  const request = payload.request ?? {};
  const status = request.overall_status ?? "확인 필요";
  const statusBadge = document.querySelector("#overall-status");
  statusBadge.textContent = status;
  statusBadge.className = `badge ${status === "BLOCKED" ? "status-blocked" : ""}`;
  factList(document.querySelector("#request-panel"), [
    ["요청 원문", request.request_text],
    ["조합", request.dummy_fund_id],
    ["Process", (request.process_ids ?? []).join(", ")],
    ["Scenario", request.scenario_id ?? payload.scenario_id],
    ["Transaction ID", request.transaction_id ?? payload.transaction_id],
    ["전체 상태", status],
    ["Preview-only", bool(request.preview_only)]
  ]);
  renderKanban(payload);
  renderInteraction(payload);
  renderEvidence(payload);
  factList(document.querySelector("#execution-panel"), [
    ["Request 완료 가능", bool(payload.execution?.request_completion_allowed)],
    ["Task 완료 가능", bool(payload.completion_allowed)],
    ["후속 자동 진행", bool(payload.execution?.downstream_auto_completion)],
    ["운영 Write 가능", bool(payload.execution?.operational_write_allowed)],
    ["실제 Write Count", payload.execution?.operational_write_count ?? payload.operational_write_count ?? 0]
  ]);
  renderTimeline(payload);
  document.querySelector("#raw-json").textContent = JSON.stringify(payload, null, 2);
}

function renderError(payload) {
  emptyState.hidden = false;
  consoleContent.hidden = true;
  emptyState.replaceChildren(
    element("strong", "지원 범위 밖 / 확인 필요"),
    element("p", payload.message ?? "현재 요청을 안전하게 실행할 수 없습니다."),
    element("p", `현재 지원 Scenario: ${(payload.supported_scenarios ?? ["SINGLE-P03-02"]).join(", ")}`)
  );
}

async function runPreview() {
  runButton.disabled = true;
  runStatus.textContent = "기존 Skill을 Preview-only로 실행 중입니다…";
  try {
    const response = await fetch("/api/preview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ request_text: input.value, scenario_id: scenario.value })
    });
    const payload = await response.json();
    if (!response.ok || payload.ok === false) {
      renderError(payload);
      runStatus.textContent = `실행 중단: ${payload.error_code ?? "확인 필요"} · Write 0`;
      return;
    }
    renderPayload(payload);
    runStatus.textContent = `Preview 완료 · ${payload.request?.dummy_fund_id ?? "-"} · Write ${payload.execution?.operational_write_count ?? 0}`;
  } catch (error) {
    renderError({ message: "로컬 Console 서버와 통신하지 못했습니다." });
    runStatus.textContent = `통신 오류: ${error.message}`;
  } finally {
    runButton.disabled = false;
  }
}

runButton.addEventListener("click", runPreview);
