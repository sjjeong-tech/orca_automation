#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { compareTaskActual } from "../kernel/task-actual-compare.mjs";
const arg = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : null; };
const expected = arg("--expected"), actual = arg("--actual");
if (!expected || !actual) { console.error("--expected and --actual are required"); process.exit(2); }
const read = (f) => JSON.parse(readFileSync(f, "utf8").replace(/^\uFEFF/, ""));
console.log(JSON.stringify(compareTaskActual({ expected_preview: read(expected), notion_task_actual: read(actual), target_match_status: arg("--target-status") ?? "EXACT_1", preview_only: true }), null, 2));
