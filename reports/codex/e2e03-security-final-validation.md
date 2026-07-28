# E2E-03 Final Security Validation

## 1. Audit identity

- TAP: `C-CP22-FINAL-SECURITY-VALIDATION`
- Audited commit: `da39ebe037fd4c39c47ba91ee3882507ce2398dd`
- Previous audit: `4c0cf88b1b497c3d733d6ade94b026321f2f9d37`
- Audit branch: `agent/codex/e2e03-security-final-validation`
- Claude worktree touched: **NO**
- External Notion·Drive·Slack writes: **0**
- Result: `FAIL_SECURITY_OR_WRITE_GUARD`
- TEST Write review: **NOT APPROVED**

The new security modules and security test file are individually strong, but the
new Guard and Transaction layers are not connected to the production entry point
or enforced by the Provider Write boundary. Therefore passing standalone tests do
not establish a safe TEST Write path.

## 2. Previous P0 resolution

| Finding | Code exists | Real execution path | Verdict |
|---|---:|---:|---|
| Typed Preview·Approval | Yes (`kernel/preview.mjs`) | `index.mjs` still uses legacy `parseApproval()` and never imports the typed module | **P0 unresolved** |
| TEST-only Runtime Guard | Yes (`kernel/writeguard.mjs`) | `index.mjs` uses legacy `guardWrite()`; `notion.commit_write()` trusts `{allowed:true}` and does not call `guardTestWrite()` | **P0 unresolved** |
| Transaction·Partial Write | Yes (`kernel/transaction.mjs`) | `runTransaction()` is not imported or called by `index.mjs`; provider loop is independently callable | **P0 unresolved** |
| Fail-closed errors | Yes as standalone helpers (`kernel/errors.mjs`) | Entry point does not normalize the new errors; Provider and requery behavior is not universally bound to transaction state | **P0 unresolved** |
| Real fixture removal | Live fixture is sanitized | Repository-wide scan still finds external URLs/IDs in historical Reports and older fixtures | **Fixture gap remains** |
| Idempotency | Store and replay tests exist | No store is owned by `processRequest()` or Provider Write; direct duplicate payload replay remains possible | **P0 unresolved** |

## 3. Direct integration evidence

`rg` confirms that `index.mjs` has no imports or calls to:

- `buildPreview`
- `buildApproval`
- `validateApproval`
- `guardTestWrite`
- `createTransaction`
- `runTransaction`
- `createSessionToolBridge`

The production path remains the older sequence:

`parseApproval()` → legacy `guardWrite()` → `notion.commit_write()` → optional requery.

Independent fixture reproduction also called `notion.commit_write()` with a
TEST-prefixed payload, an operating data-source parent, and `{guard:{allowed:true}}`.
The Provider returned `OK` and made one injected Write call. This demonstrates
that the Provider boundary itself does not enforce the new runtime guard.

## 4. Mandatory security tests

The committed `security.test.mjs` result was 10/10, but these are tests of the
new standalone modules and a Provider invoked with a pre-approved guard object;
they do not prove Entry Point integration.

| # | Scenario | Standalone test | Independent integration result |
|---:|---|---|---|
| 1 | Task ID + action phrase | PASS | Legacy parser still exists; typed path not reached |
| 2 | Preview Hash mismatch | PASS | Typed validation not reached from `processRequest()` |
| 3 | Current Value changed | PASS | Typed validation not reached from `processRequest()` |
| 4 | Operating Data Source | PASS | Provider direct bypass returned `OK`, Write calls 1 |
| 5 | TEST Prefix missing | PASS | Provider legacy prefix check only; new guard not enforced at boundary |
| 6 | Request success + partial Task failure | PASS | Standalone transaction/provider fixture only |
| 7 | Requery mismatch | PASS | Standalone provider method only; Entry Point remains legacy |
| 8 | Connection closed | PASS | Normalizer test only; no production transaction binding |
| 9 | Rate limit | PASS | Normalizer test only; no production transaction binding |
| 10 | Same Transaction replay | PASS | In-memory store test only; no production store integration |

Additional committed security tests: **34/34 PASS**. Existing Harness,
Provider, Live, and conversational-intake regression tests: **PASS**.

## 5. Additional security checks

