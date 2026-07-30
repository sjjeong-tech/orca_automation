# Context Pack — admin-process-prototype-replay

## Purpose

Implement one preview-only Plugin Skill that replays synthetic administrative Evidence scenarios. It must produce Request, Task, Evidence, Actor, Action, Blocker, human-confirmation, sequential-process, snapshot-timeline, Expected–Actual, and resume output without Notion, Drive, Slack, or operating writes.

## Scope and safety

- Base: `agent/codex/evidence-state-mvp` at `f5bcf176`.
- New branch: `agent/orca/admin-process-prototype-replay-mvp`.
- Scenario fixtures are synthetic and contain no raw Evidence, external URLs, or personal data.
- Evidence existence is not completion. Human confirmation and Request completion remain false by default.
- A failed Process must not contaminate an independent Process. A blocked prerequisite prevents downstream completion, never its preview.
- Replay is deterministic and idempotent: the same scenario ID yields the same transaction ID and creates no records.

## Existing reusable modules

| Module | Reuse role |
|---|---|
| `kernel/evidence-state.mjs` | evidence validity, human-confirmation, completion and Request-completion guards |
| `kernel/task-evidence-preview.mjs` | read-only evidence-to-Task change preview |
| `kernel/task-actual-compare.mjs` | Expected–Actual comparison with semantic matches |
| `kernel/task-evidence-orchestrator.mjs` | composed discovery → resolution → preview → comparison pattern |
| `kernel/format.mjs` | user and manager result formatter |
| `kernel/runtime-snapshot-bridge.mjs` | sanitization and preview-only safety posture |

## Required scenarios

1. `SINGLE-P03-01`: P03 normal application Evidence sequence (submission package, receipt, result document). Propose a completion candidate only; do not auto-complete.
2. `SINGLE-P03-02`: P03 missing stamped document. Require a human confirmation question, keep completion and Request completion false, and keep the question separate from the actual blocker.
3. `COMPOSITE-01`: P03 → P04 → P07. Preview all three Process instances; missing P03 prerequisite blocks P04/P07 completion but must not change their independent preview states. Expose P04 and P07 as next-process candidates.

## Required output

`scenario_id`, `transaction_id`, Process/Request/Task instances, evidence decisions, human confirmation, actor transitions, next actions, blockers, historical snapshot timeline, Expected–Actual, completion candidate, completion guards, next Process candidates, errors/resume information, and every write count as zero.

## Minimum vertical slice decision points

- A single pure kernel function should accept a Scenario object and return a deterministic preview.
- A narrow CLI should load a fixture, require `--preview`, optionally emit the timeline, and never write an output file.
- Do not call MCP/Notion/Drive/Slack, use a session bridge, or create a new Evidence DB.
- Register the Skill in `skills.yaml` and `plugin.yaml` only after the slice is tested.

## Test matrix

- skill/manifest/registry/CLI/contract parse;
- normal P03, missing stamped document, and composite P03→P04→P07;
- invalid Evidence, missing P03 prerequisite, independent partial failure, duplicate replay;
- snapshot timeline ordering and Expected–Actual;
- Request completion guard and all write counts zero;
- existing plugin regression and smoke tests.

## Review questions

1. What is the smallest reusable Scenario contract?
2. Which existing modules should be composed rather than duplicated?
3. Which state transitions must remain Preview-only?
4. How should blocked prerequisite, partial failure, and resume be represented without pretending a write happened?
5. What test would reveal accidental auto-completion or state leakage across Process instances?
