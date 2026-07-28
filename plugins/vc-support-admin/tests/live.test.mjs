#!/usr/bin/env node
// Provider Normalizer Scenario Test (합성 픽스처)
//
// 한계 고지: 이 Node Runtime은 MCP 서버를 직접 호출할 수 없다.
// 이 테스트는 **Connector를 호출하지 않는다.** Provider Normalizer와 도메인 로직만 검증한다.
// 검증 경로:
//   1) Provider가 호출 Payload(도구명·쿼리)를 생성
//   2) 주입된 fixture invoke가 응답 '형태'를 반환
//   3) Provider Normalizer가 도메인 결과로 정규화
//   4) Expected–Actual 대조
// 아래 SYNTHETIC_* 픽스처는 응답 스키마 형태만 재현한 **합성값**이다.
// 실제 조합명·Drive URL·File ID·Page ID·문서 원문은 포함하지 않는다(Codex P0-05 대응).
// 실제 raw 응답은 Git에 저장하지 않는다.

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createNotionProvider } from "../providers/notion.mjs";
import { createDriveProvider } from "../providers/drive.mjs";
import { createSlackProvider } from "../providers/slack.mjs";
import { RESULT } from "../providers/base.mjs";
import { compareExpectedActual, WRITE_MODE } from "../kernel/guards.mjs";
import { maskString } from "../kernel/sanitize.mjs";
import { processRequest, loadDocumentProfiles } from "../index.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));

// ---- 합성 픽스처 (실제 응답의 형태만 재현, 실데이터 없음) ----------------
const SYNTHETIC_FUND_ROWS = [{ "조합명": "TEST FUND ALPHA", "조합구분": "민법", "고유번호": null, "조합 Root 폴더": "synthetic://fund-root/TEST-FUND-ALPHA" }];
const SYNTHETIC_SHADOW_TASK_ROWS = [
  { operational_task_id: "P03-T01", state: "진행 중", actor: "지원팀", next_action: "요청정보·착수조건 확인 기록을 사람이 확정한다", blocker: "HUMAN_CONFIRMATION_REQUIRED — 운영 Request가 없어 착수조건 확인 기록을 Evidence로 대체할 수 없음", evidence: "[TEST SHADOW][Evidence 후보/미확정] FUND EXACT_1 매칭" },
  { operational_task_id: "P03-T02", state: "진행 중", actor: "지원팀", next_action: "서류 적합성·누락·최신본을 사람이 확인한다", blocker: "HUMAN_CONFIRMATION_REQUIRED — 서류 존재만으로 적합성 확정 불가", evidence: "[TEST SHADOW][Evidence 후보/미확정] SUBMISSION_PACKAGE 합본 1건" },
  { operational_task_id: "P03-T03", state: "진행 중", actor: "지원팀", next_action: "날인본 실물을 사람이 확인한다", blocker: "HUMAN_CONFIRMATION_REQUIRED — 날인본 여부는 파일명·메타데이터로 판정 불가", evidence: "[TEST SHADOW][Evidence 후보/미확정] 작성본 확인" },
  { operational_task_id: "P03-T04", state: "진행 중", actor: "지원팀", next_action: "접수증 본문의 조합명·접수일을 사람이 대조한다", blocker: "HUMAN_CONFIRMATION_REQUIRED — 본문 미열람으로 확정 불가", evidence: "[TEST SHADOW][Evidence 후보/미확정] RECEIPT 1건" },
  { operational_task_id: "P03-T05", state: "진행 중", actor: "지원팀", next_action: "발급본의 최신본·정정본 여부를 사람이 확인한다", blocker: "HUMAN_CONFIRMATION_REQUIRED — 최신본 여부와 실물 수령 사실 미확인", evidence: "[TEST SHADOW][Evidence 후보/미확정] RESULT_DOCUMENT 1건" },
  { operational_task_id: "P03-T06", state: "진행 중", actor: "지원팀", next_action: "관리역 전달 사실을 사람이 확인한다", blocker: "HUMAN_CONFIRMATION_REQUIRED — 관리역 전달 증빙 없음", evidence: "[TEST SHADOW][Evidence 후보/미확정] Fund Root 저장 확인(부분)" }];
