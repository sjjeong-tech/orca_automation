// Smoke Test — 사용자 대면 기능 U1~U4가 실제로 동작하는지만 확인한다.
// 보안 테스트는 security.test.mjs 결과를 재사용하고 여기서 다시 확장하지 않는다.
// Fixture는 전부 합성값이다. 실제 조합명·Page·Drive ID를 쓰지 않는다.

import assert from "node:assert/strict";
import { runUserRequest, INTENT, routeIntent, parseUserMessage } from "../index.mjs";
import { runSessionWorkflow, toolKey, createSessionInvoker } from "../session-runner.mjs";
import { RESULT, ok, fail } from "../providers/base.mjs";

let pass = 0, failed = 0;
const t = async (name, fn) => {
  try { await fn(); pass += 1; console.log(`  PASS  ${name}`); }
  catch (e) { failed += 1; console.log(`  FAIL  ${name}\n        ${e.message}`); }
};

// ---- 합성 Fixture ------------------------------------------------------------

const FUND_A = { name: "테스트알파투자조합", key: "테스트알파투자조합", fund_type: "민법", tax_id: null, root_folder: "synthetic://root/alpha" };
const FUND_B1 = { name: "테스트베타투자조합 1호", key: "테스트베타투자조합 1호", fund_type: "벤처", tax_id: null, root_folder: null };
const FUND_B2 = { name: "테스트베타투자조합 2호", key: "테스트베타투자조합 2호", fund_type: "벤처", tax_id: null, root_folder: null };

const FILES = [
  { name: "테스트알파투자조합_고유번호증.pdf", extension: "pdf", size: 700000, modified: "2026-07-07T00:00:00Z", is_folder: false },
  { name: "##합본_테스트알파투자조합_고유번호증 신청서류.pdf", extension: "pdf", size: 500000, modified: "2026-07-01T00:00:00Z", is_folder: false },
  { name: "#테스트알파투자조합_고유번호증 접수증.pdf", extension: "pdf", size: 120000, modified: "2026-07-02T00:00:00Z", is_folder: false },
  { name: "테스트알파투자조합_보안카드.pdf", extension: "pdf", size: 90000, modified: "2026-07-02T00:00:00Z", is_folder: false },
  { name: "바로가기.lnk", extension: "lnk", size: 1200, modified: "2026-07-02T00:00:00Z", is_folder: false },
  { name: "빈파일_고유번호증.pdf", extension: "pdf", size: 0, modified: "2026-07-02T00:00:00Z", is_folder: false }
];

const TASKS = [
  { operational_task_id: "P03-T01", state: "완료", actor: "지원팀", next_action: "", blocker: "", evidence: "" },
  { operational_task_id: "P03-T02", state: "진행 중", actor: "지원팀", next_action: "", blocker: "", evidence: "" },
  { operational_task_id: "P03-T03", state: "시작 전", actor: "지원팀", next_action: "", blocker: "", evidence: "" },
  { operational_task_id: "P03-T04", state: "시작 전", actor: "지원팀", next_action: "", blocker: "", evidence: "" },
  { operational_task_id: "P03-T05", state: "시작 전", actor: "외부기관", next_action: "", blocker: "", evidence: "" },
  { operational_task_id: "P03-T06", state: "시작 전", actor: "지원팀", next_action: "", blocker: "", evidence: "" }
];

