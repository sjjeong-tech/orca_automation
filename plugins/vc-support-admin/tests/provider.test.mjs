#!/usr/bin/env node
// Provider·Kernel Test — 실제 MCP 연결 없이 fixture invoke로 계약을 검증한다.

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createNotionProvider } from "../providers/notion.mjs";
import { createDriveProvider } from "../providers/drive.mjs";
import { createSlackProvider } from "../providers/slack.mjs";
import { assertProviderShape, RESULT, PROVIDER_OPERATIONS } from "../providers/base.mjs";
import { maskString, maskIdentifier, sanitize, auditLog, assertNoSensitive } from "../kernel/sanitize.mjs";
import { guardWrite, parseApproval, calculateDuplicateKey, compareExpectedActual, WRITE_MODE } from "../kernel/guards.mjs";
import { parseFieldworkFilename, matchSubmissionToReceipt, detectInvalidEvidence } from "../kernel/filename.mjs";
import { calculateTaskState } from "../kernel/state.mjs";
import { classifyEvidence, identifyDocument } from "../kernel/evidence.mjs";
import { buildProviders, healthCheck, loadDocumentProfiles } from "../index.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));

const CFG = {
  notion: { data_sources: { fund_master: "ds-fund", fund_work: "ds-work", request: "ds-req", task: "ds-task" },
            write_mode: WRITE_MODE.PREVIEW_ONLY, allowed_prefixes: ["[TEST][X]"], operating_write_enabled: false },
  drive: { allow_broad_search: false }, slack: {}
};

// ---------------------------------------------------------------- 1. Interface
const provs = buildProviders({ runtime_config: CFG, invokers: {} });
for (const [n, p] of Object.entries(provs)) assertProviderShape(p, n);
assert.equal(PROVIDER_OPERATIONS.length, 13);
console.log("provider interface: PASS (3 providers expose all 13 standard operations)");

// ---------------------------------------------------------------- 2. invoke 미주입 = 무단 호출 차단
const noInvoke = createNotionProvider({ config: CFG.notion });
const denied = await noInvoke.search_records({ source: "request", where: "SELECT 1" });
assert.equal(denied.result, RESULT.ACCESS_DENIED);
const hc = await noInvoke.health_check();
assert.equal(hc.data.invoke_injected, false);
console.log("no-invoke guard: PASS (access denied without injected transport)");

// ---------------------------------------------------------------- 3. Config 누락
const noCfg = createNotionProvider({ config: {}, invoke: async () => ({ results: [] }) });
const missing = await noCfg.search_records({ source: "request", where: "SELECT 1" });
assert.equal(missing.result, RESULT.NOT_FOUND);
console.log("config guard: PASS (missing data source reported, not guessed)");

// ---------------------------------------------------------------- 4. Fixture invoke = read 정규화
const calls = [];
const notion = createNotionProvider({
  config: CFG.notion,
  invoke: async (tool, params) => {
    calls.push(tool);
    if (tool === "notion-query-data-sources") {
      const q = params.data.query;
      if (q.includes("조합명")) return { results: [{ "조합명": "샘플 조합", "조합구분": "민법", "고유번호": null, "조합 Root 폴더": "https://drive.google.com/drive/folders/FAKEROOTID" }] };
      if (q.includes("Operational Task ID")) return { results: [{ operational_task_id: "P03-T01", state: "진행 중", actor: "지원팀", next_action: "확인", blocker: "", evidence: "" }] };
      return { results: [{ url: "u", "요청명": "[TEST][X] 샘플" }] };
    }
    return {};
  }
});
const funds = await notion.resolve_fund_master("샘플 조합");
assert.equal(funds.result, RESULT.OK);
assert.equal(funds.data.length, 1);
assert.equal(funds.data[0].fund_type, "민법");
assert.equal(funds.data[0].tax_id, null);
const tasks = await notion.find_tasks({ titleContains: "[TEST][X]" });
assert.equal(tasks.data[0].operational_task_id, "P03-T01");
console.log("notion read normalization: PASS (fund + task rows normalized)");

