import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import { replayAdminProcessPrototype, validatePrototypeScenario, PROTOTYPE_REPLAY_STAGES } from "../kernel/admin-process-prototype-replay.mjs";

const root = "plugins/vc-support-admin";
const fixture = (name) => JSON.parse(fs.readFileSync(`${root}/fixtures/${name}`, "utf8"));
const normalFixture = fixture("prototype-single-p03-normal.json");
const humanFixture = fixture("prototype-single-p03-human-confirmation.json");
const compositeFixture = fixture("prototype-composite-p03-p04-p07.json");
const replay = (value) => replayAdminProcessPrototype(JSON.parse(JSON.stringify(value)));

// Manifest, registry, contract, and scenario schema.
const plugin = JSON.parse(fs.readFileSync(`${root}/plugin.yaml`, "utf8"));
const registry = JSON.parse(fs.readFileSync(`${root}/skills.yaml`, "utf8"));
const contract = JSON.parse(fs.readFileSync(`${root}/skills/admin-process-prototype-replay/contract.yaml`, "utf8"));
assert.ok(plugin.supported_skills.includes("admin-process-prototype-replay"));
assert.equal(plugin.entry_points.admin_process_prototype_replay, "kernel/admin-process-prototype-replay.mjs");
assert.ok(registry.skills.some((skill) => skill.skill_id === "admin-process-prototype-replay" && skill.write_mode === "preview_only"));
assert.equal(contract.safety.write_count, 0);
assert.equal(validatePrototypeScenario(normalFixture).scenario_id, "SINGLE-P03-01");
assert.equal(validatePrototypeScenario(humanFixture).scenario_id, "SINGLE-P03-02");
assert.equal(validatePrototypeScenario(compositeFixture).scenario_id, "COMPOSITE-01");

// SINGLE-P03-01: valid documents can only propose a completion candidate.
const normal = replay(normalFixture);
assert.equal(normal.completion_candidate, true);
assert.equal(normal.completion_allowed, false);
assert.equal(normal.request_completion_allowed, false);
assert.equal(normal.task_instances[0].actor, "지원팀");
assert.equal(normal.task_instances[0].blocker, "");
assert.ok(normal.snapshot_timeline.some((snapshot) => snapshot.stage === "COMPLETION_CANDIDATE"));
assert.equal(normal.write_count, 0);
assert.deepEqual(normal.write_counts, { notion: 0, drive: 0, slack: 0, file: 0, total: 0 });
assert.deepEqual(normal.connector_calls, { notion: 0, drive: 0, slack: 0, total: 0 });

// SINGLE-P03-02: the question is distinct from a blocking fact and never permits completion.
const human = replay(humanFixture);
assert.equal(human.process_instances[0].stage, "BLOCKED");
assert.equal(human.task_instances[0].actor, "사람 확인");
assert.equal(human.task_instances[0].blocker, "날인본 원본 미확보");
assert.equal(human.human_confirmation[0].question, "날인본 원본과 필수 날인 위치가 확인됐나요?");
assert.notEqual(human.human_confirmation[0].question, human.task_instances[0].blocker);
assert.equal(human.completion_candidate, false);
assert.equal(human.request_completion_allowed, false);
assert.equal(human.errors[0].code, "MISSING_REQUIRED_EVIDENCE");

// COMPOSITE-01: P03 and P04 are preserved while P07 is the isolated failure.
const composite = replay(compositeFixture);
const byLane = new Map(composite.process_instances.map((lane) => [lane.lane_id, lane]));
assert.equal(byLane.get("COMPOSITE-01/P03").stage, "RESULT_REVIEW");
assert.equal(byLane.get("COMPOSITE-01/P04").stage, "NEXT_PROCESS");
assert.equal(byLane.get("COMPOSITE-01/P07").stage, "BLOCKED");
assert.equal(composite.task_instances.find((task) => task.lane_id === "COMPOSITE-01/P07").blocker, "P07 제출서류 미확보");
assert.equal(composite.next_process_candidates[0].mapping_status, "CANDIDATE_CONFIRMATION_REQUIRED");
assert.equal(composite.errors.length, 1);
assert.equal(composite.errors[0].lane_id, "COMPOSITE-01/P07");
assert.equal(composite.request_completion_allowed, false);
assert.equal(byLane.get("COMPOSITE-01/P04").operational_relation, "NONE");
assert.equal(byLane.get("COMPOSITE-01/P07").mapping_status, "CANDIDATE_CONFIRMATION_REQUIRED");