function makeProviders({ funds = [FUND_A], likeFunds = null, files = FILES, tasks = TASKS, requests = [{ "요청명": "[TEST] 알파 고유번호증" }] } = {}) {
  const writes = [];
  const notionAudit = [], driveAudit = [];
  return {
    _writes: writes,
    notion: {
      audit: notionAudit,
      async resolve_fund_master() { notionAudit.push({ operation: "resolve_fund_master" }); return funds.length ? ok(funds) : fail(RESULT.NOT_FOUND, "none"); },
      async search_fund_candidates() { notionAudit.push({ operation: "search_fund_candidates" }); return likeFunds ? ok(likeFunds) : ok([]); },
      async find_tasks() { notionAudit.push({ operation: "find_tasks" }); return ok(tasks); },
      async find_requests() { notionAudit.push({ operation: "find_requests" }); return ok(requests); },
      async commit_write() { writes.push("notion"); return fail(RESULT.READ_ONLY, "blocked"); }
    },
    drive: {
      audit: driveAudit,
      async resolve_fund_root(fund) {
        driveAudit.push({ operation: "resolve_fund_root" });
        return fund?.root_folder ? ok({ root_id: "syn-root", masked: "<masked>" }) : fail(RESULT.NOT_FOUND, "root not set");
      },
      async resolve_path() { driveAudit.push({ operation: "resolve_path" }); return ok({ folder_id: "syn-canon", trail: ["1. 결성", "1. 고유번호증 신청"] }); },
      async list_by_parent() { driveAudit.push({ operation: "list_by_parent" }); return ok(files); },
      async list_fieldwork_candidates({ daily } = {}) {
        driveAudit.push({ operation: "list_fieldwork_candidates" });
        return ok({ months: ["2026.07", "2026.06"], days: ["0728", "0727"], monthly: null, level: "CURRENT", resolved_day_id: daily === "0728" ? "syn-day" : null, resolved_from: daily === "0728" ? "ROOT_LEVEL" : null, _day_ids: { "0728": "syn-day" } });
      },
      async commit_write() { writes.push("drive"); return fail(RESULT.READ_ONLY, "read only"); }
    }
  };
}

const RUNTIME = { record_prefix: "[TEST][SMOKE]", write_mode: "preview_only", operating_write_enabled: false, drive: {}, notion: {} };
const NOW = Date.parse("2026-07-28T09:00:00Z");

// ---- Smoke 1: U1 조합 상태 조회 ----------------------------------------------

await t("U1 자연어 조합 상태 조회 — 상태·Actor·다음 Action·Blocker가 채워진다", async () => {
  const p = makeProviders();
  const v = await runUserRequest({
    user_message: "테스트알파투자조합 고유번호증 신청 지금 어디까지 진행됐어?",
    runtime_config: RUNTIME, providers: p, now: NOW
  });
  assert.equal(v.intent, INTENT.FUND_STATUS);
  assert.equal(v.fund_match, "EXACT_1");
  assert.equal(v.resolved_fund.name, FUND_A.name);
  assert.equal(v.task_summary.length, 6);
  assert.ok(v.current_status.headline.includes("발급 결과물"), "발급본 Evidence가 headline에 반영돼야 한다");
  assert.ok(v.current_status.done.some((s) => s.startsWith("P03-T01")));
  assert.ok(v.next_actions.length > 0);
  assert.ok(v.blockers.length > 0);
  assert.ok(v.human_confirmations.length > 0);
  assert.ok(v.display.includes("현재 판단:"));
  assert.ok(v.display.includes("다음 Action:"));
});

await t("U1 조합명이 발화에만 있어도 추출된다 (fund_hint 없이)", async () => {
  const parsed = parseUserMessage("테스트알파투자조합 고유번호증 업무 상태 알려줘");
  assert.equal(parsed.fund.name, "테스트알파투자조합");
  assert.equal(parsed.intent, INTENT.FUND_STATUS);
});

await t("U1 어떤 Task도 자동 완료되지 않는다", async () => {
  const p = makeProviders();
  const v = await runUserRequest({ user_message: "테스트알파투자조합 고유번호증 진행상태", runtime_config: RUNTIME, providers: p, now: NOW });
  assert.equal(v.task_summary.filter((x) => x.computed_state === "완료").length, 0);
});

// ---- Smoke 2: U2 외근 산출물 검토 --------------------------------------------

