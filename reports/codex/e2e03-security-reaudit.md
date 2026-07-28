# E2E-03 Provider Security Reaudit

## 1. Audit identity

- TAP: `C-CP21-SECURITY-REAUDIT-OF-REAL-PROVIDER-KERNEL`
- Audited commit: `ffebdaa5a7676cfda7ec053a4eee60831ab69ba6`
- Audited parent: `efa2c2cf5efa518739fdd603e6269ba50d2fc96a`
- Previous audit: `ea5cd014ca0d22fb7a8a613ef25317e05a419143`
- Audit branch: `agent/codex/e2e03-security-reaudit`
- Mode: isolated read audit and fixture testing; implementation unchanged
- Claude worktree touched: **NO**
- Notion·Drive·Slack external calls or writes: **0**
- Result: `FAIL_SECURITY_OR_WRITE_GUARD`
- Test-write recommendation: **DO NOT ENABLE**

The four earlier P0 findings remain unresolved in executable code. The mandatory
security suite passed 2 of 10 cases. One additional P0 was found: a committed
live fixture contains a real external resource URL/identifier and case metadata.

## 2. Scope and method

The audit reviewed all 23 paths changed by `efa2c2c..ffebdaa`, including:

- common kernel and entry point under `plugins/vc-support-admin/`
- Notion, Drive, and Slack providers
- provider, live-scenario, and existing harness tests
- E2E-03 contract, canonical reference, evidence taxonomy, and six document profiles

The previous Codex audit report was read from its committed object. The current
session's connector schemas were inspected without calling an external system.
Adversarial tests used injected, in-memory `invoke` fixtures only.

## 3. Executive decision

`ffebdaa` improves provider separation, metadata sanitization, document profiles,
Evidence safety rules, and the explicit Session Tool Bridge concept. These are
useful preview/read foundations. They do not satisfy the write-security gate.

The plugin must remain `preview_only` because:

1. approval is still parsed as free text and is not bound to a typed preview;
2. the TEST guard omits target data-source, process, hash, actor, expiry, scope,
   and current-value checks;
3. no request→requery→relation→tasks→full-requery transaction exists;
4. transport and verification failures are not normalized or fail-closed;
5. idempotent transaction replay is not implemented;
6. a real Drive resource identifier and case metadata are committed in a test fixture.

## 4. Previous P0 resolution

| Previous finding | Status | Actual evidence | Gate result |
|---|---|---|---|
| P0-1 Typed Approval Intent | **UNRESOLVED** | `kernel/guards.mjs:15-33` retains one Task-ID plus action-word parsing. `index.mjs:216-228` keeps only `target_task`. No approval ID, actor, request, property, current/proposed values, scope, preview hash, or expiry is compared. | BLOCK |
| P0-2 TEST-only Runtime Guard | **UNRESOLVED** | `guardWrite()` checks operating flag, coarse mode, reuse, and optional prefix. `providers/notion.mjs:116-130` checks exact `test_write` and optional prefix, but not TEST data-source allowlist, process allowlist, preview hash, current value, typed actor/scope, or complete runtime config. | BLOCK |
| P0-3 Sequential Transaction / Partial Write | **UNRESOLVED** | `index.mjs:231-237` sends an empty payload list. Direct provider writes are a simple loop (`notion.mjs:125-128`) without request requery, relation verification, task-set validation, execution log, or recovery state. | BLOCK |
| P0-4 Fail-closed | **UNRESOLVED** | Provider write exceptions escape. Query exceptions collapse to `ACCESS_DENIED`. `requery_and_verify()` returns `OK` with `match:false`. Result codes do not include partial, connection, rate-limit, requery, mismatch, or unknown-response states. | BLOCK |

## 5. New findings

### P0 findings

#### P0-05 — Real external resource data is committed in the live fixture

`plugins/vc-support-admin/tests/live.test.mjs:29-47` embeds a real case name,
external Drive folder URL/identifier, and observed file metadata. The report does
not reproduce those values.

- Hardcoded real internal/external ID count: **1**
- Sensitive-data finding groups: **1**
- Required action: replace committed real fixtures with sanitized synthetic
  fixtures; keep any raw capture outside Git and retain only a safe normalized
  shape.

#### P0-06 — Idempotency is descriptive, not enforced