// ---------------------------------------------------------------- 5. Write Guard 4-mode
const approved = parseApproval("P03-T01을 완료로 변경", { ambiguousPhrases: ["네"] });
assert.equal(approved.approved, true);
assert.equal(guardWrite({ approval: approved, writeMode: WRITE_MODE.READ_ONLY, targetTitle: "[TEST][X] a", allowedPrefixes: ["[TEST][X]"] }).allowed, false);
assert.equal(guardWrite({ approval: approved, writeMode: WRITE_MODE.PREVIEW_ONLY, targetTitle: "[TEST][X] a", allowedPrefixes: ["[TEST][X]"] }).allowed, false);
assert.equal(guardWrite({ approval: approved, writeMode: WRITE_MODE.TEST_WRITE, targetTitle: "[TEST][X] a", allowedPrefixes: ["[TEST][X]"] }).allowed, true);
const opw = guardWrite({ approval: approved, writeMode: WRITE_MODE.OPERATING_WRITE, targetTitle: "[TEST][X] a", allowedPrefixes: ["[TEST][X]"] });
assert.equal(opw.allowed, false); assert.equal(opw.code, "OPERATING_WRITE_FORBIDDEN");
assert.equal(guardWrite({ approval: approved, writeMode: WRITE_MODE.TEST_WRITE, operatingWriteEnabled: true }).code, "OPERATING_WRITE_FORBIDDEN");
assert.equal(guardWrite({ approval: approved, writeMode: WRITE_MODE.TEST_WRITE, targetTitle: "운영 Record", allowedPrefixes: ["[TEST][X]"] }).code, "PREFIX_NOT_ALLOWED");
assert.equal(guardWrite({ approval: { approved: false }, writeMode: WRITE_MODE.TEST_WRITE }).code, "APPROVAL_REQUIRED");
assert.equal(guardWrite({ approval: approved, writeMode: WRITE_MODE.TEST_WRITE, targetTitle: "[TEST][X] a", allowedPrefixes: ["[TEST][X]"], reuseExisting: true }).code, "REUSE_EXISTING");
console.log("write guard: PASS (4 modes + operating forced off + prefix + approval + reuse)");

// ---------------------------------------------------------------- 6. commit_write 차단
const blocked = await notion.commit_write({ guard: { allowed: false, code: "APPROVAL_REQUIRED" }, payloads: [] });
assert.equal(blocked.result, RESULT.APPROVAL_REQUIRED);
const modeBlocked = await notion.commit_write({ guard: { allowed: true }, payloads: [] });
assert.equal(modeBlocked.result, RESULT.READ_ONLY); // preview_only
console.log("commit guard: PASS (blocked by approval and by write_mode)");

// ---------------------------------------------------------------- 7. Drive read-only + rejection
const drive = createDriveProvider({
  config: CFG.drive,
  invoke: async () => ({ files: [
    { title: "##합본_샘플_고유번호증 신청서류.pdf", fileExtension: "pdf", fileSize: "1000", mimeType: "application/pdf", modifiedTime: "2026-07-02T00:00:00Z", id: "FAKE1" },
    { title: "#샘플_고유번호증 접수증.pdf", fileExtension: "pdf", fileSize: "500", mimeType: "application/pdf", modifiedTime: "2026-07-02T00:00:00Z", id: "FAKE2" },
    { title: "샘플_보안카드.lnk", fileExtension: "lnk", fileSize: "552", mimeType: "application/x-ms-shortcut", id: "FAKE3" },
    { title: "인감증명서.txt", fileExtension: "txt", fileSize: "0", mimeType: "text/plain", id: "FAKE4" }] }),
  classificationRules: read("plugins/vc-support-admin/adapters/drive.yaml").evidence_classification,
  documentProfiles: loadDocumentProfiles()
});
assert.equal((await drive.preview_write()).result, RESULT.READ_ONLY);
assert.equal((await drive.commit_write()).result, RESULT.READ_ONLY);
assert.equal((await drive.fetch_document()).result, RESULT.TOOL_LIMITATION);
assert.equal((await drive.search_records("title contains 'x'")).result, RESULT.ACCESS_DENIED); // broad search off
const noRoot = await drive.resolve_fund_root({ root_folder: null });
assert.equal(noRoot.result, RESULT.NOT_FOUND);
const listed = await drive.list_by_parent("PARENT");
assert.equal(listed.result, RESULT.OK);
const ev = drive.classify_evidence(listed.data);
assert.equal(ev.find((e) => e.name.endsWith(".lnk")).counts_as_evidence, false);
assert.equal(ev.find((e) => e.name.endsWith(".txt")).counts_as_evidence, false);
assert.ok(ev.some((e) => e.type === "RECEIPT" && e.counts_as_evidence));
assert.equal(drive.sanitize_output(listed.data).every((f) => !("_id" in f)), true);
console.log("drive provider: PASS (read-only, broad-search off, shortcut/zero-byte rejected, ids stripped)");

