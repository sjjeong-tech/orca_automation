#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { mapNotionTaskSnapshot } from "../kernel/notion-task-snapshot.mjs";
const i = process.argv.indexOf("--snapshot"), file = i >= 0 ? process.argv[i + 1] : null;
if (!file) { console.error("--snapshot <json> is required"); process.exit(2); }
console.log(JSON.stringify(mapNotionTaskSnapshot(JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, ""))), null, 2));