Slack can calculate a string key, and the kernel calculates a duplicate key, but
the write provider does not persist or check a transaction key. Replaying the
same approved payload produces another provider write.

### P1 findings

1. **Bridge implementation is incomplete.** `invoke(toolName, params)` is a good
   boundary, but no session bridge maps logical provider operation names and
   payloads to the installed connector schemas. Current provider tool names are
   bare logical strings; the installed Notion tools are namespaced and expose
   different payload/result contracts.
2. **Tool error mapping is incomplete.** Connection closed, rate limit, unknown
   response, and requery failure have no stable domain result. Notion and Drive
   read errors are broadly mapped to access denied.
3. **A terminal Task can regress in the candidate state.** `kernel/state.mjs`
   reports an existing terminal state only as metadata and recalculates a lower
   candidate state.
4. **Live tests are captured-fixture tests, not live MCP calls.** The test itself
   correctly states the Node runtime limitation, but its success message says
   “real reads.” No connector was called during the test.
5. **Runtime configuration is not validated as a complete unit.** Missing or
   empty prefix/data-source allowlists do not consistently fail closed before
   write intent construction.
6. **Drive completeness is not implemented.** Parent query exists, but cursor
   pagination and a completeness marker do not.

### P2 findings

1. Existing write tests assert the old free-text approval behavior and do not
   exercise a successful typed `test_write` transaction.
2. Sanitizer tests are useful, but sanitizer coverage does not make committed raw
   fixtures safe.
3. Notion SQL uses interpolated predicates instead of the connector's supported
   parameter binding.
4. `commit_write()` reports only masked created IDs after total success; it does
   not retain a safe created-record ledger during partial failure.
5. Provider `health_check()` can return `result=OK` while its nested
   `healthy=false`, which callers must interpret separately.

### P3 findings

1. Files with `.yaml` use JSON-subset syntax. Parsing succeeds, but the convention
   should remain explicit.
2. Several comments and fixture labels describe read or live readiness more
   strongly than the executable boundary proves.

## 6. Mandatory security tests

All provider calls below were local fixture invocations. “Write” means the
in-memory write spy was called; no external system was accessed.

| # | Input | Expected | Actual | Provider calls | Fixture writes | Result |
|---:|---|---|---|---:|---:|---|
| 1 | Task ID + `진행해줘` | block, write 0 | ambiguous approval, write 0 | 0 | 0 | PASS |
| 2 | Preview hash mismatch | block before provider | provider returned `OK` | 1 | 1 | **FAIL** |
| 3 | Current value changed after preview | block before provider | provider returned `OK` | 1 | 1 | **FAIL** |
| 4 | Operating data source | block before provider | arbitrary parent accepted, `OK` | 1 | 1 | **FAIL** |
| 5 | Record without TEST prefix | block before provider | `APPROVAL_REQUIRED` | 0 | 0 | PASS |
| 6 | Request success, Task partial failure | `PARTIAL_WRITE`, ledger, stop | raw exception after 3 fixture writes; no created ledger or domain result | 4 | 3 | **FAIL** |
| 7 | Requery Expected–Actual mismatch | fail closed | `OK` with `match:false` | 1 | 0 | **FAIL** |
| 8 | Provider connection closed | stable error, stop, handoff | raw exception; no normalized result or handoff | 1 | 0 | **FAIL** |
| 9 | Rate limit | stable error, no automatic write retry | raw exception; no normalized result or handoff | 1 | 0 | **FAIL** |
| 10 | Same transaction replay | second-run write 0 | second run wrote again | 2 | 2 | **FAIL** |

Summary: **2 PASS / 8 FAIL**.

Additional approval inputs `네`, `진행해주세요`, `그렇게 해주세요`,
`확인했습니다`, Task-only, and property/value-only were blocked by the
existing parser. However, the repository's own tests confirm that a Task ID plus
an action phrase is approved without the full typed context, so P0-1 remains.

## 7. Session Tool Bridge

### Observed

- `providers/base.mjs` explicitly states that Node cannot call MCP directly.
- Providers receive an injected `invoke(toolName, params)` function.
- Domain code and transport invocation are separated at a basic constructor boundary.
- Fixture and future session invocations can share the JavaScript callback shape.
- There is no committed bridge that maps logical tool names and normalized
  payloads to the actual installed connector tool schemas.
- The provider's Notion and Drive request shapes do not fully match the current
  session connector schemas, including namespacing, parameterized SQL, Drive
  search fields, and pagination.
