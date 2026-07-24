import assert from "node:assert/strict";
import {
  buildTransactionPreview,
  buildWritePlan,
  commitTransaction,
  detectDuplicates,
  missingQuestions,
  parseIntake,
  prepareTransaction
} from "./conversational-intake.mjs";

const missingInput = "디토 케이스테이 투자조합 고유번호증 신청 부탁드립니다.";
const missing = parseIntake(missingInput);
assert.equal(missing.related_fund, "디토 케이스테이 투자조합");
assert.equal(missing.request_type, "고유번호증 신청");
assert.deepEqual(missingQuestions(missing).map((item) => item.field), ["requester", "fund_manager", "document_status"]);
assert.equal(buildWritePlan(missing, { approved: true }).write_count, 0);

const completeInput = [
  "디토 케이스테이 투자조합 고유번호증 신청 요청합니다.",
  "요청자는 정상준이고 담당 관리역은 박세림입니다.",
  "서류는 전달 완료했고 다음 주 수요일까지 필요합니다."
].join(" ");
const complete = parseIntake(completeInput);
assert.equal(complete.requester, "정상준");
assert.equal(complete.fund_manager, "박세림");
assert.equal(complete.document_status, "전달 완료");
assert.equal(complete.target_date, "2026-07-29");

const beforeApproval = buildWritePlan(complete);
assert.equal(beforeApproval.status, "PREVIEW_ONLY");
assert.equal(beforeApproval.write_count, 0);
assert.equal(beforeApproval.preview.tasks.length, 6);

const approved = buildWritePlan(complete, { approved: true });
assert.equal(approved.status, "APPROVED_WRITE_PLAN");
assert.equal(approved.write_count, 7);

const duplicate = detectDuplicates(complete, [{
  related_fund: complete.related_fund,
  request_type: complete.request_type,
  status: "시작 전",
  url: "https://example.invalid/test"
}]);
assert.equal(duplicate.length, 1);
assert.equal(buildWritePlan(complete, { approved: true, duplicates: duplicate }).write_count, 0);

const pilotInput = [
  "[TEST][CI1-PILOT] 디토 케이스테이 투자조합의 고유번호증 신청을 요청합니다.",
  "요청자는 정상준이고 담당 관리역은 박세림입니다.",
  "서류는 아직 미전달이며 2026년 7월 29일까지 필요합니다.",
  "긴급 요청은 아니며 특이사항은 없습니다."
].join(" ");
const pilot = parseIntake(pilotInput);
assert.equal(pilot.related_fund, "디토 케이스테이 투자조합");
assert.equal(pilot.document_status, "미전달");
assert.equal(pilot.urgent, false);
assert.deepEqual(missingQuestions(pilot), []);

const pilotPreview = buildWritePlan(pilot, {
  duplicates: [{
    related_fund: "디토 케이스테이 투자조합",
    request_type: "고유번호증 신청",
    status: "시작 전",
    url: "https://example.invalid/existing-test"
  }]
});
assert.equal(pilotPreview.write_count, 0);
assert.equal(pilotPreview.preview.duplicate_requests.length, 1);
assert.equal(pilotPreview.preview.tasks[0].process_id, "P03");

for (const [phrase, expected] of [
  ["서류는 일부만 전달했습니다.", "일부 전달"],
  ["서류는 모두 전달했습니다.", "전달 완료"]
]) {
  assert.equal(parseIntake(`테스트 투자조합 고유번호증 신청. ${phrase}`).document_status, expected);
}

console.log("conversational-intake tests: PASS (5 scenarios + status variants)");

const transactionInput = [
  "[TEST][CI1-PILOT] 가상조합1호의 고유번호증 신청을 요청합니다.",
  "요청자는 정상준이고 담당 관리역은 정상준입니다.",
  "서류는 아직 미전달이며 2026년 7월 29일까지 필요합니다.",
  "긴급 요청은 아니며 사용자 Pilot 검증용 가상 요청입니다."
].join(" ");
const person = [{ person_id: "person-normal-jun" }];
const existingFund = [{ page_id: "fund-existing", url: "https://example.invalid/fund-existing" }];

