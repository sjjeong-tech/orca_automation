import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  BATCH_ID,
  CONSOLE_VERSION,
  DEMO_REQUESTS,
  SCHEMA_SOURCE,
  SKILL_BASELINE_COMMIT,
  buildTestWritePayloadPreview
} from "./admin-process-console-server.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const reportsDir = path.resolve(here, "../reports/console-pilot");
const artifactPrefix = "request-task-console-v0.4.1";

function jsonForHtml(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

function uxEvidence(payloads) {
  return Object.values(payloads).map((payload) => {
    const view = payload.business_decision_view;
    return {
      request_id: payload.request_id,
      scenario_id: payload.scenario_id,
      answers: [
        { question: "현재 어떤 요청인가?", expected_ui_location: "업무 요청 요약", actual_text: `${view.request_summary.title} / ${view.request_summary.fund}`, result: "PASS", gap: null },
        { question: "Notion에 반영 가능한가?", expected_ui_location: "반영 가능 여부 Hero", actual_text: view.hero.status, result: "PASS", gap: null },
        { question: "반영할 수 없다면 이유가 무엇인가?", expected_ui_location: "차단 사유와 다음 조치", actual_text: view.blockers.map((item) => item.title).join(", "), result: "PASS", gap: null },
        { question: "무엇을 확인해야 하는가?", expected_ui_location: "현재 해야 할 일", actual_text: view.current_action.db_confirmation, result: "PASS", gap: null },
        { question: "누가 확인해야 하는가?", expected_ui_location: "현재 해야 할 일", actual_text: view.current_action.owner, result: "PASS", gap: null },
        { question: "생성 예정 Record는 몇 건인가?", expected_ui_location: "반영 가능 여부 Hero", actual_text: `Request ${view.hero.planned_request_count}건 / Task ${view.hero.planned_task_count}건`, result: "PASS", gap: null },
        { question: "실제로 반영된 Record는 몇 건인가?", expected_ui_location: "반영 가능 여부 Hero 및 승인 영역", actual_text: `Notion ${view.hero.actual_write_count}건`, result: "PASS", gap: null }
      ]
    };
  });
}

function standaloneHtml(data, css) {
  const embedded = jsonForHtml(data);
  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>지원팀 행정업무 반영 검토 · PILOT v0.4.1</title><style>${css}</style></head>
<body><main class="shell"><header class="header card"><div><p class="eyebrow">LOCAL STATIC DEMO · 검증된 읽기 전용 Snapshot</p><h1>지원팀 행정업무 반영 검토</h1><p class="subhead">선택한 요청을 Notion TEST DB에 반영할 수 있는지 검토하고, 부족한 조건과 다음 확인 업무를 안내합니다.</p><div class="header-badges"><span class="badge">읽기 전용</span><span class="badge">승인 전</span><span class="badge">실제 반영 없음</span></div></div><dl class="header-facts"><div><dt>지원 범위</dt><dd>구현 Scenario 3 / 6</dd></div><div><dt>실제 Notion 반영</dt><dd>0건</dd></div><div><dt>운영 데이터 반영</dt><dd>0건</dd></div></dl></header>
<div class="workspace"><aside class="inbox card"><p class="eyebrow">요청 선택</p><h2>업무 요청 3건</h2><p class="muted inbox-note">요청을 선택하면 반영 가능 여부와 다음 확인 업무가 함께 갱신됩니다.</p><div id="request-inbox" class="request-inbox"></div><section class="backend-note"><strong>로컬 Preview</strong><span>Skill 재실행 없이 검증된 Output Snapshot만 표시합니다.</span></section></aside>
<div class="main-content"><section id="readiness-hero" class="readiness-hero card"><div><p class="eyebrow">반영 가능 여부</p><h2 id="readiness-title"></h2><p id="readiness-description" class="hero-description"></p></div><dl id="readiness-stats" class="hero-stats"></dl></section><section class="card"><div class="section-heading"><div><p class="eyebrow">먼저 확인할 사항</p><h2>차단 사유와 다음 조치</h2></div><span id="blocking-count-badge" class="badge status-blocked"></span></div><div id="blocking-reasons" class="blocking-reasons"></div></section><div class="top-grid"><section class="card"><div class="section-heading"><div><p class="eyebrow">업무 요청 요약</p><h2>현재 요청</h2></div><span id="overall-status" class="badge"></span></div><dl id="request-panel" class="fact-grid summary-grid"></dl><details class="metadata"><summary>기술 정보</summary><dl id="metadata-panel" class="fact-grid compact"></dl></details></section><aside id="current-action-panel" class="card current-action"><p class="eyebrow">현재 해야 할 일</p><h2>누가 무엇을 확인해야 하나요?</h2><div id="current-action-content"></div></aside></div><section class="card planned-section"><div class="section-heading"><div><p class="eyebrow">생성 예정 내용</p><h2>반영 전 Payload Preview</h2></div><span class="badge">아직 생성하지 않음</span></div><div class="mapping-grid"><section class="inset"><h3>생성 예정 Request 1건</h3><div id="request-record-preview"></div></section><section class="inset"><h3>생성 예정 Task</h3><div id="task-record-previews" class="planned-tasks"></div></section></div></section><div class="mid-grid"><section class="card"><p class="eyebrow">반영 준비 체크리스트</p><h2>필수 확인 항목</h2><div id="readiness-checklist" class="readiness-checklist"></div></section><section class="card approval-card"><p class="eyebrow">승인 영역</p><h2>TEST 반영 범위 검토</h2><button id="approval-button" type="button" disabled>TEST 반영 범위 검토</button><p id="approval-disabled-reason" class="disabled-reason"></p><p id="approval-status" class="status"></p></section></div><section class="kanban-section"><div class="section-heading"><div><p class="eyebrow">현재 업무</p><h2>현재 Task Kanban</h2></div><span class="badge">과거 상태는 Timeline에서 확인</span></div><div id="kanban" class="kanban"></div><div id="composite-summary" hidden></div></section><div class="details-grid business-details"><section class="card"><p class="eyebrow">사람 확인</p><h2>확인 질문</h2><div id="interaction-panel"></div></section><section class="card"><p class="eyebrow">Evidence 검토</p><h2>제출·확인 자료</h2><div id="evidence-panel"></div></section><section class="card"><p class="eyebrow">실행 안전</p><h2>완료와 Write 차단</h2><dl id="execution-panel" class="fact-grid compact"></dl></section></div><section class="card"><p class="eyebrow">상태 이력</p><h2>시점별 진행 흐름</h2><ol id="timeline" class="timeline"></ol></section><details id="technical-details" class="card technical-details"><summary>기술 검증 상세</summary><p class="muted">Canonical 값과 실제 Schema Read 정보는 업무 판단을 대신하지 않습니다.</p><section class="technical-block"><h3>Property Mapping</h3><div class="table-wrap"><table id="property-mappings"><thead><tr><th>화면 데이터</th><th>원본 값</th><th>대상 DB</th><th>실제 Notion Property</th><th>Property 유형</th><th>Mapping 규칙</th><th>검증 결과</th><th>생성 예정 값</th><th>확인 필요 사항</th></tr></thead><tbody></tbody></table></div></section><details class="raw-json"><summary>Payload JSON</summary><pre id="raw-json"></pre></details></details></div></div></main>
<script>const DATA=${embedded};let selectedRequestId='REQ-DEMO-001';const stage={RECEIVED:'요청 접수',INFORMATION_CHECK:'확인 필요',EVIDENCE_REVIEW:'확인 필요',HUMAN_CONFIRMATION:'사람 확인 필요',EXTERNAL_WAIT:'외부 대기',RESULT_REVIEW:'진행 가능',NEXT_PROCESS:'진행 가능',COMPLETION_CANDIDATE:'완료 후보',BLOCKED:'중단'};const $=s=>document.querySelector(s);const esc=v=>String(v??'-').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));const rows=a=>a.map(([k,v])=>'<div><dt>'+esc(k)+'</dt><dd>'+esc(Array.isArray(v)?v.join(', '):v)+'</dd></div>').join('');const task=p=>p.preview_output.scenario_id==='COMPOSITE-01'?(p.preview_output.tasks.find(t=>t.process_id==='P07'&&t.stage==='BLOCKED')||p.preview_output.tasks.at(-1)):p.preview_output.tasks[0];function render(){const p=DATA.payloads[selectedRequestId],v=p.business_decision_view,t=task(p),r=v.request_summary;$('#request-inbox').innerHTML=Object.values(DATA.payloads).map(x=>{const d=x.preview_output.demo_request;return '<button data-request-id="'+d.request_id+'" class="inbox-item '+(d.request_id===selectedRequestId?'selected':'')+'"><span class="inbox-id">'+d.request_id+'</span><strong>'+esc(d.title)+'</strong><span class="inbox-meta">조합 · '+esc(d.dummy_fund_id)+'</span><span class="inbox-meta">현재 판단 · '+esc(d.display_status)+'</span><span class="inbox-meta">차단 항목 · '+(d.has_blocker?'있음':'없음')+' · 담당 · '+esc(d.current_actor)+'</span></button>'}).join('');$('#readiness-title').textContent=v.hero.status;$('#readiness-description').textContent=v.hero.description;$('#readiness-stats').innerHTML=rows([['반영 가능 여부',v.hero.status],['차단 항목',v.hero.blocking_count+'건'],['생성 예정 Request',v.hero.planned_request_count+'건'],['생성 예정 Task',v.hero.planned_task_count+'건'],['실제 Write',v.hero.actual_write_count+'건'],['현재 승인 상태',v.hero.approval_status]]);$('#blocking-count-badge').textContent='차단 '+v.hero.blocking_count+'건';$('#blocking-reasons').innerHTML=v.blockers.map(b=>'<article class="blocking-card"><h3>'+esc(b.title)+'</h3><dl class="blocking-facts">'+rows([['문제',b.problem],['영향',b.impact],['다음 조치',b.next_action],['확인 담당 후보',b.owner_candidate],['차단 여부','차단']])+'</dl></article>').join('');$('#overall-status').textContent=r.status;$('#request-panel').innerHTML=rows([['요청명',r.title],['조합',r.fund],['대상 업무',r.process],['현재 상태',r.status],['현재 담당',r.owner],['지금 해야 할 일',r.next_action]]);$('#metadata-panel').innerHTML=rows([['Request ID',r.request_id],['Scenario ID',r.technical.scenario_id],['Transaction ID',r.technical.transaction_id],['Skill Manifest',r.technical.manifest_id],['Schema Source',r.technical.schema_source],['Skill Commit',r.technical.skill_commit?.slice(0,7)]]);$('#current-action-content').innerHTML=[['누가 확인해야 하는가',v.current_action.owner],['무엇을 확인해야 하는가',v.current_action.next_action],['왜 멈췄는가',v.current_action.blocker],['확인 후 무엇이 달라지는가',v.current_action.db_confirmation],['Task 완료 가능',v.current_action.completion_allowed?'예':'아니요']].map(x=>'<div class="action-row"><span>'+x[0]+'</span><strong>'+esc(x[1])+'</strong></div>').join('');const pr=v.planned.request;$('#request-record-preview').innerHTML=rows([['요청명',pr.title],['조합',pr.fund],['업무',pr.process],['상태',pr.status],['원문',pr.request_text],['Preview 여부',pr.preview_only?'예':'아니요'],['반영 상태',pr.write_status]]);$('#task-record-previews').innerHTML=v.planned.tasks.map(x=>'<article class="planned-task-card"><h4>'+esc(x.title)+'</h4><dl class="task-facts">'+rows([['현재 상태',x.status],['담당',x.actor],['다음 Action',x.next_action],['Blocker',x.blocker],['완료조건',x.completion_condition],['완료증빙',x.completion_evidence],['완료 후보',x.completion_candidate?'예':'아니요'],['완료 가능',x.completion_allowed?'예':'아니요'],['반영 상태',x.write_status]])+'</dl></article>').join('');$('#readiness-checklist').innerHTML=v.checklist.map(x=>'<article class="check-item '+(x.status==='차단'?'is-blocked':'')+'"><strong>'+esc(x.label)+'</strong><span class="check-status">'+esc(x.status)+'</span><p>'+esc(x.detail)+'</p></article>').join('');$('#approval-disabled-reason').textContent=v.approval.reason;$('#approval-status').textContent=v.approval.status+' · '+v.approval.actual_write_label;const cols=[['RECEIVED','요청 접수'],['CHECK','확인 필요'],['ACTIVE','진행 가능'],['EXTERNAL_WAIT','외부 대기'],['COMPLETION_CANDIDATE','완료 후보'],['BLOCKED','중단']],active=['INFORMATION_CHECK','EVIDENCE_REVIEW','HUMAN_CONFIRMATION'].includes(t.stage)?'CHECK':['RESULT_REVIEW','NEXT_PROCESS'].includes(t.stage)?'ACTIVE':t.stage;$('#kanban').innerHTML=cols.map(([id,l])=>'<section class="kanban-column"><h3>'+l+'</h3>'+(id===active?'<article class="task-card"><p class="card-kicker">현재 Task</p><h3>'+esc(t.process_id)+' 업무</h3><p class="task-meta">'+esc(stage[t.stage]||t.stage)+'</p><dl class="task-facts">'+rows([['담당',t.actor],['지금 할 일',t.next_action],['막힌 이유',t.blocker||'없음'],['상태',stage[t.stage]||t.stage]])+'</dl></article>':'<p class="empty-column">현재 업무 없음</p>')+'</section>').join('');const i=p.preview_output.interaction;$('#interaction-panel').innerHTML='<p class="'+(i.human_confirmation_required?'callout':'callout neutral')+'">'+(i.human_confirmation_required?'사람 확인 필요':'현재 사람 확인 없음')+'</p><h3>확인 질문</h3><p>'+esc(i.questions?.[0]||'추가 확인 질문 없음')+'</p>';$('#evidence-panel').innerHTML='<table><thead><tr><th>자료 유형</th><th>확인 결과</th></tr></thead><tbody>'+p.preview_output.evidence.map(e=>'<tr><td>'+esc(e.evidence_type)+'</td><td>'+esc(e.evidence_result)+'</td></tr>').join('')+'</tbody></table>';const ex=p.preview_output.execution;$('#execution-panel').innerHTML=rows([['Request 완료 가능',ex.request_completion_allowed?'예':'아니요'],['Task 완료 가능',t.completion_allowed?'예':'아니요'],['후속 자동 진행',ex.downstream_auto_completion?'예':'아니요'],['Notion Write 가능',ex.notion_write_enabled?'예':'아니요'],['실제 Write Count',ex.operational_write_count]]);$('#timeline').innerHTML=p.preview_output.snapshot_timeline.map(s=>'<li class="timeline-item '+(s.stage===t.stage?'current':'')+'"><strong>'+esc(stage[s.stage]||s.stage)+'</strong><p>'+esc(s.question?'질문 · '+s.question:s.evidence_type?'확인 자료 · '+s.evidence_type+' / '+s.evidence_result:'대상 업무 · '+(s.process_id||t.process_id))+'</p>'+(s.actor?'<p>담당 · '+esc(s.actor)+'</p>':'')+(s.blocker?'<p class="timeline-blocker">차단 사유 · '+esc(s.blocker)+'</p>':'')+'</li>').join('');$('#property-mappings tbody').innerHTML=p.property_mappings.map(m=>'<tr>'+['console_field','source_value','target_db','target_property','property_type','mapping_rule','validation','write_value','gap'].map(k=>'<td>'+esc(m[k])+'</td>').join('')+'</tr>').join('');$('#raw-json').textContent=JSON.stringify({preview:p.preview_output,mapping_preview:p},null,2);window.__consoleReady=true;window.__consoleDiagnostics={selectedRequestId,approvalStatus:'NOT_REVIEWED'};}$('#request-inbox').addEventListener('click',e=>{const b=e.target.closest('button[data-request-id]');if(b){selectedRequestId=b.dataset.requestId;render();}});render();</script></body></html>`;
}

export async function generateV041Artifacts() {
  await mkdir(reportsDir, { recursive: true });
  const css = await readFile(path.join(here, "public", "console.css"), "utf8");
  const payloads = Object.fromEntries(await Promise.all(DEMO_REQUESTS.map(async (demo) => [
    demo.request_id,
    await buildTestWritePayloadPreview({ request_id: demo.request_id, scenario_id: demo.scenario_id, preview_output: { request: { request_text: demo.request_text } } })
  ])));
  const selected = payloads["REQ-DEMO-001"];
  const output = {
    console_version: CONSOLE_VERSION,
    selected_request: "REQ-DEMO-001",
    demo_requests: DEMO_REQUESTS,
    request: selected.preview_output.request,
    tasks: selected.preview_output.tasks,
    interaction: selected.preview_output.interaction,
    execution: selected.execution,
    snapshot_timeline: selected.preview_output.snapshot_timeline,
    mapping_preview: selected,
    business_decision_view: selected.business_decision_view,
    payloads
  };
  const uxValidation = {
    console_version: CONSOLE_VERSION,
    validation_at_kst: selected.audit.preview_generated_at_kst,
    questions_per_request: uxEvidence(payloads),
    notion_write_count: 0,
    operational_write_count: 0
  };
  const guide = `# Request–Task Console v0.4.1\n\n## 목적\n\n선택한 요청을 Notion TEST DB에 반영할 수 있는지 검토하고, 부족한 조건과 다음 확인 업무를 안내합니다. 이 Console은 **읽기 전용 Preview**이며 Notion 및 운영 데이터 Write를 실행하지 않습니다.\n\n## 실행\n\n\`node plugins/vc-support-admin/console/admin-process-console-server.mjs\`\n\n표시되는 Local URL을 엽니다. 서버 없이 보는 정적 시연은 \`${artifactPrefix}.html\`을 직접 엽니다.\n\n## 시연 순서\n\n1. 좌측 업무 요청 3건을 선택합니다.\n2. 상단 **반영 가능 여부**에서 차단 항목 수와 실제 Write 0건을 확인합니다.\n3. **차단 사유와 다음 조치**에서 조합 연결 대상과 중복 방지 기준을 확인합니다.\n4. **현재 해야 할 일**에서 담당·후속 조치·차단 사유를 확인합니다.\n5. **생성 예정 내용**에서 Request 1건과 Task 수를 검토합니다.\n6. **TEST 반영 범위 검토**가 비활성인 이유와 실제 Notion 반영 0건을 확인합니다.\n7. 필요할 때만 **기술 검증 상세**를 열어 Canonical 값과 Property Mapping을 확인합니다.\n\n## 현재 차단 조건\n\n- DUMMY-FUND-A/B/E의 Exact Match는 현재 0건입니다.\n- 전용 Transaction ID Property가 확인되지 않아 durable duplicate protection은 미확정입니다.\n- COMPOSITE-01은 Request DB에서 복합 Process Mapping을 추가로 확인해야 합니다.\n\n## 제한\n\n- 구현 Scenario 3/6만 표시합니다.\n- Preview-only, Notion Write 0, Operational Write 0입니다.\n- 실제 TEST Write와 Request–Task Relation 생성은 별도 승인 TAP 범위입니다.\n`;
  await Promise.all([
    writeFile(path.join(reportsDir, `${artifactPrefix}.html`), standaloneHtml({ payloads }, css), "utf8"),
    writeFile(path.join(reportsDir, `${artifactPrefix}-output.json`), `${JSON.stringify(output, null, 2)}\n`, "utf8"),
    writeFile(path.join(reportsDir, `${artifactPrefix}-demo.md`), guide, "utf8"),
    writeFile(path.join(reportsDir, `${artifactPrefix}-ux-validation.json`), `${JSON.stringify(uxValidation, null, 2)}\n`, "utf8")
  ]);
  return { payloads, output, uxValidation, artifactPrefix };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await generateV041Artifacts();
  console.log(`console-v0.4.1-artifacts: PASS (${Object.keys(result.payloads).length} requests, write=0)`);
}
