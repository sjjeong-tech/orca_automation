import assert from "node:assert/strict";
import { buildWritePlan, detectDuplicates, missingQuestions, parseIntake } from "./conversational-intake.mjs";

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

console.log("conversational-intake tests: PASS (4 scenarios)");
