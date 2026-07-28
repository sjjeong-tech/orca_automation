#!/usr/bin/env node
import assert from "node:assert/strict";
import { evaluateEvidenceState, parseEvidenceText } from "../index.mjs";

const event = (over = {}) => ({
  test_case_id: "MVP",
  process_id: "P03",
  operational_task_id: "P03-T04",
  evidence_type: "RECEIPT",
  evidence_validity: "VERIFIED",
  human_confirmation: true,
  current_task_status: "진행 중",
  current_actor: "지원팀",
  ...over
});

const receipt = evaluateEvidenceState(event());
assert.equal(receipt.evidence_judgment, "사람 확인 필요");
assert.equal(receipt.proposed_next_action, "접수증 본문 대조");
assert.equal(receipt.proposed_blocker, "");
assert.equal(receipt.request_completion_allowed, false);

const result = evaluateEvidenceState(event({ operational_task_id: "P03-T05", evidence_type: "RESULT_DOCUMENT", human_confirmation: true }));
assert.equal(result.proposed_next_action, "최신본·실물 수령 확인");
assert.equal(result.completion_candidate, false);

const delivery = evaluateEvidenceState(event({ operational_task_id: "P03-T06", evidence_type: "DELIVERY_EVIDENCE", storage_confirmed: true, delivery_confirmed: false }));
assert.equal(delivery.evidence_judgment, "일부 확인");
assert.equal(delivery.proposed_next_action, "관리역 전달 여부 확인");

for (const validity of ["ZERO_BYTE", "INVALID_SHORTCUT"]) {
  const rejected = evaluateEvidenceState(event({ evidence_type: "SUBMISSION_PACKAGE", evidence_validity: validity }));
  assert.equal(rejected.evidence_judgment, "불인정");
  assert.equal(rejected.completion_candidate, false);
}

const verified = evaluateEvidenceState(event({ evidence_type: "STAMPED_DOCUMENT", human_confirmation: false }));
assert.equal(verified.evidence_judgment, "확인됨");
assert.equal(verified.proposed_task_status, "완료");
assert.equal(verified.completion_candidate, true);

const preview = evaluateEvidenceState(event());
assert.equal(preview.change_preview.planned_write_count, 0);
assert.equal(preview.change_preview.actual_write_count, 0);
assert.equal(parseEvidenceText("P03-004 접수증은 있는데 조합명과 접수일을 아직 확인하지 않았어.").proposed_next_action, "접수증 본문 대조");
assert.equal(parseEvidenceText("P03-005 고유번호증 PDF는 있지만 최신본인지 모르겠고 실물도 아직 못 받았어.").proposed_next_action, "최신본·실물 수령 확인");
assert.equal(parseEvidenceText("P03-T06 파일은 저장했지만 관리역에게 전달했는지 확인이 안 돼.").proposed_next_action, "관리역 전달 여부 확인");
console.log("evidence-state MVP tests: PASS (rules, invalid evidence, natural-language examples, preview-only)");