const missingFundPrepared = prepareTransaction(transactionInput, {
  transaction_id: "TX-MISSING-FUND",
  requester_matches: person,
  manager_matches: person
});
const missingFundPreview = buildTransactionPreview(missingFundPrepared);
assert.equal(missingFundPreview.actual_write_count, 0);
assert.equal(missingFundPreview.commit_plan.fund.action, "CREATE");
assert.equal(missingFundPreview.planned_write_count, 8);

const existingFundPrepared = prepareTransaction(transactionInput, {
  transaction_id: "TX-EXISTING-FUND",
  fund_matches: existingFund,
  requester_matches: person,
  manager_matches: person
});
const existingFundPreview = buildTransactionPreview(existingFundPrepared);
assert.equal(existingFundPreview.commit_plan.fund.action, "USE_EXISTING");
assert.equal(existingFundPreview.commit_plan.fund.planned_writes, 0);
assert.equal(existingFundPreview.planned_write_count, 7);
assert.equal(existingFundPreview.commit_plan.request.current_actor, "담당 관리역");
assert.equal(existingFundPreview.commit_plan.request.next_action, "신청 필요서류 전달");
assert.equal(existingFundPreview.commit_plan.request.blocker, "서류 미전달");
assert.ok(existingFundPreview.commit_plan.tasks.records.every((task) => task.process_id === "P03"));

function mockAdapter({ failFund = false, failRequest = false, failTaskId = null } = {}) {
  const calls = { fund: 0, request: 0, tasks: [] };
  return {
    calls,
    async createFund() {
      calls.fund += 1;
      if (failFund) throw new Error("FUND_FAIL");
      return { page_id: "fund-created", url: "https://example.invalid/fund-created" };
    },
    async createRequest() {
      calls.request += 1;
      if (failRequest) throw new Error("REQUEST_FAIL");
      return { page_id: "request-created", url: "https://example.invalid/request-created" };
    },
    async verifyRequestFundRelation() { return true; },
    async createTask(task) {
      calls.tasks.push(task.operational_task_id);
      if (task.operational_task_id === failTaskId) throw new Error("TASK_FAIL");
      return { page_id: `page-${task.operational_task_id}` };
    },
    async verifyTaskRelationsAndRollup() { return true; }
  };
}

const normalAdapter = mockAdapter();
const normalCommit = await commitTransaction(existingFundPreview, { approved: true, adapter: normalAdapter });
assert.equal(normalCommit.stage, "COMPLETED");
assert.equal(normalCommit.actual_write_count, 7);
assert.equal(normalAdapter.calls.fund, 0);

const requestFailAdapter = mockAdapter({ failRequest: true });
const requestFail = await commitTransaction(missingFundPreview, { approved: true, adapter: requestFailAdapter });
assert.equal(requestFail.stage, "FAILED");
assert.equal(requestFail.failed_at, "REQUEST_CREATE_OR_RELATION_VERIFY");
assert.equal(requestFail.actual_write_count, 1);
assert.equal(requestFailAdapter.calls.tasks.length, 0);

const taskFailAdapter = mockAdapter({ failTaskId: "CI1-P03-03" });
const taskPartial = await commitTransaction(existingFundPreview, { approved: true, adapter: taskFailAdapter });
assert.equal(taskPartial.stage, "PARTIAL");
assert.equal(taskPartial.missing_tasks.length, 1);
assert.equal(Object.keys(taskPartial.execution_log.task_page_ids).length, 5);

const retryAdapter = mockAdapter();
const retried = await commitTransaction(existingFundPreview, {
  approved: true,
  adapter: retryAdapter,
  execution_log: taskPartial.execution_log
});
assert.equal(retried.stage, "COMPLETED");
assert.equal(retried.actual_write_count, 1);
assert.deepEqual(retryAdapter.calls.tasks, ["CI1-P03-03"]);
assert.equal(retryAdapter.calls.request, 0);

const notApproved = await commitTransaction(existingFundPreview, { approved: false, adapter: mockAdapter() });
assert.equal(notApproved.stage, "COMMIT_BLOCKED");
assert.equal(notApproved.actual_write_count, 0);

console.log("transaction tests: PASS (6 required scenarios)");
