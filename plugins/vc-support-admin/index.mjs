#!/usr/bin/env node

// VC 지원팀 행정업무 Plugin — Entry Point
// 공통 Kernel + Process-specific Contract + 주입형 Provider 조합.
// 실제 Database·Page·Drive ID는 이 파일에 없다. runtime_config / providers로 주입한다.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { INTENT, INTENT_LABEL, parseUserMessage, routeIntent, extractFundName, extractFolderHint } from "./kernel/intent.mjs";
import { formatUserResult, buildManagerMessageText, label as displayLabel } from "./kernel/format.mjs";
import { buildPreview } from "./kernel/preview.mjs";

import { classifyEvidence as kClassify, summarizeEvidence as kSummarize, identifyDocument } from "./kernel/evidence.mjs";
import { calculateTaskState, buildManagerShare, buildFundTracking, buildHandoff, reconcileTaskIds } from "./kernel/state.mjs";
import { calculateDuplicateKey as kDupKey, parseApproval as kParseApproval, guardWrite, compareExpectedActual, WRITE_MODE } from "./kernel/guards.mjs";
import { sanitize, auditLog } from "./kernel/sanitize.mjs";
import { parseFieldworkFilename, matchSubmissionToReceipt, detectInvalidEvidence } from "./kernel/filename.mjs";
import { createNotionProvider } from "./providers/notion.mjs";
import { createDriveProvider } from "./providers/drive.mjs";
import { createSlackProvider } from "./providers/slack.mjs";
import { assertProviderShape, RESULT } from "./providers/base.mjs";
import { evaluateEvidenceState, parseEvidenceText } from "./kernel/evidence-state.mjs";
export { buildEvidencePreview, normalizeEvidenceInput } from "./kernel/evidence-adapter.mjs";

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
export { evaluateEvidenceState, parseEvidenceText };
export { locateOperationalRecords, locateOperationalRecord } from "./kernel/record-locator.mjs";
export { discoverEvidence } from "./kernel/evidence-discovery.mjs";
export { buildTaskEvidencePreview } from "./kernel/task-evidence-preview.mjs";
export { mapNotionTaskSnapshot } from "./kernel/notion-task-snapshot.mjs";
export { reviewTaskEvidence } from "./kernel/task-evidence-orchestrator.mjs";

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

// =============================================================================
// 사용자 대면 Workflow — 자연어 1건 → 업무 결과 1건
// =============================================================================

const FUND_REQUIRED_INTENTS = new Set([INTENT.FUND_STATUS, INTENT.NOTION_PREVIEW, INTENT.MANAGER_UPDATE]);
const DOWNSTREAM_TYPES = { SECURITY_CARD: "P04", BANKBOOK_COPY: "P07" };

// 이 Skill이 처리하지 않는 Process의 발화 신호. 하나라도 있으면 인계한다.
const OTHER_PROCESS_SIGNALS = [
  "계좌개설", "계좌 개설", "보안카드", "홈택스", "증권거래세",
  "부가세", "부가가치세", "원천세", "법인세", "지급명세서", "사업자등록"
];

export const USER_INTENTS = [INTENT.FUND_STATUS, INTENT.FIELDWORK_EVIDENCE, INTENT.NOTION_PREVIEW, INTENT.MANAGER_UPDATE];

function taskMetaMap(contract) {
  const list = contract.operational_tasks ?? contract.operational_task_ids.map((id) => ({ id, name: id, actor: "지원팀" }));
  return new Map(list.map((t) => [t.id, t]));
}

const providerReadCount = (p) => (p?.audit ?? []).filter((a) => !["health_check", "initialize"].includes(a.operation)).length;

