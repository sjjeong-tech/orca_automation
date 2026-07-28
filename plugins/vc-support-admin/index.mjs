#!/usr/bin/env node

// VC 지원팀 행정업무 Plugin — Entry Point
// 공통 Kernel + Process-specific Contract + 주입형 Provider 조합.
// 실제 Database·Page·Drive ID는 이 파일에 없다. runtime_config / providers로 주입한다.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { classifyEvidence as kClassify, summarizeEvidence as kSummarize, identifyDocument } from "./kernel/evidence.mjs";
import { calculateTaskState, buildManagerShare, buildFundTracking, buildHandoff } from "./kernel/state.mjs";
import { calculateDuplicateKey as kDupKey, parseApproval as kParseApproval, guardWrite, compareExpectedActual, WRITE_MODE } from "./kernel/guards.mjs";
import { sanitize, auditLog } from "./kernel/sanitize.mjs";
import { parseFieldworkFilename, matchSubmissionToReceipt, detectInvalidEvidence } from "./kernel/filename.mjs";
import { createNotionProvider } from "./providers/notion.mjs";
import { createDriveProvider } from "./providers/drive.mjs";
import { createSlackProvider } from "./providers/slack.mjs";
import { assertProviderShape, RESULT } from "./providers/base.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");

export const load = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
export const loadSkillContract = () => load("skills/e2e03-tax-id-application/contract.yaml");
export const loadDriveAdapter = () => load("plugins/vc-support-admin/adapters/drive.yaml");
export const loadSlackAdapter = () => load("plugins/vc-support-admin/adapters/slack.yaml");
export const loadPlugin = () => load("plugins/vc-support-admin/plugin.yaml");
export const loadDocumentProfiles = () => {
  const dir = path.join(ROOT, "skills/e2e03-tax-id-application/document_profiles");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".yaml"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
};

// ---- 기존 API 호환 wrapper (Contract·Adapter 기본값 주입) --------------------
export function classifyEvidence(files = [], drive = loadDriveAdapter()) {
  return kClassify(files, drive.evidence_classification ?? []);
}
export const summarizeEvidence = kSummarize;
export function computeTaskStates(evidenceSummary, { existingTasks = [] } = {}, contract = loadSkillContract()) {
  return calculateTaskState({
    taskIds: contract.operational_task_ids,
    rules: contract.evidence_to_task_rules,
    evidenceSummary, existingTasks,
    maxAutoState: contract.human_confirmation_rules?.max_auto_state ?? "진행 중"
  });
}
export function parseApproval(text = "", { slack = loadSlackAdapter() } = {}) {
  return kParseApproval(text, { ambiguousPhrases: slack.approval_parsing?.ambiguous_phrases ?? [] });
}
export const calculateDuplicateKey = kDupKey;

export function detectProcess(userMessage, { process_hint } = {}, contract = loadSkillContract()) {
  if (process_hint) return process_hint === contract.process_id ? contract.process_id : null;
  const hit = (contract.trigger_phrases ?? []).some((p) => userMessage.includes(p)) || userMessage.includes("고유번호");
  return hit ? contract.process_id : null;
}

export function buildSlackPreview(result, slack = loadSlackAdapter()) {
  const lines = [
    `[Input] ${result.process_id ?? "-"} / ${result.resolved_fund?.name ?? "미해소"}`,
    `[State] 활성 Task ${result.manager_share_preview?.active_tasks?.length ?? 0}건`,
    `[Evidence] 인정 ${(result.evidence_summary?.counted_types ?? []).join(", ") || "없음"} / 불인정 ${result.evidence_summary?.rejected?.length ?? 0}건`,
    `[Preview] Write 예정 ${result.preview?.planned_write_count ?? 0}건`,
    `[Approval] ${result.approval_required ? "명시 승인 필요" : "불필요"}`,
    `[Handoff] ${result.next_action ?? "-"}`
  ];
  return { contract: slack.message_contract, send_enabled: false, text: lines.join("\n"), thread_key: result.duplicate_key ?? null };
}

// ---- Provider 조립 -----------------------------------------------------------
export function buildProviders({ runtime_config = {}, invokers = {}, logger = () => {} } = {}) {
  const drive = loadDriveAdapter();
  const providers = {
    notion: createNotionProvider({ config: runtime_config.notion ?? runtime_config, invoke: invokers.notion, logger }),
    drive: createDriveProvider({
      config: runtime_config.drive ?? {}, invoke: invokers.drive, logger,
      classificationRules: drive.evidence_classification ?? [],
      documentProfiles: loadDocumentProfiles()
    }),
    slack: createSlackProvider({ config: runtime_config.slack ?? {}, logger })
  };
  for (const [n, p] of Object.entries(providers)) assertProviderShape(p, n);
  return providers;
}