// Partial failure does not mutate prior lanes; the replay remains deterministic and duplicate-safe.
const altered = JSON.parse(JSON.stringify(compositeFixture));
altered.lanes[2].task_projection.blocker = "P07 추가 서류 미확보";
const alteredReplay = replay(altered);
assert.deepEqual(composite.process_instances.slice(0, 2), alteredReplay.process_instances.slice(0, 2));
assert.deepEqual(composite.task_instances.slice(0, 2), alteredReplay.task_instances.slice(0, 2));
assert.equal(JSON.stringify(replay(compositeFixture)), JSON.stringify(replay(compositeFixture)));
assert.equal(composite.duplicate_result.duplicates_created, 0);
assert.equal(composite.duplicate_result.new_records, 0);
assert.equal(composite.duplicate_result.new_duplicates, 0);
assert.match(composite.duplicate_result.limitation, /does not observe a persistent record store/);
assert.equal(composite.resume_contract.find((lane) => lane.lane_id === "COMPOSITE-01/P07").resume_scope, "COMPOSITE-01/P07");

// A failed predecessor blocks dependent lanes without contaminating the original fixture result.
const predecessorMissing = JSON.parse(JSON.stringify(compositeFixture));
predecessorMissing.lanes[0].evidence[0].fixture_state = "ABSENT";
const predecessorReplay = replay(predecessorMissing);
assert.equal(predecessorReplay.process_instances.find((lane) => lane.lane_id === "COMPOSITE-01/P03").stage, "BLOCKED");
assert.equal(predecessorReplay.errors.some((error) => error.code === "PREDECESSOR_NOT_READY"), true);

// Recovery is lane-local: resolving P07 does not change P03 or P04 output.
const recovered = JSON.parse(JSON.stringify(compositeFixture));
recovered.lanes[2].evidence[0].fixture_state = "PRESENT_VALID";
const recoveredReplay = replay(recovered);
assert.deepEqual(composite.process_instances.slice(0, 2), recoveredReplay.process_instances.slice(0, 2));
assert.equal(recoveredReplay.process_instances.find((lane) => lane.lane_id === "COMPOSITE-01/P07").stage, "EVIDENCE_REVIEW");
assert.equal(recoveredReplay.errors.length, 0);
assert.equal(recoveredReplay.completion_candidate, false);
assert.equal(recoveredReplay.request_completion_allowed, false);

// The completion clamp holds even if the injected pure evaluator is compromised in a unit test.
const permissiveEvaluator = () => ({ evidence_judgment: "확인됨", human_confirmation_required: false, completion_candidate: true, request_completion_allowed: true });
const clamped = replay(humanFixture, { evaluateEvidence: permissiveEvaluator });
assert.equal(clamped.completion_allowed, false);
assert.equal(clamped.request_completion_allowed, false);
assert.equal(clamped.task_instances[0].completion_allowed, false);
assert.equal(clamped.process_instances[0].stage, "BLOCKED");

// A deliberately independent wrong expectation must surface a mismatch with its stable check id.
const wrongExpectation = JSON.parse(JSON.stringify(normalFixture));
wrongExpectation.expectations.lanes["SINGLE-P03-01/P03"].stage = "BLOCKED";
const mismatch = replay(wrongExpectation);
assert.equal(mismatch.expected_actual.mismatch_count, 1);
assert.deepEqual(mismatch.expected_actual.entries.find((entry) => entry.result === "MISMATCH"), {
  check_id: "SINGLE-P03-01/P03:stage", lane_id: "SINGLE-P03-01/P03", property: "stage", expected: "BLOCKED", actual: "COMPLETION_CANDIDATE", comparison_mode: "EXACT", result: "MISMATCH"
});
assert.equal(normal.expected_actual.source, "SYNTHETIC_FIXTURE_EXPECTATIONS");
assert.equal(normal.expected_actual.expected_source, "scenario.expectations");

// Safety-critical Expected–Actual values are fixture expectations, never copied from actuals.
const wrongCompletionCandidate = JSON.parse(JSON.stringify(normalFixture));
wrongCompletionCandidate.expectations.lanes["SINGLE-P03-01/P03"].completion_candidate = false;
const candidateMismatch = replay(wrongCompletionCandidate).expected_actual.entries.find((entry) => entry.property === "completion_candidate");
assert.equal(candidateMismatch.result, "MISMATCH");
assert.equal(candidateMismatch.actual, true);
const wrongRequestCompletion = JSON.parse(JSON.stringify(normalFixture));
wrongRequestCompletion.expectations.lanes["SINGLE-P03-01/P03"].request_completion_allowed = true;
const requestMismatch = replay(wrongRequestCompletion).expected_actual.entries.find((entry) => entry.property === "request_completion_allowed");
assert.equal(requestMismatch.result, "MISMATCH");
assert.equal(requestMismatch.actual, false);
const wrongHumanQuestion = JSON.parse(JSON.stringify(humanFixture));
wrongHumanQuestion.expectations.lanes["SINGLE-P03-02/P03"]["human_confirmation.question"] = "different question";
const questionMismatch = replay(wrongHumanQuestion).expected_actual.entries.find((entry) => entry.property === "human_confirmation.question");
assert.equal(questionMismatch.result, "MISMATCH");
const wrongBlocker = JSON.parse(JSON.stringify(humanFixture));
wrongBlocker.expectations.lanes["SINGLE-P03-02/P03"]["task.blocker"] = "different blocker";
const blockerMismatch = replay(wrongBlocker).expected_actual.entries.find((entry) => entry.property === "task.blocker");
assert.equal(blockerMismatch.result, "MISMATCH");

