# Repository Overdesign Audit and Lean Work Entry Review

## 1. Executive Summary

**판정: `OVERDESIGNED` (SEVERELY_OVERDESIGNED는 아님 — 정보 손실이나 차단 오류는 없으나 탐색 비용이 이미 통제 계층 자체를 병목으로 만들고 있음)**

핵심 문제는 폴더 수나 파일 수 자체가 아니라, **"현재 계획 상태"를 추적하는 서로 다른 메커니즘이 최소 4개 공존**한다는 점이다: (1) `README.md` §9.8의 수동 서술형 상태표, (2) `tasks/tap-queue.md`의 "Notion Operations Control Plane Queue" 표(스스로 "Historical Summary"라 선언했지만 여전히 실시간으로 갱신됨), (3) `orchestration/plan/master-workmap.yaml`(공식 선언된 Canonical), (4) `orchestration/generated/current-state.md`(재생성 뷰). 이 중 (1)과 (2)는 자동 동기화 장치가 없어 (3)과 어긋날 위험을 항상 안고 있다.

두 번째 핵심 문제는 **거버넌스 체계 자체가 하루 만에 통째로 교체**됐다는 것이다: `operating-model/**` + `plans/notion-control-plane-roadmap.md` + `tasks/tap-queue.md`(2026-07-23 생성)로 구성된 "CP-05 Operating Model" 체계 위에, 2026-07-24 `CP-00-O1` 작업으로 `orchestration/**`(Git-Native Orchestration) 체계가 병렬로 부트스트랩됐다. 두 체계는 서로 다른 Gate ID 스킴(`AG-01~35` vs `AG-P2/AG-P3`)을 쓰며, 이전 체계를 명시적으로 폐기·대체했다는 단일 선언이 없다(`decisions/decision-log.md`의 `DEC-ORCH-01~04`는 새 체계의 소유권 규칙만 정의하고, 이전 `operating-model/**` 문서 9종의 처분은 언급하지 않는다).

긍정적인 신호도 있다: 지난 Claude Review(`A-CP05-P0-REVIEW`) 이후 Codex는 실제로 Finding 7건 중 6건을 반영했고(`tasks/tap-queue.md`의 "CP-05-P0 Claude Finding 상태" 표), `decisions/pending-approvals.md`는 이제 스스로 "Canonical Source가 아니며 `operating-model/approval-gates.md`가 기준"이라고 명시해 동기화 책임을 규정했다(RM-04 반영). 즉 이 Repository는 과설계를 스스로 인지하고 부분적으로 고치는 능력은 있으나, 고치는 속도보다 새 계층을 추가하는 속도가 더 빠르다.

Blocking 수준의 정보 손실이나 상태 상충은 발견되지 않았다. 문제는 **탐색 비용과 유지비용**이다.

## 2. Repository Statistics

- Base Commit: `origin/main` `a50cce0f7d1467e410e85f237ebbacfb637bcd94` ("Document conversational intake transition decision", 2026-07-24)
- 전체 파일 수(git-tracked): **218**
- 전체 폴더 수(파일을 직접 포함하는 디렉터리): **44**
- 최대 Depth: **5** (예: `orchestration/runs/codex/CP-05-P3-LR/checkpoints/01-p3-wo-1.md`)
- Depth 1 최상위 폴더 수: **21** (`agents, cases, conflicts, contracts, decisions, docs, handoffs, mappings, notion, operating-model, orchestration, plans, processes, rag, reports, rules, schemas, scripts, sources, tasks, variations`)
- 문서 유형별: Markdown 177, YAML 33, JSON 5, Python 2
- 확장자 없는 파일: 0
- 빈 폴더: 조사 범위 내 발견되지 않음(모든 폴더가 최소 1개 파일 보유)
- 파일 1~2개만 가진 과도한 하위 폴더: `agents/claude`(1), `contracts`(1), `docs/logs`(1), `handoffs/notion-ai`(1), `orchestration/generated`(2), `orchestration/runs/codex/CP-05-P3-LR`(2, 하위에 `checkpoints/` 4개 추가), `rag/metadata`(1), `rules`(1), `schemas`(1), `scripts`(2), `tasks/handoffs`(1), `tasks/queues`(1) — 12곳
- 최근 활동: 조사 시점 기준 전체 커밋 이력이 2026-07-15~07-24 약 9일에 불과해 "최근 30일 수정" 기준은 사실상 전체 파일에 해당한다. 따라서 "장기 미참조" 여부는 날짜가 아니라 **참조 여부**로 판단해야 하며, 이는 5번 절에서 다룬다.
- 최상위 폴더별 파일 수(내림차순): `orchestration` 59, `reports` 49, `notion` 18, `mappings` 16, `sources` 15, `processes` 12, `operating-model` 9, `tasks` 7, `variations`·`plans`·`handoffs`·`cases` 4, `decisions` 3, `scripts`·`conflicts` 2, `schemas`·`rules`·`rag`·`docs`·`contracts`·`agents` 1
- `orchestration/` 내부 분포: `runs` 22, `work-orders` 9, `governance` 6, `schemas` 5, `handoffs` 5, `proposals` 3, `plan` 3, `approvals` 3, `generated` 2

## 3. Current Architecture Map

