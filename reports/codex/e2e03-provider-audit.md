# E2E-03 Skill·Plugin Provider Readiness Audit

## 1. Audit identity

- TAP: `C-CP20-PARALLEL-SKILL-PLUGIN-PROVIDER-AUDIT`
- Base commit: `efa2c2cf5efa518739fdd603e6269ba50d2fc96a`
- Branch: `agent/codex/e2e03-provider-audit`
- Mode: separate-worktree read audit and test design
- Result: `FAIL_SECURITY_OR_WRITE_GUARD`
- MCP runtime boundary: `SESSION_TOOL_BRIDGE_REQUIRED`
- Claude worktree touched: **NO**
- External Notion·Drive·Slack calls or writes: **0**

This report audits the committed implementation at the base commit. It does not inspect or modify Claude's uncommitted worktree.

## 2. Scope and evidence

### Implementation files reviewed

The base commit changes 18 files:

- `skills/e2e03-tax-id-application/**`
- `plugins/vc-support-admin/**`
- the appended prototype section in `reports/reviews/claude/e2e03-operational-standard-draft.md`

The audit also cross-checked:

- `contracts/process-execution-mapping.yaml`
- `contracts/conversational-intake-contract.yaml`
- `scripts/conversational-intake.mjs`
- the installed Notion and Google Drive connector tool schemas

The Slack connector was not found in the currently installed tool set. Tool discovery was read-only; no external tool was executed.

### Existing harness

Command:

```text
node plugins/vc-support-admin/tests/harness.test.mjs
```

Actual:

- unit: PASS
- approval guard: PASS for the four ambiguous phrases currently asserted
- eight fixture cases: PASS
- zero-write invariants: PASS
- CLI/Slack-preview state parity: PASS
- hardcoded ID scan: PASS
- registry integrity: PASS

The harness result is valid for `preview_only` fixtures. It does not exercise the non-preview commit path, real provider normalization, partial writes, verification mismatches, or transport failures.

## 3. Executive findings

| ID | Priority | Finding | Evidence | Required disposition |
|---|---|---|---|---|
| P0-01 | P0 | Approval parsing does not enforce the declared approval context. | `parseApproval()` checks only one Task ID and an action word. A Task+action phrase passes without target Request, Property, current value, proposed value, TEST Prefix, write mode, or approval actor. | Replace free-text boolean approval with a typed approval intent validated against the exact preview hash and record context. |
| P0-02 | P0 | TEST-only write policy is not structurally enforced by the kernel. | With an injected provider, `write_mode=commit`, and no TEST Prefix or an operating-looking Prefix, `createTestInstance()` is called. The manifest restriction is declarative only. | Validate runtime config before any provider write; require an allowlisted write mode, TEST Prefix, resolved TEST targets, and explicit approved preview token. |
| P0-03 | P0 | Partial writes and Expected–Actual mismatches fail open. | A fixture provider returning three writes produces no `PARTIAL_WRITE`; a verifier returning `match=false` is returned as data without an error or stop state. | Introduce a transaction result state machine, created-record log, missing-task recovery, and mandatory mismatch failure. |
| P0-04 | P0 | Provider exceptions are not normalized or contained. | A provider exception escapes `processRequest()` instead of producing a stable error, handoff, and known write count. | Wrap every provider boundary; map transport and domain errors; preserve known page keys without logging raw responses. |
| P1-01 | P1 | No real MCP provider or invocation bridge exists. | YAML adapters list operations, but runtime code only accepts JavaScript functions in `providers`. Runtime config data-source keys are not consumed. | Add a session-tool bridge with injected `invoke(toolName, args)` and provider-specific normalization. |
| P1-02 | P1 | Notion provider contract is incomplete. | Workspace identity, database/schema fetch, Fund Work resolution, schema validation, page fetch/update, view query, pagination, and explicit requery comparison are absent. | Implement the Notion matrix in section 5 behind one provider interface. |
| P1-03 | P1 | Existing Task state can regress in the calculated candidate. | An existing `완료` Task with supporting Evidence is returned with candidate `진행 중`; existing state is only echoed as metadata. | State calculator must preserve terminal state unless an approved transition contract explicitly changes it. |
| P1-04 | P1 | Provider absence is misclassified as business data absence. | Missing Notion provider returns `FUND_NOT_FOUND` rather than `PROVIDER_UNAVAILABLE` or `MCP_CONNECTION_REQUIRED`. | Validate provider capabilities before domain resolution. |
| P1-05 | P1 | Drive traversal and completeness are not implemented. | Adapter rules exist, but there is no pagination, parent traversal, access error mapping, shortcut metadata inspection, or stale/latest selection implementation. | Implement normalized Drive provider and completeness flags before treating Evidence discovery as complete. |
| P1-06 | P1 | Sanitization is declarative, not executable. | Evidence results retain raw file names; there is no output sanitizer or raw-response log guard. | Sanitize at provider boundary and again before interface output. |
| P2-01 | P2 | Manifest and adapter operations overstate executable readiness. | Prototype report says TEST Write, requery, Expected–Actual verifier, and common kernel elements are ready, but those are delegated to undefined provider methods. | Change readiness wording or implement and test each capability. |
| P2-02 | P2 | Duplicate lookup contract is underspecified. | `findRequestByDuplicateKey()` accepts any shape, has no incomplete-status constraint, and cannot distinguish zero, one, or multiple existing Requests. | Return a normalized match result and block multiple matches. |
| P2-03 | P2 | Slack contract is mostly documentation. | Thread and idempotency key operations are declared, but only duplicate key is used as a thread key; no inbound payload, approval envelope, or send provider exists. | Keep preview-only and add normalized Slack envelope tests before any send implementation. |
| P2-04 | P2 | Evidence duplicate/latest rules are not implemented. | `STALE_OR_DUPLICATE` is declared but `classifyEvidence()` never emits it and ignores modification time and duplicate grouping. | Add document-profile and duplicate/latest policy tests. |
| P2-05 | P2 | P04/P07 handoff data is discarded. | Drive rules contain `downstream_process`, but `classifyEvidence()` does not return it and `processRequest()` creates no downstream handoff. | Preserve downstream candidate metadata; never auto-start the process. |
| P3-01 | P3 | Files with `.yaml` use JSON syntax. | Parsing works, but naming can mislead tooling and reviewers. | Non-blocking: document JSON-subset convention or migrate only under a separate approved cleanup. |

