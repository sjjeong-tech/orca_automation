import assert from "node:assert/strict";
import { buildEvidencePreview, normalizeEvidenceInput } from "../kernel/evidence-adapter.mjs";

const examples = [
  ["접수증은 받았는데 조합명과 접수일을 확인하지 않았어.", "RECEIPT", "P03-T04"],
  ["신청서 날인본은 받았는데 날인 위치가 맞는지 확인이 필요해.", "STAMPED_DOCUMENT", "P03-T03"],
  ["고유번호증 PDF는 있는데 최신본인지 모르겠어.", "RESULT_DOCUMENT", "P03-T05"],
  ["최종 파일은 조합 폴더에 저장했어.", "STORAGE_COPY", "P03-T06"],
  ["저장은 했는데 관리역에게 전달했는지는 모르겠어.", "DELIVERY_EVIDENCE", "P03-T06"],
  ["파일이 바로가기이고 원본은 열리지 않아.", "SUBMISSION_PACKAGE", null],
];
for (const [text, type, task] of examples) {
  const out = buildEvidencePreview({ text, fund_name: "[TEST] 가상조합", case_id: "CP24" });
  assert.equal(out.evidence_type, type);
  if (task) assert.equal(out.task_candidate, task);
  assert.equal(out.notion_change_preview.actual_write_count, 0);
  assert.equal(out.approval_required, true);
}
const ambiguous = normalizeEvidenceInput({ text: "접수증을 확인했어", fund_name: "[TEST] 가상조합" });
assert.equal(ambiguous.ambiguity, null);
const unknown = buildEvidencePreview({ text: "업무 관련 파일이 있어", fund_name: "[TEST] 가상조합" });
assert.equal(unknown.ambiguity, "EVIDENCE_TASK_UNRESOLVED");
assert.equal(unknown.notion_change_preview.actual_write_count, 0);
console.log("evidence-adapter tests: PASS (6 examples, ambiguity guard, preview-only)");