// Closed vocabulary, pure output, sanitization and fail-closed schema checks.
assert.equal(composite.snapshot_timeline.every((snapshot) => PROTOTYPE_REPLAY_STAGES.includes(snapshot.stage)), true);
assert.equal(PROTOTYPE_REPLAY_STAGES.some((stage) => ["COMPLETE", "COMPLETED", "DONE"].includes(stage)), false);
assert.equal(composite.expected_actual.mismatch_count, 0);
assert.equal(composite.expected_actual.entries.every((entry) => entry.comparison_mode === "EXACT"), true);
assert.equal(composite.process_instances.every((lane) => lane.stage !== "BLOCKED" || lane.completion_candidate === false), true);
assert.equal(composite.request_instances.every((request) => request.request_completion_allowed === false), true);
assert.equal(composite.task_instances.every((task) => task.completion_allowed === false), true);
assert.equal(composite.write_counts.total, 0);
assert.equal(composite.connector_calls.total, 0);
assert.notStrictEqual(composite.process_instances[0], composite.process_instances[1]);
assert.notStrictEqual(composite.task_instances[0], composite.task_instances[1]);
assert.throws(() => replay({ ...normalFixture, external_url: "https://example.invalid" }), (error) => error.code === "UNSANITIZED_EXTERNAL_URL");
assert.throws(() => replay({ ...normalFixture, arbitrary_property: "no" }), (error) => error.code === "SCHEMA_UNKNOWN_PROPERTY");
assert.throws(() => replay({ ...normalFixture, expectations: { lanes: { "unknown/lane": {} } } }), (error) => error.code === "EXPECTATION_UNKNOWN_LANE");
assert.throws(() => replay({ ...normalFixture, expectations: { lanes: { "SINGLE-P03-01/P03": { actual: "forbidden" } } } }), (error) => error.code === "SCHEMA_UNKNOWN_PROPERTY");
assert.throws(() => replay({ ...normalFixture, lanes: [{ ...normalFixture.lanes[0], evidence: [{ ...normalFixture.lanes[0].evidence[0], evidence_type: "UNKNOWN" }] }] }), (error) => error.code === "UNSUPPORTED_EVIDENCE_TYPE");
assert.throws(() => replay({ ...normalFixture, lanes: [{ ...normalFixture.lanes[0], depends_on: [normalFixture.lanes[0].lane_id] }] }), (error) => error.code === "DEPENDENCY_CYCLE");
assert.equal(/node:fs|node:net|child_process|providers\/|runtime-snapshot|session-snapshot|Date\.now|Math\.random|process\.env/.test(fs.readFileSync(`${root}/kernel/admin-process-prototype-replay.mjs`, "utf8")), false);
assert.equal(/(?:\d{4}-\d{2}-\d{2}T|[A-Za-z]:\\|\\\\|\/Users\/|\/home\/|https?:\/\/)/.test(JSON.stringify(composite)), false);

// CLI entry: preview only, emits deterministic JSON, and cannot write an output file.
const cliArgs = [`${root}/cli/admin-process-prototype-replay.mjs`, "--scenario", `${root}/fixtures/prototype-composite-p03-p04-p07.json`, "--scenario-id", "COMPOSITE-01", "--preview", "--emit-snapshots"];
const cliOutput = JSON.parse(execFileSync("node", cliArgs, { encoding: "utf8" }));
assert.equal(cliOutput.cli.preview, true);
assert.equal(cliOutput.cli.emit_snapshots, true);
assert.equal(cliOutput.write_count, 0);
assert.equal(spawnSync("node", [`${root}/cli/admin-process-prototype-replay.mjs`, "--scenario", `${root}/fixtures/prototype-single-p03-normal.json`, "--scenario-id", "SINGLE-P03-01"], { encoding: "utf8" }).status, 1);
assert.equal(spawnSync("node", [...cliArgs, "--output", "forbidden.json"], { encoding: "utf8" }).status, 1);

console.log("admin-process-prototype-replay e2e: PASS (manifest, CLI, schemas, 3 scenarios, isolation, duplicate, resume, sanitization, write=0)");