| 영역 | 존재 여부 | 요약 |
|---|---|---|
| `orchestration/` | 존재 | Git-Native Orchestration(2026-07-24 Bootstrap). `plan/`(GPT Canonical), `generated/`(재생성 뷰), `governance/`(정책 6종), `approvals/`(승인 패킷), `runs/`(Agent 실행이력), `handoffs/`, `proposals/`, `schemas/`, `work-orders/` |
| `tasks/` | 존재 | `tap-queue.md`(레거시 Queue, 현재는 "Historical Summary" 자기 선언), `handoffs/claude-current-handoff.md`, `queues/claude-queue.md` |
| `reports/` | 존재 | 49개 — CP-04 시대 QA 보고서, CP-05 Operating Model 보고서, 신규 Orchestration/Fast-Track 보고서, Claude Review 산출물 10종이 모두 한 폴더에 평탄하게 혼재 |
| `decisions/` | 존재 | `decision-log.md`(승인 완료 24건), `pending-approvals.md`(파생 View, Canonical 아님을 자기 선언), `conversational-intake-transition.md` |
| `plans/` | 존재 | `notion-control-plane-roadmap.md`(구 CP-05 Roadmap), `automation-expansion-roadmap.md`, `conversational-intake-roadmap.md` |
| `operating-model/` | 존재 | 9개 — 2026-07-23 CP-05-P0에서 생성, 새 `orchestration/governance/**`와 미명시적 관계 |
| `mappings/` | 존재 | 16개 — Source·Process·Notion·Task 연결 |
| `notion/` | 존재 | `model/**`(상태·증빙·승인 규칙), `schema/**`(DB·Form 구조) |
| `processes/` | 존재 | 00~11, CP-04 As-Is Process Model — 이번 조사에서 가장 안정적이고 명확한 영역 |
| `variations/` | 존재 | 4축, CP-04/V1-R2 산출물 |
| `contracts/` | 존재 | `conversational-intake-contract.yaml` 1개뿐 |
| `conflicts/` | 존재 | `unresolved.md`(구), `p3-open-conflicts.md`(신) |
| `sources/` | 존재 | `notion/**` Source Extract |
| `rag/` | 존재 | `metadata/status-evidence-metadata.md` 1개뿐 — Repository 이름이 "process-rag"인데 실제 RAG 관련 내용은 이 파일 하나 |

실제로 존재하지 않는 경로: 없음(질의된 모든 최상위 경로가 존재함).

## 4. Canonical Source Analysis

| 질문 | 답 | 근거 |
|---|---|---|
| 1. 프로젝트 전체 Canonical | `README.md` | 유일한 최상위 진입 문서이나, 자체적으로 §9.8에 상태 요약을 중복 보유 |
| 2. 현재 업무상태 Canonical | **분열됨** — 선언상 `orchestration/plan/master-workmap.yaml`(GPT 소유), 실질적으로 `tasks/tap-queue.md`와 `README.md` §9.8도 같은 정보를 별도 서술 | `orchestration/README.md`: "Canonical plan: plan/master-workmap.yaml"; 그러나 `tasks/tap-queue.md` 최상단에 "다음 READY 후보: AG-P3" 등 동일 판단이 재기술됨 |
| 3. 다음 실행 작업 Canonical | `orchestration/generated/ready-work.md`(비Canonical 선언, 재생성 전제) | 파일 자체가 "Non-canonical. Regenerate from master-workmap.yaml"이라 명시 — 이 패턴은 올바른 예시 |
| 4. 승인상태 Canonical | **분열됨** — 구 체계 `operating-model/approval-gates.md`(AG-01~35) vs 신 체계 `orchestration/governance/approval-gates.yaml` + `master-workmap.yaml.approval_gates`(AG-P2/AG-P3) | ID 스킴 자체가 달라 충돌은 없으나 "승인상태를 어디서 봐야 하는가"에 대한 단일 답이 없음 |
| 5. Process의 Canonical | `processes/00~11` | 명확, 안정적, 이번 조사 대상 중 유일하게 혼란 없음 |
| 6. Notion 설계의 Canonical | 3분할 — `notion/schema/**`(구조) + `notion/model/**`(상태·증빙 규칙) + `mappings/process-to-notion-map.yaml`(연결) | 상호 배타적이라 나쁜 중복은 아니지만, 이 세 개가 합쳐서 "Notion 설계"를 이룬다는 점을 알려주는 단일 안내가 없음 |
| 7. 실행 결과의 Canonical | **분열됨** — `orchestration/runs/<agent>/**`(공식 선언) vs `reports/cp-*.md`(같은 이벤트의 산문 보고서) | `orchestration/runs/codex/CP-00-O1/result.md`와 `reports/cp-00-o1-orchestration-control-layer.md`가 같은 실행을 두 번 서술 |
| 8. Agent R&R의 Canonical | **분열됨** — `AGENTS.md`(원본, 여전히 존재) vs `orchestration/governance/agent-policy.yaml`(신규) | 상호 참조 없음. `grep AGENTS.md` 결과 `CLAUDE.md`, 일부 오래된 `reports/`·`processes/`·`tasks/` 파일만 참조하고 신규 `orchestration/**`는 전혀 참조하지 않음 |
| 9. 동일 정보를 나타내는 파일이 여러 개인가 | **예, 다수** | 7번 절 참고 |
| 10. 서로 다른 상태를 표시하는 파일이 있는가 | **아니오(현재까지는)** | 여러 곳에 중복되지만 내용이 서로 어긋나는 사례는 발견하지 못함 — 이는 안심할 요소가 아니라 "아직 어긋나지 않았을 뿐"이라는 위험 신호로 읽어야 한다(수동 동기화 메커니즘이므로) |

