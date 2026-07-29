import { discoverEvidence } from "./evidence-discovery.mjs";
import { locateOperationalRecords } from "./record-locator.mjs";
import { buildTaskEvidencePreview } from "./task-evidence-preview.mjs";
import { mapNotionTaskSnapshot } from "./notion-task-snapshot.mjs";
import { compareTaskActual } from "./task-actual-compare.mjs";
const now = () => new Date().toLocaleString("sv-SE", { timeZone: "Asia/Seoul", hour12: false }).replace(" ", "T") + "+09:00";
export function reviewTaskEvidence({ inventory = {}, notion_snapshot = {}, fund_name = null, process_id = "P03", e2e_id = "E2E-03", operational_task_id = "P03-T04", preview_only = true, max_candidates = 100, master_matches = [] } = {}) {
  const started_at_kst = now();
  const discovery = discoverEvidence({ ...inventory, fund_name, process_id, max_candidates });
  const resolution = locateOperationalRecords({ fund_name, master_matches, request_matches: [], fund_work_matches: [], task_matches: [] });
  const snapshot = mapNotionTaskSnapshot({ ...notion_snapshot, process_id, target_match_status: notion_snapshot.target_match_status ?? "EXACT_1" });
  const candidate = discovery.evidence_candidates.find((x) => x.task_candidate === operational_task_id) ?? discovery.invalid_candidates[0] ?? null;
  const targetStatus = snapshot.target_match_status ?? "NOT_RESOLVED";
  const taskPreview = buildTaskEvidencePreview({ evidence_candidate: candidate, task_candidate: operational_task_id, current_task_values: snapshot.mapped_actual_values, target_match_status: targetStatus, fund_candidate: fund_name, process_candidate: process_id, inventory_reference: candidate?.name ?? null, preview_only });
  const comparison = compareTaskActual({ expected_preview: taskPreview, notion_task_actual: snapshot.mapped_actual_values, target_match_status: snapshot.comparison_ready ? targetStatus : "NOT_RESOLVED", preview_only });
  const identifier_warning = process_id === "E2E-03" ? "LEGACY_PROCESS_ID_E2E03_NORMALIZED_CANDIDATE" : null;
  const testLabLinkAllowed = snapshot.environment_classification === "TEST_LAB" && targetStatus === "EXACT_1";
  const operationalLinkAllowed = false;
  return { started_at_kst, completed_at_kst: now(), elapsed_time_ms: 0, target: { environment: snapshot.environment_classification, fund_name, master_match_status: resolution.operational_match_status, fund_match_status: resolution.operational_match_status, process_id, e2e_id, operational_task_id, target_match_status: targetStatus, target_fund_status: resolution.operational_match_status, operational_link_allowed: operationalLinkAllowed, test_lab_link_allowed: testLabLinkAllowed }, discovery, resolution, snapshot, task_preview: taskPreview, comparison, identifier_warning, actual_notion_write_count: 0, actual_file_write_count: 0, approval_required: true };
}

export function reviewEvidenceBundle({ inventory = {}, snapshots = {}, fund_name = null, process_id = "P03", e2e_id = "E2E-03", preview_only = true, master_matches = [] } = {}) {
  const started_at_kst = now(), taskIds = ["P03-T02", "P03-T04", "P03-T05"], task_results = [], unresolved_tasks = [], missing_evidence_tasks = [];
  const discovery = discoverEvidence({ ...inventory, fund_name, process_id });
  for (const taskId of taskIds) {
    const snap = snapshots[taskId] ?? null;
    if (!snap) { missing_evidence_tasks.push(taskId); continue; }
    const taskFiles = (inventory.files ?? []).filter((file) => {
      const name = String(file.name ?? "");
      if (taskId === "P03-T02") return name.includes("신청서류") || name.includes("신청 서류") || name.includes("제출서류");
      if (taskId === "P03-T04") return name.includes("접수증") || name.includes("접수");
      if (taskId === "P03-T05") return name.includes("결과물") || name.includes("발급");
      return false;
    });
    const result = reviewTaskEvidence({ inventory: { ...inventory, files: taskFiles }, notion_snapshot: snap, fund_name, process_id, e2e_id, operational_task_id: taskId, preview_only, master_matches });
    task_results.push({ task_id: taskId, ...result });
  }
  if (!snapshots["P03-T06"]) missing_evidence_tasks.push("P03-T06");
  const masterExact = master_matches.length === 1, testLabLinkAllowed = task_results.every((r) => r.target.test_lab_link_allowed);
  return { started_at_kst, completed_at_kst: now(), master_resolution: masterExact ? "EXACT_1" : master_matches.length > 1 ? "MULTIPLE" : "NOT_FOUND", task_results, unresolved_tasks, missing_evidence_tasks, request_completion_allowed: false, operational_link_allowed: false, test_lab_link_allowed: testLabLinkAllowed, discovery, actual_notion_write_count: 0, actual_file_write_count: 0 };
}
