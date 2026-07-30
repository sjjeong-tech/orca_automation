# Admin Process Prototype Replay — Result

Status: preview-only prototype. The kernel accepts only synthetic, sanitized scenario fixtures and emits no connector call, record operation, approval, completion, or output-file write.

## Contract alignment (G19)

- Recorded reference: `PROTOTYPE-SCENARIO-CONTRACT-V0.1`, manifest hash `3cb20f707649e3d628bdc0e2ce2d32c67cb27430a0de47a1bafc5a806be3402d`, batch `A-CP25-B18`. Artifact/UI version `V18` is separate metadata and not part of the Batch ID. The reference is traceability metadata; `conformance_claim.claimed` remains `false`.
- Contract coverage is `6`; implementation coverage is `3`: `SINGLE-P03-01`, `SINGLE-P03-02`, and `COMPOSITE-01`. `SINGLE-P07-01`, `SINGLE-P08-01`, and `COMPOSITE-02` are not implemented.
- Canonical Skill stages remain the nine TAP-prescribed tokens. Notion `진행 중` is reported only as `TASK_OR_UI_AUXILIARY_STATE`, never as a tenth stage.
- Duplicate replay is `PASS_IN_PREVIEW_FIXTURE`; `PERSISTENT_STORE_DUPLICATE_OBSERVATION_NOT_RUN` remains explicit. No persistent-store duplicate claim is made.

### G19 verification traceability

| Alignment requirement | Evidence |
|---|---|
| Manifest identity, hash, batch, 6/3/3 scope | `admin-process-prototype-replay.e2e.test.mjs` byte-exact contract and all-three-output assertions. |
| P07 state preservation and next action | Fixture Expected–Actual plus direct actor, blocker, stage, exact next-action, and negative `재수집` assertions. |
| P03 completion candidate gate | Candidate is true, `candidate_reason` is `저장·전달 Evidence 확인 필요`, and Task/Request completion stay false. The reason lives only on the process instance, not in the fixture input. |
| Scope disclosure | `SKILL.md`, CLI `--help`, contract, output, and both reports name the three implemented and three unimplemented scenarios. |
| Nine stages versus Task status | The test asserts exactly nine canonical tokens; `진행 중` appears only in `ui_auxiliary_state`, never in a timeline, and any lane-supplied `stage` field is rejected by strict schema. |
| Duplicate scope | Contract, output, E2E PASS line, and both reports carry `PASS_IN_PREVIEW_FIXTURE` and `PERSISTENT_STORE_DUPLICATE_OBSERVATION_NOT_RUN`. |

Pre-patch inspection at `293954731276ce92f6c11fd6916da675e5113cc8` confirmed the old P07 string was `P07 제출서류 재수집` and that manifest hash, candidate reason, and duplicate-scope labels were absent. This prototype has no generated golden artifacts; its checked fixtures are hand-authored scenario inputs, so golden regeneration is not applicable.

Validated scenarios:

- `SINGLE-P03-01`: valid package, receipt, and result document produce a completion candidate only; its candidate reason is `저장·전달 Evidence 확인 필요`, and Request completion remains false.
- `SINGLE-P03-02`: an absent stamped original produces a separate canonical human question and a real blocker. It does not complete the Task or Request.
- `COMPOSITE-01`: P03 result review and a candidate P04 requirement decision remain preserved while P07 alone is blocked by `P07 제출서류 미확보`; its next action is `계좌개설 제출서류 수집`.

The duplicate fields report only the pure reducer's zero record-emission behavior. They do not claim persistent-store duplicate suppression.

Standard command:

```powershell
node plugins/vc-support-admin/cli/admin-process-prototype-replay.mjs --scenario plugins/vc-support-admin/fixtures/prototype-composite-p03-p04-p07.json --scenario-id COMPOSITE-01 --preview --emit-snapshots
```

Service-manual handoff:

- Describe this as a dry-run learning tool, not an operational workflow or canonical process contract.
- Show the three supported scenarios, the `BLOCKED` recovery scope, and the human-confirmation question separately from the Task blocker.
- State that P04 and P07 mappings are prototype candidates and that the external TEST LAB stage-count disagreement remains unresolved.
- A future lifecycle or sunset review must decide whether the synthetic timeline vocabulary can be mapped to the TEST LAB manual.

## Safety and review evidence

