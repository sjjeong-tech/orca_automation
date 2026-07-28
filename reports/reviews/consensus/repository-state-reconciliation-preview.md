# Repository State Reconciliation Preview

> TAP: `CP-13-REPOSITORY-STATE-RECONCILIATION-PREVIEW`
> Snapshot date: 2026-07-27 (Asia/Seoul)
> Base: `origin/main` at `32d017ceee551f370a7f25dcf52e6a77c7d45b38`
> Audit branch: `agent/codex/repository-state-reconciliation`
> Mode: Repository/Git read-only audit. No PR, merge, Canonical, Workmap, Governance, generated-view, Notion, or Drive change was performed.

Facts are marked **OBSERVED**, cross-source interpretations **INFERRED**, and future changes **PROPOSED**. A report of an earlier external-system validation is historical evidence; it is not proof that the external value remains unchanged at this snapshot.

## 1. Executive Decision

### Decision

**PROPOSED result: `PASS_WITH_EXTERNAL_STATE_GAPS`.**

The two independent Orientation Candidates agree on the core navigation and safety model. Neither should be copied wholesale. The final manual should synthesize:

- Codex's Git reproducibility, generated-state, validation-runtime, and branch/commit controls.
- Claude's Process meaning, Evidence layers, Verification-versus-Live distinction, explicit approval, and Compact recovery guidance.
- This reconciliation's two-axis Source of Truth model: **Normative Authority** and **Actual State**.

### Integration order

1. Integrate both Candidate documents and the Codex fieldwork inventory as non-Canonical consensus/evidence.
2. Integrate the first five commits of the Claude WS2/WS3 branch after a technical and sensitive-metadata review.
3. Hold the sixth WS3 commit, which records an approved Notion Schema/Record write, until GPT and the user accept its approval provenance and a later read-only external recheck confirms the current physical state.
4. Reconcile Governance, Workmap, approval packets, and the P03 five-versus-six Task mapping.
5. Repair generated-state reproducibility before overwriting either generated Markdown file.
6. Add a stable final manual at `docs/repository-orientation.md`, linked from `START_HERE.md`.
7. Run repository cold-start validation, then merge through one reviewed integration PR.

### Immediate safety decision

- Do not restart `WS2-01`; a six-commit branch already contains WS2 and WS3 work.
- Do not treat that branch as Canonical completion until integration and state reconciliation are approved.
- Do not run the current Python Renderer against the working tree: its output differs materially from both committed generated files and would remove hand-maintained context.
- Do not present `AG-P3` for decision using the current packet; its N-06 facts are stale.
- Do not approve or execute `CI-09`: its Workmap status is `READY`, but its own gate still requires independent validation and user-approved scope.

## 2. Candidate Consensus Matrix

Committed Candidate originals were read from:

- Codex: `276bbab3643df874ddb5348d2523a65a4a07091b`
- Claude: `b25d1d3e51c5147abdb6385576af4ce2d2afb4b6`