## 4. Runtime boundary decision

### Observed

1. `processRequest()` can call only JavaScript provider functions already injected into the Node process.
2. The repository contains no Notion, Drive, or Slack transport implementation and no generic `invoke` function.
3. The current session exposes Notion and Drive as agent tools, not as importable Node modules.
4. No Slack connector tool was discovered in the current environment.
5. `config.example.yaml` contains placeholder IDs, but `index.mjs` does not load or validate the file and does not use its data-source keys.

### Decision

`SESSION_TOOL_BRIDGE_REQUIRED`

Node must not guess that it can call MCP tools directly. The safe boundary is:

```text
Agent/session tool call
  → transport-specific bridge
  → normalized provider result
  → processRequest/domain kernel
  → normalized write intent
  → approval guard
  → bridge write call
  → requery normalization
  → Expected–Actual verifier
```

Recommended provider constructor:

```text
createProviders({ invoke, runtimeConfig, sanitizer, logger })
```

`invoke` is supplied by the hosting agent/session. Domain logic must not know connector tool names. If a tool name changes, only the bridge mapping changes.

## 5. Provider contract matrix

The MCP tool names below are candidates discovered from installed tool schemas. They were not executed.

### 5.1 Notion provider

| Plugin method | MCP tool candidate | Input | Normalized result | Error code | R/W | Approval | Test |
|---|---|---|---|---|---|---|---|
| `getWorkspaceIdentity` | Notion `fetch(id="self")` | none | workspace key, actor key, available tool map; no email in domain result | `NOTION_IDENTITY_UNAVAILABLE` | R | No | fixture identity and missing-access map |
| `fetchDatabase` | Notion `fetch` | injected database ref | database key, data-source refs, views | `NOTION_DATABASE_NOT_FOUND` | R | No | zero/one/multiple data sources |
| `fetchDataSourceSchema` | Notion `fetch` | injected data-source ref | property map with logical aliases and types | `NOTION_SCHEMA_MISMATCH` | R | No | missing/type/option drift |
| `queryRecords` | Notion `query_data_sources` SQL mode | data-source refs, parameterized predicate, cursor policy | rows, count, completeness, query limitation | `NOTION_QUERY_FAILED` | R | No | parameter binding, pagination, status filter fallback |
| `queryView` | Notion `query_database_view` or view mode | injected view ref, cursor | rows, completeness, applied-view marker | `NOTION_VIEW_QUERY_LIMITATION` | R | No | ignored status filter and cursor continuation |
| `fetchRecord` | Notion `fetch` | normalized page key | sanitized properties, relation keys, omitted fields | `NOTION_RECORD_FETCH_FAILED` | R | No | missing page and Rollup omitted |
| `resolveFund` | composed fetch/query | exact normalized fund name | `EXACT_1`, `NOT_FOUND`, `MULTIPLE`; candidate keys hidden from output | `FUND_NOT_FOUND`, `FUND_MULTIPLE` | R | No | zero/one/multiple/similar |
| `resolveFundWork` | composed query | Fund key and work selector | `EXACT_1`, `NOT_FOUND`, `MULTIPLE` | `FUND_WORK_NOT_FOUND`, `FUND_WORK_MULTIPLE` | R | No | zero/one/multiple |
| `findRequestByDuplicateKey` | composed query | fund, process, request type, TEST Prefix, incomplete statuses | match status, one sanitized request or candidates | `REQUEST_MULTIPLE` | R | No | completed excluded, multiple blocked |
| `findTasks` | composed query | Request key | six normalized Task records, completeness | `TASK_SET_INCOMPLETE`, `TASK_SET_DUPLICATE` | R | No | 0/1–5/6/>6 and duplicate OTID |
| `createTestRequest` | Notion `create_pages` | approved request intent, TEST parent, exact properties | created page key, URL token for internal log, property echo | `REQUEST_CREATE_FAILED` | W | Yes | TEST Prefix and parent allowlist |
| `createTestTasks` | Notion `create_pages` | approved Task intents and parent relation | per-Task keys and per-item outcomes | `TASK_PARTIAL_WRITE` | W | Yes | six, partial, retry missing only |
| `updateTestTask` | Notion `update_page` | page key, approved property diff | updated property echo | `TASK_UPDATE_FAILED` | W | Yes | exact page/property/current/proposed guard |
| `requeryAndVerify` | fetch/query composition | expected model and created keys | match boolean, field-level mismatches, limitations | `EXPECTED_ACTUAL_MISMATCH` | R | No new approval | mismatch must stop |

