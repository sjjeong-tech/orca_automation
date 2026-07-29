import fs from "node:fs";
import { createTestLabCommitPreview, commitTestLabWithRequery } from "../kernel/test-lab-write-requery.mjs";
const file = process.argv[process.argv.indexOf("--fixture") + 1];
const input = JSON.parse(fs.readFileSync(file, "utf8"));
const preview = createTestLabCommitPreview(input);
const result = { preview, approval_scope: null, committed_writes: [], requery_results: [], operational_write_count: 0, actual_file_write_count: 0, approval_required: true };
console.log(JSON.stringify(result, null, 2));
