# Repository Orientation Manual Candidate — Claude

> 이 문서는 **Consensus 비교용 후보**이며 Canonical이 아니다. 최종 확정 전까지 이 문서의 서술을 Rule로 인용하지 않는다.
> Snapshot 기준: `origin/main` = `32d017ceee551f370a7f25dcf52e6a77c7d45b38`, 조사일 2026-07-27.
> 표기: **[OBSERVED]** 직접 확인 / **[INFERRED]** 복수 근거 종합 추론 / **[PROPOSED]** Claude 제안 / **[확인 필요]** 미확정.

---

## 1. 5분 시작 안내

신규 세션이 처음 실행할 최소 순서다. 이 순서를 지키면 "설계만 된 것"과 "실제로 끝난 것"을 혼동하지 않는다.

| 순서 | 행동 | 이유 |
|---|---|---|
| 1 | `git fetch --all --prune` 후 `git rev-parse origin/main`, `git status`, `git branch --show-current` | 대화 요약이 아니라 실제 Git 상태가 기준 **[OBSERVED]** |
| 2 | `START_HERE.md` 읽기 | 저장소가 지정한 공식 진입점이며 Canonical 목록과 경로 소유권을 담고 있다 **[OBSERVED]** |
| 3 | `AGENTS.md` → `CLAUDE.md` 읽기 | 전 Agent 공통 원칙과 Notion 작업 원칙 **[OBSERVED]** |
| 4 | `orchestration/plan/master-workmap.yaml`에서 대상 Work Item의 `status`·`input_gate`·`allowed_paths`·`forbidden_paths` 확인 | 계획상 Canonical. 단 6절의 미병합 Branch를 함께 봐야 실제 진도를 안다 **[OBSERVED]** |
| 5 | `git branch -r --no-merged origin/main` 실행 | **main만 보면 최신 작업을 놓친다**(6절) **[OBSERVED]** |
| 6 | 현재 TAP 또는 Work Order 확인 | TAP 없이 임의 실행하지 않는다(8절) |

**5분 안에 알아야 할 한 문장**: 이 저장소는 지원팀의 세무서·은행 행정업무를 Process로 구조화해 자연어 요청을 Notion Request·Task로 연결하는 프로젝트이고, 지금은 E2E-03(고유번호증 신청) 한 건을 끝까지 실증하는 단계다. **[OBSERVED: README.md, START_HERE.md, master-workmap]**

---

## 2. Repository의 목적과 범위

**목적** **[OBSERVED: README.md §1]**
미라파트너스 지원팀의 세무서·은행 행정업무를 AI Agent가 이해·지원·수행할 수 있는 Process Model로 구조화한다. 단순 매뉴얼 작성이 아니라 표준화 → Gap 검증 → 자동화 후보 도출 → Tracker·Agent 설계까지 이어지는 기반 구축이 목표다.

**포함 범위** **[OBSERVED: README.md]**
- 세무서·홈택스·은행·문구점 행정업무
- Process Modeling과 Rule·Variation·Exception 관리
- 운영팀–지원팀 Intake와 Notion Request·Task Control Plane
- RAG Knowledge Retrieval, 승인 기반 Agent Automation

**현재 Primary 방향** **[OBSERVED: START_HERE.md §1, governance/execution-policy.yaml]**
`자연어 요청 → 누락정보 확인 → 생성 Preview → 사용자 승인 → Notion 업무요청·Task`
Notion Form은 **Optional Fallback**이며 선행조건이 아니다. Notion AI는 기본 Dependency가 아니다.

**제외·유예 범위** **[OBSERVED: README.md §9.6, workmap]**
Pilot A 제외: 고유번호증 정정, 폐업·청산, 계좌해지, 잔액증명서, Process 11, Slack 자동화, Agent Write.
현재 단계에서 Slack 연동(CI-06)·운영 확장(CI-07)·다음 Process 확장(CI-10)은 모두 BLOCKED다.

**현재 프로젝트 단계** **[OBSERVED: master-workmap `current_phase`]**
`CP-05_NOTION_CONTROL_PLANE`, 병행하여 CP-06의 WS1~WS4가 진행 중. `next_review` = `WS2_01_E2E03_NATURAL_LANGUAGE_CONTRACT_CORE`.

---

## 3. Source of Truth 계층

우선순위가 높은 것부터 낮은 순이다. **충돌 시 위쪽이 이긴다** — 단, 맨 위의 "실제 시스템 상태"가 항상 최종 심판이다.

| 순위 | 계층 | 파일·대상 | 성격 | 주의 |
|---:|---|---|---|---|
| 0 | **실제 Git·Notion·Drive 상태** | 라이브 조회 결과 | 최종 Actual | 문서가 실제와 다르면 문서가 틀린 것 **[OBSERVED: 5·6절 사례]** |
| 1 | 전 Agent 공통 원칙 | `AGENTS.md` | 불변 원칙 | 사실·추정 구분, 민감정보 금지, 단일 Writer **[OBSERVED]** |
| 2 | Claude 전용 원칙 | `CLAUDE.md` | 불변 원칙 | Notion 연결·읽기·쓰기·금지사항 **[OBSERVED]** |
| 3 | 진입점 | `START_HERE.md` | 안내 | Canonical 목록·경로 소유권·Current/Historical 구분 **[OBSERVED]** |
| 4 | **Canonical 계획 상태** | `orchestration/plan/master-workmap.yaml` | GPT 단독 소유 | Agent가 수정 금지. **미병합 Branch 진도를 반영하지 못할 수 있음** **[OBSERVED]** |
| 5 | 거버넌스 정책 | `orchestration/governance/*.yaml` | GPT 소유 | 6종. 현재 workmap과 일부 불일치 **[OBSERVED: 15절 G-1]** |
| 6 | 실행 계약 | `contracts/*.yaml`, `templates/`, `docs/process-execution-layering.md` | Canonical 계약 | E2E-03 실행 구조의 기준 **[OBSERVED]** |
| 7 | Process 정의 | `processes/00~11` | Canonical | 가장 안정적인 영역 **[OBSERVED]** |
| 8 | Test·Validation 보고서 | `reports/**` | 당시 판정 | **당시 시점의 판정**이며 현재 상태가 아님 **[OBSERVED: START_HERE §11]** |
| 9 | Evidence | `cases/`, `reports/evidence/**`(미병합), Drive 실물 | 근거 | 사례 1건으로 공통 Rule 확정 금지 **[OBSERVED: AGENTS.md]** |
| 10 | Generated View | `orchestration/generated/*.md` | **비Canonical** | 재생성 대상. 현재 생성기와 어긋나 있음 **[OBSERVED: 15절 G-3]** |
| 11 | Legacy Queue·상태 서술 | `tasks/tap-queue.md`, `tasks/active.md`, `README.md` §9.8 | Historical | 스스로 LEGACY 선언. 상태 판단에 쓰지 말 것 **[OBSERVED]** |
| 12 | TAP·대화 기록 | 사용자 지시, 세션 로그 | 실행 지시 | 지시는 권위가 있으나 **상태의 근거는 아님**. 반드시 Repository로 재검증 |