| Area | Decision | Accepted synthesis | Rejected or deferred claim |
|---|---|---|---|
| 1. 5-minute Bootstrap | BOTH_AGREE | Fetch, confirm branch/HEAD/status, read instructions and Workmap, then inspect unmerged branches before starting work. | None. |
| 2. Purpose and scope | BOTH_AGREE | Process knowledge, Notion Request/Task operation records, Evidence, and approval-based multi-interface execution; conversational intake is primary. | Neither Candidate proves organization-wide operational automation is complete. |
| 3. Source of Truth | CONFLICT | Use the dual-axis model in section 3. Norms decide what is allowed; fresh state reads decide what is actually true. | Claude's single ranked list with live state at rank 0 is not accepted because actual state does not grant authority. Canonical text also does not prove live application. |
| 4. Repository map | CLAUDE_STRONGER | Use Claude's broader semantic directory descriptions, with Codex's generated/canonical and ignored-Evidence caveats. | Dynamic file counts do not belong in the final manual. |
| 5. Workstream status | BOTH_AGREE | Main is behind the WS2/WS3 branch; distinguish Conceptual, Logical, Physical, and Live completion. | External state described in the branch is not assumed current without requery. |
| 6. Branch and commit map | CODEX_STRONGER | Base, head, parent chain, files, merged/unmerged state, and rollback unit must be reproducible from Git. | Snapshot SHAs and branch lists do not belong in the stable manual. |
| 7. Work Item start procedure | BOTH_AGREE | Discover, reuse, Preview, approve, implement, verify, record Evidence, hand off. | Workmap `allowed_paths` does not automatically override a later explicit user/GPT instruction; conflicts require clarification or an explicit exception. |
| 8. TAP | BOTH_AGREE | A TAP must specify objective, base, inputs, paths, writes, approval, stop conditions, tests, commit policy, and handoff. | A user TAP and a Git Work Order are not assumed identical in every context; the applicable authority must be explicit. |
| 9. Write, approval, stop | CLAUDE_STRONGER | Preview before external write, explicit approval, one final writer, post-write requery, and fail-safe stop. | A blanket prohibition on direct main commits is not accepted; explicit TAPs have previously authorized them. |
| 10. Evidence structure | CLAUDE_STRONGER | Separate Fund Root, Request Source, shared functional source, Task Evidence, and Completion Evidence. Codex fieldwork inventory remains observational Evidence. | A file's presence does not prove an entire E2E or a common Rule. |
| 11. Test Gate | BOTH_AGREE | Codex Git/parse/reproducibility checks plus Claude's Conceptual/Logical/Physical/Live and V-model distinctions. | A document `PASS` is not a Live Acceptance result. |
| 12. Agent collaboration | BOTH_AGREE | GPT owns planning and approval coordination; Claude/Codex capabilities are selected by Work Item, tool access, and independent-review need; user is Process Owner. | Claude=judgment and Codex=execution are not permanent interface restrictions. |
| 13. Compact and restore | CLAUDE_STRONGER | Persist approval scope, actual writes, Expected/Actual, branch/head, and incomplete work; re-fetch and re-read after Compact. | Conversation summaries are not state evidence. |
| 14. Error prevention | BOTH_AGREE | Prevent wrong base, duplicate work, generated drift, unapproved write, ambiguous Person/FUND selection, historical-state reuse, and evidence overgeneralization. | None. |
| 15. Open Gaps | CODEX_STRONGER | Use G-1 through G-12 below; they combine both Candidates and additional repository checks. | Candidate snapshots alone are insufficient for closure. |
| 16. Cold-start checklist | BOTH_AGREE | A short executable checklist belongs in the final manual. | Current READY counts and SHAs must be queried, not copied into the manual. |
| 17. Final manual location | BOTH_AGREE | `docs/repository-orientation.md`, linked from `START_HERE.md`; Candidates remain historical consensus evidence. | Neither Candidate becomes Canonical by itself. |

## 3. Normative Authority and Actual State

The final manual must not flatten these into one precedence list.

### 3.1 Normative Authority — what is allowed and what should happen

| Layer | Role | Conflict handling |
|---|---|---|
| Explicit user approval and GPT-issued Work Order/TAP | Defines current objective, scope, approval, and exceptional authority. | A materially new action requires a new or clarified authorization. |
| Applicable `AGENTS.md` and `CLAUDE.md` | Defines repository-wide and Claude/Notion safety rules. | Higher-level instructions and explicit scoped exceptions apply; uncertainty stops the write. |
| `orchestration/governance/**` and `orchestration/plan/master-workmap.yaml` | Defines ownership, execution policy, planned state, dependencies, and gates. | Current internal inconsistencies are G-1/G-2; do not choose a convenient value. |
| Process and Contract Canonical files | Defines Process meaning, execution contract, state/evidence rules, and mappings. | A case or implementation cannot silently rewrite the Process meaning. |

### 3.2 Actual State — what currently exists or happened

| Layer | Role | Limitation |
|---|---|---|
| Fresh Git fetch and object inspection | Confirms branch, commit, file, parent, and merge facts. | Git cannot prove current Notion/Drive values. |
| Fresh scoped Notion/Drive read | Confirms current Physical/Live state. | This TAP prohibited those reads; branch reports are historical evidence only. |
| Tests and validation | Confirms behavior under the executed environment and inputs. | A local test cannot replace external Acceptance. |
| Evidence and reports | Records observations, outcomes, and review findings. | Evidence does not grant permission or automatically become a Rule. |
| Generated views | Human-readable projection from the Workmap. | Current committed views are not reproducible by the current Renderer. |
| Historical documents and conversation | Context and provenance. | They are not current state. |

### 3.3 Governing principle

Actual state can show that a Canonical statement is stale, but it does not authorize a replacement Rule. Normative authority can approve a change, but it does not prove that the Live system was changed successfully. Closure requires both appropriate authority and Expected/Actual verification.

## 4. Main and Unmerged Branch Map

### 4.1 Main

**OBSERVED**

