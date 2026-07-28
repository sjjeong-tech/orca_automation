#!/usr/bin/env node
// Security Regression — Codex 재감사(4c0cf88) 필수 10건 + 추가 항목.
// 실제 Connector 호출 0. 모든 Write는 in-memory spy로만 계수한다.

import assert from "node:assert/strict";
import { buildPreview, buildApproval, computePreviewHash, validateApproval, draftApprovalIntentFromText } from "../kernel/preview.mjs";
import { guardTestWrite, validateRuntimeConfig, GUARD_CODE } from "../kernel/writeguard.mjs";
import { createTransaction, createTransactionStore, runTransaction, verifyExpectedActual, TX_STATUS } from "../kernel/transaction.mjs";
import { DOMAIN_ERROR, normalizeTransportError, isAutoWriteRetryAllowed } from "../kernel/errors.mjs";
import { createSessionToolBridge, buildBridgeRequest, BRIDGE_STATUS } from "../providers/bridge.mjs";
import { createNotionProvider } from "../providers/notion.mjs";
import { WRITE_MODE } from "../kernel/guards.mjs";
import { maskString } from "../kernel/sanitize.mjs";

const TEST_DS = "ds-test-task";
const OPERATING_DS = "ds-operating-task";
const CFG = {
  write_mode: WRITE_MODE.TEST_WRITE, operating_write_enabled: false,
  test_data_sources: [TEST_DS], allowed_prefixes: ["[TEST][SEC]"],
  allowed_processes: ["P03"], allowed_actions: ["set_task_status"]
};
const NOW = Date.parse("2026-07-28T00:00:00Z");

function mkPreview(over = {}) {
  return buildPreview({
    transaction_id: "tx_sec_001", process_id: "P03", request_ref: "req_1", task_ref: "P03-T01",
    target_data_source: TEST_DS, target_record: "rec_1", target_property: "Task 상태",
    current_value: "시작 전", proposed_value: "진행 중", action: "set_task_status", write_scope: "task_status",
    now: NOW, ...over
  });
}
const okApproval = (pv, over = {}) => buildApproval({ preview: pv, approval_actor: "user:tester", now: NOW, ...over });
const guard = (pv, ap, over = {}) => guardTestWrite({ preview: pv, approval: ap, runtimeConfig: CFG, targetRecordTitle: "[TEST][SEC] Task", now: NOW, ...over });

// writeSpy 기반 Provider — guard가 막으면 호출이 0이어야 한다.
function spyProvider({ failAtIndex = null, throwErr = null } = {}) {
  const writes = []; const calls = [];
  const provider = createNotionProvider({
    config: { data_sources: { request: TEST_DS, task: TEST_DS }, write_mode: WRITE_MODE.TEST_WRITE, allowed_prefixes: ["[TEST][SEC]"] },
    invoke: async (tool, params) => {
      calls.push(tool);
      if (tool === "notion-create-pages") {
        if (throwErr) throw throwErr;
        if (failAtIndex !== null && writes.length === failAtIndex) throw Object.assign(new Error("create failed"), { code: "PROVIDER_ERROR" });
        writes.push(tool);
        return { pages: [{ id: `id_${writes.length}` }] };
      }
      return { results: [] };
    }
  });
  return { provider, writes, calls };
}
const payload = (n) => ({ tool: "notion-create-pages", parent: { data_source_id: TEST_DS }, step: `task_${n}`, pages: [{ properties: { "Task명": `[TEST][SEC] T0${n}` } }] });

const results = [];
const rec = (n, name, cond, extra = "") => { assert.ok(cond, `#${n} ${name} FAILED`); results.push(`#${n} ${name} PASS ${extra}`); };

