#!/usr/bin/env node

// VC 지원팀 행정업무 Plugin — Entry Point (Prototype)
// 실제 Database·Page·Drive ID는 이 파일에 없다. runtime_config와 providers로 주입한다.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");

export const load = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
export const loadSkillContract = () => load("skills/e2e03-tax-id-application/contract.yaml");
export const loadDriveAdapter = () => load("plugins/vc-support-admin/adapters/drive.yaml");
export const loadSlackAdapter = () => load("plugins/vc-support-admin/adapters/slack.yaml");
export const loadPlugin = () => load("plugins/vc-support-admin/plugin.yaml");

// ---------------------------------------------------------------- pure logic

export function detectProcess(userMessage, { process_hint } = {}, contract = loadSkillContract()) {
  if (process_hint) return process_hint === contract.process_id ? contract.process_id : null;
  const hit = contract.trigger_phrases.some((p) => userMessage.includes(p)) ||
    userMessage.includes("고유번호");
  return hit ? contract.process_id : null;
}

export function classifyEvidence(files = [], drive = loadDriveAdapter()) {
  const rules = drive.evidence_classification;
  return files.map((file) => {
    const name = file.name ?? "";
    const ext = (file.extension ?? name.split(".").pop() ?? "").toLowerCase();
    const size = Number(file.size ?? 0);

    let type = null;
    for (const rule of rules) {
      const matched = rule.signals.some((s) => name.includes(s));
      const excluded = (rule.exclude_signals ?? []).some((s) => name.includes(s));
      if (matched && !excluded) { type = rule.type; break; }
    }

    let verdict;
    if (file.access_blocked) verdict = "ACCESS_BLOCKED";
    else if (ext === "lnk") verdict = "UNVERIFIED_SHORTCUT";
    else if (size === 0) verdict = "ZERO_BYTE";
    else if (!type) verdict = "CANDIDATE";
    else verdict = "VERIFIED";

    const counts = verdict === "VERIFIED";
    return { name, type, verdict, counts_as_evidence: counts, source_layer: file.source_layer ?? null };
  });
}

export function summarizeEvidence(classified) {
  const byType = {};
  for (const e of classified) {
    if (!e.counts_as_evidence || !e.type) continue;
    (byType[e.type] ??= []).push(e.name);
  }
  return {
    counted_types: Object.keys(byType).sort(),
    by_type: byType,
    rejected: classified.filter((e) => !e.counts_as_evidence)
      .map((e) => ({ name: e.name, verdict: e.verdict }))
  };
}

export function computeTaskStates(evidenceSummary, { existingTasks = [] } = {}, contract = loadSkillContract()) {
  const counted = new Set(evidenceSummary.counted_types ?? []);
  const existingById = new Map(existingTasks.map((t) => [t.operational_task_id, t]));

  return contract.operational_task_ids.map((taskId, index) => {
    const rule = contract.evidence_to_task_rules.find((r) => r.task === taskId) ?? {};
    const support = (rule.supporting_evidence ?? []).filter((t) => counted.has(t));
    const hasSupport = support.length > 0;
    const existing = existingById.get(taskId) ?? null;

    // 계약상 어떤 Task도 Evidence만으로 완료하지 않는다.
    let state;
    if (hasSupport || index === 0) state = "진행 중";
    else state = "시작 전";

    const blocker = hasSupport || index === 0
      ? `HUMAN_CONFIRMATION_REQUIRED — ${rule.human_confirmation ?? "사람 확인 필요"}`
      : `${contract.operational_task_ids[index - 1]} 미완료`;

    return {
      operational_task_id: taskId,
      state_candidate: state,
      auto_complete_allowed: false,
      supporting_evidence: support,
      requires_human_confirmation: true,
      human_confirmation: rule.human_confirmation ?? null,
      blocker,
      existing_state: existing ? existing.state : null
    };
  });
}

export function calculateDuplicateKey({ fund_key, process_id, request_type, record_prefix }) {
  return [fund_key, process_id, request_type, record_prefix].map((v) => v ?? "").join("|");
}

const ACTION_WORDS = ["완료", "진행 중", "진행중", "시작", "변경", "기록"];