- `origin/main`: `32d017ceee551f370a7f25dcf52e6a77c7d45b38`
- Latest merged review history:
  - PR #1: CI4 targeted validation
  - PR #2: CI5 loop engineering reports, preserving both source commits
  - PR #3: E2E-03 operational-standard draft
- GitHub returned no open PRs at the audit time.
- All eight branches below were reported by `git branch -r --no-merged origin/main`.

### 4.2 Unmerged branch classification

| Branch | Base / Head / Ahead | Scope | Classification | Decision |
|---|---|---|---|---|
| `agent/claude/e2e03-natural-language-contract` | `32d017ce` / `88aa2697` / 6 | Five report files; WS2 Logical/Physical/Live and WS3 discovery/evidence/write record | REQUIRES_REVIEW | Integrate commits 1-5 after review. Hold commit 6 until approval provenance and current external state are accepted/rechecked. |
| `agent/codex/fieldwork-output-evidence-inventory` | `32d017ce` / `9f0e3ff0` / 1 | CSV inventory plus analysis | INTEGRATE | Independent non-Canonical Evidence. Verified 353 data rows, 19 columns per row, 14 masked filename rows, and no Drive IDs/direct URLs in the report's stated checks. |
| `agent/codex/repository-orientation-consensus-candidate` | `32d017ce` / `276bbab3` / 1 | Codex Candidate only | INTEGRATE | Preserve as consensus evidence; do not use as final manual verbatim. |
| `agent/claude/repository-orientation-consensus-candidate` | `32d017ce` / `b25d1d3e` / 1 | Claude Candidate only | INTEGRATE | Preserve as consensus evidence; do not use as final manual verbatim. |
| `agent/claude/setup` | `a50cce0f` / `6c1f8fd` / 9 | Claude role, lean review, old source audits and queues | SELECTIVE_REUSE | Never merge whole. Main `CLAUDE.md` already imports `AGENTS.md`. Reuse only stable safety/output ideas after current review; do not import fixed-role or stale queue rules. No explicit Memory/Compact rules were found in the setup instruction files. |
| `agent/claude/ci1-test-design` | `a364e70a` / `0d51ed78` / 1 | 20-case pre-implementation test design | HISTORICAL_ONLY | Later main tests and fixes supersede its open implementation assumptions. Reuse individual test ideas only after revalidation. |
| `agent/claude/ci2-alignment-review` | `794343cf` / `8c1f87db` / 2 | Initial blocking review plus blocker recheck | HISTORICAL_ONLY | Important audit trail, but both blockers were later resolved and main advanced through CI4-CI6. Do not merge the whole old-base branch. |
| `agent/claude/ci4-alpha-validation` | `2cb1e57d` / `b66a11be` / 1 | Early gate failure because CI4 target did not yet exist | SUPERSEDED | Superseded by merged PR #1 and the later targeted validation report. |

No structural merge-conflict section was reported by a three-way `git merge-tree` dry check for the eight branches. This does not replace content, approval, or sensitive-metadata review.

## 5. Commit Integration Matrix

### 5.1 Consensus and fieldwork

| Source commit | Files | Integrate | Conflict | Approval | Test before integration |
|---|---:|---|---|---|---|
| `276bbab3643df874ddb5348d2523a65a4a07091b` | 1 | Yes, historical consensus evidence | None observed | Technical integration approval | Heading/path/sensitive-pattern check |
| `b25d1d3e51c5147abdb6385576af4ce2d2afb4b6` | 1 | Yes, historical consensus evidence | None observed | Technical integration approval | Same as above |
| `9f0e3ff00622146fddcddf7ef2d122f037310c83` | 2 | Yes, observational Evidence | `.gitignore` contains `evidence/`; the committed objects are valid | Evidence integration approval | CSV 353×19, masked rows 14, Markdown totals, rule-language check |

### 5.2 Claude WS2/WS3 branch