// ── 1. Task ID + 진행해줘 → Write 0 ─────────────────────────────────────────
const d1 = draftApprovalIntentFromText("P03-T02 진행해줘");
const s1 = spyProvider();
const g1 = guardTestWrite({ preview: mkPreview(), approval: null, runtimeConfig: CFG, targetRecordTitle: "[TEST][SEC] Task", now: NOW });
rec(1, "task-id + action phrase blocked", d1.is_approval === false && g1.allowed === false && g1.code === GUARD_CODE.BLOCKED_APPROVAL && s1.writes.length === 0, `code=${g1.code} writes=0`);

// ── 2. Preview Hash 불일치 → Provider 이전 차단 ─────────────────────────────
const pv2 = mkPreview();
const ap2 = okApproval(pv2); ap2.preview_hash = "deadbeef";
const s2 = spyProvider();
const g2 = guard(pv2, ap2);
if (g2.allowed) await s2.provider.commit_write({ guard: g2, payloads: [payload(1)] });
rec(2, "preview hash mismatch blocked before provider", g2.allowed === false && s2.calls.length === 0 && s2.writes.length === 0, `code=${g2.code} calls=0`);

// ── 3. Preview 이후 Current Value 변경 → 차단 ───────────────────────────────
const pv3 = mkPreview(); const ap3 = okApproval(pv3);
const s3 = spyProvider();
const g3 = guard(pv3, ap3, { currentValueNow: "진행 중" });
if (g3.allowed) await s3.provider.commit_write({ guard: g3, payloads: [payload(1)] });
rec(3, "current value changed blocked", g3.allowed === false && /CURRENT_VALUE_CHANGED/.test(g3.detail) && s3.calls.length === 0, "calls=0");

// ── 4. 운영 Data Source → Provider 호출 0 ───────────────────────────────────
const pv4 = mkPreview({ target_data_source: OPERATING_DS });
const s4 = spyProvider();
const g4 = guard(pv4, okApproval(pv4));
if (g4.allowed) await s4.provider.commit_write({ guard: g4, payloads: [payload(1)] });
rec(4, "operating data source blocked", g4.allowed === false && g4.code === GUARD_CODE.BLOCKED_DATA_SOURCE && s4.calls.length === 0, `code=${g4.code}`);

// ── 5. TEST Prefix 없는 Record → Provider 호출 0 ────────────────────────────
const pv5 = mkPreview();
const s5 = spyProvider();
const g5 = guard(pv5, okApproval(pv5), { targetRecordTitle: "운영 Task" });
if (g5.allowed) await s5.provider.commit_write({ guard: g5, payloads: [payload(1)] });
rec(5, "record without TEST prefix blocked", g5.allowed === false && g5.code === GUARD_CODE.BLOCKED_RECORD_SCOPE && s5.calls.length === 0, `code=${g5.code}`);

// ── 6. Request 성공 + Task 일부 실패 → PARTIAL_WRITE, 후속 Write 0 ──────────
const s6 = spyProvider({ failAtIndex: 3 }); // request 1 + task 2건 성공 후 실패
const tx6 = createTransaction({ transaction_id: "tx6", transaction_type: "create_request_tasks", process_id: "P03", expected_task_ids: ["P03-T01", "P03-T02", "P03-T03"] });
const r6 = await s6.provider.commit_write({ guard: { allowed: true }, payloads: [payload(0), payload(1), payload(2), payload(3), payload(4)] });
rec(6, "partial write ledger and stop", r6.result === DOMAIN_ERROR.PARTIAL_WRITE && r6.created_records.length === 3 && r6.failed_step === "task_3" && r6.next_write_allowed === false && r6.auto_write_retry === false && s6.writes.length === 3,
  `created=${r6.created_records.length} failed_step=${r6.failed_step}`);