await t("U2 외근 산출물 검토 — 분류·불인정·연결 Task 후보가 나온다", async () => {
  const p = makeProviders();
  const v = await runUserRequest({
    user_message: "7월 28일 외근 폴더에 들어온 고유번호증 산출물 확인해줘.",
    runtime_config: RUNTIME, providers: p, now: NOW
  });
  assert.equal(v.intent, INTENT.FIELDWORK_EVIDENCE);
  const rows = v.evidence_summary.classified;
  assert.equal(rows.length, FILES.length);
  assert.ok(rows.some((r) => r.display_verdict === "INVALID_SHORTCUT"), ".lnk는 불인정");
  assert.ok(rows.some((r) => r.display_verdict === "ZERO_BYTE"), "0byte는 불인정");
  assert.ok(rows.some((r) => r.display_verdict === "OUT_OF_SCOPE" && r.downstream_process === "P04"), "보안카드는 범위 밖");
  assert.ok(v.evidence_summary.task_candidates.length > 0);
  assert.ok(v.evidence_summary.fund_candidates.length > 0);
  assert.ok(v.display.includes("외근 산출물 검토 결과"));
  assert.ok(v.display.includes("파일이 있다는 사실만으로"));
});

await t("U2 날짜 미지정이면 폴더 후보를 제시한다", async () => {
  const p = makeProviders();
  const v = await runUserRequest({ user_message: "최근 외근 파일 중 고유번호증 관련 결과물 정리해줘.", runtime_config: RUNTIME, providers: p, now: NOW });
  assert.equal(v.intent, INTENT.FIELDWORK_EVIDENCE);
  assert.ok(v.evidence_summary.folder_candidates, "후보 폴더 목록이 있어야 한다");
  assert.ok(v.next_actions.some((a) => a.includes("외근 폴더를 지정")));
});

// ---- Smoke 3: U3 Notion Preview ----------------------------------------------

await t("U3 Notion 변경 Preview — Typed Preview가 생성되고 실제 반영은 0건", async () => {
  const p = makeProviders();
  const v = await runUserRequest({
    user_message: "확인한 결과로 고유번호증 Notion 변경안 만들어줘.",
    fund_hint: FUND_A.name, runtime_config: RUNTIME, providers: p, now: NOW
  });
  assert.equal(v.intent, INTENT.NOTION_PREVIEW);
  assert.ok(v.notion_preview.rows.length > 0, "변경 제안이 있어야 한다");
  assert.equal(v.notion_preview.actual_write_count, 0);
  assert.equal(v.notion_preview.auto_apply_allowed, false);
  for (const r of v.notion_preview.rows) {
    assert.ok(r.preview_id && r.preview_hash, "preview_id·preview_hash 필수");
    assert.equal(r.write_scope, "TEST_RECORD_ONLY");
    assert.equal(r.approval_required, true);
    assert.equal(r.auto_apply_allowed, false);
  }
  assert.ok(v.display.includes("제안값:"));
  assert.ok(v.display.includes("Preview만 생성했습니다."));
});

await t("U3 동일 입력은 동일 transaction_id·preview_hash를 만든다", async () => {
  const args = { user_message: "고유번호증 Notion 변경안 만들어줘.", fund_hint: FUND_A.name, runtime_config: RUNTIME, now: NOW };
  const a = await runUserRequest({ ...args, providers: makeProviders() });
  const b = await runUserRequest({ ...args, providers: makeProviders() });
  assert.equal(a.notion_preview.transaction_id, b.notion_preview.transaction_id);
  assert.deepEqual(a.notion_preview.rows.map((r) => r.preview_hash), b.notion_preview.rows.map((r) => r.preview_hash));
});

// ---- Smoke 4: U4 매니저 공유문 -----------------------------------------------