## 5. Overdesign Findings (O1~O12)

| 기준 | 판정 | 근거 |
|---|---|---|
| O1 상태 중복 | **HIGH** | Work Item 상태(예: N-06 BLOCKED, AG-P3 READY)가 `master-workmap.yaml`, `orchestration/generated/current-state.md`, `tasks/tap-queue.md`, `README.md` §9.8까지 최대 4곳에 표시됨 |
| O2 수정 확산 | **HIGH** | 승인 Gate 하나가 바뀌면 위 4개 파일 중 최소 2개(tap-queue.md, README.md)는 자동 재생성 스크립트가 없어 수동 수정 필요 |
| O3 파일 역할 중복 | **HIGH** | `dependency-map.yaml` ↔ `master-workmap.yaml.dependencies`; `plan/roadmap.md` ↔ `master-workmap.yaml`(전체); `reports/cp-00-o1-*.md` ↔ `orchestration/runs/codex/CP-00-O1/result.md` |
| O4 과도한 계층 | **MEDIUM** | 최대 Depth 5(`orchestration/runs/codex/CP-05-P3-LR/checkpoints/01-p3-wo-1.md`); 단일 체크포인트 메모를 위해 5단계 탐색 필요 |
| O5 일회성 문서의 영구 구조화 | **MEDIUM** | `orchestration/runs/codex/CP-05-FT2/`(단발 Form Capability 재확인)가 `run.yaml`+`result.md`+`checkpoints.md` 3파일 구조를 그대로 사용; `orchestration/proposals/P-N06-ROLLUP-CLASSIFICATION.yaml` 단일 제안 1건에 스키마 검증되는 영구 파일 |
| O6 현재·과거 혼합 | **HIGH(가장 심각)** | `tasks/tap-queue.md`가 스스로 "Historical Summary"라 선언하면서도 2026-07-24 시점까지 계속 실시간 편집됨(최근 5개 커밋 중 3개가 이 파일을 건드림) |
| O7 상태 ID 난해성 | **HIGH** | `AG-P2, AG-P3, N-04~06, J-01, J-02, FT-01~05, CI-01~07, DEC-CP05-S1-02, RM-01~07` 등 각기 다른 네임스페이스의 ID가 파일마다 로컬 설명만 있고 통합 용어집이 없음 |
| O8 진입점 부재 | **HIGH** | README.md에 대화형 Intake 전환(4개 파일, 2026-07-24 결정) 링크가 전혀 없음 — 8절 시나리오 B 참고 |
| O9 문서 우선 업무 | **MEDIUM-HIGH** | reports 49개 + orchestration 59개 + operating-model 9개 등 계획·보고 문서가 실제 Notion Build 산출물(DB 2개, 검증 미완료 Rollup 1건)보다 압도적으로 많음 |
| O10 Agent별 중복보고 | **MEDIUM** | Codex의 `orchestration/runs/codex/*/result.md`와 `reports/cp-*.md`가 동일 실행을 서로 다른 형식으로 반복 서술 |
| O11 사용되지 않는 구조 | **MEDIUM** | `rag/`(1파일, Repository 이름의 핵심 축인데 사실상 미사용), `agents/claude/role.md`(신규 `orchestration/governance/agent-policy.yaml`가 사실상 대체했으나 폐기 선언 없음), `schemas/`(최상위, 1파일, `orchestration/schemas/`와 별개로 방치), `rules/`(1파일, 신규 체계에서 참조 없음) |
| O12 확장 전제 과다 | **MEDIUM** | `orchestration/work-orders/templates/`(build·review·ui 3종 템플릿) + `orchestration/schemas/*.json`(5개 JSON Schema)가 현재 실제 발행된 Work Order 1~2건 규모에 비해 앞서 구축됨 |

## 6. Duplicate·Stale·Unused Candidates (대표 사례 10건)