// ── 7. Requery 불일치 → EXPECTED_ACTUAL_MISMATCH, 성공 처리 0 ───────────────
const v7 = verifyExpectedActual({ task_count: 6, completed: 0 }, { task_count: 5, completed: 0 });
const p7 = createNotionProvider({ config: { data_sources: { task: TEST_DS }, write_mode: WRITE_MODE.TEST_WRITE }, invoke: async () => ({ results: [{ operational_task_id: "P03-T01", state: "진행 중" }] }) });
const r7 = await p7.requery_and_verify({ titleContains: "[TEST][SEC]", expected: { task_count: 6, completed: 0 } });
rec(7, "requery mismatch fails closed", v7.ok === false && v7.error_code === DOMAIN_ERROR.EXPECTED_ACTUAL_MISMATCH && r7.result === DOMAIN_ERROR.EXPECTED_ACTUAL_MISMATCH && r7.next_write_allowed === false, `mismatches=${v7.mismatches}`);

// ── 8. Connection 종료 → 정규화·중단·Handoff ────────────────────────────────
const err8 = Object.assign(new Error("socket hang up"), { code: "ECONNRESET" });
const s8 = spyProvider({ throwErr: err8 });
const r8 = await s8.provider.commit_write({ guard: { allowed: true }, payloads: [payload(0)] });
const tx8 = createTransaction({ transaction_id: "tx8", transaction_type: "t", process_id: "P03" });
const run8 = await runTransaction(tx8, [{ name: "write", run: async () => { throw err8; } }]);
rec(8, "connection closed normalized and stopped", r8.result === DOMAIN_ERROR.CONNECTION_CLOSED && run8.error_code === DOMAIN_ERROR.CONNECTION_CLOSED && run8.handoff?.next_owner === "USER" && run8.next_write_allowed === false, `code=${r8.result}`);

// ── 9. Rate Limit → 자동 Write 재시도 0 ─────────────────────────────────────
const err9 = Object.assign(new Error("429 too many requests"), { code: "RATE_LIMIT" });
const s9 = spyProvider({ throwErr: err9 });
const r9 = await s9.provider.commit_write({ guard: { allowed: true }, payloads: [payload(0)] });
rec(9, "rate limit no auto write retry", r9.result === DOMAIN_ERROR.RATE_LIMIT && s9.writes.length === 0 && isAutoWriteRetryAllowed() === false && r9.auto_write_retry === false, `attempts=${s9.calls.length}`);

// ── 10. 동일 Transaction 재실행 → 신규 Record 0 ─────────────────────────────
const store = createTransactionStore();
const tx10 = createTransaction({ transaction_id: "tx10", transaction_type: "t", process_id: "P03" });
tx10.status = TX_STATUS.COMPLETED; tx10.created_records = [{ id: "a" }];
store.put("dupkey", tx10);
const replay = store.checkReplay("dupkey");
const s10 = spyProvider();
if (replay.write_allowed) await s10.provider.commit_write({ guard: { allowed: true }, payloads: [payload(0)] });
rec(10, "transaction replay is no-op", replay.replay === true && replay.decision === TX_STATUS.NO_OP && replay.write_allowed === false && s10.writes.length === 0, "writes=0");

console.log("\n== 필수 보안 테스트 10건 ==");
results.forEach((r) => console.log("  " + r));

// ── 추가 필수 테스트 ────────────────────────────────────────────────────────
const add = [];
const A = (name, cond, extra = "") => { assert.ok(cond, `${name} FAILED`); add.push(`${name} PASS ${extra}`); };