**핵심 규칙 [OBSERVED: START_HERE.md §5, ownership-policy.yaml]**
- GPT 소유(수정 금지): `orchestration/plan/**`, `orchestration/governance/**`, `orchestration/work-orders/**`, `orchestration/approvals/**`
- Agent 기록 영역: `orchestration/runs/<agent>/**`, `orchestration/handoffs/**`, `orchestration/proposals/**`
- Generated: `orchestration/generated/**` — Source of Truth 아님

---

## 4. Repository 지도

`origin/main` 기준 실재하는 경로만 기록한다. tracked 파일 231개, 최상위 디렉터리 21개. **[OBSERVED: `git ls-files`]**

| 경로 | 역할 | 신규 세션 참고 |
|---|---|---|
| `START_HERE.md` | 공식 진입점 | **여기서 시작** |
| `AGENTS.md` / `CLAUDE.md` | 공통 원칙 / Claude·Notion 원칙 | 필독 |
| `README.md` | 프로젝트 전체 소개 + 과거 상태표(§9.8) | 목적 파악용. **상태값은 신뢰하지 말 것**(15절 G-4) |
| `orchestration/plan/` | Canonical 계획(`master-workmap.yaml`, `dependency-map.yaml`, `roadmap.md`) | 계획 기준 |
| `orchestration/governance/` | 정책 6종(agent·approval-gates·execution·ownership·runtime·status-model) | 역할·중단조건·정지 규칙 |
| `orchestration/generated/` | `current-state.md`, `ready-work.md` | 비Canonical View |
| `orchestration/work-orders/`, `orchestration/approvals/`, `orchestration/runs/`, `orchestration/handoffs/`, `orchestration/proposals/`, `orchestration/schemas/` | GPT 발행 지시·승인 패킷·Agent 실행이력·인계·계획변경요청·JSON Schema | Agent는 runs·handoffs·proposals에만 기록 |
| `processes/00~11` | As-Is Process Model 12개 | E2E-03은 `03-unique-number-application.md`. Process 11은 DRAFT |
| `contracts/` | `conversational-intake-contract.yaml`, `process-execution-mapping.yaml` | 실행 계약 |
| `templates/request-execution-template.md` | Request 실행 본문 템플릿 | 계약과 세트 |
| `docs/` | `process-execution-layering.md`(계층 정의), `work-item-glossary.md`(ID 뜻), `conversational-intake-quickstart.md` | **Glossary를 먼저 보면 ID 혼동이 없다** |
| `notion/model/`, `notion/schema/` | 상태·증빙·승인 모델 / DB·Form 구조 | Notion 설계는 이 둘 + `mappings/process-to-notion-map.yaml` 3분할 |
| `mappings/` | Source·Process·Notion·Task 연결 16종 | 연결 관계 탐색 |
| `sources/notion/` | 공식 Notion Source Extract | Process의 근거 |
| `variations/` | 조합·GP·계좌·기관 4축 | 실재함(README 서술과 다름) |
| `cases/` | 비식별 CASE Evidence | Evidence 전용, Source 대체 불가 |
| `conflicts/` | `unresolved.md`, `p3-open-conflicts.md` | 미해결 Gap |
| `decisions/` | `decision-log.md`(승인된 결정), `pending-approvals.md`(파생 View) | 결정 근거 추적 |
| `operating-model/`, `plans/`, `tasks/` | 구 CP-05 체계·Roadmap·Legacy Queue | **주로 Historical** |
| `reports/` | QA·검증·리뷰 보고서 49+종 평탄 배치 | 당시 판정 |
| `scripts/` | `conversational-intake.mjs`(+test), `validate_orchestration.py`, `render_orchestration_state.py` | 11절 참고 |
| `rag/`, `rules/`, `schemas/` | 보조 자료(각 1~2파일) | 참고용 |

---

## 5. 현재 Workstream과 완료 수준

### 5.1 계획상 상태 **[OBSERVED: master-workmap v1.4.0, 35 Work Items]**

Work Item 상태 분포: APPROVED 21, READY 3, BLOCKED 5, SUPERSEDED 3, PLANNED 2, APPROVAL_REQUIRED 1.

