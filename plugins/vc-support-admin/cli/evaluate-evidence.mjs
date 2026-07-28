#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { buildEvidencePreview } from "../kernel/evidence-adapter.mjs";

function arg(name, fallback = null) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const text = arg("--text", "");
const inputFile = arg("--input");
const input = inputFile ? JSON.parse(readFileSync(inputFile, "utf8")) : {
  text,
  fund_name: arg("--fund"),
  case_id: arg("--case"),
  process_id: arg("--process", "P03"),
  current_request: arg("--request"),
  current_task: arg("--task"),
};
if (!input.text) { console.error("--text or --input is required"); process.exit(2); }
const result = buildEvidencePreview(input);
console.log(JSON.stringify({
  extracted_facts: result.extracted_facts,
  evidence_judgment: result.state.evidence_judgment,
  proposed_task_status: result.state.proposed_task_status,
  proposed_actor: result.state.proposed_actor,
  proposed_next_action: result.state.proposed_next_action,
  proposed_blocker: result.state.proposed_blocker,
  request_completion_allowed: result.state.request_completion_allowed,
  missing_information: result.missing_information,
  ambiguity: result.ambiguity,
  notion_change_preview: result.notion_change_preview,
  approval_required: true,
  actual_write_count: 0,
}, null, 2));
