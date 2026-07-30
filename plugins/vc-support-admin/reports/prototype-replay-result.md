# Admin Process Prototype Replay — Result

Status: preview-only prototype. The kernel accepts only synthetic, sanitized scenario fixtures and emits no connector call, record operation, approval, completion, or output-file write.

Validated scenarios:

- `SINGLE-P03-01`: valid package, receipt, and result document produce a completion candidate only; Request completion remains false pending storage and delivery confirmation.
- `SINGLE-P03-02`: an absent stamped original produces a separate canonical human question and a real blocker. It does not complete the Task or Request.
- `COMPOSITE-01`: P03 result review and a candidate P04 requirement decision remain preserved while P07 alone is blocked by missing submission material.

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