| Order | Source commit | Meaning | Logical / Physical / Live | Integration decision | External-state rule |
|---:|---|---|---|---|---|
| 1 | `fac229734f6e3c89d418d1464fa15b1ce26bf906` | Channel-neutral E2E-03 Natural Language Contract draft | Logical | INTEGRATE after content review | No external claim required for the contract text. |
| 2 | `dd1cd3ead90e104e218c16fa23eb6cb63caf0348` | Contract-to-current-Notion-Schema mapping report | Physical mapping | INTEGRATE as dated mapping evidence | Requery Schema before any future write. |
| 3 | `83e3d7423392695d91fff131b3b40f5a374eb153` | Approved TEST Request/Task Live validation | Live TEST evidence | INTEGRATE as historical validation | Do not assume records or schema are unchanged now. |
| 4 | `8ae12d76f777660fb2af5f8d50e958ddbed9a689` | Folder evidence discovery with a safe stop | Physical discovery, blocked | INTEGRATE as negative/safety Evidence | Its blocked result is not WS3 completion. |
| 5 | `22605ccf14e90867869962be43e4bdee5a1eacff` | One actual-case Evidence replay and mapping Preview | Physical Evidence | INTEGRATE after sensitive-metadata review | Case facts remain case Evidence; no common Rule promotion. |
| 6 | `88aa2697d9b7063efb1f650254cd8aa0abf6ea87` | Records an approved Fund Root Property and one Record write | Live Schema/Record write record | HOLD / REQUIRES_USER_DECISION | Confirm approval provenance, check scope against Workmap, and re-read current external state before Canonical completion. |

### 5.3 Selective and historical branches

| Branch | Whole-branch merge | Selective value | Why not integrate now |
|---|---|---|---|
| `agent/claude/setup` | No | Lean navigation findings and stable review-safety language | Stale base, broad 18-file delta, fixed role assumptions, separate queue/handoff system, and direct external references in old audits |
| `agent/claude/ci1-test-design` | No | Some adversarial approval/date/partial-failure cases | Pre-implementation assumptions are outdated |
| `agent/claude/ci2-alignment-review` | No | Independent test method and blocker-resolution history | Findings have later resolution and main has advanced |
| `agent/claude/ci4-alpha-validation` | No | Historical example of fail-closed review | Its target-absent result was superseded |

## 6. Repository Gap Register

### G-1 — AG-P2 approval disagreement

- **Requirement:** The approval packet, Workmap, Join Gate evidence, Governance gate, and Validator must agree.
- **Expected:** AG-P2 is approved because the packet records GPT/user approval and J-01 passed on that basis.
- **Actual:** Workmap and `ag-p2-review.yaml` say approved; `orchestration/governance/approval-gates.yaml` says `approved:false` and `plan_status:READY`.
- **Evidence:** An ad-hoc Node port of the Validator's core Workmap/Gate checks returned exactly one error: `CP-05-P3: passes unapproved gate AG-P2`. Full Python/Node equivalence is not claimed.
- **Severity:** HIGH
- **Recommended Action:** GPT-authorized update of the Governance gate to the already-recorded decision; rerun the official validator.
- **Owner:** GPT, recorded by an explicitly authorized Builder.
- **Approval Needed:** Yes; GPT-owned path and approval-state correction.

### G-2 — AG-P3 missing from Governance

- **Requirement:** Every active approval gate must exist in the Governance gate registry and Workmap.
- **Expected:** AG-P3 exists as `READY`, not approved.
- **Actual:** Workmap and `ag-p3-review.yaml` contain AG-P3; Governance contains only AG-P2.
- **Evidence:** Governance gate count is 1; Workmap approval gate count is 2.
- **Severity:** HIGH
- **Recommended Action:** Add AG-P3 as unapproved/ready with its packet and blocked items. Do not approve it.
- **Owner:** GPT.
- **Approval Needed:** Yes.

### G-3 — Generated-state output is not reproducible

- **Requirement:** `current-state.md` and `ready-work.md` must be deterministic Renderer outputs and non-Canonical.
- **Expected:** Running the Renderer does not discard unique information and produces the committed bytes.
- **Actual:** Current Renderer would output 46 logical lines for current state versus 50 committed lines, and 9 versus 19 for ready work. No byte-equivalent result exists. The committed files contain hand-written Korean labels, E2E context, and cautions; the Renderer would instead emit all 35 Work Items and a uniform three-item READY table.
- **Evidence:** No-index dry diff against temporary expected output: current-state 92 changed lines; ready-work 22 changed lines.
- **Severity:** HIGH
- **Recommended Action:** Inventory manual-only facts, move stable facts into Workmap/roadmap fields, enhance the Renderer to emit labels/cautions and all READY items, then regenerate and verify byte stability.
- **Owner:** GPT for data placement decision; Codex for approved Renderer implementation.
- **Approval Needed:** Yes. Never overwrite first.

### G-4 — README is stale and internally contradictory