const pvExp = mkPreview({ ttl_ms: 1 });
A("approval expired", validateApproval({ preview: mkPreview(), approval: okApproval(mkPreview(), { ttl_ms: 1 }), now: NOW + 5000 }).error_code === "APPROVAL_EXPIRED");
A("preview expired", validateApproval({ preview: pvExp, approval: okApproval(pvExp), now: NOW + 5000 }).error_code === "PREVIEW_EXPIRED");
const pvA = mkPreview(); const apNoActor = okApproval(pvA); apNoActor.approval_actor = null;
A("approval actor missing", validateApproval({ preview: pvA, approval: apNoActor, now: NOW }).error_code === "APPROVAL_ACTOR_MISSING");
const pvS = mkPreview(); const apScope = okApproval(pvS); apScope.approved_scope = "other_scope";
A("approval scope mismatch", validateApproval({ preview: pvS, approval: apScope, now: NOW }).error_code === "APPROVAL_SCOPE_MISMATCH");
const pvT = mkPreview(); const apTx = okApproval(pvT); apTx.transaction_id = "tx_other";
A("transaction mismatch", validateApproval({ preview: pvT, approval: apTx, now: NOW }).error_code === "APPROVAL_TRANSACTION_MISMATCH");
const pvTamper = mkPreview(); pvTamper.proposed_value = "완료"; // hash 재계산 불일치
A("preview tampered detected", validateApproval({ preview: pvTamper, approval: okApproval(mkPreview()), now: NOW }).error_code === "PREVIEW_TAMPERED");
A("test DS but operating prefix blocked", guard(mkPreview(), okApproval(mkPreview()), { targetRecordTitle: "운영 요청" }).code === GUARD_CODE.BLOCKED_RECORD_SCOPE);
const pvOp = mkPreview({ target_data_source: OPERATING_DS });
A("operating DS with TEST prefix blocked", guard(pvOp, okApproval(pvOp)).code === GUARD_CODE.BLOCKED_DATA_SOURCE);
const pvProc = mkPreview({ process_id: "P07" });
A("process outside allowlist blocked", guard(pvProc, okApproval(pvProc)).code === GUARD_CODE.BLOCKED_PROCESS);
const pvAct = mkPreview({ action: "delete_record" });
A("action outside allowlist blocked", guard(pvAct, okApproval(pvAct)).code === GUARD_CODE.BLOCKED_ACTION);
A("incomplete runtime config blocked", guardTestWrite({ preview: mkPreview(), approval: okApproval(mkPreview()), runtimeConfig: { write_mode: WRITE_MODE.TEST_WRITE }, now: NOW }).code === GUARD_CODE.BLOCKED_CONFIG);
A("preview_only blocks even with valid approval", guardTestWrite({ preview: mkPreview(), approval: okApproval(mkPreview()), runtimeConfig: { ...CFG, write_mode: WRITE_MODE.PREVIEW_ONLY }, targetRecordTitle: "[TEST][SEC] Task", now: NOW }).code === GUARD_CODE.BLOCKED_PREVIEW_ONLY);
A("operating_write_enabled forces block", guardTestWrite({ preview: mkPreview(), approval: okApproval(mkPreview()), runtimeConfig: { ...CFG, operating_write_enabled: true }, targetRecordTitle: "[TEST][SEC] Task", now: NOW }).code === GUARD_CODE.BLOCKED_OPERATING_WRITE);
A("valid typed approval passes guard", guard(mkPreview(), okApproval(mkPreview())).allowed === true);
const pUnknown = createNotionProvider({ config: { data_sources: { task: TEST_DS } }, invoke: async () => "not-an-object" });
A("unknown response shape", (await pUnknown.find_tasks({ titleContains: "x" })).result === DOMAIN_ERROR.NORMALIZATION_FAILED);
const pNull = createNotionProvider({ config: { data_sources: { task: TEST_DS } }, invoke: async () => null });
A("null response normalized", (await pNull.find_tasks({ titleContains: "x" })).result === DOMAIN_ERROR.UNKNOWN_RESPONSE);
A("only 5 tasks created is mismatch", verifyExpectedActual({ task_count: 6 }, { task_count: 5 }).error_code === DOMAIN_ERROR.EXPECTED_ACTUAL_MISMATCH);
A("duplicate OTID is mismatch", verifyExpectedActual({ distinct_otid: 6 }, { distinct_otid: 5 }).ok === false);
A("relation mismatch fails", verifyExpectedActual({ relations: 6 }, { relations: 4 }).ok === false);
A("partial transaction requires human recovery", (() => { const s = createTransactionStore(); const t = createTransaction({ transaction_id: "p", transaction_type: "t", process_id: "P03" }); t.status = TX_STATUS.PARTIAL_WRITE; s.put("k", t); const c = s.checkReplay("k"); return c.decision === "HUMAN_RECOVERY_REQUIRED" && c.write_allowed === false; })());
A("timeout normalized", normalizeTransportError(Object.assign(new Error("ETIMEDOUT"), { code: "ETIMEDOUT" })).error_code === DOMAIN_ERROR.TIMEOUT);
A("access denied normalized", normalizeTransportError(new Error("403 forbidden")).error_code === DOMAIN_ERROR.ACCESS_DENIED);
A("sanitizer keeps process ids", maskString("P03-T01 진행 중") === "P03-T01 진행 중");
A("sanitizer masks drive url", maskString(`x https://${["drive", "google", "com"].join(".")}/drive/folders/AAA`).includes("<drive-url>"));
A("preview hash is deterministic on core fields", computePreviewHash({ process_id: "P03", target_data_source: "a", target_record: "b", target_property: "c", current_value: 1, proposed_value: 2, action: "x", write_scope: "y", transaction_id: "t" }) === computePreviewHash({ process_id: "P03", target_data_source: "a", target_record: "b", target_property: "c", current_value: 1, proposed_value: 2, action: "x", write_scope: "y", transaction_id: "t" }));
A("preview hash ignores display text", (() => { const a = mkPreview(); const b = mkPreview(); b.generated_at = "different"; return computePreviewHash(a) === computePreviewHash(b); })());