export function parseApproval(text = "", { contract = loadSkillContract(), slack = loadSlackAdapter() } = {}) {
  const trimmed = text.trim();
  if (!trimmed) return { approved: false, reason: "NO_APPROVAL_INPUT", write_allowed: false };

  const taskMatch = trimmed.match(/P03-T0[1-6]/);
  const hasAction = ACTION_WORDS.some((w) => trimmed.includes(w));
  const isAmbiguousOnly = slack.approval_parsing.ambiguous_phrases
    .some((p) => trimmed === p || trimmed === `${p}.`);

  if (isAmbiguousOnly || !taskMatch || !hasAction) {
    return {
      approved: false,
      reason: "APPROVAL_AMBIGUOUS",
      write_allowed: false,
      missing: [
        taskMatch ? null : "target_task",
        hasAction ? null : "change_action"
      ].filter(Boolean),
      question: "어떤 Task를 어떤 값으로 변경할지 명시해주세요. 예: `P03-T01을 완료로 변경`"
    };
  }
  return {
    approved: true,
    reason: "EXPLICIT_TARGET_AND_VALUE",
    write_allowed: true,
    target_task: taskMatch[0],
    contract_version: contract.version
  };
}

export function buildManagerShare(taskStates, { fund_name, process_id }) {
  const active = taskStates.filter((t) => t.state_candidate === "진행 중");
  return {
    fund: fund_name,
    process_id,
    active_tasks: active.map((t) => ({
      task: t.operational_task_id,
      next_action: t.human_confirmation,
      blocker: t.blocker
    })),
    human_confirmation_count: taskStates.filter((t) => t.requires_human_confirmation).length,
    send_enabled: false
  };
}

export function buildSlackPreview(result, slack = loadSlackAdapter()) {
  const lines = [
    `[Input] ${result.process_id ?? "-"} / ${result.resolved_fund?.name ?? "미해소"}`,
    `[State] 활성 Task ${result.manager_share_preview?.active_tasks?.length ?? 0}건`,
    `[Evidence] 인정 ${result.evidence_summary?.counted_types?.join(", ") || "없음"} / 불인정 ${result.evidence_summary?.rejected?.length ?? 0}건`,
    `[Preview] Write 예정 ${result.preview?.planned_write_count ?? 0}건`,
    `[Approval] ${result.approval_required ? "명시 승인 필요" : "불필요"}`,
    `[Handoff] ${result.next_action ?? "-"}`
  ];
  return {
    contract: slack.message_contract,
    send_enabled: false,
    text: lines.join("\n"),
    thread_key: result.duplicate_key ?? null
  };
}