Standalone checks passed for expiry, missing actor, scope/action/process mismatch,
runtime-config omission, operating-prefix/data-source combinations, unknown/null
responses, normalization, duplicate OTID, relation mismatch, preview display-text
stability, disabled Bridge Write, and sanitized synthetic fixtures.

These results are useful unit evidence, but the missing production wiring remains a
P0 because a caller can still reach the Provider with a legacy or forged guard.

## 6. Session Tool Bridge

The Bridge has a clear injected `invoke` boundary, disabled Write by default,
sanitized responses, normalized transport errors, and no automatic Write retry.
The Node/MCP runtime limitation is correctly stated in the Live test.

However, its default tool map still uses logical/bare names and is not connected to
the current connector-specific tool schema. No production entry point sends its
Provider operations through `createSessionToolBridge()`.

Verdict: `FAIL_BRIDGE_CONTRACT` for final Write readiness; `PASS_WITH_RUNTIME_LIMITATION`
only for the isolated Bridge unit contract.

## 7. Fixture and sensitive-data scan

The changed Live fixture no longer contains the previously reported real fund name
or Drive URL. A repository-wide scan of Skill, Plugin, Reports, Contracts, and
Orchestration found:

- 176 URL/UUID/ID pattern hits
- 20 files containing such patterns
- 158 hits under historical Reports
- 5 hits under Plugin/Skill files, primarily synthetic sanitizer test vectors

This is not a zero-exposure repository-wide result. Historical reports contain
external Notion/Drive references and must be treated as Sensitive/Historical, not
as clean runtime fixtures. No values are reproduced in this report.

## 8. P0·P1·P2·P3 findings

### P0

1. New typed Guard is not on the `processRequest()` path.
2. Provider Write trusts a caller-supplied `guard.allowed` and accepts an arbitrary
   parent data source.
3. New Transaction and idempotency stores are dead relative to the production path.
4. New fail-closed results are not the single result state machine for production.
5. Repository-wide historical fixture/report identifiers remain exposed.

### P1

1. A valid typed Approval cannot currently be supplied through the existing
   `approval_context` entry-point contract.
2. Provider Write does not require a transaction ID, approved preview hash, target
   process, or target action.
3. Bridge mapping is not wired to the production Provider transport.
4. Existing terminal Task-state preservation remains outside the new transaction.
5. Historical Reports and older fixture vectors need a documented sensitive-data
   boundary or sanitization migration before they are used as runtime evidence.

### P2

- Notion SQL still lacks parameter binding.
- Drive cursor pagination and completeness markers remain incomplete.
- Connector schema mapping remains configuration-dependent.
- Health and normalized result semantics need one caller-facing contract.

### P3

- JSON-subset `.yaml` convention remains.
- Some comments and test labels describe readiness more strongly than the executable
  Entry Point demonstrates.

## 9. Regression and static validation

| Check | Result |
|---|---|
| Harness | PASS |
| Provider tests | PASS |
| Live synthetic-fixture tests | PASS |
| Security tests | 10/10 mandatory; 34/34 additional |
| Conversational-intake regression | PASS |
| Node syntax | PASS, 0 failures |
| JSON/YAML parse | PASS in existing suites |
| `git diff --check` | PASS |
| External writes | 0 |

## 10. Required Claude actions

1. Replace `index.mjs` legacy approval/guard path with typed Preview→Approval→Guard.
2. Make Provider `commit_write()` independently require the validated Guard,
   allowlisted data source, process/action, transaction, and preview hash.
3. Wire `runTransaction()` around Request Write, Request Requery, Relation check,
   Task writes, Task requery, and Expected–Actual.
4. Attach a real transaction store to the execution session and block completed or
   partial replay without human recovery.
5. Route all Provider/Bridge errors through one fail-closed result contract.
6. Replace the remaining historical runtime fixtures with synthetic values or mark
   their containing reports explicitly non-runtime and restricted.
7. Add an integration test that invokes the actual `processRequest()` with a typed
   approval and proves the Provider call count is zero on every invalid case.

## 11. GPT·User recommendation

- `test_write`: **BLOCKED**
- Actual MCP Write: **FORBIDDEN**
- Slack Send: **FORBIDDEN**
- Preview-only use: allowed
- Reaudit gate: P0=0, Entry Point integration proven, Provider boundary fail-closed,
  10/10 tests executed through the real entry path, and fixture exposure resolved.

Final status: `FAIL_SECURITY_OR_WRITE_GUARD`