Notion provider requirements:

- Fetch identity and schema before the first write in a session.
- Allowlist TEST data sources and TEST title Prefix independently.
- Never infer `NOT_FOUND` when the provider is missing.
- Treat Rollup omission as `TOOL_LIMITATION` only after relation-chain verification.
- Do not rely solely on a view status filter; verify with direct query when the connector reports the known limitation.

### 5.2 Drive provider

| Plugin method | MCP tool candidate | Input | Normalized result | Error code | R/W | Approval | Test |
|---|---|---|---|---|---|---|---|
| `getMetadata` | Drive `get_file_metadata` | injected file/folder key | sanitized name, MIME, size, parents, modified time, shortcut details | `DRIVE_METADATA_FAILED` | R | No | access denied, shortcut, zero byte |
| `listChildren` | Drive `search` with parent filter and page token; `list_folder` only when bounded | parent key, page token | children, next token, complete flag | `DRIVE_LIST_INCOMPLETE` | R | No | >100 items and pagination |
| `resolveFundRoot` | metadata + parent traversal | configured root ref | exact folder key or blocked result | `FUND_ROOT_NOT_FOUND`, `FUND_ROOT_MULTIPLE` | R | No | zero/one/multiple |
| `fetchPdfCandidate` | Drive `fetch` raw stream candidate | approved file key | temporary file reference and MIME; never raw bytes in logs | `PDF_FETCH_UNAVAILABLE` | R | Separate content-read approval | permission, size, non-PDF |
| `classifyFile` | local domain function after normalization | sanitized metadata | evidence type, validity, source layer | `EVIDENCE_UNCLASSIFIED` | R | No | alias/profile matrix |
| `detectDuplicateLatest` | local domain function | same-type candidates | groups and human-review candidates; no automatic deletion | `STALE_DUPLICATE_REVIEW_REQUIRED` | R | No | same name, versions, modified times |
| `sanitizeEvidence` | local boundary function | normalized metadata | no ID, URL, body, tax/account/personal values | `SENSITIVE_OUTPUT_BLOCKED` | R | No | adversarial filenames and raw payloads |

Drive writes remain unsupported. A partial folder listing must never be labeled complete.

### 5.3 Slack provider

No installed Slack MCP tool was discovered. The current target is a transport-neutral envelope and preview only.