- No external call in `live.test.mjs` proves a working bridge.

### Verdict

`FAIL_BRIDGE_CONTRACT`

The architectural boundary is valid, but the executable bridge contract is not
complete enough to claim a real MCP provider. A safe next implementation should
keep provider domain methods stable and add one explicit session bridge per
connector with:

- logical-operation → tool mapping;
- input validation and payload translation;
- response-shape normalization;
- connection/rate/access/unknown error mapping;
- sanitized per-call audit output;
- read pagination/completeness;
- zero raw response persistence.

## 8. Canonical and Evidence safety

### Canonical safety: PASS_WITH_GAPS

- Layer-1 conflicts C1–C7 remain pending rather than being silently resolved.
- C2 remains a governance conflict and is not promoted to an operating rule.
- Runtime task authority is `P03-T01` through `P03-T06`.
- Alias mappings are marked `CONFIRMATION_REQUIRED`, not auto-promoted.
- P04 and P07 remain handoff candidates rather than auto-started work.

Open gap: the repo-specific six-Task grouping remains confirmation-required in
the canonical reference, and the state engine still risks lowering an existing
terminal state candidate.

### Evidence safety: PASS_LOGIC / FAIL_FIXTURE_HYGIENE

- `.lnk` and zero-byte files are rejected.
- Evidence cannot automatically complete a Task.
- Receipt and issued-certificate profiles require human confirmation.
- T06 requires both storage and manager-delivery confirmation.
- Drive provider is read-only and Slack send is forced off.

However, committed live fixtures contain real resource metadata. Evidence rules
are safe, but fixture hygiene is not.

## 9. Existing test and static-validation results

| Check | Result |
|---|---|
| Existing harness | PASS |
| Kernel/provider suite | PASS |
| Captured-fixture live scenario | PASS |
| Conversational intake regression | PASS |
| Node syntax | PASS, 0 failures |
| JSON/YAML parse | PASS, 18 parsed |
| `git diff --check` before report | PASS |
| Hardcoded/sensitive pattern scan | Manual triage found 1 real Drive identifier exposure group |
| External writes | 0 |

The passing existing suites prove preview/read behavior and Evidence invariants.
They do not override the mandatory write-security failures.

## 10. Required Claude actions

Apply in this order and rerun the same 10 security tests:

1. Replace free-text approval with a typed approval envelope containing
   `approval_id`, actor, request/task refs, property, current/proposed values,
   action, write scope, preview hash, and expiry.
2. Calculate a stable preview hash over the exact normalized write plan and
   compare it immediately before every provider write.
3. Validate an immutable runtime policy: exact `test_write`, operating disabled,
   nonempty TEST data-source allowlist, TEST prefix allowlist, P03 allowlist, and
   complete config.
4. Implement a sequential transaction controller:
   request write → request requery → FUND relation verify → Task writes → full
   Task requery → Expected–Actual.
5. Add a sanitized execution ledger with transaction ID, step, target token,
   expected/actual, result, error code, next allowed, and created TEST records.
6. Map all failures to stable domain results; never return `OK` for a mismatch.
   Do not automatically retry writes.
7. Enforce transaction idempotency and recover only missing Task IDs after an
   explicitly reviewed partial result.
8. Implement and test the session bridge against current connector schemas.
9. Replace the committed real live fixture with synthetic sanitized data.
10. Preserve existing terminal Task state unless an exact approved transition
    changes it.

## 11. GPT approval recommendation

- Keep plugin mode: `preview_only`
- `test_write` promotion: **REJECT UNTIL REAUDIT**
- Actual MCP write: **FORBIDDEN**
- Slack send: **FORBIDDEN**
- Reaudit entry gate:
  - P0 findings = 0
  - all 10 mandatory security tests PASS
  - synthetic fixtures contain no real external IDs or case metadata
  - bridge fixture and current connector schemas agree
  - all existing regression suites remain PASS

## 12. Open gaps

- Typed approval and preview binding
- TEST data-source/process/config guards
- sequential transaction and partial recovery
- stable failure normalization and human handoff
- idempotency enforcement
- executable Session Tool Bridge
- real-fixture removal
- terminal-state preservation
- Drive pagination/completeness

Final status: `FAIL_SECURITY_OR_WRITE_GUARD`
