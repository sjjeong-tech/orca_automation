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
    capture(parseable, /(.+?투자조합)(?:의)?(?:\s*고유번호증|\s+요청|\s+신청)/) ??
    capture(parseable, /(.+?조합)(?:의)?(?:\s*고유번호증|\s+요청|\s+신청)/);
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
  return contract.task_generation_policy.tasks.map((task) => ({
    ...task,
    process_id: intake.request_type === "고유번호증 신청" ? "P03" : task.process_id,
    title: `[TEST][CI1][${String(task.order).padStart(2, "0")}] ${task.name}`,
    operational_task_id: `CI1-P03-${String(task.order).padStart(2, "0")}`,
    status: "시작 전",
    assignee: intake.fund_manager,
    next_action: task.name
  }));
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
  const args = { command: argv[2], text: null, approve: false, baseDate: "2026-07-24" };
  for (let i = 3; i < argv.length; i += 1) {
    if (argv[i] === "--approve") args.approve = true;
    else if (argv[i] === "--base-date") args.baseDate = argv[++i];
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
  const intake = parseIntake(args.text, { baseDate: args.baseDate });
  const questions = missingQuestions(intake);
  const result = buildWritePlan(intake, { approved: args.approve });
  console.log(JSON.stringify({ intake, questions, result }, null, 2));
}
