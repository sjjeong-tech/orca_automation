#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { reviewTaskEvidence } from "../kernel/task-evidence-orchestrator.mjs";
const arg = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : null; };
const inv = arg("--inventory"), snap = arg("--snapshot");
if (!inv || !snap) { console.error("--inventory and --snapshot are required"); process.exit(2); }
const read = (f) => JSON.parse(readFileSync(f, "utf8").replace(/^\uFEFF/, ""));
const result = reviewTaskEvidence({ inventory: read(inv), notion_snapshot: read(snap), fund_name: arg("--fund"), process_id: arg("--process") ?? "P03", e2e_id: arg("--e2e") ?? "E2E-03", operational_task_id: arg("--task") ?? "P03-T04", preview_only: true });
console.log(JSON.stringify({ 대상: result.target, 현재_Notion: result.snapshot.mapped_actual_values, 발견_Evidence: result.task_preview.evidence_reference, 제안: result.task_preview.proposed_values, 비교: result.comparison, 안전: { approval_required: true, actual_notion_write_count: 0, actual_file_write_count: 0 }, started_at_kst: result.started_at_kst, completed_at_kst: result.completed_at_kst, elapsed_time_ms: result.elapsed_time_ms }, null, 2));
