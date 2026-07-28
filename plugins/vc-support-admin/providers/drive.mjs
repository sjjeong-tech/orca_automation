// Drive MCP Provider — Folder·File ID는 config/Notion Property 주입, 소스에 없음.

import { RESULT, ok, fail, unsupported, requireInvoke } from "./base.mjs";
import { auditLog, maskIdentifier } from "../kernel/sanitize.mjs";
import { classifyEvidence, summarizeEvidence, identifyDocument } from "../kernel/evidence.mjs";

const SEARCH_TOOL = "search_files";
const META_TOOL = "get_file_metadata";

export function createDriveProvider({ config = {}, invoke, classificationRules = [], documentProfiles = [], logger = () => {} } = {}) {
  const audit = [];
  const allowBroad = config.allow_broad_search === true;
  const record = (operation, result, extra = {}) => {
    const entry = auditLog({ provider: "drive", operation, result, ...extra });
    audit.push(entry); logger(entry); return entry;
  };

  async function query(q, operation, pageSize = 100) {
    const denied = requireInvoke(invoke, operation);
    if (denied) { record(operation, denied.result); return denied; }
    const started = Date.now();
    try {
      const res = await invoke(SEARCH_TOOL, { query: q, pageSize, excludeContentSnippets: true });
      const files = (res?.files ?? []).map((f) => ({
        name: f.title ?? f.name ?? "",
        extension: (f.fileExtension ?? "").toLowerCase(),
        size: Number(f.fileSize ?? 0),
        mime: f.mimeType ?? null,
        modified: f.modifiedTime ?? null,
        is_folder: (f.mimeType ?? "").endsWith("folder"),
        _id: f.id ?? null
      }));
      record(operation, RESULT.OK, { count: files.length, elapsed_ms: Date.now() - started });
      return ok(files);
    } catch (error) {
      record(operation, RESULT.ACCESS_DENIED, { error_code: "SEARCH_FAILED", elapsed_ms: Date.now() - started });
      return fail(RESULT.ACCESS_DENIED, "drive query failed");
    }
  }

  return {
    name: "drive",
    audit,

    async initialize() { return ok({ broad_search_allowed: allowBroad, profiles: documentProfiles.length }); },

    async health_check() {
      const invokeReady = typeof invoke === "function";
      record("health_check", invokeReady ? RESULT.OK : RESULT.ACCESS_DENIED);
      return ok({ healthy: invokeReady, invoke_injected: invokeReady, write_enabled: false, content_read_enabled: false });
    },

    async fetch_schema() { return unsupported("fetch_schema"); },

    async list_by_parent(parentId) {
      if (!parentId) return fail(RESULT.NOT_FOUND, "parentId required");
      return query(`parentId = '${parentId}'`, "list_by_parent");
    },
    async list_folder(parentId) { return this.list_by_parent(parentId); },
    async list_root(rootId) { return this.list_by_parent(rootId ?? config.fieldwork_root); },

    /** Fund Root는 Notion FUND Property에서 온다. Drive 광역검색으로 추정하지 않는다. */
    async resolve_fund_root(fund) {
      const url = fund?.root_folder ?? null;
      if (!url) { record("resolve_fund_root", RESULT.NOT_FOUND, { error_code: "ROOT_NOT_SET" }); return fail(RESULT.NOT_FOUND, "fund root folder is not set on the FUND record"); }
      const id = String(url).split("/").filter(Boolean).pop();
      record("resolve_fund_root", RESULT.OK, { identifier: id });
      return ok({ root_id: id, masked: maskIdentifier(id) });
    },

    async search_records(q) {
      if (!allowBroad) { record("search_records", RESULT.ACCESS_DENIED, { error_code: "BROAD_SEARCH_DISABLED" }); return fail(RESULT.ACCESS_DENIED, "broad search disabled; use parentId traversal"); }
      return query(q, "search_records");
    },

    async fetch_metadata(fileId) {
      const denied = requireInvoke(invoke, "fetch_metadata");
      if (denied) return denied;
      const res = await invoke(META_TOOL, { fileId, excludeContentSnippets: true });
      record("fetch_metadata", RESULT.OK, { identifier: fileId });
      return ok({ name: res?.title ?? "", size: Number(res?.fileSize ?? 0), extension: (res?.fileExtension ?? "").toLowerCase(), modified: res?.modifiedTime ?? null });
    },
    async fetch_record(fileId) { return this.fetch_metadata(fileId); },

    /** 지정된 parent들만 순회한다. 광역검색은 기본 비활성. */
    async list_evidence({ parents = [], fund = null } = {}) {
      const targets = [...parents];
      if (fund) {
        const root = await this.resolve_fund_root(fund);
        if (root.result === RESULT.OK) targets.push(root.data.root_id);
      }
      if (!targets.length) return fail(RESULT.NOT_FOUND, "no parent folder resolved");
      const all = [];
      for (const p of targets) {
        const res = await this.list_by_parent(p);
        if (res.result === RESULT.OK) all.push(...res.data.filter((f) => !f.is_folder));
      }
      return ok(all);
    },

    classify_file(file) {
      const [c] = classifyEvidence([file], classificationRules);
      const profile = identifyDocument(file, documentProfiles);
      return { ...c, profile };
    },
    classify_folder(folder) {
      const n = folder?.name ?? "";
      if (/^\d{4}$/.test(n)) return "DAILY_FIELDWORK_FOLDER";
      if (/^\d{4}\.\d{2}$/.test(n)) return "MONTHLY_ARCHIVE";
      if (n.includes("기타")) return "COMMON_ASSET_FOLDER";
      if (/계좌|고유번호|결성|운영/.test(n)) return "PROCESS_WORKING_FOLDER";
      return "OTHER";
    },
    classify_evidence(files) { return classifyEvidence(files, classificationRules); },
    build_evidence_summary(files) { return summarizeEvidence(classifyEvidence(files, classificationRules)); },
    build_document_profile(file) { return identifyDocument(file, documentProfiles); },

    reject_shortcut(file) { return (file?.extension ?? "").toLowerCase() === "lnk"; },
    reject_zero_byte(file) { return Number(file?.size ?? 0) === 0; },
    detect_duplicate(files = []) {
      const byName = new Map();
      const dups = [];
      for (const f of files) { const k = f.name; if (byName.has(k)) dups.push(k); else byName.set(k, f); }
      return [...new Set(dups)];
    },
    detect_stale(files = [], type) {
      const same = files.filter((f) => f.type === type && f.modified).sort((a, b) => String(b.modified).localeCompare(String(a.modified)));
      return same.length > 1 ? { latest: same[0].name, older: same.slice(1).map((f) => f.name), human_check_required: true } : null;
    },
    sanitize_output(files = []) { return files.map(({ _id, ...rest }) => rest); },

    async fetch_document() { return fail(RESULT.TOOL_LIMITATION, "본문 열람은 사람 확인 범위. 메타데이터만 사용한다."); },
    async preview_write() { return fail(RESULT.READ_ONLY, "drive provider is read-only"); },
    async commit_write() { return fail(RESULT.READ_ONLY, "drive provider is read-only"); },
    async requery(args) { return this.list_evidence(args); },
    async verify() { return unsupported("verify"); },
    async close() { return ok({ audit_entries: audit.length }); }
  };
}