// Bridge
const bridge = createSessionToolBridge({ invoke: async () => ({ results: [] }) });
const wreq = buildBridgeRequest({ provider: "notion", operation: "notion.create", payload: {}, write_intent: true });
const wres = await bridge.send(wreq);
A("write bridge disabled", wres.status === BRIDGE_STATUS.BLOCKED && wres.error_code === "WRITE_BRIDGE_DISABLED");
A("bridge never stores raw", wres.raw_response_stored === false && wres.sanitized === true);
A("bridge auto write retry off", wreq.retry_policy.auto_write_retry === false);
const ures = await bridge.send(buildBridgeRequest({ provider: "notion", operation: "notion.unknown_op", payload: {} }));
A("unknown operation unsupported", ures.status === BRIDGE_STATUS.UNSUPPORTED);
const rres = await bridge.send(buildBridgeRequest({ provider: "notion", operation: "notion.query", payload: {} }));
A("read bridge works", rres.status === BRIDGE_STATUS.OK && rres.normalized_status === "SUCCEEDED");

// Fixture hygiene
const fs = await import("node:fs"); const path = await import("node:path");
const url = await import("node:url");
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..", "..");
const liveSrc = fs.readFileSync(path.join(ROOT, "plugins/vc-support-admin/tests/live.test.mjs"), "utf8");
// 탐지 패턴은 문자열 조립으로 만든다 — 이 파일 자체가 실사례 노출로 오탐되지 않도록.
const DRIVE_HOST = ["drive", "google", "com"].join("\\.");
const REAL_CASE_TOKEN = String.fromCharCode(0xADF8, 0xB85C, 0xC2A4, 0xBE0C, 0xB9BF, 0xC9C0); // 실제 조합명 토큰
A("live fixture has no real drive url", !new RegExp(DRIVE_HOST).test(liveSrc));
A("live fixture has no real fund name", !liveSrc.includes(REAL_CASE_TOKEN));
A("live fixture has no drive file id", !/\b1[A-Za-z0-9_-]{30,}\b/.test(liveSrc));

console.log("\n== 추가 보안 테스트 " + add.length + "건 ==");
add.forEach((r) => console.log("  " + r));
console.log(`\nSECURITY TESTS: 10/10 mandatory PASS, ${add.length}/${add.length} additional PASS`);