- `expected_actual.expected_source` is `scenario.expectations`; expected values are never copied from reducer output. The test suite includes deliberate mismatches for stage, completion candidate, request completion, human question, and blocker.
- The kernel defaults to the repository evidence evaluator. Its evaluator seam is module-only for unit tests, is not available through the CLI or fixture schema, and terminal safety clamps preserve `completion_allowed=false` and `request_completion_allowed=false`.
- Frozen snapshot tokens are TAP-prescribed. The suite asserts every emitted token belongs to that set and that exact completion tokens (`COMPLETE`, `COMPLETED`, `DONE`) are absent. No stage-count or route-ordering claim is made.
- Every result contains zero per-surface write counts and zero connector-call counts. The reducer imports no connector, runtime bridge, session adapter, filesystem, network, clock, or output writer.

### Counterfactual mutation evidence

This was a temporary, uncommitted source-mutation check; each mutation was restored before the final green run.

| Mutant | Temporary change | Catching assertion | Observed result |
|---|---|---|---|
| M1 | Request instance completion guard changed to `true` | all request instances remain `request_completion_allowed=false` | test failed |
| M7 | A blocked lane made a completion candidate | reducer blocked-candidacy invariant | test failed with `INTERNAL_BLOCKED_CANDIDACY_ERROR` |
| M8 | Expected–Actual expected values copied from actual output | deliberate independent stage mismatch | test failed (`mismatch_count` became `0`) |

The fixtures/goldens are hand-reviewed safety assertions, not generated golden outputs. The confirmed review fields are completion candidate, request completion, blocker, human question, mapping status, operational relation, and every per-surface counter.

Independent browser review completed five rounds and returned `ACCEPT_WITH_GAPS`: no blocking repair was requested. The acceptance is limited to this three-scenario, preview-only prototype and does not authorize operational use or a merge.

## Dry Run — DRY-P03-02-01

- User request: `DUMMY-FUND-B의 고유번호증 신청 건을 확인해줘. 신청서 초안은 있지만 날인본 원본은 아직 준비되지 않았어.`
- Command: `node plugins/vc-support-admin/cli/admin-process-prototype-replay.mjs --scenario plugins/vc-support-admin/fixtures/prototype-single-p03-human-confirmation.json --scenario-id SINGLE-P03-02 --preview --emit-snapshots`
- Skill commit: `f3a5747deeb66d491fe48e066e792eda76b2aa1f`
- Mapping: the CLI accepts a scenario fixture, not natural-language intake. The request was manually mapped to `SINGLE-P03-02`; `DUMMY-FUND-B` is not represented in the current fixture/output contract.
- Actual: `SUBMISSION_PACKAGE/PRESENT_VALID` and `STAMPED_DOCUMENT/ABSENT`; human question, actor, blocker, and next action were emitted separately. Completion candidate, Task completion, and Request completion were all `false`; every write counter and operational write count was `0`.
- Timeline: `RECEIVED -> EVIDENCE_REVIEW -> BLOCKED`. This is not fully accepted because the expected canonical `HUMAN_CONFIRMATION` snapshot stage was absent even though the separate human-confirmation object was emitted.
- Duplicate replay: deterministic second preview produced no records; `PASS_IN_PREVIEW_FIXTURE` only. Persistent-store observation remains `PERSISTENT_STORE_DUPLICATE_OBSERVATION_NOT_RUN`.
- Counterfactual: `NOT_RUN_UNSUPPORTED_INPUT_OVERRIDE`; the CLI supports only scenario-fixture input and no safe evidence override.
- Acceptance status: `FAIL_SNAPSHOT_TIMELINE`; no code or fixture was changed in this dry run. User review is needed for wording and for whether the missing timeline stage requires an implementation repair.

## Repair — D20 Dry Run 01

- Previous result: `FAIL_SNAPSHOT_TIMELINE` for `DRY-P03-02-01`.
- Root cause: the reducer emitted a `human_confirmation` object only. Its snapshot builder added `HUMAN_CONFIRMATION` only when the lane itself had that terminal stage, so a blocked P03 lane skipped the required review snapshot.
- Changed contract: `--request-text` now accepts the supported synthetic P03 missing-stamped-original request and emits a `request` context, `tasks`, `interaction`, and `execution` structures. The request adapter fails closed with `missing_information` and a clarification question when the supported pattern is incomplete.
- Evidence display: user-facing decisions normalize `STAMPED_DOCUMENT` / `ABSENT` to `STAMPED_ORIGINAL` / `MISSING`; the legacy type and fixture state remain explicit compatibility fields. Kernel evaluation still uses the legacy fixture vocabulary.
- Human confirmation: the P03-T03 timeline is now `RECEIVED -> EVIDENCE_REVIEW -> HUMAN_CONFIRMATION -> BLOCKED`. The review snapshot repeats the actor, question, blocker, next action, and all three false completion gates from the corresponding Task projection.
- Actual revalidation: the supported request retains `DUMMY-FUND-B`, `P03`, and `SINGLE-P03-02`; its next action is `유효한 날인본 원본 재수집`; completion candidate and completion permissions remain false; all write counters remain zero.
- Test evidence: adapter unit cases, request-to-fixture CLI integration, snapshot ordering, canonical evidence vocabulary, output compatibility fields, three-scenario E2E, full plugin regression, security suites, smoke, parse, syntax, and scans passed.
- Remaining gap: the adapter recognizes only the declared synthetic P03 missing-stamped-original request. It is not a general natural-language parser, and persistent-store duplicate observation remains not run.
- Revalidation command: `node plugins/vc-support-admin/cli/admin-process-prototype-replay.mjs --scenario plugins/vc-support-admin/fixtures/prototype-single-p03-human-confirmation.json --scenario-id SINGLE-P03-02 --request-text "DUMMY-FUND-B의 고유번호증 신청 건을 확인해줘. 신청서 초안은 있지만 날인본 원본은 아직 준비되지 않았어." --preview --emit-snapshots`
- Revalidation ready: `true`.

