import {
  HUMAN_CONFIRMATION_RULES,
  TEST_LAB_DATA_SOURCE_ALLOWLIST,
  calculateRuntimeSnapshotHash,
  evaluateRuntimeSnapshot,
  hasForbiddenSnapshotContent
} from "./runtime-snapshot-bridge.mjs";

const TASK_IDS = ["P03-T01", "P03-T02", "P03-T03", "P03-T04", "P03-T05", "P03-T06"];
const CONFIRMATION_TASK_IDS = ["P03-T03", "P03-T04", "P03-T05"];
const PACKET_KEYS = new Set([
  "version", "source", "sanitized", "environment", "transaction_id", "data_sources",
  "fund_work", "request", "tasks", "relations", "retrieved_at_kst", "source_metadata"
]);
const TASK_KEYS = new Set(["record_id", "properties"]);
const PROPERTY_ALIASES = Object.freeze({
  operational_task_id: ["operational_task_id", "Operational Task ID"],
  lab: ["lab", "LAB 여부"],
  request_relation: ["request_relation", "상위 요청 Relation"],
  task_status: ["task_status", "Task 상태"],
  actor: ["actor", "현재 Actor"],
  next_action: ["next_action", "다음 Action"],
  blocker: ["blocker", "Blocker"],
  evidence_judgment: ["evidence_judgment", "Evidence 판정"],
  evidence_source: ["evidence_source", "Evidence Source"],
  actual_confirmation: ["actual_confirmation", "Evidence 확인사항"],
  completion_evidence: ["completion_evidence", "완료증빙"]
});
const ALLOWED_PROPERTY_KEYS = new Set(Object.values(PROPERTY_ALIASES).flat());
const FORBIDDEN_KEYS = /(?:raw|mcp|payload|response|body|url|path|email|resident|password|token|credential)/i;