// ---------------------------------------------------------------- 8. Slack send 강제 차단
const slack = createSlackProvider({ config: { send_enabled: true } }); // 구성값이 true여도
assert.equal(slack.send_enabled, false);
assert.equal((await slack.commit_write()).result, RESULT.READ_ONLY);
assert.equal((await slack.health_check()).data.send_enabled, false);
assert.ok(slack.build_preview_payload({ manager_share_preview: { active_tasks: [] }, evidence_summary: { counted_types: [], rejected: [] }, preview: { planned_write_count: 0 }, approval_required: true }).text.includes("[Preview]"));
console.log("slack provider: PASS (send forced off even when config enables it)");

// ---------------------------------------------------------------- 9. Sanitizer
assert.equal(maskString("page 123e4567-e89b-12d3-a456-426614174000"), "page <uuid>");
assert.ok(maskString("https://drive.google.com/drive/folders/ABC").includes("<drive-url>"));
assert.ok(maskString("주민 900101-1234567").includes("<rrn>"));
assert.ok(maskString("사업자 123-45-67890").includes("<biz-no>"));
assert.equal(maskString("고유번호증 신청서류 합본"), "고유번호증 신청서류 합본"); // 과도 마스킹 없음
assert.equal(maskString("P03-T01 진행 중"), "P03-T01 진행 중");
assert.equal(maskIdentifier("abcdefghijklmnop"), "abcd…mnop");
assert.deepEqual(Object.keys(auditLog({ provider: "notion", operation: "x", result: "OK" })).sort(),
  ["count", "elapsed_ms", "error_code", "masked_identifier", "operation", "provider", "result"]);
assert.throws(() => assertNoSensitive("https://drive.google.com/drive/folders/X"));
assert.ok(sanitize({ a: "id 123e4567-e89b-12d3-a456-426614174000" }).a.includes("<uuid>"));
console.log("sanitizer: PASS (masks ids/urls/PII, preserves business text, audit fields limited)");

// ---------------------------------------------------------------- 10. 파일명 문법·무효 규칙
const fw = parseFieldworkFilename("##합본_샘플조합_고유번호증 신청서류(규약 미포함).pdf");
assert.equal(fw.prefix, "##합본_"); assert.equal(fw.qualifier, "규약 미포함"); assert.equal(fw.is_institution_result, false);
assert.equal(parseFieldworkFilename("샘플조합_고유번호증.pdf").is_institution_result, true);
assert.equal(parseFieldworkFilename("(x)양식_체크리스트.hwp.pdf").discarded, true);
const pairs = matchSubmissionToReceipt([{ name: "##합본_A_고유번호증 신청서류.pdf" }, { name: "#A_고유번호증 접수증.pdf" }]);
assert.equal(pairs.find((p) => p.matched)?.matched, true);
const inv = detectInvalidEvidence([
  { name: "(x)양식.pdf", size: 10 }, { name: "a.lnk", extension: "lnk", size: 5 },
  { name: "b.txt", extension: "txt", size: 0 },
  { name: "#A_고유번호증 접수증.pdf", size: 10 }, { name: "#A_고유번호증 접수증(취하 후 재접수).pdf", size: 10 }]);