| Workstream | 계획 상태 | 비고 |
|---|---|---|
| WS-PROCESS (As-Is Process Model) | APPROVED | CP-04 완료 |
| WS-NOTION (Control Plane) | APPROVAL_REQUIRED | AG-P3 대기 |
| WS-UI (Form) | PLANNED / DEFERRED_OPTIONAL | Fallback으로 보존 |
| WS-CONVERSATIONAL-INTAKE | READY / ACTIVE_FAST_TRACK | CI-01~CI-05·CI-08 APPROVED |
| WS1 Process-DB 실행표준 | READY (WS1-01 APPROVED) | 산출물 main 병합 완료 |
| WS2 Interaction Contract | BLOCKED (WS2-01 READY) | **실제로는 미병합 Branch에서 완료**(5.3) |
| WS3 Fund Folder·Evidence | BLOCKED (WS3-01 PLANNED) | **실제로는 미병합 Branch에서 Root 구현까지 진행**(5.3) |
| WS4 Multi-interface Agent | BLOCKED | WS1·WS2·WS3 선행 필요 |

READY 3건 = `AG-P3`, `CI-09`, `WS2-01`. Join Gate: `J-01` PASSED, `J-02` BLOCKED. **[OBSERVED]**

### 5.2 Conceptual / Logical / Physical / Live 축 **[INFERRED: 산출물 종류로부터 종합]**

| 축 | 도달 범위 | 근거 |
|---|---|---|
| Conceptual | Process 12개, 계층 정의, Operating Model — **완료** | `processes/**`, `docs/process-execution-layering.md` |
| Logical | E2E-03 실행표준·Natural Language Contract·Schema Mapping — **완료(일부 미병합)** | `reports/reviews/claude/e2e03-operational-standard-draft.md`(main), Contract·Mapping(미병합) |
| Physical | Notion Request·Task DB 및 기존 Property로 충족, 신규 Property 1건 추가 — **부분 완료** | WS2-P 판정 "신규 Property 불필요", WS3에서 FUND Root Property 1개 승인 후 생성 |
| Live | E2E-03 TEST 범위 Live 검증 완료, **운영 Record 자동화는 미구현** | CI4·CI5·CI6·WS2-O 검증. Slack·Skill 미구현 **[OBSERVED: README.md §9.8]** |

### 5.3 계획과 실제의 격차 — 신규 세션이 반드시 알아야 할 항목 **[OBSERVED]**

`origin/main`의 Workmap은 **WS2-01=READY, WS3-01=PLANNED**로 되어 있으나,
미병합 Branch `agent/claude/e2e03-natural-language-contract`에는 WS2 Logical·Physical·Live 검증과 WS3 Root 확정·Evidence 검증까지 **6개 Commit**이 이미 존재한다.

즉 **계획 상태(main)가 실행 상태(미병합 Branch)보다 뒤처져 있다.** main만 읽고 "WS2는 아직 시작 전"이라고 판단하면 중복 작업이 발생한다.
같은 패턴이 Codex 쪽에도 있다 — 미병합 Evidence Branch의 문서는 스스로 "현재 Canonical Workmap에 해당 Work Item이 없어 독립 Evidence Discovery로 기록한다"고 밝히고 있다. **[OBSERVED]**

### 5.4 Verification 축(V-Model) **[OBSERVED: 보고서 판정값]**

| 축 | 현재 |
|---|---|
| Unit | Intake 파서·계약 테스트 PASS(11절에서 재현 가능) |
| Integration | Request→Task Relation, 상태 전이, Process 정합 검증 완료 |
| System | E2E-03 전 구간 Replay 완료(TEST 범위·실제 폴더 Evidence 1건) |
| Acceptance | 사용자 확인 기반. **일부 항목은 사람 육안 확인이 유일한 수단**(예: Rollup 표시값은 API가 `<omitted />` 반환) |

---

## 6. 주요 Branch·Commit 지도

**Snapshot 시점 정보다. 반드시 `git fetch` 후 재확인할 것.** **[OBSERVED: 2026-07-27]**

`origin/main` HEAD = `32d017c` "Advance E2E-03 workmap to natural language contract"

### 6.1 main에 병합 완료

