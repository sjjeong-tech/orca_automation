import { createHash } from "node:crypto";

const FAIL_CODES = ["PARTIAL_WRITE", "PROVIDER_ERROR", "REQUERY_FAILED", "EXPECTED_ACTUAL_MISMATCH", "BLOCKED_BY_GUARD"];

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${stable(value[k])}`).join(",")}}`;
  return JSON.stringify(value);
}
export function previewHash(preview) { return createHash("sha256").update(stable(preview.core)).digest("hex"); }

export function createTestLabCommitPreview(input) {
  const core = { transaction_id: input.transaction_id, target_data_source: input.target_data_source, request: input.request, tasks: input.tasks ?? [] };
  return { mode: "test_write", environment: input.environment, core, preview_hash: previewHash({ core }), planned_writes: 1 + (input.tasks ?? []).length, approval_required: true, actual_notion_write_count: 0 };
}

function guard(preview, approval, runtime, duplicateStatus, now) {
  const errors = [];
  if (preview.environment !== "TEST_LAB" || runtime.environment !== "TEST_LAB") errors.push("ENVIRONMENT_NOT_TEST_LAB");
  if (runtime.write_mode !== "test_write" || runtime.operating_write_enabled !== false) errors.push("WRITE_MODE_BLOCKED");
  if (!preview.core.transaction_id) errors.push("TRANSACTION_ID_REQUIRED");
  if (duplicateStatus !== "EXACT_0") errors.push("DUPLICATE_NOT_EXACT_0");
  if (!runtime.test_lab_data_sources?.includes(preview.core.target_data_source)) errors.push("DATA_SOURCE_NOT_ALLOWLISTED");
  if (!approval?.explicit_approval) errors.push("EXPLICIT_APPROVAL_REQUIRED");
  if (!approval || approval.transaction_id !== preview.core.transaction_id || approval.preview_hash !== preview.preview_hash) errors.push("APPROVAL_SCOPE_MISMATCH");
  if (approval?.expires_at && Date.parse(approval.expires_at) <= now) errors.push("APPROVAL_EXPIRED");
  return errors;
}

export async function commitTestLabWithRequery({ preview, approval, runtime, provider, expected, duplicateStatus = "EXACT_0", now = Date.now(), idempotencyStore = new Map() }) {
  const base = { preview, approval_scope: approval?.write_scope ?? null, intended_writes: preview?.planned_writes ?? 0, committed_writes: [], requery_results: [], actual_notion_write_count: 0, operational_write_count: 0, recovery_guidance: "사람 확인 후 생성된 TEST LAB Record를 재조회하고 필요한 수동 복구를 수행하세요." };
  if (!preview) return { ...base, result: "BLOCKED_BY_GUARD", errors: ["PREVIEW_REQUIRED"] };
  if (idempotencyStore.has(preview.core.transaction_id)) return { ...base, result: "NO_OP", idempotent: true };
  const errors = guard(preview, approval, runtime, duplicateStatus, now);
  if (errors.length) return { ...base, result: "BLOCKED_BY_GUARD", errors };
  const log = (step, result, error_code = null) => base.requery_results.push({ step, result, error_code, next_allowed: !error_code });
  try {
    const request = await provider.createRequest(preview.core.request); base.committed_writes.push(request); log("REQUEST_WRITE", "PASS");
    const requestActual = await provider.requeryRequest(request.id); log("REQUEST_REQUERY", "PASS");
    if (!requestActual) throw Object.assign(new Error("requery"), { code: "REQUERY_FAILED", step: "REQUEST_REQUERY" });
    if (!(await provider.verifyRelation(requestActual, preview.core.request))) throw Object.assign(new Error("relation"), { code: "EXPECTED_ACTUAL_MISMATCH", step: "RELATION_VERIFY" });
    for (const task of preview.core.tasks ?? []) { const created = await provider.createTask(task); base.committed_writes.push(created); log("TASK_WRITE", "PASS"); }
    const tasksActual = await provider.requeryTasks(base.committed_writes.filter((x) => x.kind === "task").map((x) => x.id)); log("TASK_REQUERY", "PASS");
    const actual = { request: requestActual, tasks: tasksActual };
    const matched = expected ? expected(actual) : true;
    if (!matched) throw Object.assign(new Error("actual"), { code: "EXPECTED_ACTUAL_MISMATCH", step: "EXPECTED_ACTUAL" });
    log("EXPECTED_ACTUAL", "PASS"); idempotencyStore.set(preview.core.transaction_id, "COMPLETE");
    return { ...base, result: "PASS", expected_actual: "PASS" };
  } catch (error) {
    const code = FAIL_CODES.includes(error.code) ? error.code : "PROVIDER_ERROR";
    return { ...base, result: code === "PROVIDER_ERROR" && base.committed_writes.length ? "PARTIAL_WRITE" : code, error_code: code, failed_step: error.step ?? "UNKNOWN", auto_retry_write_count: 0, follow_up_write_count: 0, created_records: base.committed_writes };
  }
}
