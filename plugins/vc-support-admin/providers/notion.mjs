// Notion MCP Provider — 실제 Database·Page ID는 config 주입, 소스에 없음.

import { RESULT, ok, fail, unsupported, requireInvoke } from "./base.mjs";
import { WRITE_MODE } from "../kernel/guards.mjs";
import { auditLog, maskIdentifier } from "../kernel/sanitize.mjs";

const SQL_TOOL = "notion-query-data-sources";
const FETCH_TOOL = "notion-fetch";
const CREATE_TOOL = "notion-create-pages";
const UPDATE_TOOL = "notion-update-page";

export function createNotionProvider({ config = {}, invoke, logger = () => {} } = {}) {
  const ds = config.data_sources ?? {};
  const writeMode = config.write_mode ?? WRITE_MODE.PREVIEW_ONLY;
  const allowedPrefixes = config.allowed_prefixes ?? [];
  const operatingWrite = config.operating_write_enabled === true;
  const audit = [];

  const record = (operation, result, extra = {}) => {
    const entry = auditLog({ provider: "notion", operation, result, ...extra });
    audit.push(entry); logger(entry); return entry;
  };

  async function sql(dataSourceId, query, operation) {
    const denied = requireInvoke(invoke, operation);
    if (denied) { record(operation, denied.result); return denied; }
    if (!dataSourceId) { record(operation, RESULT.NOT_FOUND, { error_code: "DATA_SOURCE_NOT_CONFIGURED" }); return fail(RESULT.NOT_FOUND, "data source not configured"); }
    const started = Date.now();
    try {
      const res = await invoke(SQL_TOOL, { data: { data_source_urls: [`collection://${dataSourceId}`], query } });
      const rows = res?.results ?? [];
      record(operation, RESULT.OK, { count: rows.length, identifier: dataSourceId, elapsed_ms: Date.now() - started });
      return ok(rows);
    } catch (error) {
      record(operation, RESULT.ACCESS_DENIED, { error_code: error?.code ?? "SQL_FAILED", elapsed_ms: Date.now() - started });
      return fail(RESULT.ACCESS_DENIED, "query failed");
    }
  }

  return {
    name: "notion",
    write_mode: writeMode,
    audit,

    async initialize() { return ok({ write_mode: writeMode, operating_write_enabled: operatingWrite, configured: Object.keys(ds) }); },

    async health_check() {
      const checks = {};
      for (const key of ["fund_master", "fund_work", "request", "task"]) checks[key] = Boolean(ds[key]);
      const invokeReady = typeof invoke === "function";
      const healthy = invokeReady && Object.values(checks).every(Boolean);
      record("health_check", healthy ? RESULT.OK : RESULT.ACCESS_DENIED);
      return ok({ healthy, invoke_injected: invokeReady, data_sources_configured: checks, operating_write_enabled: operatingWrite });
    },

    async fetch_schema(sourceKey) {
      const denied = requireInvoke(invoke, "fetch_schema");
      if (denied) return denied;
      const id = ds[sourceKey];
      if (!id) return fail(RESULT.NOT_FOUND, `${sourceKey} not configured`);
      const res = await invoke(FETCH_TOOL, { id: `collection://${id}` });
      record("fetch_schema", RESULT.OK, { identifier: id });
      return ok({ source: sourceKey, schema_present: Boolean(res) });
    },

    async search_records({ source, where }) { return sql(ds[source], where, `search_records:${source}`); },
    async fetch_record({ source, where }) {
      const res = await sql(ds[source], where, `fetch_record:${source}`);
      if (res.result !== RESULT.OK) return res;
      if (res.data.length === 0) return fail(RESULT.NOT_FOUND, "no record");
      return ok(res.data[0]);
    },

    // ---- 업무 의미 단위 -------------------------------------------------
    async resolve_fund_master(name) {
      const safe = String(name ?? "").replace(/'/g, "''");
      const q = `SELECT "조합명", "조합구분", "고유번호", "조합 Root 폴더" FROM "collection://${ds.fund_master}" WHERE "조합명" = '${safe}'`;
      const res = await sql(ds.fund_master, q, "resolve_fund_master");
      if (res.result !== RESULT.OK) return res;
      return ok(res.data.map((r) => ({ name: r["조합명"], key: r["조합명"], fund_type: r["조합구분"], tax_id: r["고유번호"] ?? null, root_folder: r["조합 Root 폴더"] ?? null })));
    },

    async resolve_fund_work_record(fundName) {
      const safe = String(fundName ?? "").replace(/'/g, "''");
      const q = `SELECT url, "요청사항", "구분", "상태" FROM "collection://${ds.fund_work}" WHERE "요청사항" LIKE '%${safe}%'`;
      return sql(ds.fund_work, q, "resolve_fund_work_record");
    },

    async find_requests({ titleContains }) {
      const safe = String(titleContains ?? "").replace(/'/g, "''");
      const q = `SELECT url, "요청명", "요청 상태", "서류 상태", "요청 업무 유형" FROM "collection://${ds.request}" WHERE "요청명" LIKE '%${safe}%'`;
      return sql(ds.request, q, "find_requests");
    },

    async find_tasks({ titleContains }) {
      const safe = String(titleContains ?? "").replace(/'/g, "''");
      const q = `SELECT "Operational Task ID" AS operational_task_id, "Task 상태" AS state, "현재 Actor" AS actor, "다음 Action" AS next_action, "Blocker" AS blocker, "완료증빙" AS evidence FROM "collection://${ds.task}" WHERE "Task명" LIKE '%${safe}%' ORDER BY operational_task_id`;
      return sql(ds.task, q, "find_tasks");
    },

    async read_task_state(args) { return this.find_tasks(args); },

    // ---- Write (기본 차단) ---------------------------------------------
    build_test_request_payload({ title, properties }) {
      return { tool: CREATE_TOOL, parent: { type: "data_source_id", data_source_id: ds.request }, pages: [{ properties: { "요청명": title, ...properties } }] };
    },
    build_test_task_payload({ title, properties }) {
      return { tool: CREATE_TOOL, parent: { type: "data_source_id", data_source_id: ds.task }, pages: [{ properties: { "Task명": title, ...properties } }] };
    },
    async preview_property_updates(changes = []) {
      record("preview_property_updates", RESULT.OK, { count: changes.length });
      return ok({ planned_write_count: changes.length, changes, actual_write_count: 0 });
    },
    async preview_write(changes) { return this.preview_property_updates(changes); },

    async commit_write({ guard, payloads = [] }) {
      if (operatingWrite) return fail(RESULT.APPROVAL_REQUIRED, "operating write is forbidden");
      if (!guard?.allowed) { record("commit_write", RESULT.APPROVAL_REQUIRED, { error_code: guard?.code }); return fail(RESULT.APPROVAL_REQUIRED, guard?.detail ?? "guard blocked"); }
      if (writeMode !== WRITE_MODE.TEST_WRITE) { record("commit_write", RESULT.READ_ONLY, { error_code: `MODE_${writeMode}` }); return fail(RESULT.READ_ONLY, `write_mode=${writeMode}`); }
      const denied = requireInvoke(invoke, "commit_write");
      if (denied) return denied;
      const bad = payloads.find((p) => !allowedPrefixes.some((pre) => String(p?.pages?.[0]?.properties?.["요청명"] ?? p?.pages?.[0]?.properties?.["Task명"] ?? "").startsWith(pre)));
      if (allowedPrefixes.length && bad) return fail(RESULT.APPROVAL_REQUIRED, "payload outside allowed TEST prefix");
      const created = [];
      for (const p of payloads) {
        const res = await invoke(p.tool, { parent: p.parent, pages: p.pages });
        created.push({ id: maskIdentifier(res?.pages?.[0]?.id ?? "") });
      }
      record("commit_write", RESULT.OK, { count: created.length });
      return ok({ write_count: created.length, records: created });
    },

    async commit_approved_test_write(args) { return this.commit_write(args); },
    async requery(args) { return this.find_tasks(args); },
    async requery_and_verify({ titleContains, expected }) {
      const tasks = await this.find_tasks({ titleContains });
      if (tasks.result !== RESULT.OK) return tasks;
      const actual = { task_count: tasks.data.length, completed: tasks.data.filter((t) => t.state === "완료").length };
      return ok({ actual, expected, match: JSON.stringify(actual) === JSON.stringify(expected) });
    },
    async verify(args) { return this.requery_and_verify(args); },

    async manager_share_query({ titleContains }) {
      const res = await this.find_tasks({ titleContains });
      if (res.result !== RESULT.OK) return res;
      return ok(res.data.filter((t) => t.state === "진행 중"));
    },
    async fund_tracking_query({ titleContains }) { return this.find_requests({ titleContains }); },

    async list_evidence() { return unsupported("list_evidence (use drive provider)"); },
    async fetch_metadata() { return unsupported("fetch_metadata (use drive provider)"); },
    async fetch_document() { return unsupported("fetch_document (use drive provider)"); },
    async close() { return ok({ audit_entries: audit.length }); }
  };
}