- **Requirement:** README should orient, not duplicate outdated current state.
- **Expected:** It links to current orientation/workmap and does not claim absent directories or unimplemented functionality that now exists.
- **Actual:** It says `variations/` is planned/not created although four files exist; says the current position is CP-04; says the conversational prototype/Agent Write is unimplemented despite later TEST implementation and validation; and retains a Form-primary flow that conflicts with its own opening conversational-intake notice.
- **Evidence:** `README.md` current-stage, variation, Form flow, and progress sections versus main tree and Workmap.
- **Severity:** MEDIUM
- **Recommended Action:** Replace dynamic progress claims with links to Workmap/generated state, correct stable directory descriptions, and mark the Form section historical/fallback.
- **Owner:** Documentation Builder under GPT-approved scope.
- **Approval Needed:** Yes for current-state wording; no Process Rule change.

### G-5 — Root instructions, Claude role, and setup branch differ

- **Requirement:** Common safety rules and Agent defaults must be discoverable without creating permanent tool-role silos.
- **Expected:** `AGENTS.md` is common; `CLAUDE.md` is a narrow supplement; Governance defines defaults while TAPs may assign other capabilities.
- **Actual:** Main follows that minimal shape. The setup branch expands Claude into a fixed Reviewer role, prohibits main work by default, and adds separate queue/handoff instructions. Main Workmap's multi-interface principle rejects permanent role restriction. Setup instruction files contain no explicit Memory/Compact rules.
- **Evidence:** Main `AGENTS.md`, main and setup `CLAUDE.md`, setup `agents/claude/role.md`, main `agent-policy.yaml`, WS2-01 principle.
- **Severity:** MEDIUM
- **Recommended Action:** Do not merge setup wholesale. Put stable Compact/restore guidance in the final orientation manual; keep roles as defaults selected by Work Item and authority.
- **Owner:** GPT/user for role policy; documentation Builder.
- **Approval Needed:** Yes if Governance or root instructions change.

### G-6 — Two approval-gate systems have no declared relationship

- **Requirement:** Business/design decision gates and runtime orchestration approvals must be distinguishable.
- **Expected:** One file explains their separate purposes and cross-reference.
- **Actual:** `operating-model/approval-gates.md` calls itself Canonical and contains 38 gate rows; `orchestration/governance/approval-gates.yaml` contains one runtime gate. The old file has one explicit reference from `decisions/pending-approvals.md`; the new file is loaded programmatically by the Validator.
- **Evidence:** File headers, reference search, and Validator source.
- **Severity:** MEDIUM
- **Recommended Action:** Retain the old catalog as business/design decision history and the new registry as executable orchestration state; add reciprocal role notices and stop calling both the same kind of Canonical source.
- **Owner:** GPT/user.
- **Approval Needed:** Yes; governance semantics.

### G-7 — Official validation and rendering runtime is unavailable

- **Requirement:** A new session must reproduce validation and rendering with a supported command.
- **Expected:** Official scripts run in the documented environment.
- **Actual:** `python` and `py` both return exit 9009/not found. Node 24 is available. An ad-hoc Node parity check reproduced the one AG-P2 error, but no committed Node validator/renderer exists, so equivalence is not guaranteed.
- **Evidence:** Runtime commands, Python script source, and Node test run.
- **Severity:** MEDIUM
- **Recommended Action:** Either pin/provision Python or add reviewed Node-equivalent validator/renderer tests; choose one official path and CI it.
- **Owner:** Codex after GPT choice.
- **Approval Needed:** Yes for implementation choice.

### G-8 — Workmap trails the WS2/WS3 branch

- **Requirement:** Workmap status changes only after reviewed outputs are integrated and external claims are accepted.
- **Expected:** Main shows WS2-01 READY and WS3-01 PLANNED until integration.
- **Actual:** Main child items show WS2-01 `READY` and WS3-01 `PLANNED`, while their parent Workstreams both remain `BLOCKED`; the unmerged branch then adds six subsequent commits including Logical, Physical, Live TEST, Evidence, and a recorded external write. WS1 has the analogous parent/child lag (`WS1=READY`, `WS1-01=APPROVED/COMPLETED`).
- **Evidence:** Branch parent chain and five-file diff.
- **Severity:** HIGH
- **Recommended Action:** Integrate approved commit subsets first, revalidate current external facts, then update WS2/WS3 gates with separate Logical/Physical/Live results.
- **Owner:** GPT/user for gate decisions; Codex for technical integration.
- **Approval Needed:** Yes.

### G-9 — P03 five-Task and six-Task mappings coexist