/** 정확일치 → 부분일치 순. 부분일치 1건도 자동 확정하지 않고 확인 대상으로 표시한다. */
async function resolveFundForUser(providers, name, errors) {
  if (!name) return { match: "NOT_FOUND", fund: null, candidates: [] };
  if (!providers.notion?.resolve_fund_master) return { match: "NO_PROVIDER", fund: null, candidates: [] };

  const exact = await providers.notion.resolve_fund_master(name);
  if (exact.result === RESULT.OK && exact.data.length === 1) return { match: "EXACT_1", fund: exact.data[0], candidates: [] };
  if (exact.result === RESULT.OK && exact.data.length > 1) return { match: "MULTIPLE", fund: null, candidates: exact.data.map((f) => f.name) };
  if (exact.result !== RESULT.OK) errors.push({ code: "FUND_LOOKUP_FAILED", detail: `FUND 마스터 조회에 실패했습니다 (${exact.result}).` });

  if (!providers.notion.search_fund_candidates) return { match: "NOT_FOUND", fund: null, candidates: [] };
  const like = await providers.notion.search_fund_candidates(name);
  if (like.result !== RESULT.OK) return { match: "NOT_FOUND", fund: null, candidates: [] };
  if (like.data.length === 1) return { match: "PARTIAL_1", fund: like.data[0], candidates: [] };
  if (like.data.length > 1) return { match: "MULTIPLE", fund: null, candidates: like.data.map((f) => f.name) };
  return { match: "NOT_FOUND", fund: null, candidates: [] };
}

/** Evidence 출처 결정: 입력 목록 > 외근 날짜 폴더 > 조합 Canonical Source. 광역검색은 쓰지 않는다. */
async function collectEvidence({ providers, fund, folder, intent, evidence_context, runtime_config, errors }) {
  if (evidence_context?.files?.length) {
    return { files: evidence_context.files, source_label: evidence_context.source_label ?? "입력으로 제공된 파일 목록" };
  }
  const drive = providers.drive;
  if (!drive) return { files: [], unavailable: "Drive Provider가 연결되지 않았습니다." };

  const wantsFieldwork = intent === INTENT.FIELDWORK_EVIDENCE || folder?.monthly || folder?.daily || folder?.relative;
  if (wantsFieldwork && drive.list_fieldwork_candidates) {
    const cand = await drive.list_fieldwork_candidates({ monthly: folder?.monthly ?? null, daily: folder?.daily ?? null });
    if (cand.result !== RESULT.OK) {
      errors.push({ code: "FIELDWORK_ROOT_UNAVAILABLE", detail: "외근 Root 폴더를 조회하지 못했습니다." });
      return { files: [], unavailable: "외근 Root 폴더 조회 실패", folder_candidates: null };
    }
    const dayId = cand.data.resolved_day_id ?? null;
    if (!dayId) {
      return {
        files: [],
        unavailable: folder?.daily ? `${folder.monthly ?? ""} ${folder.daily} 폴더를 찾지 못했습니다.` : "대상 날짜 폴더가 지정되지 않았습니다.",
        folder_candidates: { months: cand.data.months ?? [], days: cand.data.days ?? [], monthly: cand.data.monthly ?? null }
      };
    }
    const files = await drive.list_by_parent(dayId);
    if (files.result !== RESULT.OK) return { files: [], unavailable: "날짜 폴더 조회 실패" };
    return {
      files: files.data.filter((f) => !f.is_folder).map((f) => ({ ...f, source_layer: "DAILY_FIELDWORK_FOLDER" })),
      source_label: `외근 폴더 ${folder.daily}${cand.data.resolved_from === "MONTHLY_ARCHIVE" ? ` (${cand.data.monthly} 아카이브)` : ""}`,
      folder_candidates: { months: cand.data.months ?? [], days: cand.data.days ?? [], monthly: cand.data.monthly ?? null }
    };
  }

  if (!fund) return { files: [], unavailable: "조합이 확정되지 않아 Evidence 위치를 결정할 수 없습니다." };
  const root = await drive.resolve_fund_root(fund);
  if (root.result !== RESULT.OK) {
    return { files: [], unavailable: "이 조합에는 Root 폴더가 등록되어 있지 않습니다. (FUND 마스터 '조합 Root 폴더' 값 없음)" };
  }
  // 실측: 발급 결과물은 Canonical Source가 아니라 Fund Root 최상위에 저장되는 경우가 있다.
  // 두 계층을 모두 읽고 source_layer로 구분한다.
  const rootListing = await drive.list_by_parent(root.data.root_id);
  const rootFiles = rootListing.result === RESULT.OK
    ? rootListing.data.filter((f) => !f.is_folder).map((f) => ({ ...f, source_layer: "FUND_ROOT" }))
    : [];

  const segments = runtime_config.drive?.canonical_source_segments ?? ["결성", "고유번호증"];
  const resolved = drive.resolve_path ? await drive.resolve_path({ rootId: root.data.root_id, segments }) : { result: RESULT.NOT_FOUND };
  if (resolved.result !== RESULT.OK) {
    return {
      files: rootFiles,
      source_label: "조합 Root 폴더 (고유번호증 전용 폴더 미확인)",
      unavailable: `Canonical Source 경로(${segments.join(" > ")})를 찾지 못했습니다.`
    };
  }
  const canon = await drive.list_by_parent(resolved.data.folder_id);
  if (canon.result !== RESULT.OK) return { files: rootFiles, source_label: "조합 Root 폴더", unavailable: "고유번호증 폴더 조회 실패" };
  return {
    files: [...canon.data.filter((f) => !f.is_folder).map((f) => ({ ...f, source_layer: "CANONICAL_SOURCE" })), ...rootFiles],
    source_label: `조합 Root > ${resolved.data.trail.join(" > ")} + 조합 Root 최상위`
  };
}

