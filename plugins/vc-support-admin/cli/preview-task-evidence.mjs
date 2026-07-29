#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { discoverEvidence } from "../kernel/evidence-discovery.mjs";
import { buildTaskEvidencePreview } from "../kernel/task-evidence-preview.mjs";
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const inv = arg("--inventory"), current = arg("--current");
if (!inv || !current) { console.error("--inventory and --current are required"); process.exit(2); }
const inventory = JSON.parse(readFileSync(inv, "utf8").replace(/^\uFEFF/, ""));
const currentValues = JSON.parse(readFileSync(current, "utf8").replace(/^\uFEFF/, ""));
const discovered = discoverEvidence({ ...inventory, fund_name: arg("--fund") ?? inventory.fund_name, process_id: arg("--process") ?? inventory.process_id });
const task = arg("--task");
const candidate = discovered.evidence_candidates.find((x) => x.task_candidate === task) ?? discovered.invalid_candidates.find((x) => x.name === task) ?? null;
const result = buildTaskEvidencePreview({ evidence_candidate: candidate, task_candidate: task, current_task_values: currentValues, target_match_status: arg("--target-status") ?? "EXACT_1", inventory_reference: candidate?.name ?? null, preview_only: true });
console.log(JSON.stringify({ found_evidence: candidate, ...result, actual_write_count: 0 }, null, 2));