- **Requirement:** Operational Task IDs used by execution instances must map unambiguously to the Process-to-Notion aggregation.
- **Expected:** A declared bridge or one approved active mapping.
- **Actual:** `mappings/process-to-notion-map.*` aggregates P03 into `OT-P03-01` through `OT-P03-05`; `contracts/process-execution-mapping.yaml` and the validated execution standard use `P03-T01` through `P03-T06`.
- **Evidence:** The older mapping groups UN-13 through UN-16 into one fifth task; the current contract separates result receipt and scan/store/delivery into T05 and T06.
- **Severity:** HIGH
- **Recommended Action:** Before AG-P3, decide whether the P3 aggregation is historical or revise it with an explicit 5-to-6 bridge. Do not silently rename existing TEST instances.
- **Owner:** GPT/user Process decision; Codex mapping update after approval.
- **Approval Needed:** Yes; Process-to-execution meaning.

### G-10 — `current_phase` trails the actual next work

- **Requirement:** Project phase should identify the active Workstream.
- **Expected:** CP-06 interaction/evidence work after WS1 completion.
- **Actual:** `current_phase` is `CP-05_NOTION_CONTROL_PLANE`, while `next_review` and the main-ready WS2 item are CP-06.
- **Evidence:** Workmap root fields and WS2-01 phase.
- **Severity:** MEDIUM
- **Recommended Action:** Update the phase only in the same approved reconciliation that integrates WS2/WS3 state.
- **Owner:** GPT.
- **Approval Needed:** Yes.

### G-11 — AG-P3 packet contains stale N-06 facts

- **Requirement:** Approval questions must reflect current verified prerequisites.
- **Expected:** N-06 is `VERIFIED`, with UI visual evidence and API rollup-value limitation recorded separately.
- **Actual:** Workmap records that state; the AG-P3 packet still says `PARTIAL`, blocks J-02, and asks whether the unverified gap should remain.
- **Evidence:** `master-workmap.yaml` versus `orchestration/approvals/ag-p3-review.yaml`.
- **Severity:** HIGH
- **Recommended Action:** Refresh the packet and recommendation before AG-P3 review; preserve the API limitation and do not imply automated API verification.
- **Owner:** GPT/user, with authorized recorder.
- **Approval Needed:** Yes.

### G-12 — No automated repository CI

- **Requirement:** Repeated parse, dependency, test, and generated-drift checks should be reproducible.
- **Expected:** Pull requests run non-external checks automatically.
- **Actual:** `.github/workflows` is absent. Node intake tests and syntax checks pass locally; orchestration validation is manual and the official runtime is unavailable.
- **Evidence:** Tree search; successful `node scripts/conversational-intake.test.mjs`; Python exit 9009.
- **Severity:** MEDIUM
- **Recommended Action:** After G-1/G-3/G-7, add non-external CI for JSON-compatible YAML parse, dependency cycles, gates, Node tests, generated drift, and `git diff --check`. Keep Notion/Drive Acceptance manual.
- **Owner:** Codex under approved CI Work Item.
- **Approval Needed:** Yes for workflow addition.

## 7. Proposed Physical Changes

No change in this table was executed.

| Path or area | Proposed change | Source | Canonical effect |
|---|---|---|---|
| `reports/reviews/consensus/*-repository-orientation-candidate.md` | Add both committed Candidate blobs | Candidate branches | None; consensus evidence |
| `reports/evidence/fieldwork-output-inventory/**` | Add two committed Evidence files | Codex Evidence branch | None; observational Evidence |
| `reports/reviews/claude/e2e03-*.md` | Add approved WS2/WS3 commit subset | Claude WS2/WS3 branch | None by file alone |
| `orchestration/governance/approval-gates.yaml` | Correct AG-P2 and register unapproved AG-P3 | G-1/G-2 | Governance state |
| `orchestration/plan/master-workmap.yaml` and `dependency-map.yaml` | Reconcile WS2/WS3, phase, gates, and satisfied inputs | G-8/G-10/G-11 | Canonical plan; GPT-owned |
| `orchestration/approvals/ag-p3-review.yaml` | Replace stale N-06 premise and current recommendation | G-11 | Approval packet; not approval itself |
| `mappings/process-to-notion-map.md` and `.yaml` | Add approved five-to-six bridge or mark old aggregation historical | G-9 | Process-to-execution mapping |
| `scripts/render_orchestration_state.py` or approved equivalent | Make rendering deterministic and information-preserving | G-3/G-7 | Tooling only |
| `orchestration/generated/*.md` | Regenerate only after Renderer fix | G-3 | Non-Canonical |
| `README.md` | Remove stale dynamic claims; point to current sources | G-4 | Navigation only |
| `operating-model/approval-gates.md` and orchestration guidance | Declare old/new gate responsibilities | G-6 | Governance interpretation |
| `docs/repository-orientation.md` | Add final stable manual | Candidate consensus | Navigation Canonical |
| `START_HERE.md` | Link final manual, without current-state duplication | Manual integration | Root navigation |
| CI workflow and/or official Node validator | Add deterministic non-external checks | G-7/G-12 | Validation infrastructure |

