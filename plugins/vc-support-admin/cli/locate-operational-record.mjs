#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { locateOperationalRecords } from "../kernel/record-locator.mjs";
const i = process.argv.indexOf("--fixture"), file = i >= 0 ? process.argv[i + 1] : null;
if (!file) { console.error("--fixture <json> is required"); process.exit(2); }
const result = locateOperationalRecords(JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, "")));
console.log(JSON.stringify({ ...result, user_summary: { found_fund: result.master_matches.map((r) => r.name ?? r.title), existing_work: result.fund_work_matches.length, existing_request: result.request_matches.map((r) => r.title ?? r.name), active_tasks: result.task_matches.filter((r) => r.state !== "완료").length, next_step: result.recommended_action, write: 0 } }, null, 2));