assert.ok(inv.some((f) => f.rule === "DISCARDED_MARKER"));
assert.ok(inv.some((f) => f.rule === "SHORTCUT"));
assert.ok(inv.some((f) => f.rule === "ZERO_BYTE"));
assert.ok(inv.some((f) => f.rule === "SUPERSEDED_BY_QUALIFIER"));
console.log("filename grammar: PASS (prefix semantics, pairing, 4 invalid-evidence rules)");

// ---------------------------------------------------------------- 11. Document Profile 재사용
const profiles = loadDocumentProfiles();
assert.equal(profiles.length, 6);
assert.equal(profiles.every((p) => p.alone_completes_task === false), true);
const idA = identifyDocument({ name: "#조합가_고유번호증 접수증.pdf", extension: "pdf" }, profiles);
const idB = identifyDocument({ name: "#전혀다른조합_고유번호증 접수증.pdf", extension: "pdf" }, profiles);
assert.equal(idA.profile_id, "tax_office_receipt");
assert.equal(idB.profile_id, "tax_office_receipt"); // 다른 조합에 동일 Profile 재사용
assert.equal(identifyDocument({ name: "조합_고유번호증.pdf", extension: "pdf" }, profiles).profile_id, "tax_id_certificate_issued");
assert.equal(identifyDocument({ name: "설명서.txt", extension: "txt" }, profiles), null); // 추정하지 않음
console.log("document profile reuse: PASS (6 profiles, cross-fund identification, no guessing)");

// ---------------------------------------------------------------- 12. Task State — 자동 완료 금지
const contract = read("skills/e2e03-tax-id-application/contract.yaml");
const st = calculateTaskState({
  taskIds: contract.operational_task_ids, rules: contract.evidence_to_task_rules,
  evidenceSummary: { counted_types: ["SUBMISSION_PACKAGE", "RECEIPT", "RESULT_DOCUMENT", "SUPPLEMENT"] },
  maxAutoState: contract.human_confirmation_rules.max_auto_state
});
assert.equal(st.filter((s) => s.state_candidate === "완료").length, 0);
assert.equal(st.every((s) => s.requires_human_confirmation), true);
console.log("task state engine: PASS (full evidence still yields 0 auto-completions)");

// ---------------------------------------------------------------- 13. Expected–Actual
const cmp = compareExpectedActual({ task_count: 6, completed: 0 }, { task_count: 6, completed: 0 });
assert.equal(cmp.pass, true);
assert.equal(compareExpectedActual({ task_count: 6 }, { task_count: 5 }).mismatches, 1);
console.log("expected-actual: PASS");

// ---------------------------------------------------------------- 14. Health check
const health = await healthCheck(buildProviders({ runtime_config: CFG, invokers: { notion: async () => ({ results: [] }), drive: async () => ({ files: [] }) } }));
assert.equal(health.notion.healthy, true);
assert.equal(health.notion.operating_write_enabled, false);
assert.equal(health.drive.write_enabled, false);
assert.equal(health.slack.send_enabled, false);
console.log("health check: PASS (notion ready, drive read-only, slack send disabled)");

// ---------------------------------------------------------------- 15. Config example: 실제 값 없음
const cfgEx = read("plugins/vc-support-admin/config.example.yaml");
assert.equal(cfgEx.notion.write_mode, "preview_only");
assert.equal(cfgEx.notion.operating_write_enabled, false);
assert.equal(cfgEx.slack.send_enabled, false);
assert.equal(cfgEx.drive.allow_broad_search, false);
assert.ok(Object.values(cfgEx.notion.data_sources).every((v) => v.startsWith("<") && v.endsWith(">")));
console.log("config example: PASS (placeholders only, safe defaults)");

console.log("\nALL PROVIDER TESTS PASS");