| Branch | 역할 |
|---|---|
| `agent/claude/ci4-alpha-targeted-validation` | CI4 알파 독립 검증(PR #1) |
| `agent/claude/ci5-e2e03-loop-engineering` | E2E-03 Loop Engineering(PR #2) |
| `agent/claude/e2e03-operational-standard-integration` | E2E-03 실행표준 통합(PR #3) |

### 6.2 미병합 Branch — 여기에 최신 작업이 있다

| Branch | ahead/behind | 내용 | 위험 |
|---|---|---|---|
| `agent/claude/e2e03-natural-language-contract` | 6 / 0 | **WS2 Contract·Schema Mapping·Live 검증 + WS3 Evidence·Fund Root 구현**. 신규 문서 5종 | main에 없음. 가장 최신 실행 상태 |
| `agent/codex/fieldwork-output-evidence-inventory` | 1 / 0 | 외근 산출물 Evidence 인벤토리(분석 + CSV) | main에 없음. WS3 입력 후보 |
| `agent/claude/ci1-test-design` | 1 / 16 | 독립 테스트 팩 | 오래됨 |
| `agent/claude/ci2-alignment-review` | 2 / 12 | CI2 정합성 검증·Blocker 재확인 | 오래됨 |
| `agent/claude/ci4-alpha-validation` | 1 / 10 | CI4 1차 시도(대상 부재로 FAIL 보고) | 후속 Branch로 대체됨 |
| `agent/claude/setup` | 9 / 18 | **확장 `CLAUDE.md`, `agents/claude/role.md`, repository-lean-review 등 18파일** | Claude 역할 정의가 main에 없음(15절 G-5) |

### 6.3 중복·충돌 위험 **[INFERRED]**

- `agent/claude/setup`의 `CLAUDE.md`(121행)와 main의 `CLAUDE.md`(35행)는 **같은 파일을 다르게 정의**한다. 병합 시 충돌 대상 **[OBSERVED]**
- 미병합 Branch 6개 중 4개가 main보다 10커밋 이상 뒤처져 있어, 그대로 병합하면 구식 상태를 되살릴 수 있다 **[확인 필요: 정리·폐기 여부는 GPT·사용자 결정]**
- Branch·worktree 대응이 1:1로 유지되고 있어 서로 다른 작업이 같은 파일을 동시에 쓰는 사고는 관찰되지 않았다 **[OBSERVED]**

---

## 7. 신규 Work Item 시작 절차

`탐색 → 기존 구조 재사용 → Preview → 승인 → 구현 → 검증 → Evidence → Handoff` **[OBSERVED: START_HERE §8~9, execution-policy.yaml, 실제 WS2·WS3 실행 사례]**

1. **탐색** — Workmap에서 Work Item의 `status`·`input_gate`·`required_inputs`·`allowed_paths`·`forbidden_paths`를 읽는다. 미병합 Branch(6절)도 함께 확인해 이미 수행된 작업인지 본다.
2. **기존 구조 재사용 우선** — 새 Property·새 DB·새 디렉터리를 만들기 전에 기존 것으로 충족되는지 먼저 검증한다. 실제로 WS2에서는 전 Contract 요소가 기존 Property로 표현 가능하다고 판정돼 **신규 Property 0개**로 끝났다. **[OBSERVED]**
3. **Preview** — 변경 대상·이전 값·새 값·Write 건수·원복 방법을 사용자에게 먼저 보여준다. 이 시점 Write는 0건이어야 한다.
4. **승인** — 사용자가 **명시적 승인 문구**를 말한 경우에만 진행한다. 모호한 반응("확인했습니다")은 승인이 아니다(fail-safe 기본값 = 비승인). **[OBSERVED: Contract 및 WS2 AC-02 검증]**
5. **구현** — 승인된 범위만. 승인 범위를 넘는 항목은 같은 승인에 끼워 넣지 않고 별도 후보로 남긴다.
6. **검증** — 구현 직후 **재조회**로 Expected–Actual을 비교한다. 불일치 시 즉시 중단.
7. **Evidence** — `reports/**`(또는 허용 경로)에 근거·범위·미확인 항목을 남긴다. 민감정보는 기록하지 않는다.
8. **Handoff** — 다음 Owner·Gate·Open Gap을 명시한다.

**경로 우선순위 규칙 [PROPOSED, 실제 적용 사례 있음]**
TAP이 제안한 파일 경로와 Workmap에 등록된 `allowed_paths`가 다르면 **Workmap의 등록값을 따르고, 그 편차를 문서와 Commit 메시지에 남긴다.** WS1-01에서 이 방식이 실제로 적용됐고 이후 TAP에서 문제 제기가 없었다. **[OBSERVED: 사례 존재] / [확인 필요: 공식 Rule로 승격 여부]**

---

## 8. TAP 사용법

**TAP(Task Assignment Package)** 은 사용자가 발행하는 구조화된 실행 지시다. Work Order와 같은 역할을 하되 사용자가 직접 발행한다. **[INFERRED: 실제 운용 형태 관찰]**

### 8.1 TAP에 담겨야 하는 항목 **[INFERRED: 반복 관찰된 구조 + work-order.schema.json]**

목적 / 선행조건 / 대상 Branch / Canonical 우선순위 / 읽을 파일 / 산출물 경로 / 허용·금지 행위 / 승인 게이트와 승인 문구 / 중단조건 / Commit 메시지 규격 / 완료 판정값 / 완료 보고 형식 / 다음 Owner.

### 8.2 TAP 없이 하면 안 되는 변경 **[OBSERVED: agent-policy.yaml `AGENT_MUST_HAVE_WORK_ORDER`, execution-policy `stop_conditions`]**

- Notion Schema 변경(Property 생성·삭제·타입 변경)
- Notion 운영 Record Write
- Drive 파일 이동·수정·삭제·이름 변경
- Canonical 경로(`orchestration/plan/**`, `orchestration/governance/**`) 수정
- main 직접 Commit·Push, PR Merge
- Process Rule 확정, 새 Workstream·Schema 신설

### 8.3 TAP이 있어도 멈춰야 하는 순간 **[OBSERVED: execution-policy.yaml]**

`HUMAN_APPROVAL_REQUIRED`, `USER_JUDGMENT_REQUIRED`, `NOTION_OPERATIONAL_WRITE`, `EXTERNAL_SYSTEM_WRITE`, `SENSITIVE_DATA`, `MISSING_REQUIRED_INPUT`, `SOURCE_CONFLICT`, `PROCESS_MEANING_CHANGE`, `ARCHITECTURE_CHANGE`, `NEW_SCOPE`, `VALIDATION_FAILURE`, `TEST_FAILURE`, `BASE_COMMIT_MISMATCH`, `PATH_CONFLICT`, `PLAN_CHANGE_REQUIRED`, `RUNTIME_LIMIT`, `ESTIMATE_EXCEEDS_2X`.
`continuation_default`는 **STOP**이다. 계속 실행이 기본값이 아니다.

---

## 9. Write·승인·중단 규칙

| 대상 | 허용 | 승인 필요 | 금지 |
|---|---|---|---|
| **Git** | 지정된 Agent Branch에 Commit·Push | PR 생성·Merge | main 직접 Commit·Push, force push, 타 Agent Branch 수정·병합 **[OBSERVED]** |
| **Git 경로** | Work Item `allowed_paths` 내부 | 범위 밖 경로 | `orchestration/plan/**`·`orchestration/governance/**`·`orchestration/work-orders/**`·`orchestration/approvals/**` 수정 **[OBSERVED: ownership-policy]** |
| **Notion 읽기** | 조회·재조회 자유 | — | — |
| **Notion TEST Record** | 승인된 Prefix 범위 | 생성 계획 Preview 후 명시 승인 | 운영 Record 혼입 |
| **Notion 운영 Record** | — | 건별 명시 승인 | 승인 없는 상태·담당자 변경 **[OBSERVED: CLAUDE.md]** |
| **Notion Schema** | — | **전용 승인 문구** 필요 | 기존 Property·Option·Relation 삭제·변경 |
| **Drive** | 메타데이터·구조 읽기 | 사용자 지정 범위 읽기 | 파일 이동·수정·다운로드·이름 변경 **[OBSERVED: WS3-01 forbidden_paths]** |
| **민감정보** | — | — | 주민번호·계좌·비밀번호·보안카드 값·인증정보·연락처·인감 이미지 Git 기록 **[OBSERVED: AGENTS.md]** |

**Commit 정책** **[OBSERVED: execution-policy.yaml]**: Work Order당 최대 3커밋, 메시지 필수, force push 금지. 사소한 수정 Commit을 남발하지 않는다.

**단일 Writer 원칙** **[OBSERVED: AGENTS.md]**: 동일 Notion Record의 최종 쓰기 Agent는 작업 시작 전에 **한 명만** 지정한다.

**추가 실무 주의 [PROPOSED]**: Drive 광역 키워드 검색은 무관한 실제 조합의 민감 서류를 결과에 노출시킬 수 있다. 확정된 `parentId` 기반 단계 조회를 우선한다. **[OBSERVED: WS3 실증]**

---

## 10. Evidence와 파일 구조 이해

E2E-03 검증에서 실제로 확인된 4계층 구분이다. **한 계층을 다른 계층으로 대체하지 않는다.** **[OBSERVED: WS3 실증]**

| 계층 | 정의 | 수명·소속 | 저장 위치 |
|---|---|---|---|
| **Fund Root Folder** | 조합 1건의 장기 기준 폴더 | FUND와 1:1, 장기 | Drive. FUND 마스터에 Root URL Property 1개가 승인 후 신설됨 **[OBSERVED]** |
| **Request Source Folder** | 특정 업무요청의 작업 위치 | Request별, 단기 | Request `원본 폴더`(URL). 운영 데이터에서 거의 비어 있음 **[OBSERVED]** |
| **Shared Functional Evidence Folder** | 특정 업무유형 결과물을 여러 조합에 걸쳐 일괄 취합 | 조합 무관, 공통 | 공통 드라이브의 업무별 취합 폴더. 조합 Root에 없다고 미발급이 아님 **[OBSERVED]** |
| **Task Evidence / Completion Evidence** | Task 판단 입력 파일 / 완료를 증명하는 결과물 | Task별 | Drive 파일 + Task `완료증빙` |

**판정 원칙 [OBSERVED: WS3 실증]**
- 파일 부재 ≠ 업무 미수행. Blocker로 남기되 완료로도 미수행으로도 단정하지 않는다.
- Windows 바로가기(`.lnk`)는 실물 증빙으로 인정하지 않는다(`UNVERIFIED_SHORTCUT`).
- 같은 파일이 외근·Root·공통 폴더에 중복 존재해도 즉시 오류가 아니다. 운영상 복사본이 허용된다.
- 폴더·파일명 괄호 안 메모는 정식 명칭이 아니라 `operational_note`로 분리하고, 그것만으로 상태를 자동 변경하지 않는다.
- 날인 여부·전달 증빙처럼 **본문을 열어야 아는 사실은 자동 판정하지 않고 사람 확인으로 남긴다.**

---

## 11. 테스트와 완료 Gate

### 11.1 지금 바로 실행 가능한 검증 **[OBSERVED: 본 조사에서 실제 실행]**

```
node scripts/conversational-intake.test.mjs
```
→ `conversational-intake tests: PASS` / `transaction tests: PASS` / `canonical process alignment tests: PASS` (exit 0). 파일을 쓰지 않는 순수 테스트이며 외부 시스템 없이 Intake 로직 건강도를 확인할 수 있다.

### 11.2 실행 불가한 검증 — 환경 제약 **[OBSERVED]**

`scripts/validate_orchestration.py`와 `render_orchestration_state.py`는 Python 스크립트지만, 현재 개발 환경의 `python`/`python3`는 Windows Store 스텁이며 실제 인터프리터가 설치돼 있지 않다(`py` 런처도 없음). 따라서 **이 환경에서는 저장소 자체 검증기를 직접 돌릴 수 없다.**
본 조사에서는 검증 로직을 Node로 동등 이식해 실행했고 결과는 15절 G-1이다. **[확인 필요: Python 설치 또는 Node 이식본 공식화 여부]**

### 11.3 V-Model 연결 **[INFERRED: 실제 검증 관행]**

| 단계 | 질문 | 근거 형태 |
|---|---|---|
| Unit | 개별 함수·필드 Mapping이 맞는가 | 코드 실행 결과 |
| Integration | 계층 간 연결(FUND→Root→Evidence, Request→Task)이 맞는가 | 재조회 결과 |
| System | 실제 사례 1건이 전 구간 재현되는가 | E2E Replay |
| Acceptance | 업무 담당자가 맞다고 확인하는가 | 사용자 확인 |

### 11.4 완료 판정 원칙 **[OBSERVED: AGENTS.md, 실제 판정 사례]**

- **Verification(문서가 스스로 맞다고 하는 것)과 Validation(실제 시스템에서 확인한 것)을 분리한다.** 보고서의 PASS는 Verification일 뿐이다.
- 선행 Agent의 결과를 전제로 PASS 처리하지 않는다. 코드 실행 또는 라이브 재조회로 독립 확인한다. 이 원칙으로 실제 버그 2건(FUND 미해결 시 자동 생성, Rollup의 근거 없는 VERIFIED 표기)이 발견됐다. **[OBSERVED]**
- 사례 1건으로 공통 Rule을 확정하지 않는다. 잠정 규칙으로 표시한다.
- API로 구조적으로 확인 불가한 항목(예: Rollup 표시값)은 "실패"가 아니라 `TOOL_LIMITATION`으로 분리 기록한다.

---

## 12. Claude·Codex·GPT 협업 기준

**고정 역할이 아니다.** Workmap은 "Claude, Codex, Slack은 판단·실행·입력 역할에 영구히 제한되지 않으며, 각 인터페이스는 자신의 모델·도구·권한 범위 안에서 동일한 Process Contract를 사용한다"는 Multi-interface 원칙을 담고 있다. **[OBSERVED]**

다만 현재 정책과 실적상 강점은 다음과 같다. **[OBSERVED: agent-policy.yaml + 실행 이력]**

| 주체 | 정책상 권한 | 현재 강점 | 사용 판단 기준 |
|---|---|---|---|
| **GPT** | Canonical Plan 소유, Work Order 발행, 의존성·승인 조율 | 계획 일관성, Gate 관리 | 계획 상태 변경·우선순위 결정이 필요할 때 |
| **Codex** | Build Work Order 실행, Intake 로직·Skill 구축, 승인된 TEST 범위 Notion CRUD, Commit·Push | 구현·대량 인벤토리·반복 처리 | 코드·구조를 실제로 만들어야 할 때 |
| **Claude** | Review Work Order 실행, Findings·Handoff·Proposal 작성 | 독립 검증, 계약·의미 정합성, 예외·Evidence 판별 | 남의 결과를 **의심하며** 확인해야 할 때 |
| **사용자** | Process Owner, 승인, 실제 화면·Pilot 확인 | 업무 사실의 최종 근거 | 사람만 아는 사실·승인이 필요할 때 |

**충돌 방지 [OBSERVED]**: 동일 Notion Record의 최종 Writer는 1명, Canonical Plan 수정은 GPT만, Agent는 자신의 Branch·Run·Handoff만 기록.

**[PROPOSED]** Reviewer 역할을 맡은 Agent는 검증 대상 Agent의 결과 문서를 근거로 삼지 말고, 원본 시스템(코드 실행·라이브 조회)을 직접 확인해야 한다. 이 저장소에서 실제로 결함을 잡아낸 방식이 이것이다.

---

## 13. 세션 Memory·Compact·복원

대화 요약은 **상태의 근거가 아니다.** 요약에는 "무엇을 하려 했는지"는 남지만 "실제로 반영됐는지"는 남지 않는다. **[PROPOSED, 실제 경험 기반]**

### 13.1 Compact 전에 반드시 문서·Commit으로 내보낼 것

- 현재 Branch명·Base Commit·마지막 Commit SHA
- 수행한 외부 Write의 **실제 건수와 대상**(Notion Schema/Record, Drive)
- 사용자로부터 받은 **승인 문구와 그 범위**
- Expected–Actual 검증 결과
- 미확인 항목(`[확인 필요]`)과 다음 Owner

이것들이 파일에 남아 있지 않으면 Compact 후 복원이 불가능하다.

### 13.2 Compact 후 복원 순서

1. `git fetch --all --prune`; `git rev-parse origin/main`; `git branch --show-current`; `git log --oneline -10`; `git status`
2. `git branch -r --no-merged origin/main`로 **미병합 작업 확인**(6절)
3. 자신의 Branch에서 최근 Commit의 산출물 문서를 읽는다 — 이 문서들이 사실상의 세션 메모리다
4. Workmap의 해당 Work Item 상태를 다시 읽고 3과 비교한다(계획이 뒤처져 있을 수 있음)
5. 외부 상태(Notion·Drive)는 **재조회로 확인한다.** 이전 대화의 조회 결과를 그대로 신뢰하지 않는다
6. 미완 항목만 이어서 수행하고, 이미 반영된 Write를 반복하지 않는다

### 13.3 재개 시 식별 수단 **[OBSERVED]**

별도 Transaction ID Property 없이 **Record 제목 Prefix + 상위 Relation + page URL**만으로 재개 대상을 특정할 수 있음이 실증됐다. 새 식별자를 만들기 전에 이 방식으로 충분한지 먼저 확인한다.

---

## 14. 자주 발생할 수 있는 오류

| # | 오류 | 예방 |
|---|---|---|
| E-1 | **main의 Workmap만 보고 "아직 안 한 작업"이라 판단해 중복 수행** | `git branch -r --no-merged origin/main`을 Bootstrap에 포함(5.3·6절) **[OBSERVED: 실제 격차 존재]** |
| E-2 | **설계 완료를 실제 완료로 오인** | 문서의 PASS는 Verification일 뿐. Live 여부는 라이브 재조회로 확인(11.4절) |
| E-3 | **Historical 문서의 당시 판정을 현재 상태로 인용** | `README.md` §9.8, `tasks/tap-queue.md`, `tasks/active.md`는 Historical. 상태는 Workmap + 실제 시스템에서 확인 **[OBSERVED: START_HERE §11]** |
| E-4 | **Generated View를 Canonical로 착각** | `orchestration/generated/**`는 비Canonical. 게다가 현재 생성기 출력과 어긋나 있다(G-3) |
| E-5 | **모호한 사용자 반응을 승인으로 처리** | 승인은 명시적 문구만. 기본값은 비승인. Preview 시점 Write 0건 유지 **[OBSERVED: AC-02 검증]** |
| E-6 | **선행 Agent 결과를 전제로 PASS 처리** | 코드 실행·라이브 조회로 독립 확인. 과거 이 방식으로 실제 결함 2건 발견 |
| E-7 | **파일이 없다는 이유로 업무 미수행/완료로 단정** | Blocker로 남기고 사람 확인 대상으로 표시(10절) |
| E-8 | **기존 구조 확인 없이 새 Property·DB·디렉터리 신설** | 먼저 기존 Property로 충족되는지 검증. WS2는 신규 Property 0개로 종결 **[OBSERVED]** |
| E-9 | **Drive 광역 키워드 검색 실행** | 무관한 실제 조합의 민감 서류가 노출된다. 확정 `parentId` 기반 단계 조회 사용 **[OBSERVED: 실제 노출 관찰]** |
| E-10 | **TAP 인라인 경로를 Workmap `allowed_paths`보다 우선 적용** | 등록된 `allowed_paths`를 따르고 편차를 문서화(7절) |
| E-11 | **`.lnk`·0byte placeholder를 실물 증빙으로 계수** | 실물 여부를 별도 판정하고 미검증으로 표시(10절) |
| E-12 | **Compact 이후 대화 요약만 믿고 작업 재개** | 13절 복원 순서 수행. 외부 Write는 재조회로 확인 |

---

## 15. 현재 Open Gap과 다음 안전한 작업

### 15.1 현재 상태에서 발견된 Gap **[OBSERVED — 본 조사에서 직접 확인]**

| ID | Gap | 근거 | 영향 |
|---|---|---|---|
| **G-1** | **저장소 자체 검증 로직이 FAIL한다** — `CP-05-P3: passes unapproved gate AG-P2`. `orchestration/governance/approval-gates.yaml`의 AG-P2는 `approved: false`인데 `orchestration/plan/master-workmap.yaml`은 AG-P2를 `APPROVED`로, `J-01` 근거로도 "AG-P2 APPROVED"를 기재 | 검증 로직 Node 이식본 실행 결과 | 승인 상태를 어디서 봐야 하는지 답이 갈린다 |
| **G-2** | `orchestration/governance/approval-gates.yaml`에 **AG-P3 항목이 아예 없다**. Workmap에는 AG-P3(READY)가 존재 | 두 파일 비교 | 거버넌스 파일만 읽으면 AG-P3의 존재를 모른다 |
| **G-3** | `orchestration/generated/*.md`가 **생성기 출력 형식과 다르다**(헤더 문구·표 구조 상이) → 손으로 유지되며 drift | 파일 내용 vs `render_orchestration_state.py` | "재생성 가능"이라는 전제가 실제로는 깨져 있다 |
| **G-4** | `README.md` §5가 `variations/`를 "예정 — 디렉터리 미생성"으로 기재하나 실제로는 4개 파일 존재 | `git ls-files` | README 상태 서술 신뢰도 저하 |
| **G-5** | Claude 역할 정의(확장 `CLAUDE.md`, 그리고 main에는 없고 해당 Branch에만 있는 `agents/claude/role.md`)가 **미병합 Branch에만 존재** | `agent/claude/setup` 비교 | main만 보는 신규 Claude 세션은 자신의 역할 정의를 못 본다 |
| **G-6** | 승인 게이트 체계가 **2개 병존** — 구 `operating-model/approval-gates.md`(AG-nn 계열 36개 참조)와 신 `orchestration/**`(AG-P2/AG-P3). 폐기 선언 없음 | 두 체계 파일 실재 | 승인 이력 추적 시 혼선 |
| **G-7** | Python 미설치로 저장소 검증·렌더 스크립트를 이 환경에서 실행 불가 | 환경 조사 | 상태 재생성·검증 자동화가 사실상 중단 |
| **G-8** | 계획(main Workmap)이 실행(미병합 Branch)보다 뒤처짐 — WS2·WS3 및 Codex Evidence 작업 | 6절 | 중복 작업·오판 위험(E-1) |

### 15.2 다음 안전한 작업 **[PROPOSED — 실행 전 GPT·사용자 승인 필요]**

Write 위험이 낮은 순서다.

1. **미병합 산출물의 main 반영 결정** — `agent/claude/e2e03-natural-language-contract`(WS2·WS3)와 Codex Evidence Branch의 PR·Merge 여부를 GPT·사용자가 판단한다. 이것이 G-8과 E-1의 근본 해소책이다.
2. **G-1·G-2 정합화** — `orchestration/governance/approval-gates.yaml`의 AG-P2 `approved` 값과 AG-P3 항목을 Workmap과 맞춘다. **GPT 소유 경로이므로 Agent는 Proposal로 제출한다.**
3. **G-3 해소** — `orchestration/generated/**`를 생성기로 재생성하거나, 손으로 유지한다면 "생성기 사용 안 함"을 명시한다(선택은 소유자 몫).
4. **Workmap의 WS2-01·WS3-01 상태 갱신** — 실제 진도 반영. GPT 소유.
5. **G-4 README 정정**, **G-5 Claude 역할 정의 병합 여부 결정**, **G-6 구 게이트 체계 처분 선언**.
6. **WS4-01 착수 검토** — WS1·WS2·WS3 산출물이 병합·반영된 이후에만.

**지금 즉시 하면 안 되는 것**: Workmap·governance 직접 수정, 미병합 Branch 임의 Merge, 운영 Record·Schema 추가 변경.

---

## 16. 신규 세션 Bootstrap Checklist

복사해서 사용한다.

```
[ ] 0. 모델·환경 확인 (TAP이 특정 모델을 요구하면 실제 활성 모델을 확인)
[ ] 1. git fetch --all --prune
[ ] 2. git rev-parse origin/main            → BASE_MAIN_HEAD 기록
[ ] 3. git branch --show-current / git status --short   → 예상 밖 dirty면 중단
[ ] 4. git branch -r --no-merged origin/main            → 미병합 최신 작업 확인 (필수)
[ ] 5. START_HERE.md 읽기
[ ] 6. AGENTS.md, CLAUDE.md 읽기
[ ] 7. docs/work-item-glossary.md 로 ID 의미 확인
[ ] 8. orchestration/plan/master-workmap.yaml 에서 대상 Work Item의
       status / input_gate / required_inputs / allowed_paths / forbidden_paths 확인
[ ] 9. orchestration/generated/ready-work.md 는 참고만 (비Canonical)
[ ] 10. 관련 Canonical 계약 읽기
        - contracts/process-execution-mapping.yaml
        - docs/process-execution-layering.md
        - processes/03-unique-number-application.md (E2E-03인 경우)
[ ] 11. node scripts/conversational-intake.test.mjs   → 로직 건강도 확인
[ ] 12. 외부 상태가 필요하면 Notion·Drive를 직접 재조회 (대화 요약 신뢰 금지)
[ ] 13. Write 계획이 있으면 Preview 작성 → 명시 승인 대기 (이 시점 Write 0건)
[ ] 14. 실행 → 즉시 재조회로 Expected–Actual 비교
[ ] 15. Evidence 문서화 (민감정보 제외) → 허용 경로에 Commit
[ ] 16. 완료 보고: 실제 Write 건수 / 미확인 항목 / 다음 Owner / Open Gap
```

---

## 17. Cold-start 검증 결과

이 문서만 받은 신규 Agent가 답할 수 있어야 하는 5개 질문에 대해, **이 문서 안의 근거만으로** 답한다.

| # | 질문 | 이 문서만으로 답 가능한가 | 답 | 근거 절 |
|---|---|---|---|---|
| 1 | 현재 가장 중요한 Work Item은? | 예 | 계획상 `next_review`는 WS2-01이나, **실제로는 WS2·WS3가 미병합 Branch에서 이미 수행됨**. 따라서 실질적 다음 과제는 그 산출물의 반영 결정과 Workmap 정합화 | 5.1·5.3·6.2·15.2 |
| 2 | 작업 전 무엇을 읽어야 하는가? | 예 | START_HERE → AGENTS/CLAUDE → glossary → Workmap의 해당 Work Item → 관련 Contract. 그리고 미병합 Branch 확인 | 1·16 |
| 3 | 어떤 Write가 승인 대상인가? | 예 | Notion Schema·운영 Record, Drive 파일 변경, PR·Merge, Canonical 경로 수정. TEST Record 생성도 Preview+승인 | 9·8.2 |
| 4 | 설계 완료와 실제 완료를 어떻게 구분하는가? | 예 | 문서 PASS = Verification. Live 완료는 라이브 재조회로 Expected–Actual 확인. Conceptual/Logical/Physical/Live 축과 V-Model 축을 따로 본다 | 5.2·5.4·11.4 |
| 5 | 다음 안전한 작업은? | 예 | 미병합 산출물 반영 결정 → G-1·G-2 정합화 Proposal → generated 재생성 → Workmap 상태 갱신. 모두 승인 선행 | 15.2 |

**판정: 5/5 답변 가능.** 다만 아래 두 가지는 이 문서만으로는 불충분하며 원본 파일 확인이 필요하다 — 의도된 설계다(이 문서는 Navigation Manual이며 Process 상세를 복제하지 않는다).
- E2E-03의 구체적 Task 정의와 Atomic Step 대응 → `docs/process-execution-layering.md`, `contracts/process-execution-mapping.yaml`
- 각 Notion Property의 정확한 이름·타입 → `notion/schema/**` 및 라이브 Schema 재조회

---

## 18. 근거와 한계

### 18.1 참조한 주요 경로 **[모두 `origin/main` = `32d017c`에서 실재 확인]**

`START_HERE.md`, `AGENTS.md`, `CLAUDE.md`, `README.md`,
`orchestration/README.md`, `orchestration/plan/master-workmap.yaml`,
`orchestration/governance/{agent-policy,approval-gates,execution-policy,ownership-policy,runtime-policy,status-model}.yaml`,
`orchestration/generated/{current-state,ready-work}.md`,
`contracts/{conversational-intake-contract,process-execution-mapping}.yaml`,
`docs/{process-execution-layering,work-item-glossary}.md`,
`decisions/decision-log.md`, `tasks/{tap-queue,active}.md`,
`operating-model/approval-gates.md`, `variations/`, `processes/`,
`scripts/{conversational-intake.mjs,conversational-intake.test.mjs,validate_orchestration.py,render_orchestration_state.py}`,
`reports/reviews/claude/`

### 18.2 참조한 Branch·Commit

- `origin/main` `32d017c`(base), 이력 15건 확인
- 병합됨: `ci4-alpha-targeted-validation`, `ci5-e2e03-loop-engineering`, `e2e03-operational-standard-integration`
- 미병합: `e2e03-natural-language-contract`(6 commits), `codex/fieldwork-output-evidence-inventory`(1), `ci1-test-design`(1), `ci2-alignment-review`(2), `ci4-alpha-validation`(1), `setup`(9)
- 미병합 Branch는 `git show`·`git log`·`git diff`로만 조사했고 **Merge하지 않았다**

### 18.3 실제 실행한 검증

- `node scripts/conversational-intake.test.mjs` → PASS(3개 스위트, exit 0)
- 저장소 검증 로직 Node 이식 실행 → FAIL 1건(G-1)
- `git ls-files` 231건, 미병합 Branch diff stat

### 18.4 확인하지 못한 사항

- **Codex의 이번 Consensus Candidate 문서** — 독립성 규칙에 따라 조회하지 않았다 **[의도적 미확인]**
- `scripts/*.py` 원본 실행 결과 — Python 미설치(G-7). Node 이식본은 로직을 옮긴 것이므로 원본과 100% 동일하다고 보장할 수 없다 **[확인 필요]**
- Notion·Drive의 현재 라이브 상태 — 본 조사는 Repository·Git 중심이며 외부 시스템 Write·조회를 수행하지 않았다
- 미병합 Branch들의 폐기·병합 방침 **[확인 필요: GPT·사용자 결정 사항]**
- 구 게이트 체계(AG-01~35)의 공식 처분 여부 **[확인 필요]**
- 괄호 운영 메모의 현재 유효성 등 업무 사실 **[확인 필요: 담당자만 판단 가능]**

### 18.5 이 문서의 성격

Canonical이 아닌 **비교용 Candidate**다. 여기서 제안한 개선안(15.2)은 실제로 반영하지 않았으며, 이번 작업에서 변경한 파일은 이 문서 1개뿐이다. Root 지침·Canonical·generated 상태파일·README는 수정하지 않았다.
