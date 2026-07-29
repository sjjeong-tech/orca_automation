import assert from "node:assert/strict";
import { buildTaskEvidencePreview } from "../kernel/task-evidence-preview.mjs";
const base = { task_candidate: "P03-T04", target_match_status: "EXACT_1", evidence_candidate: { evidence_type: "RECEIPT", validity: "VERIFIED", confirmation_questions: ["조합명·접수일·신청유형 확인"] }, current_task_values: { task_status: "진행 중", actor: "지원팀", next_action: "확인", blocker: "" }, inventory_reference: "FWO-0001" };
const receipt = buildTaskEvidencePreview(base); assert.equal(receipt.change_preview_status, "READY_PREVIEW"); assert.equal(receipt.approval_required, true); assert.equal(receipt.request_completion_allowed, false); assert.equal(receipt.actual_notion_write_count, 0);
for (const type of ["STAMPED_DOCUMENT", "RESULT_DOCUMENT", "DELIVERY_EVIDENCE"]) assert.equal(buildTaskEvidencePreview({ ...base, task_candidate: type === "DELIVERY_EVIDENCE" ? "P03-T06" : type === "RESULT_DOCUMENT" ? "P03-T05" : "P03-T03", evidence_candidate: { evidence_type: type, validity: "VERIFIED" } }).completion_candidate, false);
for (const reason of ["ZERO_BYTE", "INVALID_SHORTCUT"]) { const out = buildTaskEvidencePreview({ ...base, evidence_candidate: { reason, evidence_type: "SUBMISSION_PACKAGE" } }); assert.equal(out.completion_candidate, false); assert.ok(out.reason_codes.includes(reason)); }
for (const status of ["MULTIPLE", "NOT_FOUND", "NOT_RESOLVED"]) assert.equal(buildTaskEvidencePreview({ ...base, target_match_status: status }).change_preview_status, "BLOCKED");
assert.equal(buildTaskEvidencePreview({ ...base, target_match_status: "EXACT_1", task_candidate: null }).change_preview_status, "BLOCKED");
console.log("task-evidence-preview tests: PASS (mapping, invalid evidence, target guards, write=0)");
