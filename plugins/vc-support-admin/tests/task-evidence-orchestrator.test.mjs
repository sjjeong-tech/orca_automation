import assert from "node:assert/strict";
import { reviewTaskEvidence, reviewEvidenceBundle } from "../kernel/task-evidence-orchestrator.mjs";
const inventory = { files: [{ name: "접수증.pdf", path: "p", size: 10, modified_at: "2026-07-01" }] };
const snapshot = { database_id: "db", data_source_id: "ds", record_id: "r", test_lab: true, target_match_status: "EXACT_1", properties: { "Task 상태": "진행 중", "현재 Actor": "지원팀", "다음 Action": "접수증 본문 확인", Blocker: "", "Evidence 판정": "사람 확인 필요", "Evidence Source": "FWO-0001", "Evidence 확인사항": "조합명 확인", 완료증빙: "없음", "Operational Task ID": "P03-T04" } };
const exact = reviewTaskEvidence({ inventory, notion_snapshot: snapshot, fund_name: "Alpha", master_matches: [{ name: "Alpha" }] });
assert.equal(exact.target.environment, "TEST_LAB"); assert.equal(exact.target.target_match_status, "EXACT_1"); assert.equal(exact.target.operational_link_allowed, false); assert.equal(exact.target.test_lab_link_allowed, true); assert.equal(exact.actual_notion_write_count, 0); assert.ok(exact.started_at_kst);
assert.equal(reviewTaskEvidence({ inventory, notion_snapshot: snapshot, fund_name: "Missing" }).target.operational_link_allowed, false);
assert.equal(reviewTaskEvidence({ inventory, notion_snapshot: { ...snapshot, target_match_status: "MULTIPLE" }, fund_name: "Alpha", master_matches: [{ name: "Alpha" }] }).comparison.comparison_result, "BLOCKED");
assert.equal(reviewTaskEvidence({ inventory, notion_snapshot: snapshot, process_id: "E2E-03", fund_name: "Alpha", master_matches: [{ name: "Alpha" }] }).identifier_warning, "LEGACY_PROCESS_ID_E2E03_NORMALIZED_CANDIDATE");
assert.equal(reviewTaskEvidence({ inventory, notion_snapshot: { ...snapshot, properties: { "Operational Task ID": "P03-T04" } }, fund_name: "Alpha", master_matches: [{ name: "Alpha" }] }).snapshot.comparison_ready, false);
assert.equal(reviewTaskEvidence({ inventory, notion_snapshot: snapshot, fund_name: "Alpha", master_matches: [{ name: "Alpha" }, { name: "Alpha 2" }] }).target.operational_link_allowed, false);
assert.ok(reviewTaskEvidence({ inventory, notion_snapshot: snapshot, fund_name: "Alpha", master_matches: [{ name: "Alpha" }] }).completed_at_kst);
console.log("task-evidence-orchestrator tests: PASS (10 review gates, KST, FUND guard, write=0)");
const bundle = reviewEvidenceBundle({ inventory: { files: [
  { inventory_id: "FWO-0124", name: "그로스브릿지 고유번호증 신청서류.pdf", path: "metadata://fwo-0124", size: 10 },
  { inventory_id: "FWO-0121", name: "그로스브릿지 고유번호증 신청 접수증.pdf", path: "metadata://fwo-0121", size: 10 },
  { inventory_id: "FWO-0087", name: "그로스브릿지 고유번호증 결과물.pdf", path: "metadata://fwo-0087", size: 10 }
] }, snapshots: { "P03-T02": snapshot, "P03-T04": snapshot, "P03-T05": snapshot }, fund_name: "그로스브릿지-바이오투자조합", master_matches: [{ title: "그로스브릿지-바이오투자조합", layer: "OPERATING" }] });
assert.equal(bundle.master_resolution, "EXACT_1"); assert.equal(bundle.test_lab_link_allowed, true); assert.equal(bundle.operational_link_allowed, false); assert.equal(bundle.task_results.length, 3); assert.deepEqual(bundle.missing_evidence_tasks, ["P03-T06"]); assert.equal(bundle.request_completion_allowed, false); assert.equal(bundle.actual_notion_write_count, 0); assert.ok(bundle.task_results.every((x) => x.discovery.evidence_candidates.length > 0));
console.log("growthbridge bundle replay tests: PASS (T02/T04/T05, T06 missing, links guarded, completion=false, write=0)");