| # | 대상 | 유형 | 설명 | 분류 |
|---|---|---|---|---|
| 1 | `orchestration/plan/dependency-map.yaml` | O1/O3 | `master-workmap.yaml.dependencies`와 동일 그래프를 별도 파일로 유지, 자동 생성 아님 | MERGE_CANDIDATE |
| 2 | `orchestration/plan/roadmap.md` | O1/O3 | `master-workmap.yaml` 상태를 산문으로 재서술, "재생성 가능" 표시 없음(generated/ 파일과 달리) | MERGE_CANDIDATE 또는 GENERATED_ONLY로 전환 |
| 3 | `tasks/tap-queue.md`의 "Notion Operations Control Plane Queue"(C0~C17,X1) 표 | O1/O6 | `master-workmap.yaml` work_items를 다른 ID 스킴으로 재기술, 자기 선언("Historical")과 실제 갱신 빈도가 불일치 | ARCHIVE_CANDIDATE(신규 절만) — 상단 레거시 S0~F2/V0~V8 부분은 KEEP_HISTORY |
| 4 | `README.md` §9.8 진행상태 표 | O1 | `orchestration/generated/current-state.md`와 같은 정보를 수동 산문으로 중복 | MERGE_CANDIDATE(§9.8을 current-state.md 링크로 축약) |
| 5 | `operating-model/approval-gates.md` vs `orchestration/governance/approval-gates.yaml` | O1/O3 | 두 개의 독립된 승인 Gate 프레임워크, ID 스킴 다름, 관계 미선언 | NEEDS_CLEAR_OWNER |
| 6 | `orchestration/governance/{agent,execution,ownership,runtime,status}-policy.yaml`(5개) | O12 | 각 15~27줄, 단일 `policy.yaml`의 하위 키로 합칠 수 있는 규모 | MERGE_CANDIDATE |
| 7 | `AGENTS.md` vs `orchestration/governance/agent-policy.yaml` | O3/O8 | 원본 공통 원칙과 신규 Role 정의가 상호 참조 없음 | NEEDS_ENTRY_LINK |
| 8 | `reports/cp-00-o1-orchestration-control-layer.md` vs `orchestration/runs/codex/CP-00-O1/result.md` | O3/O10 | 동일 실행을 산문 보고서와 Run Capsule로 이중 기록 | MERGE_CANDIDATE(Run Capsule을 정본으로, 보고서는 Executive Summary만 남기거나 폐기) |
| 9 | `reports/ag-p3-conflict-summary.md`, `ag-p3-gap-summary.md`, `ag-p3-review-analysis.md`, `conflicts/p3-open-conflicts.md`, `cp-05-p3-gap-analysis.md`(5개) | O3/O9 | 동일 P3/AG-P3 이벤트의 Gap·Conflict를 5개 파일에 분산 | MERGE_CANDIDATE(하나의 `cp-05-p3-completion.md` 부속 섹션으로 통합 검토) |
| 10 | `reports/form-capability-before.md`, `form-capability-after.md`, `form-structure-diff.md`, `codex-form-capability-probe.md`, `notion-crud-capability.md`(5개) | O3/O9 | 동일 Fast-Track Form 능력 탐색을 5개 파일에 분산 | MERGE_CANDIDATE |

