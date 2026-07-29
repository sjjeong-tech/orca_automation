import { createHash } from "node:crypto";

const CREATE_TOOL = "notion-create-pages";
const QUERY_TOOL = "notion-query-data-sources";

function hash(value) { return createHash("sha256").update(JSON.stringify(value, Object.keys(value).sort())).digest("hex"); }

export function createTestLabNotionAdapter({ invoke, dataSources = {}, environment = "TEST_LAB", allowWrites = false } = {}) {
  const calls = [];
  const allowed = new Set(Object.values(dataSources).filter(Boolean));
  const guard = ({ source, approval, transactionId, previewHash }) => {
    if (environment !== "TEST_LAB") return "ENVIRONMENT_NOT_TEST_LAB";
    if (!allowed.has(source)) return "DATA_SOURCE_NOT_ALLOWLISTED";
    if (!allowWrites) return "TEST_LAB_WRITE_DISABLED";
    if (!approval?.explicit_approval || approval.transaction_id !== transactionId || approval.preview_hash !== previewHash) return "APPROVAL_SCOPE_MISMATCH";
    if (!transactionId) return "TRANSACTION_ID_REQUIRED";
    return null;
  };
  const write = async (op, source, payload, context) => {
    const blocked = guard({ source, ...context });
    if (blocked) return { ok: false, error_code: blocked, provider_write_count: 0 };
    if (typeof invoke !== "function") return { ok: false, error_code: "SESSION_TOOL_BRIDGE_REQUIRED", provider_write_count: 0 };
    calls.push({ operation: op, tool: CREATE_TOOL, source });
    const result = await invoke(CREATE_TOOL, { data_source: `collection://${source}`, operation: op, payload });
    return { ok: true, result, provider_write_count: 1 };
  };
  const query = async (op, source, where) => {
    if (!allowed.has(source)) return { ok: false, error_code: "DATA_SOURCE_NOT_ALLOWLISTED", rows: [] };
    if (typeof invoke !== "function") return { ok: false, error_code: "SESSION_TOOL_BRIDGE_REQUIRED", rows: [] };
    calls.push({ operation: op, tool: QUERY_TOOL, source });
    const result = await invoke(QUERY_TOOL, { data_source_urls: [`collection://${source}`], query: where });
    return { ok: true, rows: result?.results ?? [] };
  };
  return {
    calls,
    async duplicateCheck({ source, transactionId }) { const q = await query("duplicateCheck", source, { transaction_id: transactionId }); return q.ok ? { status: q.rows.length ? "EXACT_1" : "EXACT_0", rows: q.rows } : q; },
    async createFundWork(payload, context) { return write("createFundWork", dataSources.fund_work, payload, context); },
    async createRequest(payload, context) { return write("createRequest", dataSources.request, payload, context); },
    async createTasks(payload, context) { return write("createTasks", dataSources.task, payload, context); },
    async requeryTransaction({ source, transactionId }) { return query("requeryTransaction", source, { transaction_id: transactionId }); },
    async compareExpectedActual({ source, expected, transactionId }) { const actual = await query("compareExpectedActual", source, { transaction_id: transactionId }); return { ...actual, expected, match: actual.ok && JSON.stringify(actual.rows) === JSON.stringify(expected) }; },
    approvalPreviewHash(value) { return hash(value); }
  };
}