await t("U4 매니저 공유문 — 본문이 생성되고 발송은 비활성", async () => {
  const p = makeProviders();
  const v = await runUserRequest({
    user_message: "현재 고유번호증 진행상황을 슬랙 메시지로 정리해줘.",
    fund_hint: FUND_A.name, runtime_config: RUNTIME, providers: p, now: NOW
  });
  assert.equal(v.intent, INTENT.MANAGER_UPDATE);
  assert.equal(v.manager_message.send_enabled, false);
  for (const key of ["현재 단계:", "확인된 Evidence:", "필요한 확인:", "다음 Action:", "요청사항:"]) {
    assert.ok(v.manager_message.text.includes(key), `공유문에 ${key} 누락`);
  }
  assert.ok(v.display.includes("발송하지 않음"));
});

// ---- Smoke 5: 다른 Fund Hint 재사용 ------------------------------------------

await t("재사용 — 다른 Fund Hint로 신규 코드 없이 동일 Contract 반환", async () => {
  const p = makeProviders({ funds: [], likeFunds: [FUND_B1, FUND_B2] });
  const v = await runUserRequest({
    user_message: "고유번호증 업무 상태 알려줘", fund_hint: "테스트베타투자조합",
    runtime_config: RUNTIME, providers: p, now: NOW
  });
  assert.equal(v.fund_match, "MULTIPLE");
  assert.equal(v.fund_candidates.length, 2);
  assert.equal(v.handoff.reason, "FUND_MULTIPLE");
  assert.equal(v.handoff.operating_write_performed, false);
  assert.ok(v.display.includes("조합이 여러 건 일치합니다"));
  for (const k of ["intent", "fund_match", "process_id", "handoff", "errors", "display"]) assert.ok(k in v, `출력 Contract 필드 ${k} 누락`);
});

await t("재사용 — Root 미등록 조합도 정상 Handoff로 끝난다", async () => {
  const p = makeProviders({ funds: [FUND_B1] });
  const v = await runUserRequest({ user_message: "고유번호증 진행상태", fund_hint: FUND_B1.name, runtime_config: RUNTIME, providers: p, now: NOW });
  assert.equal(v.fund_match, "EXACT_1");
  assert.ok(v.evidence_summary.unavailable?.includes("Root"));
  assert.equal(v.writes.notion, 0);
  assert.ok(v.display.length > 0);
});

// ---- Smoke 6: 운영 Write 0 ---------------------------------------------------

await t("운영 Write 0 — 모든 Intent에서 Notion·Drive·Slack Write가 발생하지 않는다", async () => {
  const messages = [
    "테스트알파투자조합 고유번호증 어디까지 진행됐어?",
    "7월 28일 외근 폴더 산출물 확인해줘",
    "고유번호증 Notion 변경안 만들어줘",
    "고유번호증 진행상황 슬랙 메시지로 정리해줘"
  ];
  for (const m of messages) {
    const p = makeProviders();
    const v = await runUserRequest({ user_message: m, fund_hint: FUND_A.name, runtime_config: RUNTIME, providers: p, now: NOW });
    assert.deepEqual(v.writes, { notion: 0, drive: 0, slack: 0 }, m);
    assert.equal(p._writes.length, 0, `${m} — provider write가 호출되면 안 된다`);
  }
});

await t("Session Runner는 Write Tool을 영구 차단한다", async () => {
  const invoke = createSessionInvoker({ results: {}, pending: [] });
  await assert.rejects(() => invoke("notion-create-pages", { a: 1 }), (e) => e.code === "WRITE_BRIDGE_DISABLED");
  await assert.rejects(() => invoke("notion-update-page", { a: 1 }), (e) => e.code === "WRITE_BRIDGE_DISABLED");
  await assert.rejects(() => invoke("slack_send_message", { a: 1 }), (e) => e.code === "WRITE_BRIDGE_DISABLED");
});

await t("Session Runner는 미해결 Tool 호출을 pending으로 반환한다", async () => {
  const r = await runSessionWorkflow({
    input: {
      user_message: "테스트알파투자조합 고유번호증 진행상태",
      runtime_config: { notion: { data_sources: { fund_master: "syn-fm", fund_work: "syn-fw", request: "syn-rq", task: "syn-tk" } }, drive: {} }
    },
    tool_results: {}
  });
  assert.equal(r.status, "NEEDS_TOOL_RESULTS");
  assert.ok(r.pending.length > 0);
  assert.ok(r.pending.every((p) => p.key === toolKey(p.tool, p.params)), "pending key가 결정적이어야 한다");
  assert.equal(r.view, null, "미완료 상태에서 결과를 반환하면 안 된다");
});