## Revalidation — D20 Dry Run 01

- Previous failure: `FAIL_SNAPSHOT_TIMELINE` from `DRY-P03-02-01`.
- Repair commit: `504ca85a28b7611ccd0e6c2680b4fb2c47a97de4`.
- User request: `DUMMY-FUND-B의 고유번호증 신청 건을 확인해줘. 신청서 초안은 있지만 날인본 원본은 아직 준비되지 않았어.`
- Actual command: `node plugins/vc-support-admin/cli/admin-process-prototype-replay.mjs --scenario plugins/vc-support-admin/fixtures/prototype-single-p03-human-confirmation.json --scenario-id SINGLE-P03-02 --request-text "DUMMY-FUND-B의 고유번호증 신청 건을 확인해줘. 신청서 초안은 있지만 날인본 원본은 아직 준비되지 않았어." --preview --emit-snapshots`
- Request output: exact request text, `DUMMY-FUND-B`, `P03`, `SINGLE-P03-02`, `PROTO-SINGLE-P03-02`, `BLOCKED`, and `preview_only=true`.
- Task output: `P03-T03`, actor `사람 확인`, next action `유효한 날인본 원본 재수집`, blocker `날인본 원본 미확보`, a human-question completion condition, one valid submission Evidence ID, and both completion fields false.
- Interaction and execution: clarification is false; human confirmation is true with the canonical question; Request completion, downstream auto-completion, and operational writes are all false/zero.
- Evidence and timeline: canonical `STAMPED_ORIGINAL` / `MISSING`; `RECEIVED -> EVIDENCE_REVIEW -> HUMAN_CONFIRMATION -> BLOCKED` in exact order.
- Expected–Actual: core Request, Task, Interaction, Execution, Evidence, timeline, duplicate preview, and incomplete-request guards all passed.
- Duplicate replay: a second identical preview was deterministic, created no records, and reported `PASS_IN_PREVIEW_FIXTURE`; persistent-store observation remains not run.
- Incomplete request probe: `DUMMY-FUND-B의 고유번호증 신청 건을 확인해줘.` returned `clarification_required=true`, `scenario_id=null`, `missing_information=[stamped_original_status]`, and zero writes.
- Console pilot readiness: `READY_WITH_DISPLAY_GAPS`. Root `request`, `tasks`, `interaction`, and `execution` objects contain the panel data. The timeline is available as `snapshot_timeline`, not `snapshots`; only the `HUMAN_CONFIRMATION` snapshot repeats Task details. `RECEIVED`, `EVIDENCE_REVIEW`, and `BLOCKED` remain compact stage records.
- Result: `PASS_WITH_NON_BLOCKING_DISPLAY_GAPS`. No code, fixture, Contract, Notion, or operational record was modified in this revalidation.

## Console MVP — G21

- The local-only `admin-process-console-server.mjs` adapter invokes the existing pure preview reducer directly. It exposes `POST /api/preview` for `SINGLE-P03-02` only and never enables an operational write path.
- The user-facing Console projects existing `request`, `tasks`, `interaction`, `evidence`, `execution`, and `snapshot_timeline` output into Request, Kanban, Evidence, Timeline, and Safety panels. It does not infer a completion state or change Skill values.
- Demo evidence: `reports/console-pilot/request-task-console-v0.1-output.json`, the standalone `reports/console-pilot/request-task-console-v0.1.html`, `reports/console-pilot/request-task-console-v0.1-demo.md`, and `reports/console-pilot/request-task-console-v0.1.png`. The PNG is generated from the standalone local HTML with an installed Chrome Headless CLI; no external URL, connector, or operational write is used.
