#!/usr/bin/env node
// Test Harness — 재사용 Skill·Plugin 검증. 실제 Notion·Drive 연결 없이 fixture provider로 실행한다.

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  processRequest, classifyEvidence, summarizeEvidence, computeTaskStates,
  parseApproval, calculateDuplicateKey, buildSlackPreview, loadSkillContract, loadPlugin
} from "../index.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..", "..");
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));

const cases = read("skills/e2e03-tax-id-application/tests/cases.yaml").cases;
const expected = read("skills/e2e03-tax-id-application/tests/expected.yaml");

// ------------------------------------------------------------- fixtures
const EVIDENCE_SETS = {
  none: [],
  full: [
    { name: "합본_고유번호증 신청서류.pdf", size: 11882312 },
    { name: "고유번호증 접수증.pdf", size: 437924 },
    { name: "규약_세무서 보완 제출용.pdf", size: 4011673 },
    { name: "조합_고유번호증.pdf", size: 770989 },
    { name: "조합_보안카드.pdf", size: 32592 },
    { name: "조합_보안카드.lnk", size: 552 },
    { name: "인감증명서 2부.txt", size: 0 }
  ],
  receipt_only: [{ name: "고유번호증 접수증.pdf", size: 400000 }],
  unsafe: [
    { name: "조합_보안카드.lnk", size: 552 },
    { name: "임대차계약서.txt", size: 0 },
    { name: "무언가.bin", size: 100 }
  ]
};

function makeProviders(fixture) {
  return {
    notion: {
      async searchFunds() { return fixture.funds.map((name) => ({ name, key: name })); },
      async findRequestByDuplicateKey(key) { return fixture.existing_request ? { id: "FIXTURE_REQUEST", duplicate_key: key } : null; },
      async findTasks() {
        return fixture.existing_request
          ? loadSkillContract().operational_task_ids.map((id) => ({ operational_task_id: id, state: "진행 중" }))
          : [];
      },
      async createTestInstance() { throw new Error("preview_only 모드에서 호출되면 안 된다"); }
    },
    drive: { async listEvidence() { return EVIDENCE_SETS[fixture.evidence] ?? []; } }
  };
}

const results = {};
for (const c of cases) {
  results[c.id] = await processRequest({
    ...c.input,
    runtime_config: { record_prefix: "[TEST][E2E03-PROTOTYPE]", write_mode: "preview_only" },
    providers: makeProviders(c.fixture)
  });
}

// ------------------------------------------------------------- Unit
const cls = classifyEvidence(EVIDENCE_SETS.full);
assert.equal(cls.find((e) => e.name.endsWith(".lnk")).verdict, "UNVERIFIED_SHORTCUT");
assert.equal(cls.find((e) => e.name.endsWith(".txt")).verdict, "ZERO_BYTE");
assert.equal(cls.filter((e) => e.verdict === "UNVERIFIED_SHORTCUT" || e.verdict === "ZERO_BYTE")
  .every((e) => e.counts_as_evidence === false), true);
const sum = summarizeEvidence(cls);
assert.ok(sum.counted_types.includes("RECEIPT"));
assert.ok(sum.counted_types.includes("RESULT_DOCUMENT"));

const states = computeTaskStates(sum, {});
assert.equal(states.length, 6);
assert.equal(states.every((s) => s.auto_complete_allowed === false), true);
assert.equal(states.every((s) => s.requires_human_confirmation === true), true);
assert.equal(states.filter((s) => s.state_candidate === "완료").length, 0);
assert.equal(calculateDuplicateKey({ fund_key: "A", process_id: "P03", request_type: "고유번호증 신청", record_prefix: "[T]" }),
  "A|P03|고유번호증 신청|[T]");
console.log("unit tests: PASS (evidence classification, task states, duplicate key)");

// ------------------------------------------------------------- Approval guard
for (const phrase of ["네", "진행해주세요", "그렇게 해주세요", "확인했습니다"]) {
  const a = parseApproval(phrase);
  assert.equal(a.approved, false, `${phrase} must not approve`);
  assert.equal(a.write_allowed, false);
}
assert.equal(parseApproval("P03-T01을 완료로 변경해주세요").approved, true);
assert.equal(parseApproval("P03-T01").approved, false); // action 없음
console.log("approval guard tests: PASS (ambiguous blocked, explicit target+action allowed)");

// ------------------------------------------------------------- Case assertions
const e = expected.expected;
assert.equal(results["REUSE-01"].fund_match_result, e["REUSE-01"].fund_match_result);
assert.equal(results["REUSE-01"].preview.reuse_existing, true);
assert.equal(results["REUSE-01"].preview.planned_write_count, 0);
assert.equal(results["REUSE-01"].committed_changes.write_count, 0);
assert.equal(results["REUSE-01"].human_confirmation.length, 6);

assert.equal(results["NOWRITE-01"].approval_required, true);
assert.ok(results["NOWRITE-01"].errors.some((x) => x.code === "APPROVAL_AMBIGUOUS"));
assert.equal(results["NOWRITE-01"].committed_changes.write_count, 0);

