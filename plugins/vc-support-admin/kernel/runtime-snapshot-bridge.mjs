import { createHash } from "node:crypto";

// Approved TEST LAB collection only. Operating sources are never allowlisted.
export const TEST_LAB_DATA_SOURCE_ALLOWLIST = new Set(["collection://1d06db48-32b8-49d7-b4bb-27e822df87a1"]);
const TASK_IDS = ["P03-T01", "P03-T02", "P03-T03", "P03-T04", "P03-T05", "P03-T06"];
const HUMAN_RULES = {
  "P03-T03": { priority: "P1", canonical_question: "날인본 원본과 필수 날인 위치가 확인됐나요?", comparison: "NEEDS_WORDING_FIX" },
  "P03-T04": { priority: "P0", canonical_question: "접수증의 조합명·접수일·신청유형이 일치하나요?", comparison: "SEMANTIC_MATCH" },
  "P03-T05": { priority: "P0", canonical_question: "발급본이 최신본이며 실물을 수령했나요?", comparison: "SEMANTIC_MATCH" }
};

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

export function calculateRuntimeSnapshotHash(snapshot) {
  const { snapshot_hash, ...unsigned } = snapshot;
  return createHash("sha256").update(stable(unsigned)).digest("hex");
}

function hasForbiddenContent(value, key = "") {
  if (Array.isArray(value)) return value.some((item) => hasForbiddenContent(item));
  if (!value || typeof value !== "object") {
    if (typeof value !== "string") return false;
    if (/https?:\/\//i.test(value) || /drive\.google\.com|app\.notion\.com/i.test(value)) return true;
    if (/(?:[A-Za-z]:\\|\\\\|\/Users\/|\/home\/)/.test(value)) return true;
    if (/\b\d{6}-?\d{7}\b/.test(value) || /\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/.test(value)) return true;
    return false;
  }
  return Object.entries(value).some(([nestedKey, nestedValue]) => nestedKey !== "data_source_id" && hasForbiddenContent(nestedValue, nestedKey));
}

function schemaErrors(snapshot) {
  const errors = [];
  const allowed = new Set(["version", "source", "environment", "data_source_id", "transaction_id", "snapshot_hash", "fund_work", "request", "tasks", "human_confirmation"]);
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return ["SNAPSHOT_SCHEMA_INVALID"];
  if (Object.keys(snapshot).some((key) => !allowed.has(key))) errors.push("SNAPSHOT_SCHEMA_INVALID");
  for (const key of allowed) if (!(key in snapshot)) errors.push("SNAPSHOT_SCHEMA_INVALID");
  if (snapshot.version !== "1.0" || snapshot.source !== "APPROVED_SESSION") errors.push("SNAPSHOT_SCHEMA_INVALID");
  if (!/^collection:\/\/[0-9a-f-]{36}$/.test(snapshot.data_source_id ?? "")) errors.push("SNAPSHOT_SCHEMA_INVALID");
  if (!/^[A-Z0-9-]{3,64}$/.test(snapshot.transaction_id ?? "") || !/^[a-f0-9]{64}$/.test(snapshot.snapshot_hash ?? "")) errors.push("SNAPSHOT_SCHEMA_INVALID");
  if (!snapshot.fund_work || typeof snapshot.fund_work !== "object" || !snapshot.request || typeof snapshot.request !== "object" || !Array.isArray(snapshot.tasks) || !Array.isArray(snapshot.human_confirmation)) errors.push("SNAPSHOT_SCHEMA_INVALID");
  return [...new Set(errors)];
}

function relationErrors(snapshot) {
  if (snapshot.fund_work?.master_match !== "EXACT_1" || snapshot.request?.fund_relation !== "EXACT_1") return ["RELATION_INVALID"];
  if (!snapshot.tasks.every((task) => task.lab === true && task.request_relation === "EXACT_1")) return ["RELATION_INVALID"];
  return [];
}

export function evaluateRuntimeSnapshot(snapshot, { transactionId } = {}) {
  const schema = schemaErrors(snapshot);
  if (schema.length) return { ok: false, error_code: schema[0], actual_notion_write_count: 0, operational_write_count: 0 };
  if (snapshot.environment !== "TEST_LAB") return { ok: false, error_code: "ENVIRONMENT_NOT_TEST_LAB", actual_notion_write_count: 0, operational_write_count: 0 };
  if (!TEST_LAB_DATA_SOURCE_ALLOWLIST.has(snapshot.data_source_id)) return { ok: false, error_code: "DATA_SOURCE_NOT_ALLOWLISTED", actual_notion_write_count: 0, operational_write_count: 0 };
  if (!transactionId || transactionId !== snapshot.transaction_id) return { ok: false, error_code: "TRANSACTION_ID_MISMATCH", actual_notion_write_count: 0, operational_write_count: 0 };
  if (snapshot.fund_work.count !== 1 || snapshot.request.count !== 1 || snapshot.tasks.length !== 6 || new Set(snapshot.tasks.map((task) => task.operational_task_id)).size !== 6 || !TASK_IDS.every((id) => snapshot.tasks.some((task) => task.operational_task_id === id))) return { ok: false, error_code: "RECORD_COUNT_INVALID", actual_notion_write_count: 0, operational_write_count: 0 };
  const relation = relationErrors(snapshot);
  if (relation.length) return { ok: false, error_code: relation[0], actual_notion_write_count: 0, operational_write_count: 0 };
  if (hasForbiddenContent(snapshot)) return { ok: false, error_code: "SNAPSHOT_SANITIZATION_FAILED", actual_notion_write_count: 0, operational_write_count: 0 };
  if (calculateRuntimeSnapshotHash(snapshot) !== snapshot.snapshot_hash) return { ok: false, error_code: "SNAPSHOT_HASH_MISMATCH", actual_notion_write_count: 0, operational_write_count: 0 };
  const confirmation = snapshot.human_confirmation.map((item) => ({
    ...item,
    canonical_question: HUMAN_RULES[item.operational_task_id]?.canonical_question ?? item.canonical_question,
    priority: HUMAN_RULES[item.operational_task_id]?.priority ?? item.priority,
    comparison: HUMAN_RULES[item.operational_task_id]?.comparison ?? "RULE_MISMATCH",
    completion_allowed: false,
    approval_required: true
  }));
  if (confirmation.length !== 3 || confirmation.some((item) => !HUMAN_RULES[item.operational_task_id] || item.completion_allowed !== false || item.approval_required !== true)) return { ok: false, error_code: "HUMAN_CONFIRMATION_INVALID", actual_notion_write_count: 0, operational_write_count: 0 };
  return {
    ok: true,
    source: "RUNTIME_SNAPSHOT",
    environment: "TEST_LAB",
    transaction_id: snapshot.transaction_id,
    duplicate_status: "EXACT_1",
    result: "NO_OP_ALREADY_COMMITTED",
    fund_count: 1,
    request_count: 1,
    task_count: 6,
    relation_pass: true,
    expected_actual: "PASS",
    request_completion_allowed: false,
    human_confirmation: confirmation,
    actual_notion_write_count: 0,
    operational_write_count: 0,
    runtime_provider_gap: "READ_ONLY_RUNTIME_PROVIDER_GAP"
  };
}