export async function healthCheck(providers) {
  const out = {};
  for (const [name, p] of Object.entries(providers)) {
    try { out[name] = (await p.health_check()).data; }
    catch (e) { out[name] = { healthy: false, error_code: "HEALTH_CHECK_FAILED" }; }
  }
  return out;
}

// ---- Entry Point -------------------------------------------------------------
export async function processRequest({
  interface: iface = "cli",
  user_message = "",
  fund_hint = null,
  process_hint = null,
  evidence_context = null,
  approval_context = null,
  runtime_config = {},
  providers = {}
} = {}) {
  const contract = loadSkillContract();
  const errors = [];
  const audit = [];
  const result = {
    interface: iface, resolved_fund: null, fund_match_result: null, process_id: null,
    existing_request: null, task_states: [], evidence_summary: null, missing_information: [],
    human_confirmation: [], blockers: [], preview: null, approval_required: true,
    allowed_changes: [], committed_changes: { write_count: 0, records: [] }, verification: null,
    manager_share_preview: null, fund_tracking: null, next_action: null, handoff: null,
    duplicate_key: null, audit, errors
  };
  const log = (op, res, extra) => audit.push(auditLog({ provider: "kernel", operation: op, result: res, ...extra }));

  // 1) Process
  result.process_id = detectProcess(user_message, { process_hint }, contract);
  if (!result.process_id) {
    errors.push({ code: "PROCESS_NOT_SUPPORTED", detail: "이 Skill은 E2E-03만 처리한다.", handoff_required: true });
    result.next_action = "다른 Process Skill로 인계가 필요합니다.";
    result.handoff = { next_owner: "USER", reason: "HANDOFF_REQUIRED", candidate_skills: ["p04-security-card-hometax", "p07-account-opening"], operating_write_performed: false };
    log("detect_process", "UNSUPPORTED");
    return result;
  }

  // 2) Fund 해소
  const fundQuery = fund_hint ?? user_message;
  let candidates = [];
  if (providers.notion?.resolve_fund_master) {
    const r = await providers.notion.resolve_fund_master(fundQuery);
    candidates = r.result === RESULT.OK ? r.data : [];
    if (r.result !== RESULT.OK) errors.push({ code: "FUND_LOOKUP_FAILED", detail: r.detail ?? r.result });
  } else if (providers.notion?.searchFunds) {
    candidates = await providers.notion.searchFunds(fundQuery); // 구 fixture 호환
  }
  if (candidates.length === 0) {
    result.fund_match_result = "NOT_FOUND";
    errors.push({ code: "FUND_NOT_FOUND", detail: "정확히 일치하는 조합이 없습니다." });
    result.missing_information.push("정확한 조합명");
    result.next_action = "조합명을 정확히 알려주세요.";
    result.slack_preview = buildSlackPreview(result);
    log("resolve_fund", "NOT_FOUND");
    return result;
  }
  if (candidates.length > 1) {
    result.fund_match_result = "MULTIPLE";
    errors.push({ code: "FUND_MULTIPLE", detail: `${candidates.length}건 일치`, candidates: candidates.map((c) => c.name) });
    result.next_action = "대상 조합을 하나 선택해주세요.";
    result.slack_preview = buildSlackPreview(result);
    log("resolve_fund", "MULTIPLE", { count: candidates.length });
    return result;
  }
  result.fund_match_result = "EXACT_1";
  result.resolved_fund = candidates[0];
  log("resolve_fund", "OK");

  // 3) Evidence
  let files = evidence_context?.files ?? [];
  if (!files.length && providers.drive?.list_evidence) {
    const r = await providers.drive.list_evidence({ fund: result.resolved_fund, parents: evidence_context?.parents ?? [] });
    files = r.result === RESULT.OK ? r.data : [];
    if (r.result !== RESULT.OK) errors.push({ code: "EVIDENCE_SOURCE_UNAVAILABLE", detail: r.detail ?? r.result });
  } else if (!files.length && providers.drive?.listEvidence) {
    files = await providers.drive.listEvidence(result.resolved_fund); // 구 fixture 호환
  }
  const classified = classifyEvidence(files);
  result.evidence_summary = kSummarize(classified);
  result.evidence_summary.invalid_findings = detectInvalidEvidence(files);
  result.evidence_summary.submission_receipt_pairs = matchSubmissionToReceipt(files);
  log("classify_evidence", "OK", { count: files.length });

  // 4) 기존 Instance·중복 Key
  result.duplicate_key = kDupKey({
    fund_key: result.resolved_fund.key ?? result.resolved_fund.name,
    process_id: result.process_id,
    request_type: "고유번호증 신청",
    record_prefix: runtime_config.record_prefix ?? null
  });
  let existing = null, existingTasks = [];
  if (providers.notion?.find_requests && runtime_config.record_prefix) {
    const r = await providers.notion.find_requests({ titleContains: runtime_config.record_prefix });
    if (r.result === RESULT.OK && r.data.length) {
      existing = { id: "matched", count: r.data.length, is_shadow: String(runtime_config.record_prefix).includes("SHADOW") };
      const t = await providers.notion.find_tasks({ titleContains: runtime_config.record_prefix });
      existingTasks = t.result === RESULT.OK ? t.data : [];
    }
  } else if (providers.notion?.findRequestByDuplicateKey) {
    existing = await providers.notion.findRequestByDuplicateKey(result.duplicate_key); // 구 fixture 호환
    if (existing && providers.notion.findTasks) existingTasks = await providers.notion.findTasks(existing);
  }
  result.existing_request = existing;

  // 5) Task 상태 (자동 완료 없음)
  result.task_states = computeTaskStates(result.evidence_summary, { existingTasks }, contract);
  result.human_confirmation = result.task_states.filter((t) => t.requires_human_confirmation)
    .map((t) => ({ task: t.operational_task_id, confirm: t.human_confirmation }));
  result.blockers = result.task_states.map((t) => ({ task: t.operational_task_id, blocker: t.blocker }));

  // 6) Preview
  const writeMode = runtime_config.write_mode ?? contract.default_write_mode ?? WRITE_MODE.PREVIEW_ONLY;
  result.preview = {
    mode: writeMode,
    reuse_existing: Boolean(existing),
    planned_write_count: existing ? 0 : 1 + contract.operational_task_ids.length,
    planned_records: existing ? [] : ["request:1", `task:${contract.operational_task_ids.length}`],
    operating_record_change: 0,
    drive_change: 0
  };

  // 7) 승인 + Write Guard
  const approval = parseApproval(approval_context ?? "");
  result.approval_required = !approval.approved;
  result.allowed_changes = approval.approved ? [approval.target_task] : [];
  if (!approval.approved && approval_context) errors.push({ code: approval.reason, detail: approval.question, missing: approval.missing });

  const guard = guardWrite({
    approval, writeMode,
    targetTitle: `${runtime_config.record_prefix ?? ""} ${result.resolved_fund.name}`.trim(),
    allowedPrefixes: runtime_config.allowed_prefixes ?? (runtime_config.record_prefix ? [runtime_config.record_prefix] : []),
    operatingWriteEnabled: runtime_config.operating_write_enabled === true,
    reuseExisting: Boolean(existing)
  });
  result.write_guard = { allowed: guard.allowed, code: guard.code, detail: guard.detail ?? null };

  // 8) Commit — Guard 통과 시에만
  if (guard.allowed && providers.notion?.commit_write) {
    const payloads = [];
    const r = await providers.notion.commit_write({ guard, payloads });
    result.committed_changes = r.result === RESULT.OK ? r.data : { write_count: 0, records: [], reason: r.result };
    if (providers.notion.requery_and_verify) {
      const v = await providers.notion.requery_and_verify({ titleContains: runtime_config.record_prefix, expected: { task_count: contract.operational_task_ids.length, completed: 0 } });
      result.verification = v.result === RESULT.OK ? v.data : { error: v.result };
    }
  } else {
    result.committed_changes = { write_count: 0, records: [], reason: guard.code };
  }

  // 9) 공유·추적·Handoff
  result.manager_share_preview = buildManagerShare(result.task_states, { fund_name: result.resolved_fund.name, process_id: result.process_id });
  result.fund_tracking = buildFundTracking({ fund_name: result.resolved_fund.name, process_id: result.process_id, existingRequest: existing, taskStates: result.task_states, evidenceSummary: result.evidence_summary });
  result.slack_preview = buildSlackPreview(result);
  const firstActive = result.task_states.find((t) => t.state_candidate === "진행 중");
  result.next_action = firstActive ? `${firstActive.operational_task_id}: ${firstActive.human_confirmation}` : "확인 필요";
  result.handoff = buildHandoff({ duplicateKey: result.duplicate_key, humanConfirmation: result.human_confirmation });
  return result;
}

export {
  identifyDocument, parseFieldworkFilename, matchSubmissionToReceipt, detectInvalidEvidence,
  guardWrite, compareExpectedActual, sanitize, WRITE_MODE,
  createNotionProvider, createDriveProvider, createSlackProvider
};
export default { processRequest, buildProviders, healthCheck };