The setup branch's broad `CLAUDE.md`, role file, queues, and old audits are not proposed as physical merges.

## 8. Proposed Commit and PR Plan

Target integration branch: `integration/repository-state-reconciliation`.

### Commit 1 — `[Integration] Add consensus and fieldwork evidence`

- **Sources:** `276bbab3`, `b25d1d3e`, `9f0e3ff0`
- **Files:** four new files.
- **Approval:** technical integration and Evidence-safety acceptance.
- **Tests:** Candidate heading/path checks; CSV 353 rows × 19 columns; 14 masked rows; analysis totals; sensitive-pattern scan; expected-files-only.
- **Rollback:** revert this commit; no external rollback.

### Commit 2 — `[Integration] Integrate validated E2E-03 WS2 and WS3 outputs`

Use separate source-preserving subcommits or clearly list source SHAs in the commit body:

- **2A Logical/Physical mapping:** `fac2297`, `dd1cd3`
- **2B Dated Live/Evidence reports:** `83e3d74`, `8ae12d7`, `22605cc`
- **2C Deferred:** `88aa269` only after user/GPT decision and external read-only revalidation
- **Conflicts:** no structural Git conflict observed; content and approval review still required.
- **Tests:** headings/results, no unexpected files, no Rule promotion, external identifiers handled according to repository policy, commit parent order.
- **Rollback:** revert 2B without removing 2A if Live Evidence must be withheld; Git rollback does not undo an external write.

### Commit 3 — `[Governance] Reconcile workmap and approval gates`

- **Includes:** G-1, G-2, G-6, G-8, G-10, G-11; G-9 only after its explicit mapping decision.
- **Approval:** GPT/user decision packet required.
- **Tests:** parse, dependency equality/cycle, gate validator, packet/workmap matrix, READY/input checks.
- **Rollback:** revert the governance commit and restore the previous packet; do not alter external systems.

### Commit 4 — `[Governance] Restore generated-state reproducibility`

- **Includes:** approved runtime strategy, Renderer enhancement, generated-file regeneration.
- **Approval:** GPT chooses stable manual fields versus generated projection.
- **Tests:** two consecutive renders are byte-identical; no manual-only fact is lost; all READY items are present.
- **Rollback:** revert Renderer and generated files together.

### Commit 5 — `[Docs] Add canonical repository orientation manual`

- **Includes:** `docs/repository-orientation.md`, minimal `START_HERE.md` link, narrow README correction.
- **Approval:** GPT/user accept consensus synthesis.
- **Tests:** every path exists; no dynamic SHA/count/branch snapshot; no external ID/URL; cold-start questions pass.
- **Rollback:** revert documentation commit only.

### Commit 6 — `[Validation] Verify repository cold start`

- **Includes:** reviewed validation artifact and, if approved, non-external CI configuration. Do not create an empty commit.
- **Tests:** section 9.
- **Rollback:** revert CI/validation artifact without reverting the manual.

### PR plan

Create one integration PR after commits 1-5 are reviewable. Commit 2C may be a later PR if its approval/live recheck is not ready. Require a fresh head SHA before merge, expected-file diff, and a final no-external-write declaration.

## 9. Test and Rollback Plan

### 9.1 Unit

- Parse every JSON-compatible YAML and JSON file.
- Validate required Work Item fields, status enums, output/validation contracts, approval gate references, duplicate IDs, and unknown dependencies.
- Verify Workmap dependencies equal `dependency-map.yaml` edges; current result is 46 = 46 and cycle count 0.
- Run `node --check scripts/conversational-intake.mjs`.
- Run `node scripts/conversational-intake.test.mjs`; current result is all three test groups PASS.
- Validate fieldwork CSV row/column/mask totals.
- Check all manual links and prohibited dynamic/sensitive patterns.

### 9.2 Integration