function toDisplayVerdict(item, profile) {
  if (item.verdict === "UNVERIFIED_SHORTCUT") return "INVALID_SHORTCUT";
  if (item.verdict === "ZERO_BYTE") return "ZERO_BYTE";
  if (item.verdict === "ACCESS_BLOCKED") return "ACCESS_BLOCKED";
  if (item.duplicate_group) return "DUPLICATE_OR_STALE";
  if (item.type && DOWNSTREAM_TYPES[item.type]) return "OUT_OF_SCOPE";
  if (!item.type) return "CANDIDATE";
  return profile?.confidence === "HIGH" ? "VERIFIED" : "HUMAN_CONFIRMATION_REQUIRED";
}

function buildHeadline({ counted, unavailable }) {
  const has = (t) => counted.includes(t);
  let lead;
  if (unavailable) lead = "Evidence를 조회하지 못해 Notion 기록만으로 판단했습니다.";
  else if (has("RESULT_DOCUMENT")) lead = "발급 결과물은 확인됐지만 최신본 여부와 관리역 전달 여부 확인이 필요합니다.";
  else if (has("RECEIPT")) lead = "세무서 접수 증빙은 확인됐지만 발급 결과물은 아직 확인되지 않았습니다.";
  else if (has("SUBMISSION_PACKAGE")) lead = "신청서류는 확인됐지만 접수 여부는 아직 확인되지 않았습니다.";
  else if (has("SUPPLEMENT")) lead = "보완서류가 확인됐습니다. 보완 접수 결과 확인이 필요합니다.";
  else lead = "확인된 Evidence가 없습니다. 착수 여부부터 확인이 필요합니다.";
  return `${lead}\n파일 존재만으로 완료 처리할 수 있는 단계는 없습니다.`;
}