const SYNTHETIC_SHADOW_REQUEST_ROWS = [{ url: "shadow", "요청명": "[TEST][E2E03-EVIDENCE-SHADOW] TEST FUND ALPHA — 고유번호증 신청", "요청 상태": "진행 중", "서류 상태": "전달 완료", "요청 업무 유형": "고유번호증 신청" }];
// Drive: Canonical Source Folder 실측 파일(메타데이터만)
const SYNTHETIC_DRIVE_FILES = { files: [
  { title: "##합본_TEST FUND ALPHA_고유번호증 신청서류.pdf", fileExtension: "pdf", fileSize: "11882312", mimeType: "application/pdf", modifiedTime: "2026-07-02T06:44:23.942Z" },
  { title: "#TEST FUND ALPHA_고유번호증 접수증.pdf", fileExtension: "pdf", fileSize: "437924", mimeType: "application/pdf", modifiedTime: "2026-07-02T08:23:36.262Z" },
  { title: "규약_세무서 보완 제출용.pdf", fileExtension: "pdf", fileSize: "4011673", mimeType: "application/pdf", modifiedTime: "2026-07-03T09:20:27.232Z" },
  { title: "조합원 선임 동의서_세무서 보완 제출용.pdf", fileExtension: "pdf", fileSize: "234880", mimeType: "application/pdf", modifiedTime: "2026-07-03T09:20:33.917Z" },
  { title: "2-2. 임대차계약서, 자가인 경우 해당X.txt", fileExtension: "txt", fileSize: "0", mimeType: "text/plain", modifiedTime: "2025-04-09T03:36:48.069Z" },
  { title: "6-1. (개인)인감증명서 2부.txt", fileExtension: "txt", fileSize: "0", mimeType: "text/plain", modifiedTime: "2025-04-09T03:36:19.533Z" }] };

const CFG = { notion: { data_sources: { fund_master: "ds1", fund_work: "ds2", request: "ds3", task: "ds4" }, write_mode: WRITE_MODE.PREVIEW_ONLY, allowed_prefixes: ["[TEST][E2E03-EVIDENCE-SHADOW]"], operating_write_enabled: false }, drive: { allow_broad_search: false } };

const notionCalls = [];
const notion = createNotionProvider({ config: CFG.notion, invoke: async (tool, params) => {
  notionCalls.push({ tool, query: params?.data?.query ?? null });
  const q = params?.data?.query ?? "";
  if (q.includes("조합 Root 폴더")) return { results: SYNTHETIC_FUND_ROWS };
  if (q.includes("Operational Task ID")) return { results: SYNTHETIC_SHADOW_TASK_ROWS };
  return { results: SYNTHETIC_SHADOW_REQUEST_ROWS };
} });
const drive = createDriveProvider({ config: CFG.drive, invoke: async () => SYNTHETIC_DRIVE_FILES,
  classificationRules: read("plugins/vc-support-admin/adapters/drive.yaml").evidence_classification,
  documentProfiles: loadDocumentProfiles() });
const slack = createSlackProvider({});

// ---- Scenario 1 — 기존 Shadow Resume ----------------------------------------
const s1 = await processRequest({
  interface: "cli", user_message: "외근 산출물을 확인해서 TEST FUND ALPHA의 고유번호증 신청 상태와 다음 확인사항을 알려줘.",
  fund_hint: "TEST FUND ALPHA",
  runtime_config: { record_prefix: "[TEST][E2E03-EVIDENCE-SHADOW]", write_mode: WRITE_MODE.PREVIEW_ONLY },
  providers: { notion, drive, slack }
});
const s1Expected = { fund_match: "EXACT_1", reuse_existing: true, planned_write: 0, committed_write: 0, auto_completed: 0, human_confirmations: 6, operating_change: 0, drive_change: 0 };
const s1Actual = {
  fund_match: s1.fund_match_result, reuse_existing: s1.preview.reuse_existing,
  planned_write: s1.preview.planned_write_count, committed_write: s1.committed_changes.write_count,
  auto_completed: s1.task_states.filter((t) => t.state_candidate === "완료").length,
  human_confirmations: s1.human_confirmation.length,
  operating_change: s1.preview.operating_record_change, drive_change: s1.preview.drive_change
};
const s1Cmp = compareExpectedActual(s1Expected, s1Actual);
assert.equal(s1Cmp.pass, true, JSON.stringify(s1Cmp.rows.filter((r) => r.result !== "PASS")));
assert.ok(s1.evidence_summary.counted_types.includes("RECEIPT"));
assert.ok(s1.evidence_summary.counted_types.includes("SUBMISSION_PACKAGE"));
assert.equal(s1.evidence_summary.rejected.length, 2); // 0byte 2건
assert.equal(s1.slack_preview.send_enabled, false);
console.log("LIVE-01 shadow resume: PASS (normalized provider reads, reuse, 0 writes, 6 human confirmations)");

// ---- Scenario 2 — 모호한 승인 ------------------------------------------------
const before = notionCalls.length;
const s2 = await processRequest({ user_message: "고유번호증 진행", fund_hint: "TEST FUND ALPHA",
  approval_context: "진행해주세요",
  runtime_config: { record_prefix: "[TEST][E2E03-EVIDENCE-SHADOW]", write_mode: WRITE_MODE.TEST_WRITE },
  providers: { notion, drive, slack } });