// ---- Smoke 7: Intent Router --------------------------------------------------

await t("Intent Router — 4개 Intent를 발화에서 판정한다", async () => {
  const cases = [
    ["그로스테스트조합 고유번호증 신청 지금 어디까지 진행됐어?", INTENT.FUND_STATUS],
    ["이 조합의 현재 Actor와 다음 할 일을 알려줘.", INTENT.FUND_STATUS],
    ["오늘 외근 폴더에 들어온 고유번호증 산출물 확인해줘.", INTENT.FIELDWORK_EVIDENCE],
    ["이 폴더 파일이 어느 조합의 어떤 업무 증빙인지 알려줘.", INTENT.FIELDWORK_EVIDENCE],
    ["확인한 결과로 Notion 변경안 만들어줘.", INTENT.NOTION_PREVIEW],
    ["어떤 Task를 어떻게 바꿔야 하는지 보여줘.", INTENT.NOTION_PREVIEW],
    ["매니저 확인 전에 Preview 만들어줘.", INTENT.NOTION_PREVIEW],
    ["이 내용을 담당 매니저에게 공유할 문구로 만들어줘.", INTENT.MANAGER_UPDATE],
    ["현재 진행상황을 슬랙 메시지로 정리해줘.", INTENT.MANAGER_UPDATE]
  ];
  for (const [msg, expected] of cases) {
    assert.equal(routeIntent(msg).intent, expected, msg);
  }
});

await t("Intent Router — 모호하면 확인 질문 1회만 한다", async () => {
  const v = await runUserRequest({ user_message: "그거 좀 봐줘", runtime_config: RUNTIME, providers: makeProviders(), now: NOW });
  assert.equal(v.intent, INTENT.CLARIFY);
  assert.ok(v.clarifying_question.endsWith("진행할까요?"));
  assert.equal(v.clarify_options.length, 2);
  assert.equal(v.display.split("?").length - 1, 1, "확인 질문은 1개만");
});

await t("범위 밖 Process는 인계로 끝난다", async () => {
  const v = await runUserRequest({ user_message: "계좌개설 진행상태 알려줘", runtime_config: RUNTIME, providers: makeProviders(), now: NOW });
  assert.equal(v.intent, INTENT.UNSUPPORTED);
  assert.equal(v.handoff.reason, "PROCESS_NOT_SUPPORTED");
  assert.ok(v.display.includes("미지원:"));
});

// ---- Smoke 8: 출력 위생 ------------------------------------------------------

await t("사용자 출력에 내부 식별자·URL이 노출되지 않는다", async () => {
  const p = makeProviders({
    files: [{ name: "테스트알파투자조합_고유번호증.pdf", extension: "pdf", size: 1, modified: "2026-07-07T00:00:00Z", is_folder: false, _id: "1AbCdEfGhIjKlMnOpQrStUvWxYz0123456" }]
  });
  const v = await runUserRequest({ user_message: "테스트알파투자조합 고유번호증 어디까지 진행됐어?", runtime_config: RUNTIME, providers: p, now: NOW });
  assert.ok(!/https?:\/\//.test(v.display), "출력에 원본 URL이 없어야 한다");
  assert.ok(!/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i.test(v.display), "출력에 UUID가 없어야 한다");
  assert.ok(!v.display.includes("1AbCdEfGhIjKlMnOpQrStUvWxYz0123456"), "출력에 Drive File ID가 없어야 한다");
});

console.log(`\nSMOKE TESTS: ${pass} PASS / ${failed} FAIL`);
if (failed) process.exit(1);