function buildPreviewRows({ view, contract, writeMode, existingTaskCount, now }) {
  const seed = `${view.duplicate_key ?? view.resolved_fund?.name ?? "unresolved"}|${view.process_id}`;
  const transaction_id = `tx_${crypto.createHash("sha1").update(seed).digest("hex").slice(0, 12)}`;
  const scope = "TEST_RECORD_ONLY";
  const rows = [];

  if (existingTaskCount === 0) {
    const p = buildPreview({
      transaction_id, process_id: view.process_id, request_ref: null, task_ref: null,
      target_data_source: "request+task", target_record: `${view.record_prefix ?? "[TEST]"} ${view.resolved_fund?.name ?? ""}`.trim(),
      target_property: "Record 생성", current_value: null,
      proposed_value: `Request 1건 + Task ${contract.operational_task_ids.length}건`,
      action: "create_test_instance", write_scope: scope, now
    });
    rows.push({
      ...p, task_ref: `${contract.operational_task_ids[0]} ~ ${contract.operational_task_ids.at(-1)}`,
      evidence: view.evidence_summary?.counted?.map((c) => displayLabel.type(c.type)) ?? [],
      confidence: "LOW", human_confirmation: "이 조합의 고유번호증 업무 Record가 없습니다. 생성 여부를 사람이 결정해야 합니다.",
      approval_required: true, auto_apply_allowed: false
    });
  } else {
    for (const t of view.task_summary) {
      if (!t.differs || !t.evidence.length) continue;
      const p = buildPreview({
        transaction_id, process_id: view.process_id, request_ref: view.request_ref, task_ref: t.task,
        target_data_source: "task", target_record: t.record_ref ?? `${t.task} ${view.resolved_fund?.name ?? ""}`.trim(),
        target_property: "Task 상태", current_value: t.actual_state, proposed_value: t.computed_state,
        action: "update_property", write_scope: scope, now
      });
      rows.push({
        ...p, task_ref: `${t.task} ${t.name}`, evidence: t.evidence.map((e) => displayLabel.type(e)),
        confidence: t.evidence.length > 1 ? "MEDIUM" : "LOW",
        human_confirmation: t.human_confirmation, approval_required: true, auto_apply_allowed: false
      });
    }
  }
  // 자동으로 제안하지 않지만, 사람이 확인하면 완료 전이가 가능한 Task를 별도로 알려준다.
  // (Evidence만으로 완료를 제안하지 않는다는 규칙 때문에 rows가 비는 경우가 정상이다.)
  const pending = view.task_summary
    .filter((t) => t.actual_state === "진행 중" && t.evidence.length > 0)
    .map((t) => ({ task: t.task, task_name: t.name, would_become: "완료", requires: t.human_confirmation }));

  return {
    mode: writeMode, transaction_id, rows,
    planned_write_count: rows.length, actual_write_count: 0,
    approval_required: rows.length > 0, auto_apply_allowed: false,
    natural_language_is_not_approval: true,
    pending_human_confirmation: pending
  };
}

/**
 * Entry Point — 자연어 요청 1건을 처리한다.
 * 읽기만 수행하고, 변경은 Preview로만 만든다. 실제 Write는 이 함수에서 하지 않는다.
 */