깨진 링크: 조사 범위 내 발견되지 않음(README·orchestration/README·핵심 문서의 상대경로 링크는 모두 유효한 파일을 가리킴). Report가 다시 계획의 Source of Truth가 되는 순환 구조: `tasks/tap-queue.md`가 `orchestration/generated/current-state.md`를 참고하라고 안내하면서도 동시에 자신도 같은 결론을 담은 표를 유지하는 것이 가장 근접한 사례다(#3).

## 7. Work Discovery Simulation

### 시나리오 A — "현재 다음 해야 할 작업이 무엇인가?"

- 첫 진입 파일: `README.md` → §10 안내 → `orchestration/generated/ready-work.md`
- 추가로 읽은 파일: `ready-work.md`("Agent READY work: None") → `orchestration/generated/current-state.md`(AG-P3=READY 확인) → `orchestration/plan/master-workmap.yaml`(AG-P3 상세, 패킷 경로 확인) → `orchestration/approvals/ag-p3-review.yaml`
- 총 파일 수: 4~5
- 상충 정보: 없음(다만 `tasks/tap-queue.md`도 같은 답을 최상단에 갖고 있어, 어느 쪽을 신뢰해야 하는지 스스로 판단해야 함)
- 불필요하게 읽은 파일: 만약 `tasks/tap-queue.md`부터 읽었다면 93줄짜리 표 전체를 훑어야 같은 결론에 도달함
- 더 단순한 대안: 진입점 문서 1개가 "지금 READY 작업"을 `ready-work.md` 링크 하나로 바로 안내하면 2개 파일(진입점 + ready-work.md)로 축소 가능

### 시나리오 B — "대화형 Intake 구조로 전환하려면 무엇을 수정해야 하는가?"

- 첫 진입 파일: `README.md` — **탐색 실패**. §9.9 관련 설계문서 목록에 대화형 Intake 관련 파일이 전혀 링크되어 있지 않음
- 실제로는 저장소를 "conversational" 또는 "대화형"으로 검색해야 발견 가능: `decisions/conversational-intake-transition.md` → `contracts/conversational-intake-contract.yaml`, `plans/conversational-intake-roadmap.md`, `reports/conversational-intake-transition-impact.md`
- 총 파일 수: 4(발견 후) + README 탐색 실패 비용
- 상충 정보: `decisions/conversational-intake-transition.md`는 "현재 계획 상태 Source of Truth = `orchestration/plan/master-workmap.yaml`"이라 명시하지만, 실제 `master-workmap.yaml`에는 **CI-01~07 Work Item이 전혀 등록되어 있지 않음** — 즉 "결정은 났으나 아직 Canonical 실행계획에 반영되지 않은 상태"라는 사실 자체가 문서 간 교차 확인 없이는 드러나지 않음
- 더 단순한 대안: README §9.9(또는 새 진입점)에 "현재 방향 전환" 섹션을 두어 대화형 Intake 4개 파일을 즉시 안내

### 시나리오 C — "Notion 업무요청 DB의 현재 검증상태는 무엇인가?"

- 첫 진입 파일: `README.md` §9.8 → `reports/cp-05-s1-r1-skeleton-stabilization.md`
- 추가로 읽은 파일: `orchestration/generated/current-state.md`(N-05=VERIFIED, N-06=BLOCKED) → `orchestration/plan/master-workmap.yaml`(N-06의 `verified_subtests`, `remaining_test` 상세 필드) → `reports/cp-05-p3-validation.md`(N-06 Build-Test-Contract 근거) → `notion/schema/support-request-db.md`/`support-task-db.md`(구조 자체)
- 총 파일 수: 5~6, 두 개의 독립 체계(구 CP-05-P3 보고서 계열과 신 orchestration 계열)를 넘나들어야 완전한 답이 나옴
- 더 단순한 대안: N-06 하나의 상태를 단일 파일(`master-workmap.yaml`)에서 상세 필드까지 완결적으로 제공하고, 나머지는 참고 링크로만 연결

### 시나리오 D — "새 Codex TAP을 실행하려면 어떤 제약을 따라야 하는가?"

- 첫 진입 파일: `AGENTS.md`(일반 원칙) 또는 `orchestration/README.md`
- 실제로는 다음을 모두 읽어야 완전한 제약을 파악: `orchestration/governance/agent-policy.yaml`, `execution-policy.yaml`, `ownership-policy.yaml`, `runtime-policy.yaml`, `status-model.yaml`(5개 별도 파일) + `orchestration/work-orders/templates/build-work-order.yaml` + `orchestration/schemas/work-order.schema.json`
- 총 파일 수: 7~8(AGENTS.md 포함 시 8~9)
- 상충 정보: 없음, 그러나 `AGENTS.md`와 `orchestration/governance/agent-policy.yaml` 중 어느 것이 우선하는지 명시가 없음
- 더 단순한 대안: 5개 governance YAML을 하나의 `orchestration/governance/policy.yaml`로 통합하고 `AGENTS.md`와의 관계를 한 줄로 명시하면 2개 파일로 축소 가능

## 8. Entry Point Necessity

**필요하다 — 위 4개 시나리오 모두 최소 4개, 최대 9개 파일을 열어야 답이 나오며, 이는 원칙 E(5분 내 답변)를 이미 위반하고 있다.**

추천 이름: **`START_HERE.md`** (Repository Root)

이유: `README.md`는 이미 292줄로 프로젝트 소개·업무지도·Notion 설계 서술까지 겸하는 "설명용 진입점"으로 굳어져 있어 이를 더 무겁게 만드는 대신, Agent 작업 시작 전용의 짧고 명령형인 별도 문서가 필요하다. `WORKMAP.md`나 `CURRENT.md`는 이미 `orchestration/plan/master-workmap.yaml`, `orchestration/generated/current-state.md`와 이름이 겹쳐 혼동을 유발할 수 있어 제외한다. `orchestration/START_HERE.md`보다 Repository Root가 낫다 — Agent가 `orchestration/`의 존재 자체를 모를 수 있기 때문이다.

## 9. Lean Structure Options

### 안 A — 현행 유지 + Entry Point만 추가

- 장점: 변경 비용 최소, 정보 손실 위험 0, 즉시 적용 가능
- 단점: O1(상태 중복)·O2(수정 확산)의 근본 원인을 건드리지 않음 — 진입점이 가리키는 대상 자체가 여전히 4곳에 분산된 상태
- 적합 조건: 지금 당장 급한 탐색 고통만 줄이고 싶을 때, AG-P3 승인 등 진행 중인 작업이 안정화되기 전

### 안 B — Canonical 최소화 + History Archive

- 예상 구조: Entry Point 1개 + Canonical Workmap 1개(`orchestration/plan/master-workmap.yaml` 유지) + `operating-model/**`를 신규 `orchestration/governance/**`와 명시적으로 통합/참조 정리 + `decisions/`(Current Decisions만) + `processes/`·`variations/`(불변) + `reports/`·`orchestration/runs/`는 "현재 열린 Work Item이 참조하는 것만 Active, 나머지는 History"로 재분류(이동은 하지 않고 Front-matter 상태 태그만 부여)
- 장점: 중복의 근본 원인(4중 상태 추적) 해소, 정보 손실 없음(파일 삭제·이동 없이 상태 태그로만 구분), 유지비용 크게 감소
- 단점: 변경 비용 중간(9개 operating-model 문서 + 49개 reports 문서 재분류 필요), 실행에 1~2 Work Order 소요
- 적합 조건: **현재 프로젝트에 가장 적합** — 진행 중인 작업(N-06 검증, AG-P3 승인 대기)을 막지 않으면서 구조적 부채를 줄일 수 있음

### 안 C — 실행 중심 초경량 구조

- 예상 구조: `START_HERE.md` + `workmap.yaml` + `work-orders/` + `processes/` + `decisions/` + `archive/`
- 장점: 가장 단순, 신규 참여자 학습곡선 최소
- 단점: 218개 파일·다수의 상대경로 링크를 대규모로 재배치해야 함(REQUIRES_MIGRATION_PLAN 수준), AG-P3 승인 대기·N-06 검증 등 진행 중인 Gate가 있는 시점에 구조 개편을 하면 어떤 파일이 최신인지 오히려 더 혼란스러워질 위험
- 적합 조건: 현재 진행 중인 Pilot이 완전히 종료되고 다음 큰 Phase(CP-06 이상) 시작 전의 회고 시점

### 최종 추천

**안 B, 단계적 적용.** 큰 구조 개편(안 C)보다 먼저 SAFE_NOW 항목(Entry Point, ID 용어집, Historical 표시)을 적용하고, 그 다음에 SAFE_AFTER_BACKUP 항목(중복 보고서 통합, operating-model↔orchestration governance 명시적 연결)을 별도 Work Order로 진행할 것을 권고한다.

## 10. Minimum Required Documents

| 문서 | 별도 파일 필수? | Workmap 필드로 대체 가능? | 자동 생성이어야 하는가? | 현재 실행에 실제 사용되는가? | 과거 이력 이동 가능? |
|---|---|---|---|---|---|
| Entry Point(`START_HERE.md`) | 예 | 아니오 | 아니오(수동, 단 최소 갱신) | (신규) | - |
| Canonical Workmap(`master-workmap.yaml`) | 예 | - | 아니오(GPT 수동 소유) | 예 | - |
| `dependency-map.yaml` | **아니오** | 예 — `master-workmap.yaml.dependencies`로 이미 존재 | - | 부분적(중복) | 통합 후 제거 검토 |
| `orchestration/plan/roadmap.md` | **아니오** | 예 — `current-state.md`가 이미 이 역할 수행 가능 | 예(가능하다면) | 부분적(중복) | 통합 검토 |
| Agent Execution Policy | 예, 그러나 **1개로 통합** | 5개 governance YAML을 1개로 병합 가능 | 아니오 | 예 | - |
| Decision Log / Current Decisions | 예 | 아니오 | 아니오 | 예 | - |
| Process Index(`processes/**`) | 예 | 아니오 | 아니오 | 예 | - |
| Notion/Data Contract | 예(3분할 유지 무방) | 아니오 | 아니오 | 예 | - |
| Active Work Order | 예(orchestration/work-orders) | 아니오 | 아니오 | 예 | - |
| Generated Current State/Ready Work | 조건부, 유지 권장 | - | 예(이미 그렇게 선언됨) | 예 | - |
| Approval Packet(`orchestration/approvals/**`) | 예 | 아니오 | 아니오 | 예 | 완료 후 History |
| TAP Queue(`tasks/tap-queue.md`) | 조건부 — **레거시 S0~V8 부분만 History로 동결, 신규 C0~X1 부분은 폐기하고 master-workmap.yaml만 참조** | 신규 부분은 대체 가능 | - | 부분적 | 레거시 부분은 즉시 History |
| Handoff(`orchestration/handoffs/**`) | 예 | 아니오 | 아니오 | 예 | 완료 후 History |
| Proposal(`orchestration/proposals/**`) | 조건부(건수 적을 때는 유지 가능) | - | - | 예(1건) | - |

## 11. Lightweight Start/Finish Checklist

### 작업 시작 체크(7개)

1. 최신 `origin/main` 확인(`git fetch`)
2. `START_HERE.md`(신규) 또는 `orchestration/generated/ready-work.md` 확인
3. 대상 Work Item의 Gate·선행조건이 충족됐는지 `master-workmap.yaml`에서 확인
4. 수정 허용 경로(`allowed_paths`)와 금지 경로(`forbidden_paths`) 확인
5. Source of Truth 파일(해당 Work Item의 `source_of_truth` 필드) 확인
6. 동일 항목이 이미 다른 Agent Run으로 진행 중인지 `orchestration/runs/`에서 확인
7. Governance(commit/runtime 제한) 확인

### 작업 중 체크(7개)

1. Scope가 Work Order 범위를 벗어나지 않는지
2. 실제 Notion/외부 시스템 변경이 발생하는지(발생 시 승인 필요 여부 확인)
3. Human Approval이 필요한 항목인지
4. `UNKNOWN`을 임의로 확정하고 있지 않은지
5. 기존 Decision Log와 충돌하지 않는지
6. 30분 Checkpoint 기록
7. Commit 수가 Work Order당 최대 3개를 넘지 않는지

### 작업 종료 체크(8개)

1. 결과 검증(Validation 기준 충족 확인)
2. Canonical 상태(Workmap) 반영 필요 여부 — **직접 수정 금지, Proposal로 제출**
3. Run Capsule·Handoff 기록
4. 다음 Owner 명시
5. 다음 Action·Blocker 명시
6. Commit·Push
7. Working Tree clean 확인
8. 민감정보 미포함 확인

## 12. Conversational Intake Impact

- 새 방향 반영을 위한 문서 추가는 **과도하지 않다** — Contract(1) + Roadmap(1) + Decision(1) + Impact Report(1) 총 4개로, 이전 CP-05 Operating Model 도입 때(9개 문서)에 비해 상당히 절제되어 있다.
- 다만 8절 시나리오 B에서 확인했듯 **발견성이 0에 가깝다** — README에 링크가 전혀 없다.
- Workmap에 포함할 정보(CI-01~07 Work Item 상태, Gate)와 별도 Contract에 둘 정보(입력 필드 규격)의 구분은 이미 합리적으로 되어 있다 — `contracts/conversational-intake-contract.yaml`은 순수 데이터 계약이고 실행 순서·상태는 `plans/conversational-intake-roadmap.md`와 (예정된) `master-workmap.yaml` 몫이다.
- **CI-01~07 7단계는 과도한 분할이 아니다.** 각 단계가 서로 다른 산출물(입력규격 확정 / DB 계약 / Parser / 자동기록 / Skill E2E / Slack Pilot / 운영적용)을 갖고 있어 인위적 세분화로 보이지 않는다. 다만 CI-05·CI-06·CI-07은 승인 전 실행 불가 항목이 많아, 실제로는 CI-01~02(계약 확정) → CI-03~04(구현) → CI-05~07(검증·확장)의 3단계로 보고하면 진행상황 파악이 더 쉬울 수 있다:
  - **CI-A**: CI-01+CI-02 (Intake Contract + DB Mapping 확정)
  - **CI-B**: CI-03+CI-04 (Conversational Write Prototype)
  - **CI-C**: CI-05+CI-06+CI-07 (Skill E2E → Slack Pilot → 운영 적용)
  이는 보고·추적 단위 제안이며, **실제 `plans/conversational-intake-roadmap.md`는 수정하지 않았다.**
- Slack 연계 전 실제 필요한 최소 Build: 이미 `plans/conversational-intake-roadmap.md` §7이 "CI-06 전 필수 Dependency 아님"으로 명확히 유예하고 있어 추가 지적 사항 없음.
- 기존 P3·Fast Track 결과 중 재사용 대상: `지원팀 업무요청`/`지원팀 Task` DB, Request→Task Relation, 상태 모델, P3 Process→Notion Mapping — 이미 `decisions/conversational-intake-transition.md`의 "재사용 자산" 절에 명확히 정리되어 있다(좋은 사례).

## 13. Prioritized Recommendations (최대 10개)

### 즉시 적용(SAFE_NOW, 3개)

1. **Repository Root에 `START_HERE.md` 신설** — Canonical 파일을 가리키기만 하고 복제하지 않음. 아래 13-A 초안 참고.
2. **`tasks/tap-queue.md`를 명확히 동결** — 레거시 S0~V8 표는 `KEEP_HISTORY`로 유지하되 파일 최상단에 "본 파일은 더 이상 갱신되지 않으며 현재 상태는 `orchestration/plan/master-workmap.yaml`을 참조" 배너 추가, 신규 "Notion Operations Control Plane Queue"(C0~X1) 절 갱신 중단.
3. **ID 용어집 1개 추가**(START_HERE.md 내 포함) — `AG-P2/P3, N-04~06, J-01/J-02, FT-01~05, CI-01~07` 등 핵심 ID를 표로 한글 설명과 함께 나열.

### 단기 적용(SAFE_AFTER_BACKUP, 3개)

4. `orchestration/plan/dependency-map.yaml`을 `master-workmap.yaml.dependencies`의 파생 파일로 명시하거나 제거하고, `scripts/render_orchestration_state.py`에 렌더링 추가.
5. `orchestration/plan/roadmap.md`에 "Non-canonical, regenerate from master-workmap.yaml" 배너 추가(내용 삭제는 아님).
6. `operating-model/approval-gates.md`와 `orchestration/governance/approval-gates.yaml` 사이에 상호 참조 문장 추가("구 AG-01~35는 CP-05 Operating Model 체계, 신규 AG-P2/P3는 Git-Native Orchestration 체계이며 후자가 현재 실행 통제 기준").

### 보류·장기(4개)

7. `reports/`의 P3/AG-P3 관련 5개 문서(발견 #9) 및 Form Capability 관련 5개 문서(발견 #10)를 각각 1개로 통합 — Pilot 종료 후 회고 시점에 실행.
8. 5개 `orchestration/governance/*.yaml`을 1개 `policy.yaml`로 통합 — 다음 Governance 개정 TAP에서 함께 처리.
9. `AGENTS.md`와 `orchestration/governance/agent-policy.yaml`의 관계 명시 — 신규 Agent 온보딩 자료 개편 시 함께 처리.
10. `rag/`, `agents/`, 최상위 `schemas/`, `rules/`의 실사용 여부 재확인 후 Archive 여부 결정 — CP-06(Automation) 착수 전 재점검.

## 14. Risks and Migration Notes

| 항목 | 위험 분류 |
|---|---|
| Entry Point 추가 | SAFE_NOW |
| ID 용어집 추가 | SAFE_NOW |
| tap-queue.md 동결 배너 | SAFE_NOW |
| dependency-map.yaml/roadmap.md 배너 추가 | SAFE_NOW |
| operating-model↔orchestration governance 상호참조 문장 추가 | SAFE_NOW |
| P3/Form Capability 보고서 통합 | SAFE_AFTER_BACKUP — 기존 파일을 참조하는 Handoff·Run Capsule이 있는지 먼저 확인 필요 |
| governance YAML 5→1 통합 | SAFE_AFTER_BACKUP — `orchestration/schemas/*.json` 스키마 검증 로직이 개별 파일 경로를 참조하는지 확인 필요 |
| `tasks/tap-queue.md` 완전 폐기 | REQUIRES_MIGRATION_PLAN — 레거시 S0~F2 이력 손실 방지를 위해 삭제가 아닌 Archive로만 진행 |
| `orchestration/` 구조 축소·이름 변경 | REQUIRES_MIGRATION_PLAN — Work Order Schema·validate_orchestration.py가 정확한 경로에 의존 |
| README.md §9.8 전면 재작성 | SAFE_AFTER_BACKUP — 외부(GitHub 열람자)가 참고하는 문서이므로 급격한 축소보다 링크 치환 우선 |
| 안 C(초경량 구조) 전면 적용 | **NOT_RECOMMENDED 지금 시점** — N-06 검증·AG-P3 승인이 진행 중인 상태에서 구조 개편은 오히려 혼란 가중 |

## Appendix A — `START_HERE.md` Draft (Entry Point, 초안, 실제 생성 아님)

```markdown
# START HERE — Agent Entry Point

> 이 문서는 Canonical 파일을 복제하지 않고 안내만 한다. 최신 상태는 항상 아래 링크된 파일에서 확인한다.

## 1. 프로젝트 목표
세무서·은행 행정업무를 Process Model로 구조화하고, RAG 검색·Notion 운영·승인 기반 Agent 실행으로 연결한다.

## 2. 현재 운영 방향
Primary Intake는 Form에서 대화형(자연어) 입력으로 전환 중이다. → `decisions/conversational-intake-transition.md`

## 3. 현재 단계
`CP-05_NOTION_CONTROL_PLANE` — Notion Skeleton 구축 및 검증 단계. → `orchestration/plan/master-workmap.yaml`(`current_phase`)

## 4. 지금 READY 작업
→ `orchestration/generated/ready-work.md` (재생성 가능, 여기가 정답)

## 5. 현재 Blocker
→ `orchestration/generated/current-state.md`의 `Blocking Reason` 열

## 6. 반드시 읽을 Canonical 파일
| 영역 | 파일 |
|---|---|
| 계획 상태 | `orchestration/plan/master-workmap.yaml` |
| Process 원본 | `processes/00~11` |
| Variation | `variations/**` |
| Notion 설계 | `notion/schema/**`, `notion/model/**`, `mappings/process-to-notion-map.yaml` |
| 승인 결정 | `decisions/decision-log.md` |
| Agent 규칙 | `AGENTS.md` + `orchestration/governance/*.yaml` |

## 7. 수정 가능한 경로
Work Order의 `allowed_paths`를 따른다. 공통적으로 `orchestration/runs/<agent>/**`, `orchestration/handoffs/**`, `orchestration/proposals/**`는 항상 허용.

## 8. 수정 금지 경로
`orchestration/plan/**`, `orchestration/governance/**`, `orchestration/work-orders/**`, `orchestration/approvals/**` — GPT 전용. 변경이 필요하면 `orchestration/proposals/**`에 제안만 제출한다.

## 9. 완료 후 기록 위치
자신의 `orchestration/runs/<agent>/<work-item-id>/` + `orchestration/handoffs/**`. Canonical Workmap은 직접 수정하지 않는다.

## 10. Agent별 역할
GPT=Plan/Gate Owner, Codex=Builder, Claude=Independent Reviewer, User(정상준)=Process Owner·최종 승인자.

## 11. 주요 ID 한글 설명
| ID | 의미 |
|---|---|
| AG-P2 / AG-P3 | Notion Control Plane P2/P3 단계 GPT·사용자 승인 Gate |
| N-04~N-06 | Notion Form/DB 실사용자 UI 검증 단계 |
| J-01 / J-02 | Join Gate(여러 선행조건이 모두 충족돼야 통과) |
| FT-01~05 | Fast Track(Form 능력 우회 검증) 단계 |
| CI-01~07 | 대화형 Intake 전환 단계 |
| RM-xx / SIC-xx / GAP-xx / INT-xx | Claude Review Finding ID |

## 12. 과거 문서 vs 현재 문서
`tasks/tap-queue.md`는 Historical Summary다(현재 갱신 대상 아님). 현재 상태는 항상 `orchestration/generated/current-state.md`를 우선한다.

## 13. 다음 작업 시작 체크리스트
본 문서 §11(Repository Lean Review, 12절) 참고.

## 14. 최근 방향 전환 결정
- 2026-07-24: Primary Intake를 Form → 대화형 전환(`DEC-CP05-CI-01`)
- 2026-07-24: Repository를 Git-Native Orchestration 체계로 전환(`DEC-ORCH-01~04`)

## 15. 5분 Quick Start
1) `ready-work.md` 확인 → 2) 대상 Work Item을 `master-workmap.yaml`에서 조회 → 3) Gate·경로 제약 확인 → 4) Work Order 없으면 정지.
```

## 15. Proposed Next Work Order

**제안 TAP명(가칭): `CP-00-O4-LEAN-ENTRY`**

- 목적: 이번 Review의 SAFE_NOW 3건(§13) 적용
- Owner 후보: Codex(Builder) — Claude는 독립 Reviewer로 결과만 검증
- Input: 본 Review Report 3종 산출물
- Output: `START_HERE.md`(신규), `tasks/tap-queue.md` 상단 배너, `orchestration/plan/roadmap.md`/`dependency-map.yaml` 배너
- 승인 필요 여부: 실제 Repository 구조 변경은 없고 안내문·신규 진입 문서 추가뿐이므로 낮은 위험 — 그러나 GPT·정상준의 최종 확인 권장
- 명시적 제외: SAFE_AFTER_BACKUP 이후 항목(§13 4~10번)은 별도 TAP으로 분리 실행