| Plugin method | Input | Normalized result | Error code | R/W | Approval | Test |
|---|---|---|---|---|---|---|
| `normalizeInbound` | channel/thread/user/message metadata from future bridge | sanitized request envelope | `SLACK_PAYLOAD_INVALID` | R | No | CLI/Slack semantic parity |
| `buildMissingQuestion` | missing fields | message payload without sensitive values | `MISSING_INFORMATION` | local | No | ordered questions |
| `buildPreview` | exact preview and preview hash | message payload, thread key, approval scope | `PREVIEW_INVALID` | local | No | planned vs actual writes |
| `parseApprovalEnvelope` | reply plus thread/preview context | approved intent or ambiguous result | `APPROVAL_AMBIGUOUS`, `APPROVAL_CONTEXT_MISMATCH` | local | Yes | all approval cases |
| `buildResult` | verified transaction result | sanitized result payload | `RESULT_NOT_VERIFIED` | local | No | mismatch and partial |
| `buildBlocker` | normalized error | blocker message and recovery action | stable domain error | local | No | provider failure matrix |
| `buildHandoff` | open items and owner | sanitized handoff | `HANDOFF_INCOMPLETE` | local | No | P04/P07 candidate only |
| `calculateThreadKey` | interface source and request context | stable opaque key | `THREAD_KEY_MISSING` | local | No | retry and cross-interface |
| `calculateIdempotencyKey` | thread, duplicate key, exact approved intent hash | stable opaque key | `IDEMPOTENCY_KEY_MISSING` | local | Yes | same intent same key; changed value new key |

Actual Slack send remains out of scope and disabled.

## 6. Approval and write-guard audit

### Current behavior

| Input class | Current result | Required result |
|---|---|---|
| `네` | blocked | blocked |
| `진행해주세요` | blocked | blocked |
| `그렇게 해주세요` | blocked | blocked |
| `확인했습니다` | blocked | blocked |
| Task ID only | blocked | blocked |
| Property/value only | blocked | blocked |
| Task ID + `완료로 변경` | **approved** | blocked because Request, Property, current value, TEST scope, and preview identity are absent |
| Full textual context | approved, but only Task ID retained | return a typed intent and compare all fields to the preview |

### Required approval envelope

Every write must bind:

- target Request key
- target Task key
- Property
- current value
- proposed value
- TEST Prefix
- allowlisted TEST data source
- write mode
- approval actor
- preview hash
- idempotency key

Approval must authorize the exact intent, not merely contain recognizable words.

## 7. Failure-control matrix

| Scenario | Expected error code | Additional write count | Retry | User guidance | Handoff |
|---|---|---:|---|---|---|
| Fund 0 | `FUND_NOT_FOUND` | 0 | after corrected name | request exact Fund name | user |
| Fund multiple | `FUND_MULTIPLE` | 0 | after selection | show sanitized candidates | user |
| Fund Work 0 | `FUND_WORK_NOT_FOUND` | 0 | after separate setup/confirmation | confirm the Fund Work record | user/GPT |
| Fund Work multiple | `FUND_WORK_MULTIPLE` | 0 | after selection | select one record | user |
| Request create response missing key | `REQUEST_CREATE_UNVERIFIED` | known count 0 or 1 | requery first | do not create Tasks | Codex/Claude |
| Request created, relation invalid | `REQUEST_RELATION_MISMATCH` | no further write | requery/approved correction | relation verification failed | Codex/Claude |
| Only 1–5 Tasks created | `TASK_PARTIAL_WRITE` | stop after observed partial | retry missing OTIDs only | list missing Tasks, no deletion | Codex/Claude |
| Rollup omitted | `ROLLUP_NOT_OBSERVABLE` | 0 | relation-chain check then UI | tool limitation, not PASS by assumption | user validation |
| Status filter ignored | `VIEW_STATUS_FILTER_LIMITATION` | 0 | direct data-source query | view result not authoritative | provider |
| Drive access denied | `DRIVE_ACCESS_BLOCKED` | 0 | after permission | request access or alternate evidence | user |
| PDF fetch unavailable | `PDF_FETCH_UNAVAILABLE` | 0 | metadata-only or human review | content not verified | user |
| Shortcut | `UNVERIFIED_SHORTCUT` | 0 | resolve target | provide actual file | user |
| Zero byte | `ZERO_BYTE` | 0 | replace file | Evidence not counted | user |
| Stale duplicate | `STALE_DUPLICATE_REVIEW_REQUIRED` | 0 | after human choice | select current authoritative file | user |
| MCP connection closed | `MCP_CONNECTION_CLOSED` | no new write; prior count unknown until requery | reconnect, requery, then resume | do not repeat create blindly | provider/session |
| Rate limit | `MCP_RATE_LIMITED` | no new write after error | bounded backoff for reads; writes require requery | retry time and state | provider/session |
| Approved write then mismatch | `EXPECTED_ACTUAL_MISMATCH` | 0 further | approved repair only | show sanitized field mismatch | user/GPT |

