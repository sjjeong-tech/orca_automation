#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTRACT_PATH = path.join(ROOT, "contracts", "conversational-intake-contract.yaml");

export function loadContract() {
  return JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
}

function nextWeekday(base, weekday) {
  const date = new Date(`${base}T00:00:00Z`);
  const current = date.getUTCDay();
  const startNextWeek = 7 - current + 1;
  const mondayOffset = weekday === 0 ? 6 : weekday - 1;
  date.setUTCDate(date.getUTCDate() + startNextWeek + mondayOffset);
  return date.toISOString().slice(0, 10);
}

export function parseTargetDate(text, baseDate = "2026-07-24") {
  if (/다음\s*주\s*수요일/.test(text)) return nextWeekday(baseDate, 3);
  if (/이번\s*주\s*금요일/.test(text)) {
    const date = new Date(`${baseDate}T00:00:00Z`);
    const delta = (5 - date.getUTCDay() + 7) % 7;
    date.setUTCDate(date.getUTCDate() + delta);
    return date.toISOString().slice(0, 10);
  }
  if (/내일/.test(text)) {
    const date = new Date(`${baseDate}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + 1);
    return date.toISOString().slice(0, 10);
  }
  const explicit = text.match(/(?:(\d{4})년\s*)?(\d{1,2})월\s*(\d{1,2})일/);
  if (explicit) {
    const year = explicit[1] ?? baseDate.slice(0, 4);
    return `${year}-${explicit[2].padStart(2, "0")}-${explicit[3].padStart(2, "0")}`;
  }
  return null;
}

function capture(text, pattern) {
  return text.match(pattern)?.[1]?.trim() ?? null;
}

export function parseIntake(text, { baseDate = "2026-07-24" } = {}) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const parseable = normalized.replace(/^\[TEST\]\[CI1-PILOT\]\s*/, "");
  const requestType = /고유번호증(?:\s*신청)?/.test(parseable) ? "고유번호증 신청" : null;
  const relatedFund =
    capture(parseable, /(.+?투자조합(?:\s*\d+호)?)(?:의)?(?:\s*고유번호증|\s+요청|\s+신청)/) ??
    capture(parseable, /(.+?조합(?:\s*\d+호)?)(?:의)?(?:\s*고유번호증|\s+요청|\s+신청)/);
  const requester = capture(normalized, /요청자는\s*([가-힣A-Za-z0-9 ]+?)(?:이고|이며|입니다|,|\.)/);
  const fundManager = capture(normalized, /담당\s*관리역은\s*([가-힣A-Za-z0-9 ]+?)(?:입니다|이고|이며|,|\.)/);
  const documentStatus = /서류(?:는|가)?\s*(?:전달\s*완료|모두\s*전달)/.test(normalized)
    ? "전달 완료"
    : /서류(?:는|가)?\s*(?:일부\s*전달|일부만\s*전달)/.test(normalized)
      ? "일부 전달"
      : /서류(?:는|가)?\s*(?:아직\s*)?미전달/.test(normalized)
        ? "미전달"
        : null;
  const urgentNegated = /긴급(?:\s*요청)?(?:은|는)?\s*(?:아니|아님|아닙|않)/.test(normalized);

  return {
    related_fund: relatedFund,
    request_type: requestType,
    requester,
    fund_manager: fundManager,
    document_status: documentStatus,
    target_date: parseTargetDate(normalized, baseDate),
    urgent: urgentNegated ? false : /긴급|급함|급하게/.test(normalized),
    original_folder: capture(normalized, /(https?:\/\/\S+)/),
    notes: null,
    source_text: text
  };
}

export function missingFields(intake, contract = loadContract()) {
  return contract.required_fields.filter((field) => intake[field] == null || intake[field] === "");
}

export function missingQuestions(intake, contract = loadContract()) {
  return missingFields(intake, contract)
    .slice(0, contract.missing_information_rules.max_questions_per_turn)
    .map((field) => ({ field, question: contract.missing_information_rules.questions[field] }));
}

export function detectDuplicates(intake, existing = []) {
  return existing.filter((record) =>
    record.related_fund === intake.related_fund &&
    record.request_type === intake.request_type &&
    ["시작 전", "진행 중"].includes(record.status)
  );
}

export function buildTasks(intake, contract = loadContract()) {
  const prefix = intake.source_text?.trimStart().startsWith("[TEST][CI1-PILOT]") ? "[TEST][CI1-PILOT]" : "[TEST][CI1]";
  return contract.task_generation_policy.tasks.map((task) => ({
    ...task,
    process_id: intake.request_type === "고유번호증 신청" ? "P03" : task.process_id,
    title: `${prefix}[${String(task.order).padStart(2, "0")}] ${task.name}`,
    operational_task_id: `CI1-P03-${String(task.order).padStart(2, "0")}`,
    status: "시작 전",
    assignee: intake.fund_manager,
    next_action: task.name
  }));
}

export function prepareTransaction(text, options = {}) {
  const contract = options.contract ?? loadContract();
  const intake = typeof text === "string" ? parseIntake(text, options) : text;
  const fundMatches = options.fund_matches ?? [];
  const requesterMatches = options.requester_matches ?? [];
  const managerMatches = options.manager_matches ?? [];
  const duplicates = detectDuplicates(intake, options.existing_requests ?? []);
  const missing = missingFields(intake, contract);
  const ambiguous = {
    fund: fundMatches.length > 1,
    requester: requesterMatches.length > 1,
    fund_manager: managerMatches.length > 1
  };
  return {
    stage: "PREPARE",
    transaction_id: options.transaction_id ?? `CI1-${options.baseDate ?? "2026-07-24"}-PREVIEW`,
    intake,
    resolution: {
      fund: fundMatches.length === 1
        ? { status: "EXISTING", name: fundMatches[0].name ?? intake.related_fund, page_id: fundMatches[0].page_id, url: fundMatches[0].url }
        : fundMatches.length === 0
          ? { status: "CREATE_ON_COMMIT", page_id: null, url: null }
          : { status: "AMBIGUOUS", candidates: fundMatches },
      requester: requesterMatches.length === 1
        ? { status: "RESOLVED", person_id: requesterMatches[0].person_id }
        : { status: requesterMatches.length === 0 ? "NOT_FOUND" : "AMBIGUOUS" },
      fund_manager: managerMatches.length === 1
        ? { status: "RESOLVED", person_id: managerMatches[0].person_id }
        : { status: managerMatches.length === 0 ? "NOT_FOUND" : "AMBIGUOUS" }
    },
    duplicate_requests: duplicates,
    missing_required: missing,
    ambiguous,
    actual_write_count: 0,
    prepare_complete:
      missing.length === 0 &&
      !Object.values(ambiguous).some(Boolean) &&
      requesterMatches.length === 1 &&
      managerMatches.length === 1
  };
}

export function buildTransactionPreview(prepared, contract = loadContract()) {
  const fundWillBeCreated = prepared.resolution.fund.status === "CREATE_ON_COMMIT";
  const blocked =
    !prepared.prepare_complete ||
    prepared.resolution.fund.status === "AMBIGUOUS" ||
    prepared.duplicate_requests.length > 0;
  const tasks = buildTasks(prepared.intake, contract);
  const commitPlan = {
    fund: {
      action: fundWillBeCreated ? "CREATE" : "USE_EXISTING",
      page_id: prepared.resolution.fund.page_id,
      planned_writes: fundWillBeCreated ? 1 : 0
    },
    request: {
      action: blocked ? "BLOCKED" : "CREATE",
      planned_writes: blocked ? 0 : 1,
      title: `[TEST][CI1-PILOT] ${prepared.intake.related_fund} — ${prepared.intake.request_type}`,
      status: "시작 전",
      current_actor: "담당 관리역",
      next_action: prepared.intake.document_status === "미전달" ? "신청 필요서류 전달" : "요청정보·착수조건 확인",
      blocker: prepared.intake.document_status === "미전달" ? "서류 미전달" : ""
    },
    tasks: {
      action: blocked ? "BLOCKED" : "CREATE_AFTER_REQUEST_RELATION_VERIFY",
      planned_writes: blocked ? 0 : tasks.length,
      records: tasks
    }
  };
  return {
    stage: "PREVIEW",
    transaction_id: prepared.transaction_id,
    actual_write_count: 0,
    intake: prepared.intake,
    resolution: prepared.resolution,
    duplicate_requests: prepared.duplicate_requests,
    missing_required: prepared.missing_required,
    commit_plan: commitPlan,
    planned_write_count:
      commitPlan.fund.planned_writes +
      commitPlan.request.planned_writes +
      commitPlan.tasks.planned_writes,
    approval_required: true,
    commit_allowed: !blocked
  };
}

export async function commitTransaction(preview, { approved = false, adapter, execution_log = {} } = {}) {
  if (!approved) return { stage: "COMMIT_BLOCKED", reason: "EXPLICIT_APPROVAL_REQUIRED", actual_write_count: 0, execution_log };
  if (!preview.commit_allowed) return { stage: "COMMIT_BLOCKED", reason: "PREVIEW_NOT_COMMITTABLE", actual_write_count: 0, execution_log };
  if (!adapter) throw new Error("COMMIT adapter is required");

  const log = execution_log;
  log.transaction_id ??= preview.transaction_id;
  log.task_page_ids ??= {};
  let writes = 0;

  try {
    if (!log.fund_page_id) {
      if (preview.commit_plan.fund.action === "CREATE") {
        const fund = await adapter.createFund(preview);
        log.fund_page_id = fund.page_id;
        log.fund_url = fund.url;
        writes += 1;
      } else {
        log.fund_page_id = preview.commit_plan.fund.page_id;
      }
    }
  } catch (error) {
    return { stage: "FAILED", failed_at: "FUND_CREATE", actual_write_count: writes, error: error.message, execution_log: log };
  }

  try {
    if (!log.request_page_id) {
      const request = await adapter.createRequest(preview, log.fund_page_id);
      log.request_page_id = request.page_id;
      log.request_url = request.url;
      writes += 1;
    }
    const relationVerified = await adapter.verifyRequestFundRelation(log.request_page_id, log.fund_page_id);
    if (!relationVerified) throw new Error("REQUEST_FUND_RELATION_VERIFY_FAILED");
  } catch (error) {
    return { stage: "FAILED", failed_at: "REQUEST_CREATE_OR_RELATION_VERIFY", actual_write_count: writes, error: error.message, execution_log: log };
  }

  const missingTasks = [];
  for (const task of preview.commit_plan.tasks.records) {
    const key = task.operational_task_id;
    if (log.task_page_ids[key]) continue;
    try {
      const created = await adapter.createTask(task, log.request_page_id, preview.transaction_id);
      log.task_page_ids[key] = created.page_id;
      writes += 1;
    } catch (error) {
      missingTasks.push({ operational_task_id: key, error: error.message });
    }
  }
  if (missingTasks.length) {
    return { stage: "PARTIAL", failed_at: "TASK_CREATE", actual_write_count: writes, missing_tasks: missingTasks, execution_log: log };
  }

  const relationRollup = await adapter.verifyTaskRelationsAndRollup(Object.values(log.task_page_ids), log.request_page_id);
  return {
    stage: relationRollup ? "COMPLETED" : "COMPLETED_WITH_ROLLUP_GAP",
    actual_write_count: writes,
    execution_log: log
  };
}

export function buildPreview(intake, { duplicates = [], contract = loadContract() } = {}) {
  const missing = missingFields(intake, contract);
  return {
    heading: "지원팀 업무요청 생성 Preview",
    request: intake,
    tasks: buildTasks(intake, contract),
    duplicate_requests: duplicates,
    missing_required: missing,
    warnings: [
      ...(intake.target_date ? [] : ["목표 완료일 미입력"]),
      ...(intake.original_folder ? [] : ["원본 폴더 미입력"]),
      ...(duplicates.length ? ["미완료 중복 요청 후보가 있어 별도 승인이 필요함"] : [])
    ],
    write_allowed: missing.length === 0 && duplicates.length === 0
  };
}

export function buildWritePlan(intake, options = {}) {
  const contract = options.contract ?? loadContract();
  const duplicates = options.duplicates ?? [];
  const preview = buildPreview(intake, { duplicates, contract });
  if (!options.approved) return { status: "PREVIEW_ONLY", write_count: 0, preview };
  if (!preview.write_allowed) return { status: "BLOCKED", write_count: 0, preview };
  return {
    status: "APPROVED_WRITE_PLAN",
    write_count: 1 + preview.tasks.length,
    request_title: `[TEST][CI1] ${intake.related_fund} — ${intake.request_type}`,
    request: intake,
    tasks: preview.tasks,
    preview
  };
}

function parseArgs(argv) {
  const args = {
    command: argv[2], text: null, approve: false, baseDate: "2026-07-24",
    transactionId: null, fundPageId: null, fundUrl: null, fundName: null, requesterPersonId: null, managerPersonId: null
  };
  for (let i = 3; i < argv.length; i += 1) {
    if (argv[i] === "--approve") args.approve = true;
    else if (argv[i] === "--base-date") args.baseDate = argv[++i];
    else if (argv[i] === "--transaction-id") args.transactionId = argv[++i];
    else if (argv[i] === "--fund-page-id") args.fundPageId = argv[++i];
    else if (argv[i] === "--fund-url") args.fundUrl = argv[++i];
    else if (argv[i] === "--fund-name") args.fundName = argv[++i];
    else if (argv[i] === "--requester-person-id") args.requesterPersonId = argv[++i];
    else if (argv[i] === "--manager-person-id") args.managerPersonId = argv[++i];
    else if (!args.text) args.text = argv[i];
  }
  return args;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv);
  if (args.command !== "create" || !args.text) {
    console.error('Usage: node scripts/conversational-intake.mjs create "<Korean request>" [--approve] [--base-date YYYY-MM-DD]');
    process.exit(2);
  }
  const prepared = prepareTransaction(args.text, {
    baseDate: args.baseDate,
    transaction_id: args.transactionId,
    fund_matches: args.fundPageId ? [{ name: args.fundName, page_id: args.fundPageId, url: args.fundUrl }] : [],
    requester_matches: args.requesterPersonId ? [{ person_id: args.requesterPersonId }] : [],
    manager_matches: args.managerPersonId ? [{ person_id: args.managerPersonId }] : []
  });
  const questions = missingQuestions(prepared.intake);
  const preview = buildTransactionPreview(prepared);
  console.log(JSON.stringify({ prepared, questions, preview }, null, 2));
}