- `AGENTS.md` / `CLAUDE.md` / Governance / final manual authority descriptions do not conflict.
- Approval packet, Governance gate, Workmap gate, dependency, and Join Gate state agree.
- P03 Process mapping, six-Task execution mapping, and E2E-03 standard have an explicit bridge.
- Workmap produces current/ready views without manual edits.
- Integrated branches add only approved files.

### 9.3 System cold-start dry run

A new session must be able to:

1. identify main and unmerged work without repeating WS2;
2. identify which external writes require Preview and explicit approval;
3. find the latest E2E-03 contract and Evidence;
4. regenerate state deterministically;
5. restore after Compact using Git and scoped external requery.

### 9.4 Acceptance

GPT and the user decide:

- commit 6 of the WS3 branch;
- the five-versus-six P03 mapping;
- the approval-gate relationship;
- the generated-state design;
- the final manual wording and Canonical role.

### 9.5 Rollback

- Use one revert per approval/rollback unit.
- Never use Git reset or history rewrite on shared branches.
- Reverting an external-write report does not revert the external system.
- Any compensation change in Notion/Drive requires a separate explicit approval and fresh target verification.

## 10. Final Orientation Manual Design

### Location and role

- Final path: `docs/repository-orientation.md`
- Root discovery: a short link from `START_HERE.md`
- Role: stable Navigation Manual, not a state snapshot or Process encyclopedia
- Candidate documents: retained as historical consensus evidence

### Required stable sections

1. Five-minute Bootstrap
2. Normative Authority versus Actual State
3. Repository map
4. Work Item discovery and existing-branch check
5. TAP/Work Order scope and ownership
6. Preview, explicit approval, write, requery, and stop
7. Process / Contract / Instance / Evidence distinctions
8. Conceptual / Logical / Physical / Live and V-model Gates
9. Agent selection without permanent role silos
10. Compact and recovery
11. Common errors and prevention
12. Query commands and cold-start checklist

### Dynamic content excluded

- current main SHA;
- current READY count;
- current unmerged branch list;
- detailed current Gap register;
- individual Process text;
- Notion/Drive internal IDs or direct URLs.

### Minimal command examples

The manual may include stable commands only:

```powershell
git fetch --all --prune
git status --short --branch
git rev-parse origin/main
git branch -r --no-merged origin/main
node scripts/conversational-intake.test.mjs
git diff --check
```

The validation/renderer command must be documented only after G-7 is resolved.

## 11. Approval Points

| ID | Decision required | Recommended choice | Blocks |
|---|---|---|---|
| AP-1 | Integrate both Candidates and fieldwork Evidence? | Approve as non-Canonical evidence | Final consensus traceability |
| AP-2 | Integrate Claude WS2/WS3 commits 1-5? | Approve after technical/sensitive review | WS2/WS3 Workmap reconciliation |
| AP-3 | Integrate/accept commit 6 and its recorded external write? | Hold until approval provenance is accepted and current state is re-read | WS3 Physical/Live completion |
| AP-4 | Reconcile AG-P2/AG-P3 Governance and stale AG-P3 packet? | Approve exact state correction; do not approve AG-P3 itself | Validator and formal review |
| AP-5 | Resolve P03 five-versus-six mapping? | Approve an explicit bridge; preserve legacy instance IDs | AG-P3 and downstream execution |
| AP-6 | Choose Python provisioning or official Node tooling and generated-view design? | Prefer one supported official path plus deterministic drift test | Reproducibility and CI |
| AP-7 | Canonicalize the final manual at the proposed path? | Approve synthesized stable manual after cold-start test | Repository onboarding |

## 12. Open Gaps and Next Owner

### Open gaps

- External Notion/Drive state described by the WS2/WS3 reports was not re-read in this TAP.
- Commit 6 approval provenance is recorded only in its branch report and has not been accepted into main Governance/Workmap.
- AG-P3 remains unapproved and its packet is stale.
- P03 five-versus-six Task mapping requires a Process Owner decision.
- Python validation/rendering is unavailable in the current environment; Node parity is not official.
- Generated views cannot be safely overwritten yet.
- No automated CI enforces repository-only gates.
- Historical setup/CI branches remain remote; no deletion decision was made.

### Next safe action

GPT and the user should approve or revise AP-1 through AP-7 and issue a scoped integration Work Order. The first implementation action should be Commit 1 on a new integration branch, followed by a technical review of WS2/WS3 commits 1-5. No external write is required for either action.

### Next owner

`GPT_AND_USER`, then an explicitly assigned Codex integration Builder and independent reviewer.