assert.equal(results["DUP-01"].preview.planned_write_count, 0);
assert.equal(results["DUP-01"].duplicate_key, results["REUSE-01"].duplicate_key);

assert.equal(results["FUND-NOTFOUND"].fund_match_result, "NOT_FOUND");
assert.ok(results["FUND-NOTFOUND"].errors.some((x) => x.code === "FUND_NOT_FOUND"));
assert.equal(results["FUND-NOTFOUND"].committed_changes.write_count, 0);

assert.equal(results["FUND-MULTIPLE"].fund_match_result, "MULTIPLE");
assert.ok(results["FUND-MULTIPLE"].errors.some((x) => x.code === "FUND_MULTIPLE"));

assert.equal(results["REUSE-OTHER-FUND"].fund_match_result, "EXACT_1");
assert.equal(results["REUSE-OTHER-FUND"].preview.reuse_existing, false);
assert.equal(results["REUSE-OTHER-FUND"].preview.planned_write_count, 7);
assert.equal(results["REUSE-OTHER-FUND"].committed_changes.write_count, 0);

assert.ok(results["EVIDENCE-SAFETY"].evidence_summary.rejected.length >= 2);
assert.equal(results["EVIDENCE-SAFETY"].task_states.filter((t) => t.state_candidate === "완료").length, 0);

assert.equal(results["APPROVAL-EXPLICIT"].approval_required, false);
assert.deepEqual(results["APPROVAL-EXPLICIT"].allowed_changes, ["P03-T01"]);
assert.equal(results["APPROVAL-EXPLICIT"].committed_changes.write_count, 0);
console.log("case tests: PASS (8 cases incl. reuse, no-write, duplicate, fund resolution, evidence safety)");

// ------------------------------------------------------------- Global invariants
const all = Object.values(results);
assert.equal(all.every((r) => (r.committed_changes?.write_count ?? 0) === 0), true);
assert.equal(all.every((r) => r.task_states.every((t) => t.state_candidate !== "완료")), true);
assert.equal(all.every((r) => (r.preview?.operating_record_change ?? 0) === 0 || !r.preview), true);
assert.equal(all.every((r) => (r.slack_preview?.send_enabled ?? false) === false), true);
console.log("invariant tests: PASS (0 writes, 0 auto-complete, 0 operating change, 0 slack send)");

// ------------------------------------------------------------- Interface reuse
const base = { user_message: "고유번호증 진행상태 확인", fund_hint: "샘플 벤처투자조합",
  runtime_config: { record_prefix: "[TEST][E2E03-PROTOTYPE]", write_mode: "preview_only" },
  providers: makeProviders({ funds: ["샘플 벤처투자조합"], existing_request: false, evidence: "receipt_only" }) };
const cli = await processRequest({ ...base, interface: "cli" });
const slack = await processRequest({ ...base, interface: "slack_preview" });
assert.deepEqual(
  cli.task_states.map((t) => [t.operational_task_id, t.state_candidate, t.blocker]),
  slack.task_states.map((t) => [t.operational_task_id, t.state_candidate, t.blocker])
);
assert.notEqual(cli.interface, slack.interface);
assert.ok(buildSlackPreview(slack).text.includes("[Preview]"));
console.log("interface reuse tests: PASS (identical task states, adapter-specific presentation)");

// ------------------------------------------------------------- Hardcoded ID scan
const SCAN = ["plugins/vc-support-admin/index.mjs", "plugins/vc-support-admin/adapters/notion.yaml",
  "plugins/vc-support-admin/adapters/drive.yaml", "plugins/vc-support-admin/adapters/slack.yaml",
  "plugins/vc-support-admin/plugin.yaml", "plugins/vc-support-admin/skills.yaml",
  "skills/e2e03-tax-id-application/contract.yaml", "skills/e2e03-tax-id-application/SKILL.md"];
const ID_PATTERNS = [/[0-9a-f]{32}/i, /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  /drive\.google\.com/i, /app\.notion\.com/i, /\b1[A-Za-z0-9_-]{30,}\b/];
let hardcoded = 0;
for (const rel of SCAN) {
  const text = fs.readFileSync(path.join(ROOT, rel), "utf8");
  for (const re of ID_PATTERNS) if (re.test(text)) { hardcoded += 1; console.error(`  hardcoded id in ${rel}: ${re}`); }
}
assert.equal(hardcoded, 0);
console.log("hardcoded id scan: PASS (0 page/database/drive ids in skill and plugin sources)");

// ------------------------------------------------------------- Registry integrity
const plugin = loadPlugin();
const registry = read("plugins/vc-support-admin/skills.yaml");
assert.equal(plugin.permissions.notion.write_operating_records, false);
assert.equal(plugin.evidence_policy.auto_complete_task_from_evidence, false);
assert.equal(registry.skills[0].skill_id, plugin.supported_skills[0]);
assert.ok(fs.existsSync(path.join(ROOT, registry.skills[0].skill_path, "SKILL.md")));
assert.equal(registry.skills[0].write_mode, "preview_only");
console.log("registry tests: PASS (manifest, registry and skill path consistent)");

console.log("\nALL HARNESS TESTS PASS");