function blocked(error_code, details = {}) {
  return { ok: false, error_code, actual_notion_write_count: 0, operational_write_count: 0, ...details };
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readAlias(properties, aliases) {
  for (const key of aliases) if (Object.hasOwn(properties, key)) return properties[key];
  return undefined;
}

function unsafePacketContent(value, key = "") {
  if (key !== "raw_response_stored" && FORBIDDEN_KEYS.test(key)) return true;
  if (Array.isArray(value)) return value.some((item) => unsafePacketContent(item));
  if (!isPlainObject(value)) return hasForbiddenSnapshotContent(value, key);
  return Object.entries(value).some(([nestedKey, nestedValue]) => unsafePacketContent(nestedValue, nestedKey));
}

function packetError(packet, transactionId) {
  if (!isPlainObject(packet)) return "SESSION_PACKET_SCHEMA_INVALID";
  if (unsafePacketContent(packet)) return "SESSION_PACKET_SANITIZATION_FAILED";
  if (Object.keys(packet).some((key) => !PACKET_KEYS.has(key))) return "SESSION_PACKET_SCHEMA_INVALID";
  for (const key of PACKET_KEYS) if (!(key in packet)) return "SESSION_PACKET_SCHEMA_INVALID";
  if (packet.version !== "1.0" || packet.source !== "SESSION_TOOL_READ" || packet.sanitized !== true) return "SESSION_PACKET_SCHEMA_INVALID";
  if (packet.environment !== "TEST_LAB") return "ENVIRONMENT_NOT_TEST_LAB";
  if (packet.transaction_id !== transactionId || !/^[A-Z0-9-]{3,64}$/.test(packet.transaction_id ?? "")) return "TRANSACTION_ID_MISMATCH";
  if (!isPlainObject(packet.data_sources) || Object.keys(packet.data_sources).length !== 1 || !TEST_LAB_DATA_SOURCE_ALLOWLIST.has(packet.data_sources.task)) return "DATA_SOURCE_NOT_ALLOWLISTED";
  if (!isPlainObject(packet.fund_work) || packet.fund_work.count !== 1 || packet.fund_work.master_match !== "EXACT_1" || !packet.fund_work.record_id) return "RECORD_COUNT_INVALID";
  if (!isPlainObject(packet.request) || packet.request.count !== 1 || packet.request.fund_relation !== "EXACT_1" || packet.request.completion_allowed !== false || !packet.request.record_id) return "RECORD_COUNT_INVALID";
  if (!isPlainObject(packet.relations) || packet.relations.fund_work_to_request !== "EXACT_1" || packet.relations.request_to_tasks !== "EXACT_1") return "RELATION_INVALID";
  if (!Array.isArray(packet.tasks) || packet.tasks.length !== 6) return "RECORD_COUNT_INVALID";
  if (!isPlainObject(packet.source_metadata) || packet.source_metadata.provider !== "notion" || packet.source_metadata.operation !== "read" || packet.source_metadata.raw_response_stored !== false) return "SESSION_PACKET_SCHEMA_INVALID";
  if (typeof packet.retrieved_at_kst !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/.test(packet.retrieved_at_kst)) return "SESSION_PACKET_SCHEMA_INVALID";
  return null;
}

function normalizeTask(task) {
  if (!isPlainObject(task) || Object.keys(task).some((key) => !TASK_KEYS.has(key)) || !isPlainObject(task.properties)) return null;
  if (Object.keys(task.properties).some((key) => !ALLOWED_PROPERTY_KEYS.has(key))) return null;
  const normalized = Object.fromEntries(Object.entries(PROPERTY_ALIASES).map(([field, aliases]) => [field, readAlias(task.properties, aliases)]));
  if (typeof task.record_id !== "string" || !normalized.operational_task_id || normalized.lab !== true || normalized.request_relation !== "EXACT_1") return null;
  return { record_id: task.record_id, ...normalized };
}

/**
 * Converts a sanitized session-tool read packet into the permanent runtime
 * snapshot contract. This module has no MCP transport and no write capability.
 */
export function adaptSessionReadPacket(packet, { transactionId } = {}) {
  const packetValidation = packetError(packet, transactionId);
  if (packetValidation) return blocked(packetValidation);
  const normalizedTasks = packet.tasks.map(normalizeTask);
  if (normalizedTasks.some((task) => !task)) return blocked("SESSION_PACKET_SCHEMA_INVALID");
  if (new Set(normalizedTasks.map((task) => task.operational_task_id)).size !== 6 || !TASK_IDS.every((id) => normalizedTasks.some((task) => task.operational_task_id === id))) return blocked("UNKNOWN_RECORD");
  const humanConfirmation = CONFIRMATION_TASK_IDS.map((operational_task_id) => {
    const task = normalizedTasks.find((candidate) => candidate.operational_task_id === operational_task_id);
    const rule = HUMAN_CONFIRMATION_RULES[operational_task_id];
    if (!task?.actual_confirmation || !task.evidence_source || !task.next_action || !task.actor || !rule) return null;
    return {
      operational_task_id,
      record_id: task.record_id,
      actual_confirmation: task.actual_confirmation,
      canonical_question: rule.canonical_question,
      evidence_source: task.evidence_source,
      next_action: task.next_action,
      actor: task.actor,
      priority: rule.priority,
      completion_allowed: false,
      approval_required: true
    };
  });
  if (humanConfirmation.some((item) => !item)) return blocked("HUMAN_CONFIRMATION_INVALID");
  const runtimeSnapshot = {
    version: "1.0",
    source: "SESSION_TOOL_BRIDGE",
    sanitized: true,
    environment: "TEST_LAB",
    data_source_id: packet.data_sources.task,
    transaction_id: packet.transaction_id,
    record_counts: { fund_work: 1, request: 1, task: 6 },
    records: {
      fund_work: { record_id: packet.fund_work.record_id },
      request: { record_id: packet.request.record_id },
      tasks: normalizedTasks.map((task) => ({ record_id: task.record_id, operational_task_id: task.operational_task_id }))
    },
    relations: { fund_work_to_request: "EXACT_1", request_to_tasks: "EXACT_1" },
    fund_work: { count: 1, master_match: "EXACT_1" },
    request: { count: 1, fund_relation: "EXACT_1", completion_allowed: false },
    tasks: normalizedTasks.map((task) => ({
      operational_task_id: task.operational_task_id,
      record_id: task.record_id,
      lab: true,
      request_relation: "EXACT_1"
    })),
    human_confirmation: humanConfirmation
  };
  runtimeSnapshot.snapshot_hash = calculateRuntimeSnapshotHash(runtimeSnapshot);
  const runtime = evaluateRuntimeSnapshot(runtimeSnapshot, { transactionId });
  if (!runtime.ok) return blocked(runtime.error_code);
  return {
    ok: true,
    source: "SESSION_TOOL_BRIDGE",
    sanitized: true,
    runtime_snapshot: runtimeSnapshot,
    runtime_result: runtime,
    actual_notion_write_count: 0,
    operational_write_count: 0
  };
}
