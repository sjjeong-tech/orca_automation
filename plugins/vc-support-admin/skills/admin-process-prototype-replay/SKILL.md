---
name: admin-process-prototype-replay
description: Preview-only replay of three of six synthetic fund-administration contract scenarios. It never calls a connector, writes a record, approves a transaction, or completes a Request.
---

# Admin Process Prototype Replay

Use this prototype to inspect a synthetic P03 flow, a missing-stamped-document human-confirmation flow, or a P03 → P04 → P07 sequence. It reports process lanes, projected task state, human confirmation, recovery scope, an ordered snapshot timeline, and exact fixture assertions.

Run only in preview mode:

```powershell
node plugins/vc-support-admin/cli/admin-process-prototype-replay.mjs --scenario plugins/vc-support-admin/fixtures/prototype-composite-p03-p04-p07.json --scenario-id COMPOSITE-01 --preview --emit-snapshots
```

Safety boundaries:

- The fixture data is synthetic and is not a Notion, Drive, Slack, MCP, or runtime snapshot transport.
- `completion_candidate` never authorizes Task or Request completion.
- P04 and P07 are candidate mappings requiring later canonical confirmation.
- Output is always JSON on stdout; this prototype has no result-file option.

## Contract alignment and scope

- Recorded contract reference: `PROTOTYPE-SCENARIO-CONTRACT-V0.1`, manifest hash `3cb20f707649e3d628bdc0e2ce2d32c67cb27430a0de47a1bafc5a806be3402d`, batch `A-CP25-B18-V18`. This is traceability metadata, not a claim of contract conformance.
- Contract coverage is **6 scenarios**. This Skill implements **3**: `SINGLE-P03-01`, `SINGLE-P03-02`, and `COMPOSITE-01`.
- Not implemented: `SINGLE-P07-01`, `SINGLE-P08-01`, and `COMPOSITE-02`.
- Canonical Skill stages are exactly: `RECEIVED`, `INFORMATION_CHECK`, `EVIDENCE_REVIEW`, `HUMAN_CONFIRMATION`, `EXTERNAL_WAIT`, `RESULT_REVIEW`, `NEXT_PROCESS`, `COMPLETION_CANDIDATE`, `BLOCKED`.
- Notion `진행 중` is a `TASK_OR_UI_AUXILIARY_STATE`; it is not a tenth canonical Skill stage.
- Duplicate replay is validated only as `PASS_IN_PREVIEW_FIXTURE`. `PERSISTENT_STORE_DUPLICATE_OBSERVATION_NOT_RUN` remains an explicit limit.

Snapshot stage-count differences in external documents are intentionally not normalized here.