assert.equal(s2.approval_required, true);
assert.ok(s2.errors.some((e) => e.code === "APPROVAL_AMBIGUOUS"));
assert.equal(s2.committed_changes.write_count, 0);
assert.equal(notionCalls.filter((c) => c.tool === "notion-create-pages").length, 0);
console.log("LIVE-02 ambiguous approval: PASS (APPROVAL_AMBIGUOUS, 0 writes even in test_write mode)");

// ---- Scenario 3 — 명확한 TEST 승인 (기존 Instance → No-op) --------------------
const s3 = await processRequest({ user_message: "고유번호증 상태 갱신", fund_hint: "TEST FUND ALPHA",
  approval_context: "P03-T01을 완료로 변경해주세요",
  runtime_config: { record_prefix: "[TEST][E2E03-EVIDENCE-SHADOW]", write_mode: WRITE_MODE.TEST_WRITE, allowed_prefixes: ["[TEST][E2E03-EVIDENCE-SHADOW]"] },
  providers: { notion, drive, slack } });
assert.equal(s3.approval_required, false);
assert.deepEqual(s3.allowed_changes, ["P03-T01"]);
assert.equal(s3.write_guard.allowed, false);
assert.equal(s3.write_guard.code, "REUSE_EXISTING"); // 기존 Instance 존재 → No-op
assert.equal(s3.committed_changes.write_count, 0);
console.log("LIVE-03 explicit approval: PASS (guard passes approval, then no-ops on existing instance — 0 writes)");

// ---- Scenario 4 — 다른 Process Candidate -------------------------------------
const s4 = await processRequest({ user_message: "이 조합 계좌개설 서류 좀 처리해줘", fund_hint: "TEST FUND ALPHA",
  runtime_config: { record_prefix: "[TEST][E2E03-EVIDENCE-SHADOW]" }, providers: { notion, drive, slack } });
assert.equal(s4.process_id, null);
assert.ok(s4.errors.some((e) => e.code === "PROCESS_NOT_SUPPORTED" && e.handoff_required));
assert.equal(s4.handoff.reason, "HANDOFF_REQUIRED");
assert.ok(s4.handoff.candidate_skills.includes("p07-account-opening"));
assert.equal(s4.committed_changes.write_count, 0);
console.log("LIVE-04 other process: PASS (not misprocessed as E2E-03, HANDOFF_REQUIRED, 0 writes)");

// ---- Scenario 5 — Document Profile 재사용 ------------------------------------
const profiles = loadDocumentProfiles();
const realDoc = drive.classify_file({ name: "#TEST FUND ALPHA_고유번호증 접수증.pdf", extension: "pdf", size: 437924 });
const otherFundDoc = drive.classify_file({ name: "#전혀다른샘플조합_고유번호증 접수증.pdf", extension: "pdf", size: 500000 });
assert.equal(realDoc.profile.profile_id, "tax_office_receipt");
assert.equal(otherFundDoc.profile.profile_id, "tax_office_receipt");
assert.equal(realDoc.type, "RECEIPT");
const rp = profiles.find((p) => p.profile_id === "tax_office_receipt");
assert.equal(rp.alone_completes_task, false);
assert.ok(rp.human_checks.length >= 3);
assert.deepEqual(rp.completion_candidate_tasks, ["P03-T04"]);
console.log("LIVE-05 profile reuse: PASS (same profile identifies a different fund's document, no auto-completion)");

// ---- 민감정보·Payload 안전 ---------------------------------------------------
const rendered = JSON.stringify(slack.build_preview_payload(s1));
assert.ok(!/drive\.google\.com/.test(rendered));
assert.ok(!/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(rendered));
// 합성 root는 Drive URL 형태가 아니므로 마스킹 대상이 아니다(원문 미보관 확인).
assert.ok(!/^https?:/.test(SYNTHETIC_FUND_ROWS[0]["조합 Root 폴더"]));
// 마스킹 자체는 Drive 형태 문자열을 조립해 검증한다.
assert.ok(maskString(["https://drive", "google.com/drive/folders/SAMPLE"].join(".")).includes("<drive-url>"));
console.log("payload safety: PASS (slack payload carries no drive urls or uuids)");

// ---- 집계 --------------------------------------------------------------------
const writes = notionCalls.filter((c) => c.tool === "notion-create-pages" || c.tool === "notion-update-page").length;
assert.equal(writes, 0);
console.log(`\nMCP RUNTIME LIMITATION: Node cannot call MCP directly. Synthetic fixtures shaped like real responses are injected into the provider normalizer; no connector was called by this test.`);
console.log(`notion read payloads issued: ${notionCalls.length} | notion write payloads: ${writes}`);
console.log("ALL LIVE TESTS PASS");