// ------------------------------------------------------------- entry point

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
  const result = {
    interface: iface,
    resolved_fund: null,
    fund_match_result: null,
    process_id: null,
    existing_request: null,
    task_states: [],
    evidence_summary: null,
    missing_information: [],
    human_confirmation: [],
    blockers: [],
    preview: null,
    approval_required: true,
    allowed_changes: [],
    committed_changes: { write_count: 0, records: [] },
    verification: null,
    manager_share_preview: null,
    next_action: null,
    handoff: null,
    duplicate_key: null,
    errors
  };

  // 1) Process 식별
  result.process_id = detectProcess(user_message, { process_hint }, contract);
  if (!result.process_id) {
    errors.push({ code: "PROCESS_NOT_SUPPORTED", detail: "E2E-03 이외 Process는 이 Skill 범위가 아니다." });
    result.next_action = "지원 Process를 확인해주세요.";
    return result;
  }

  // 2) Fund 해소 — 0·복수는 Write 0
  const fundQuery = fund_hint ?? user_message;
  const candidates = providers.notion?.searchFunds ? await providers.notion.searchFunds(fundQuery) : [];
  if (candidates.length === 0) {
    result.fund_match_result = "NOT_FOUND";
    errors.push({ code: "FUND_NOT_FOUND", detail: "정확히 일치하는 조합이 없습니다." });
    result.missing_information.push("정확한 조합명");
    result.next_action = "조합명을 정확히 알려주세요.";
    result.slack_preview = buildSlackPreview(result);
    return result;
  }
  if (candidates.length > 1) {
    result.fund_match_result = "MULTIPLE";
    errors.push({ code: "FUND_MULTIPLE", detail: `${candidates.length}건이 일치합니다.`, candidates: candidates.map((c) => c.name) });
    result.next_action = "대상 조합을 하나 선택해주세요.";
    result.slack_preview = buildSlackPreview(result);
    return result;
  }
  result.fund_match_result = "EXACT_1";
  result.resolved_fund = candidates[0];

  // 3) Evidence 분류
  const files = evidence_context?.files
    ?? (providers.drive?.listEvidence ? await providers.drive.listEvidence(result.resolved_fund) : []);
  const classified = classifyEvidence(files);
  result.evidence_summary = summarizeEvidence(classified);

  // 4) 기존 Instance 조회 + 중복 Key
  result.duplicate_key = calculateDuplicateKey({
    fund_key: result.resolved_fund.key ?? result.resolved_fund.name,
    process_id: result.process_id,
    request_type: contract.evidence_types ? "고유번호증 신청" : null,
    record_prefix: runtime_config.record_prefix ?? null
  });
  const existing = providers.notion?.findRequestByDuplicateKey
    ? await providers.notion.findRequestByDuplicateKey(result.duplicate_key)
    : null;
  result.existing_request = existing ?? null;
  const existingTasks = existing && providers.notion?.findTasks
    ? await providers.notion.findTasks(existing)
    : [];

  // 5) Task 상태 계산 (자동 완료 없음)
  result.task_states = computeTaskStates(result.evidence_summary, { existingTasks }, contract);
  result.human_confirmation = result.task_states
    .filter((t) => t.requires_human_confirmation)
    .map((t) => ({ task: t.operational_task_id, confirm: t.human_confirmation }));
  result.blockers = result.task_states.map((t) => ({ task: t.operational_task_id, blocker: t.blocker }));

  // 6) Preview — 기존 Instance가 있으면 신규 생성 0
  const wouldCreate = existing ? 0 : 1 + contract.operational_task_ids.length;
  result.preview = {
    mode: runtime_config.write_mode ?? contract.default_write_mode,
    reuse_existing: Boolean(existing),
    planned_write_count: wouldCreate,
    planned_records: existing
      ? []
      : ["request:1", `task:${contract.operational_task_ids.length}`],
    operating_record_change: 0,
    drive_change: 0
  };

  // 7) 승인 Guard
  const approval = parseApproval(approval_context ?? "", { contract });
  result.approval_required = !approval.approved;
  result.allowed_changes = approval.approved ? [approval.target_task] : [];
  if (!approval.approved && approval_context) {
    errors.push({ code: approval.reason, detail: approval.question, missing: approval.missing });
  }

  // 8) Commit — 승인 + write_mode 허용 + 신규 생성 필요할 때만
  const writeMode = runtime_config.write_mode ?? contract.default_write_mode;
  if (approval.approved && writeMode !== "preview_only" && !existing && providers.notion?.createTestInstance) {
    const created = await providers.notion.createTestInstance(result);
    result.committed_changes = { write_count: created.write_count ?? 0, records: created.records ?? [] };
    result.verification = providers.notion.verify ? await providers.notion.verify(created) : null;
  } else {
    result.committed_changes = { write_count: 0, records: [], reason: existing ? "REUSE_EXISTING" : "NO_APPROVAL_OR_PREVIEW_ONLY" };
  }

  // 9) 공유·Handoff
  result.manager_share_preview = buildManagerShare(result.task_states, {
    fund_name: result.resolved_fund.name,
    process_id: result.process_id
  });
  result.slack_preview = buildSlackPreview(result);
  const firstActive = result.task_states.find((t) => t.state_candidate === "진행 중");
  result.next_action = firstActive
    ? `${firstActive.operational_task_id}: ${firstActive.human_confirmation}`
    : "확인 필요";
  result.handoff = {
    next_owner: "USER",
    resume_key: result.duplicate_key,
    open_items: result.human_confirmation.map((h) => h.task),
    operating_write_performed: false
  };

  return result;
}

export default { processRequest };