export async function runUserRequest(input = {}) {
  const {
    user_message = "", interface: iface = "cli",
    fund_hint = null, folder_hint = null, process_hint = null, intent_hint = null,
    evidence_context = null, runtime_config = {}, providers = {}, now = Date.now()
  } = input;

  const contract = loadSkillContract();
  const meta = taskMetaMap(contract);
  const errors = [];
  const parsed = parseUserMessage(user_message, { fund_hint, folder_hint, intent_hint });

  const view = {
    intent: parsed.intent, intent_label: INTENT_LABEL[parsed.intent] ?? null, intent_source: parsed.intent_source,
    clarifying_question: parsed.clarifying_question, clarify_options: parsed.clarify_options,
    interface: iface, fund_query: parsed.fund.name, fund_required: FUND_REQUIRED_INTENTS.has(parsed.intent),
    resolved_fund: null, fund_match: null, fund_candidates: [],
    process_id: null, process_name: "고유번호증 신청·수령", request_ref: null,
    record_prefix: runtime_config.record_prefix ?? null, duplicate_key: null,
    current_status: null, task_summary: [], evidence_summary: null,
    blockers: [], next_actions: [], human_confirmations: [],
    notion_preview: null, manager_message: null,
    approval_required: true, handoff: null,
    reads: { notion: 0, drive: 0 }, writes: { notion: 0, drive: 0, slack: 0 },
    errors, display: null
  };
  const finish = () => {
    delete view._fund;
    view.reads.notion = providerReadCount(providers.notion);
    view.reads.drive = providerReadCount(providers.drive);
    view.display = formatUserResult(view);
    return view;
  };

  if (parsed.intent === INTENT.CLARIFY) return finish();

  // 1) Process 범위
  // 후속 발화("이 내용을 매니저에게 공유해줘")에는 업무명이 없다. 다른 Process 신호가
  // 없으면 지원 Process로 이어서 처리하고, 신호가 있으면 인계한다.
  const detected = detectProcess(user_message, { process_hint }, contract);
  const otherProcess = OTHER_PROCESS_SIGNALS.find((s) => user_message.includes(s));
  if (!detected && otherProcess) {
    view.intent = INTENT.UNSUPPORTED;
    view.detected_other_process = otherProcess;
    view.handoff = { next_owner: "USER", reason: "PROCESS_NOT_SUPPORTED", detected_signal: otherProcess, candidate_processes: ["P04", "P07", "P08"], operating_write_performed: false };
    return finish();
  }
  view.process_id = detected ?? contract.process_id;
  view.process_inferred = !detected;

  // 2) 조합 확정
  if (parsed.fund.name) {
    const r = await resolveFundForUser(providers, parsed.fund.name, errors);
    view.fund_match = r.match;
    view.resolved_fund = r.fund ? { name: r.fund.name, fund_type: r.fund.fund_type ?? null, tax_id: r.fund.tax_id ?? null, root_folder_registered: Boolean(r.fund.root_folder) } : null;
    view.fund_candidates = r.candidates;
    view._fund = r.fund;
    if (r.match === "PARTIAL_1") {
      view.human_confirmations.push({ task: "조합 확정", confirm: `발화에서 "${parsed.fund.name}"만 확인됐습니다. 대상이 "${r.fund.name}"가 맞는지 확인해주세요.` });
      errors.push({ code: "FUND_PARTIAL_MATCH", detail: `조합명이 부분일치로 해소됐습니다. 확정 전에는 어떤 변경도 반영하지 않습니다.` });
    }
  } else if (view.fund_required) {
    view.fund_match = "NOT_FOUND";
  }
  if (view.fund_required && (view.fund_match === "NOT_FOUND" || view.fund_match === "MULTIPLE")) {
    view.handoff = { next_owner: "USER", reason: `FUND_${view.fund_match}`, resume_key: null, operating_write_performed: false };
    return finish();
  }

  if (view.resolved_fund) {
    view.duplicate_key = kDupKey({
      fund_key: view.resolved_fund.name, process_id: view.process_id,
      request_type: "고유번호증 신청", record_prefix: view.record_prefix
    });
  }

  // 3) Evidence
  const ev = await collectEvidence({ providers, fund: view._fund, folder: parsed.folder, intent: parsed.intent, evidence_context, runtime_config, errors });
  const profiles = loadDocumentProfiles();
  const drive = loadDriveAdapter();
  const typeToTasks = new Map((drive.evidence_classification ?? []).map((r) => [r.type, r.task_candidates ?? []]));
  const outOfScopeSignals = drive.scope_exclusion_signals?.signals ?? [];

  // 조합 단위로 중복을 판정하기 위해 파일명에서 조합 토큰을 미리 붙인다.
  const annotated = (ev.files ?? []).map((f) => ({
    ...f, fund_key: f.fund_key ?? parseFieldworkFilename(f.name ?? "").fund_token ?? view.resolved_fund?.name ?? ""
  }));
  const classified = classifyEvidence(annotated);

  const rows = classified.map((c, i) => {
    const file = annotated[i];
    const profile = identifyDocument(file, profiles);
    const nameMeta = parseFieldworkFilename(file?.name ?? "");
    const outOfScope = outOfScopeSignals.some((s) => (c.name ?? "").includes(s));
    if (outOfScope) { c.type = null; c.counts_as_evidence = false; }
    return {
      name: c.name, type: c.type, verdict: c.verdict,
      display_verdict: outOfScope ? "OUT_OF_SCOPE" : toDisplayVerdict(c, profile),
      out_of_scope_reason: outOfScope ? "E2E-03 범위 밖 세무 신고 산출물" : null,
      task_candidates: typeToTasks.get(c.type) ?? [],
      downstream_process: DOWNSTREAM_TYPES[c.type] ?? null,
      fund_token: nameMeta.fund_token ?? null,
      reliability: nameMeta.prefix_reliability ?? null,
      source_layer: file?.source_layer ?? null
    };
  });

  const summary = kSummarize(classified);
  const fundTally = new Map();
  for (const r of rows) if (r.fund_token) fundTally.set(r.fund_token, (fundTally.get(r.fund_token) ?? 0) + 1);
  const taskCandidateIndex = new Map();
  for (const r of rows) {
    if (r.display_verdict === "INVALID_SHORTCUT" || r.display_verdict === "ZERO_BYTE" || r.display_verdict === "OUT_OF_SCOPE") continue;
    for (const t of r.task_candidates) (taskCandidateIndex.get(t) ?? taskCandidateIndex.set(t, new Set()).get(t)).add(displayLabel.type(r.type));
  }

  view.evidence_summary = {
    source_label: ev.source_label ?? null,
    unavailable: ev.unavailable ?? null,
    file_count: rows.length,
    counted_types: summary.counted_types, // Task State Engine 입력 (형태를 바꾸면 상태 계산이 조용히 비어버린다)
    counted: Object.entries(summary.by_type).map(([type, files]) => ({ type, files })),
    rejected: summary.rejected,
    classified: rows,
    fund_candidates: [...fundTally.entries()].map(([name, hits]) => ({ name, hits })).sort((a, b) => b.hits - a.hits),
    task_candidates: [...taskCandidateIndex.entries()].sort().map(([task, set]) => ({ task, task_name: meta.get(task)?.name ?? task, evidence: [...set] })),
    invalid_findings: detectInvalidEvidence(ev.files ?? []),
    submission_receipt_pairs: matchSubmissionToReceipt(ev.files ?? []),
    folder_candidates: ev.folder_candidates ?? null
  };
  if (ev.unavailable) errors.push({ code: "EVIDENCE_UNAVAILABLE", detail: ev.unavailable });
  if (ev.folder_candidates && !ev.files?.length) {
    const c = ev.folder_candidates;
    view.next_actions.push(`대상 외근 폴더를 지정해주세요. 최근 월 폴더: ${(c.months ?? []).slice(0, 3).join(", ") || "없음"}${c.days?.length ? ` / ${c.monthly} 날짜 폴더: ${c.days.slice(0, 8).join(", ")}` : ""}`);
  }

  // 4) Notion 실제 상태
  let existingTasks = [];
  if (providers.notion?.find_requests && view.resolved_fund) {
    const req = await providers.notion.find_requests({ titleContains: view.record_prefix ?? view.resolved_fund.name });
    if (req.result !== RESULT.OK) {
      errors.push({ code: "REQUEST_LOOKUP_FAILED", detail: `Request 조회에 실패했습니다 (${req.result}).` });
    } else if (req.data.length) {
      const chosen = req.data[0];
      view.request_ref = chosen["요청명"] ?? `${req.data.length}건 일치`;
      view.request_state = chosen["요청 상태"] ?? null;
      if (req.data.length > 1) errors.push({ code: "REQUEST_MULTIPLE", detail: `이 조합의 고유번호증 요청이 ${req.data.length}건 있습니다. 첫 건 기준으로 표시했습니다.` });
      // Task는 제목이 아니라 `상위 요청` Relation으로 붙는다. Relation 조회를 우선한다.
      if (chosen.url && providers.notion.find_tasks_by_request) {
        const t = await providers.notion.find_tasks_by_request(chosen.url);
        if (t.result === RESULT.OK) existingTasks = t.data;
      }
    }
    if (!existingTasks.length && providers.notion.find_tasks) {
      for (const k of [view.record_prefix, view.resolved_fund.name].filter(Boolean)) {
        const t = await providers.notion.find_tasks({ titleContains: k });
        if (t.result === RESULT.OK && t.data.length) { existingTasks = t.data; break; }
      }
    }
  }

  // 5) 상태 계산 — 자동 완료 없음
  const reconciled = reconcileTaskIds(existingTasks, contract.operational_task_ids);
  view.task_id_scheme = reconciled.id_scheme;
  if (reconciled.sequence_mapped_count) {
    errors.push({ code: "TASK_ID_SCHEME_MISMATCH", detail: `Notion Task ID 체계가 현행(${contract.operational_task_ids[0]} 형식)과 다릅니다. ${reconciled.sequence_mapped_count}건을 순번으로 대응시켰습니다. 정합화 여부는 사람이 결정해야 합니다.` });
  }
  if (reconciled.unmapped.length) {
    errors.push({ code: "TASK_ID_UNMAPPED", detail: `현행 Task에 대응시키지 못한 Notion Task ${reconciled.unmapped.length}건이 있습니다.` });
  }
  const computed = computeTaskStates(view.evidence_summary, { existingTasks: [...reconciled.byCanonical.values()] }, contract);
  const actualById = reconciled.byCanonical;
  view.task_summary = computed.map((c) => {
    const actual = actualById.get(c.operational_task_id) ?? null;
    const m = meta.get(c.operational_task_id) ?? {};
    return {
      task: c.operational_task_id, name: m.name ?? c.operational_task_id,
      actual_state: actual?.state ?? null, computed_state: c.state_candidate,
      actor: actual?.actor ?? m.actor ?? "지원팀",
      evidence: c.supporting_evidence, blocker: c.blocker,
      human_confirmation: c.human_confirmation,
      record_ref: actual ? `${c.operational_task_id} (Notion Task)` : null,
      differs: actual ? actual.state !== c.state_candidate && actual.state !== "완료" : c.state_candidate !== "시작 전"
    };
  });

  const done = view.task_summary.filter((t) => t.actual_state === "완료");
  const active = view.task_summary.filter((t) => t.actual_state === "진행 중" || (!t.actual_state && t.computed_state === "진행 중"));
  const pendingList = view.task_summary.filter((t) => !done.includes(t) && !active.includes(t));
  const currentTask = view.task_summary.find((t) => t.actual_state !== "완료") ?? view.task_summary.at(-1);
  const shortLabel = (t) => `${t.task} ${t.name}`;

  view.current_status = {
    headline: buildHeadline({ counted: view.evidence_summary.counted.map((c) => c.type), unavailable: ev.unavailable }),
    stage_current: currentTask ? shortLabel(currentTask) : null,
    actor: currentTask?.actor ?? null,
    done: done.map(shortLabel), active: active.map(shortLabel), pending: pendingList.map(shortLabel)
  };
  view.blockers = view.task_summary.filter((t) => t.actual_state !== "완료" && (t.evidence.length || t === currentTask))
    .map((t) => ({ task: t.task, task_name: t.name, blocker: t.blocker }));
  view.human_confirmations.push(...view.task_summary
    .filter((t) => t.actual_state !== "완료" && (t.evidence.length || t === currentTask))
    .map((t) => ({ task: t.task, confirm: t.human_confirmation })));

  // 6) Preview
  const writeMode = runtime_config.write_mode ?? contract.default_write_mode ?? WRITE_MODE.PREVIEW_ONLY;
  // 대상 조합이 확정되지 않으면 변경 대상을 특정할 수 없다. Preview를 만들지 않는다.
  view.notion_preview = view.resolved_fund
    ? buildPreviewRows({ view, contract, writeMode, existingTaskCount: existingTasks.length, now })
    : { mode: writeMode, transaction_id: null, rows: [], planned_write_count: 0, actual_write_count: 0, approval_required: false, auto_apply_allowed: false, natural_language_is_not_approval: true, suppressed_reason: "FUND_NOT_RESOLVED" };
  view.approval_required = view.notion_preview.rows.length > 0;

  // 7) 다음 Action
  const confirmActions = view.human_confirmations.map((h) => h.confirm).filter((v, i, a) => v && a.indexOf(v) === i);
  view.next_actions.push(...confirmActions.slice(0, 3));
  if (view.notion_preview.rows.length) {
    view.next_actions.push(`확인 후 ${view.notion_preview.rows.map((r) => r.task_ref.split(" ")[0]).join("·")} 변경 Preview를 승인해주세요.`);
  }
  if (!view.next_actions.length) view.next_actions.push("추가 조치 없음 — 현재 확인 가능한 변경 사항이 없습니다.");

  // 8) 매니저 공유문
  view.manager_message = {
    channel_hint: runtime_config.slack?.channel_hint ?? null,
    send_enabled: false,
    text: buildManagerMessageText(view)
  };

  view.handoff = {
    next_owner: "USER",
    reason: view.approval_required ? "HUMAN_CONFIRMATION_REQUIRED" : "NO_CHANGE_PROPOSED",
    resume_key: view.duplicate_key,
    open_items: view.human_confirmations.map((h) => h.task),
    operating_write_performed: false
  };
  return finish();
}

export {
  identifyDocument, parseFieldworkFilename, matchSubmissionToReceipt, detectInvalidEvidence,
  guardWrite, compareExpectedActual, sanitize, WRITE_MODE,
  createNotionProvider, createDriveProvider, createSlackProvider,
  INTENT, INTENT_LABEL, routeIntent, parseUserMessage, extractFundName, extractFolderHint,
  formatUserResult, buildManagerMessageText
};
export default { processRequest, runUserRequest, buildProviders, healthCheck, USER_INTENTS };