## 8. Missing test matrix

### Unit

- runtime config schema and required provider capability validation
- provider result normalization and unexpected-shape rejection
- transport/domain error mapping
- sensitive output sanitizer and raw response logger guard
- property and evidence alias mapping
- document profile, duplicate, and latest-version rule
- write mode, TEST Prefix, TEST data-source, and preview-hash guard
- approval envelope for Request, Task, Property, current value, proposed value
- existing terminal Task state preservation
- downstream P04/P07 candidate preservation without execution

### Integration

- Skill → injected provider bridge
- provider → fixture `invoke` function
- Notion result → state engine
- Drive metadata → evidence classifier
- preview → Slack envelope
- approval envelope → write guard
- create/update → requery → Expected–Actual
- provider missing and malformed response
- partial Task creation → missing-only resume

### System

- existing shadow resume
- ambiguous approval
- exact TEST approval with full context
- P04/P07 handoff only
- provider access failure
- Request-created/Task-partial failure
- Rollup omitted
- status filter tool limitation
- MCP disconnect and rate limit
- existing completed Task no regression
- Fund Work zero/multiple

### Acceptance

- same input rerun produces zero duplicate writes
- different Fund hint
- different Evidence context
- CLI and Slack envelope semantic parity
- operating write remains zero under adversarial runtime config
- no sensitive values or raw connector payload in outputs/logs

## 9. Security and hardcoding

### Scan result

- production runtime hardcoded Fund name: 0
- hardcoded Notion/Drive UUID or 32-character internal ID: 0
- Drive or Notion direct URL: 0
- credential/token value: 0
- resident/account-number pattern: 0
- raw MCP response logging: 0

Named Fund fixtures occur only in test and live-case fixture files. They are not used by runtime selection logic. The Harness ID scan does not cover every prompt, fixture, and config file, so the scan should be expanded even though this audit found no actual sensitive value.

### Remaining security issue

The main security blocker is authorization, not a committed credential: runtime config and provider injection can bypass the declared TEST-only policy.

## 10. Claude resume actions

Apply in this order:

1. **P0:** Introduce typed `ApprovalIntent` and require exact preview hash, Request, Task, Property, current/proposed values, TEST Prefix, TEST data source, actor, and idempotency key.
2. **P0:** Add runtime config validation and deny all writes unless every TEST-only invariant passes.
3. **P0:** Replace monolithic `createTestInstance()` with ordered Request/relation/Task operations plus an execution log and missing-only resume.
4. **P0:** Fail closed on partial write, provider exception, and Expected–Actual mismatch.
5. **P1:** Add `invoke`-injected session bridge and normalized Notion/Drive providers. Do not import or guess MCP tools from Node.
6. **P1:** Implement identity/schema preflight, Fund Work resolution, direct query fallback, and explicit provider-unavailable errors.
7. **P1:** Preserve existing terminal Task states and add provider/sanitizer boundaries.
8. **P2:** Expand the Harness with the matrices in sections 7–8.
9. **P2:** Keep Slack preview-only until a connector exists and the same approval envelope passes.
10. Rerun the existing Harness unchanged, then run new non-preview fixture tests with a spy provider proving that adversarial config produces zero calls.

Do not start P04/P07, perform live writes, or broaden the framework while P0 remains open.

## 11. Verification summary

| Check | Result |
|---|---|
| Exact base commit | PASS |
| Separate Codex worktree | PASS |
| Claude worktree untouched | PASS |
| Existing Harness | PASS |
| Node syntax | PASS |
| Plugin JSON-subset YAML parse | PASS |
| Hardcoded internal ID scan | PASS |
| Sensitive value scan | PASS |
| Non-preview write-guard probe | **FAIL — provider called without structural TEST constraints** |
| Partial-write probe | **FAIL — no `PARTIAL_WRITE`** |
| Expected–Actual mismatch probe | **FAIL — mismatch not promoted to error** |
| Provider exception probe | **FAIL — unhandled exception** |

## 12. Open gaps

- A real provider cannot be accepted until `SESSION_TOOL_BRIDGE_REQUIRED` is implemented and tested.
- Slack transport capability is not installed/confirmed.
- Connector-specific response shapes and rate-limit payloads require fixture capture in a future approved read-only session.
- No live MCP call was made in this audit, so tool availability was established from tool schemas only.
- P0 findings block provider implementation and any non-preview use.

NEXT_OWNER=`GPT_AND_CLAUDE_OPUS`
