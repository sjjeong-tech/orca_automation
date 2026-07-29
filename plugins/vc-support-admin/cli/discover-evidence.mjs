#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { discoverEvidence } from "../kernel/evidence-discovery.mjs";
const i = process.argv.indexOf("--inventory"), file = i >= 0 ? process.argv[i + 1] : null;
if (!file) { console.error("--inventory <json> is required"); process.exit(2); }
const input = JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
const result = discoverEvidence({ ...input, fund_name: process.argv.includes("--fund") ? process.argv[process.argv.indexOf("--fund") + 1] : input.fund_name, process_id: process.argv.includes("--process") ? process.argv[process.argv.indexOf("--process") + 1] : input.process_id });
console.log(JSON.stringify(result, null, 2));
