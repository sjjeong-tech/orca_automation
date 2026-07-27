# Repository Orientation Manual Candidate — Codex

> 상태: GPT 비교용 독립 Candidate. Canonical이 아니다.
>
> Snapshot: 2026-07-27, `origin/main` `32d017ceee551f370a7f25dcf52e6a77c7d45b38`
>
> 표기: `OBSERVED`는 Repository·Git에서 직접 확인, `INFERRED`는 복수 근거의 해석, `PROPOSED`는 안내 개선 제안이다.

## 1. 5분 시작 안내

새 세션은 아래 순서를 바꾸지 않는다.

1. **지침 확인**
   - `AGENTS.md`
   - 작업이 Claude·Notion MCP와 관련되면 `CLAUDE.md`
   - 사용자 또는 GPT가 발행한 현재 TAP·Work Order
2. **Git 사실 확인**
   - 현재 Branch, `HEAD`, `origin/main`, Working Tree
   - 현재 Branch가 올바른 Base에서 갈라졌는지
   - 같은 Work Item의 미병합 Agent Branch가 이미 있는지
3. **계획 상태 확인**
   - `orchestration/plan/master-workmap.yaml`
   - `orchestration/generated/current-state.md`
   - `orchestration/generated/ready-work.md`
   - generated 파일은 요약일 뿐 Canonical이 아님을 유지
4. **작업 의미 확인**
   - Work Item의 `source_of_truth`, `required_inputs`, `allowed_paths`, `forbidden_paths`
   - 관련 Process·Contract·Mapping·Test Evidence
5. **실행 전 Gate 확인**
   - 외부 Write, 운영 Record, Schema, 승인, 사람 판단이 있으면 Preview 후 정지
   - Workmap과 실제 Git Branch가 다르면 새 구현을 시작하지 말고 먼저 상태 정합화

PowerShell 기준 최소 명령:

```powershell
git fetch --all --prune
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
Get-Content -Encoding utf8 orchestration/generated/current-state.md
Get-Content -Encoding utf8 orchestration/generated/ready-work.md
```

POSIX shell에서는 마지막 두 줄을 `sed -n '1,220p' <path>`로 대체할 수 있다.

`OBSERVED` — 이 Snapshot에서 `origin/main`의 다음 핵심 Work Item은 `WS2-01 (E2E-03 Natural Language Contract Core)`다. 그러나 `origin/agent/claude/e2e03-natural-language-contract`에는 같은 main Base 이후 6개 미병합 Commit이 있어 WS2·WS3 작업을 새로 시작하면 중복될 위험이 있다.

`PROPOSED` — 신규 세션의 첫 실행은 WS2를 다시 작성하는 일이 아니라, 해당 미병합 Branch의 통합 여부와 Workmap 정합화 권한을 GPT·사용자에게 확인하는 일이어야 한다.

## 2. Repository의 목적과 범위

`OBSERVED` — Repository의 목적은 지원팀 행정업무를 Process 단위로 구조화하고, Notion Request·Task 운영 Record, Evidence, RAG 검색 및 향후 승인 기반 Agent 실행을 연결하는 것이다. 현재 Primary Intake 방향은 Form이 아니라 대화형 입력이다.

포함 범위:

- 세무서·홈택스·은행·문구점 관련 지원팀 행정업무
- As-Is Process·Rule·Variation·Exception
- Process와 Operational Task, 실행 Instance의 계층
- Notion `지원팀 업무요청`·`지원팀 Task` Mapping
- 상태, Actor, Next Action, Blocker, 완료조건, Evidence, Human Approval
- 자연어 요청의 Parse → 누락 질문 → Preview → 승인 → Commit → Verify
- Google Drive의 실제 작업파일과 Git의 비민감 Evidence 메타데이터 연결

현재 제외 또는 미완료 범위:

- 실제 운영 Record의 무승인 자동 Write
- Slack 운영 Adapter
- 다중 Process 자동 확장
- 완전한 RAG Index·Vector DB
- Process 11의 확정 완료 Rule
- 미확정 Variation·기관별 예외의 자동 판단
- Form을 반드시 거치는 Primary Intake

`OBSERVED` — `processes/`에는 12개 Process가 있으며 통합 QA는 `PASS WITH NON-BLOCKING GAPS`다. Process 11은 Coverage 0/7의 `DRAFT`다.

`OBSERVED` — E2E-03 고유번호증 신청·수령은 Atomic Step 16개가 `P03-T01`~`P03-T06` Operational Task 6개와 연결되었고, TEST Request·Task 기반 Physical Validation까지 존재한다.

`INFERRED` — Repository는 전체 지원업무 자동화 완료 단계가 아니라, E2E-03의 검증된 실행표준을 다른 Interface와 실제 사례로 확장하기 직전 단계다.

## 3. Source of Truth 계층

우선순위는 “문서 종류의 권위”와 “현재 외부 상태”를 함께 본다.

| 계층 | 역할 | 사용 원칙 |
|---|---|---|
| `AGENTS.md` | 모든 Agent의 공통 안전·근거 규칙 | 하위 작업보다 우선한다 |
| `CLAUDE.md` | Claude·Notion MCP 추가 규칙 | `AGENTS.md`와 함께 적용한다 |
| 현재 사용자 TAP·GPT Work Order | 이번 실행의 목적·허용·금지·Gate | 범위를 넓히지 않는다 |
| 실제 Git 상태 | Base, Branch, Commit, 변경 파일의 사실 | 대화에 적힌 SHA보다 재조회 결과 우선 |
| `orchestration/plan/master-workmap.yaml` | GPT 소유 Canonical Plan | Agent가 임의 수정하지 않는다 |
| Process·Contract Canonical | 업무 의미와 실행 계약 | Process와 Instance를 구분한다 |
| 실제 Notion·Drive 재조회 | 현재 Physical·Live 상태 | Write 전 반드시 대상과 이전 값을 재확인 |
| Test Report | 특정 Commit·환경에서의 검증 결과 | 현재 상태와 동일하다고 자동 가정하지 않는다 |
| Evidence | 사례·산출물·관찰 근거 | 한 사례로 공통 Rule을 확정하지 않는다 |
| `current-state.md`, `ready-work.md` | 사람이 읽는 generated 요약 | Canonical이 아니며 원본과 교차검증 |
| TAP Queue·대화 기록 | 실행 이력·힌트 | 현재 상태의 단독 Source로 쓰지 않는다 |

### 주요 Canonical·근거 위치

- Process Definition: `processes/*.md`
- Variation: `variations/*.md`
- 대화형 Intake Contract: `contracts/conversational-intake-contract.yaml`
- E2E-03 실행 Mapping: `contracts/process-execution-mapping.yaml`
- Status·Evidence·Approval: `notion/model/*.md`
- Process→Notion Mapping: `mappings/*.md`, `mappings/*.yaml`
- Notion Physical Schema 기록: `notion/schema/*.md`
- 검증: `reports/`, `reports/reviews/`, `reports/alpha-loop/`
- Agent 실행 이력: `orchestration/runs/`, `orchestration/handoffs/`

`OBSERVED` — `master-workmap.yaml`은 확장자가 YAML이지만 현재 내용은 JSON-compatible YAML이다. `scripts/validate_orchestration.py`와 Renderer도 JSON으로 읽는다.

`OBSERVED` — 현재 `current-state.md`와 `ready-work.md`는 `scripts/render_orchestration_state.py`가 생성할 바이트 결과와 일치하지 않는다. 따라서 generated 파일을 무심코 재생성하면 사람이 보강한 요약이 사라질 수 있다.

## 4. Repository 지도

| 경로 | 역할 | 주의 |
|---|---|---|
| `AGENTS.md` | 공통 Agent 지침 | 사실/추정, 민감정보, 단일 Writer |
| `CLAUDE.md` | Claude·Notion MCP 보충 지침 | 외부 Write 전 승인·재조회 |
| `START_HERE.md` | 간단한 진입점 | 상태 복제본이므로 Workmap과 대조 |
| `processes/` | Process Definition 12개 | Atomic Task와 상태 근거 |
| `variations/` | 조합·GP·계좌·기관 Variation | `PROVISIONAL`, `UNKNOWN`, `CASE_ONLY` 유지 |
| `sources/notion/` | Source Extract·Index | 공식 Source 추적 |
| `contracts/` | Intake·Process 실행 계약 | JSON-compatible YAML |
| `notion/model/` | 상태·Evidence·Approval 논리 모델 | 실제 Schema 옵션과 다를 수 있음 |
| `notion/schema/` | Request·Task 등 Physical Schema 기록 | 문서가 현재 DB를 보장하지 않음 |
| `mappings/` | Process·Property·Status·Evidence 연결 | P3는 AG-P3 승인 대기 |
| `templates/` | Request 실행 본문 템플릿 | Property 대체물이 아님 |
| `scripts/` | Intake 구현·테스트·Orchestration 도구 | Python Runtime 유무 확인 |
| `reports/` | 실행·QA·Review 결과 | Snapshot Evidence, Canonical 상태 아님 |
| `reports/alpha-loop/` | CI5 E2E-03 Loop 검증 | main에 병합됨 |
| `reports/reviews/claude/` | 독립 검토·실행표준 | merged/unmerged 구분 필수 |
| `orchestration/plan/` | GPT 소유 Plan | Agent 직접 수정 금지 |
| `orchestration/governance/` | Ownership·Execution·Runtime 규칙 | Plan과 상태 충돌 여부 확인 |
| `orchestration/generated/` | 사람이 읽는 요약 | 재생성 가능, Source of Truth 아님 |
| `orchestration/work-orders/` | GPT 발행 Work Order | 현재 파일은 초기·P3 Work Order 중심 |
| `orchestration/runs/` | Agent 실행 상태 | Plan 상태와 분리 |
| `orchestration/handoffs/` | 다음 Owner 전달 | 승인 자체가 아님 |
| `orchestration/proposals/` | Agent의 Plan 변경 제안 | GPT 검토 전 미반영 |
| `conflicts/` | 미해결 충돌·Gap | 임의 해소 금지 |
| `cases/` | 사례 Evidence | 공통 Rule로 자동 승격 금지 |
| `rag/` | 향후 검색 Metadata | Index 구현 완료를 뜻하지 않음 |

`OBSERVED` — main에는 231개 tracked 파일이 있다. `orchestration/` 64개, `reports/` 52개로 상태·실행 근거가 분산되어 있다.

`OBSERVED` — `.gitignore`의 `evidence/` 패턴은 `reports/evidence/**`도 무시한다. 승인된 Evidence를 추가할 때는 정확한 파일만 `git add -f -- <paths>`로 추가하고 staged 경로를 다시 확인해야 한다.

## 5. 현재 Workstream과 완료 수준

### 5.1 Conceptual / Logical / Physical / Live

| 수준 | 현재 상태 | 근거 |
|---|---|---|
| Conceptual | As-Is Process 12개와 Variation 모델 존재; Non-blocking Gap 유지 | `reports/cp-04-completion.md`, `reports/process-integration-qa.md` |
| Logical | P2 상태·Evidence·Human Approval, P3 Process→Notion Mapping 존재 | `notion/model/`, `mappings/`, P2·P3 보고서 |
| Physical | Request·Task DB Skeleton, E2E-03 Schema Alpha, Relation·Rollup 검증 존재 | CI1·CI4·N-06 보고 |
| Live(TEST) | 자연어 TEST Transaction, CI4 Alpha, CI5 Loop, 사용자 CI6 결과가 기록됨 | CI1·CI4·CI5·WS1 보고 |
| Live(운영) | 완료로 확인할 근거 없음 | CI-09가 승인·검증 전 실행 대기 |

### 5.2 Unit / Integration / System / Acceptance

| Test 층 | 확인된 범위 | 상태 |
|---|---|---|
| Unit | Parser, 누락질문, 승인 Gate, 중복, FUND 0/복수 차단, E2E Mapping | PASS |
| Integration | FUND→Request→Task, Relation, 상태, 부분 실패 재실행 | PASS(TEST 범위) |
| System | CI4 TC-A01~A07, CI5 17 Snapshot 연속 Loop | PASS_WITH_NONBLOCKING_GAPS |
| Acceptance | CI-05 사용자 Pilot, N-06 UI 확인, CI6 CASE 결과 | TEST Acceptance 완료; 실제 운영 Acceptance 미완료 |

### 5.3 현재 Plan 상태

`OBSERVED` — `master-workmap.yaml`은 Work Item 35개, Dependency 46개, Join Gate 2개, Approval Gate 2개를 가진다.

- `APPROVED`: 21
- `READY`: 3 (`AG-P3`, `CI-09`, `WS2-01`)
- `APPROVAL_REQUIRED`: 1 (`CP-05-P3`)
- `PLANNED`: 2
- `BLOCKED`: 5
- `SUPERSEDED`: 3

다만 실행 가능성은 Status 문자열만으로 판단하지 않는다.

- `AG-P3`: 사람 승인 Work Item
- `CI-09`: Status는 READY지만 독립 검증과 사용자 승인 전 실행 금지
- `WS2-01`: main 기준 다음 작성 Work Item이나 미병합 결과가 이미 존재

`OBSERVED` — WS1-01은 `PASS_OPERATIONAL_STANDARD_DRAFT`로 완료됐고 main에 병합됐다.

`OBSERVED` — CP-05-P3 실행은 완료됐지만 Plan 상태는 `APPROVAL_REQUIRED`; AG-P3는 아직 READY다.

`OBSERVED` — 실제 운영 사례 Pilot CI-09와 Slack CI-06, 다중 Interface Agent WS4-01은 완료되지 않았다.

## 6. 주요 Branch·Commit 지도

Snapshot 기준이며 작업 전 다시 Fetch한다. 아래 SHA는 Git에서 직접 확인했다.

### main에 반영됨

| Commit | 역할 |
|---|---|
| `32d017ce` | WS1 완료 반영, WS2-01 READY 전환; 현재 main HEAD |
| `6981cfc2` | E2E-03 실행표준 Claude PR Merge |
| `2879e10e` | E2E-03 Operational Standard Draft |
| `0c93052c` | CI4~CI6 이후 Workmap 방향 |
| `86d76794` | CI5 Loop Engineering PR Merge |
| `21f4d7bc`, `d5327bed` | CI5 개선·Baseline 두 Commit |
| `ee31219a` | CI4 Claude Validation PR Merge |
| `9b92499f` | CI4 독립 검증 |
| `ea64dc4a` | CI4 Schema Alpha 실행 |

### main에 미반영

| Branch | Base / Head | 관찰된 역할 | 위험 |
|---|---|---|---|
| `origin/agent/claude/e2e03-natural-language-contract` | main `32d017ce` / `88aa2697` | WS2 Contract·Physical Validation, WS3 Folder/Evidence와 승인된 Root Mapping 기록 | 현재 Workmap보다 앞선 6개 Commit; 중복 실행 금지 |
| `origin/agent/codex/fieldwork-output-evidence-inventory` | main `32d017ce` / `9f0e3ff0` | 외근 폴더 49개·파일 353개 Evidence Inventory | `.gitignore` 우회로 두 파일만 Commit; main에 없음 |
| `origin/agent/claude/ci1-test-design` | 과거 Base / `0d51ed7` | CI1 독립 테스트팩 | main 최신 Contract와 차이 검토 필요 |
| `origin/agent/claude/ci2-alignment-review` | 과거 Base / `8c1f87d` | CI2 검토·Blocker 재검증 | main 후속 Fix와 관계 확인 필요 |
| `origin/agent/claude/ci4-alpha-validation` | 과거 Base / `b66a11b` | 조기 실패 Gate 보고 | 후속 targeted validation이 main에 병합됨 |
| `origin/agent/claude/setup` | 과거 Base / `6c1f8fd` | Claude Setup·Lean Review 등 혼합 | 전체 Cherry-pick 금지; 경로별 검토 |

`OBSERVED` — 이번 Blind Review의 Claude Candidate Branch·문서는 조회하지 않았다.

`PROPOSED` — 미병합 Branch는 “최신이니 무조건 Merge”가 아니라, Base·변경 경로·외부 Write 근거·Canonical 영향·중복을 별도 TAP에서 검토해야 한다.

## 7. 신규 Work Item 시작 절차

1. **탐색**
   - Root 지침, Workmap, generated 요약, Work Item source를 읽는다.
   - `git branch -r --no-merged origin/main`으로 중복 작업을 찾는다.
2. **기존 구조 재사용**
   - 동일 목적 Contract·Mapping·Report·Script가 있으면 새 파일을 만들지 않는다.
   - 새 Schema나 Property보다 기존 값의 표현 가능성을 먼저 테스트한다.
3. **PREPARE**
   - Base SHA, 입력, 허용·금지 경로, 예상 변경, Test를 고정한다.
   - 외부 Record 후보와 중복을 Read-only로 확인한다.
4. **PREVIEW**
   - Expected Change, Planned Write, 기존 값, Rollback 또는 Failure Control을 제시한다.
   - 승인 전 외부 Write는 0이다.
5. **승인**
   - 명시적 승인 문구와 승인 범위를 기록한다.
   - 모호한 답변을 승인으로 해석하지 않는다.
6. **구현**
   - 승인된 최소 경로만 수정한다.
   - 같은 외부 Record의 최종 Writer는 한 Agent다.
7. **검증**
   - Unit → Integration → System → Acceptance 순으로 Expected–Actual을 남긴다.
   - 부분 실패 후 재시도는 실제 반영 결과를 먼저 재조회한다.
8. **Evidence**
   - 실제 문서는 Drive에 두고 Git에는 비민감 경로·메타데이터만 남긴다.
9. **Git 완료**
   - `git diff --check`
   - staged 파일, 삭제, 예상 외 변경 확인
   - Commit·Push 후 원격 SHA 확인
10. **Handoff**
   - Result, Outputs, Open Gaps, Blocking Issue, Next Owner, Approval 필요 여부를 남긴다.

## 8. TAP 사용법

TAP에는 최소 다음이 있어야 한다.

- AI·Owner·Stage·Mode
- 단일 목적
- Repository·Branch·Base 기준
- 선행 Work Item·Gate·Evidence
- 입력 Source 우선순위
- 허용·금지 Action과 경로
- 외부 Write 대상과 승인 방식
- 산출물·Output Contract
- Unit·Integration·System·Acceptance Test
- 중단조건·부분 실패·재실행 정책
- Commit·Push·PR·Merge 정책
- 완료 출력·Handoff·Next Owner

TAP 없이 하면 안 되는 변경:

- Process 의미·Canonical 상태 변경
- Workmap·Governance·Approval 파일 변경
- Notion Schema·운영 Record Write
- Drive 원본 이동·수정·삭제
- Slack 발송·Adapter 운영 연결
- 새로운 업무유형·Architecture 확장
- Agent가 사람 승인자를 대신하는 처리

`OBSERVED` — Governance는 Agent에게 GPT Work Order를 요구하고 Canonical Plan 직접 수정을 금지한다. 사용자 TAP이 별도 권한을 부여하더라도, GPT 소유 경로 예외 수정은 대상 파일과 결정 원문이 명시되어야 한다.

## 9. Write·승인·중단 규칙

| 대상 | Read | Write 조건 | 즉시 중단 |
|---|---|---|---|
| Git 작업 Branch | 허용 범위 내 | TAP의 허용 경로·Commit 정책 | Dirty, Base mismatch, 경로 충돌 |
| `orchestration/plan/**` | 읽기 가능 | GPT 결정 기록 예외 또는 GPT 직접 변경 | Agent 임의 Plan 변경 |
| Notion TEST Record | 대상 확인 후 | Preview·명시 승인·TEST Prefix·단일 Writer | Person/FUND 다중 후보, 중복, 권한 부족 |
| Notion 운영 Record | 최소 Read | 대상·이전값·새값을 지정한 별도 승인 | 개인정보, 의미 변경, 불명확한 담당자 |
| Notion Schema·View | Read-only 진단 | 승인된 Preview의 항목만 | 기존 View 영향, 승인 밖 Property |
| Drive | 지정 Root Read | 별도 명시 승인 | Root 밖 광역 탐색, 원본 변형 |
| Slack | 설계만 가능 | 권한·수신자·내용 승인 후 | 발송 대상 불명확 |

공통 중단조건:

- Required Input 누락
- Source 충돌
- Process 의미 변경 필요
- 테스트 실패
- 승인되지 않은 외부 Write 필요
- 민감정보 노출
- 최초 추정 대비 Scope 2배 초과
- 다른 Agent와 동일 Record·경로 충돌

## 10. Evidence와 파일 구조 이해

다음 다섯 개를 섞지 않는다.

1. **Fund Root**
   - 조합 전체의 Drive Root 후보.
   - 조합 공통 자료와 업무별 하위 폴더의 출발점이다.
2. **Request Source**
   - 특정 업무요청에 필요한 원본·작업 Source.
   - Request `원본 폴더`와 연결될 수 있다.
3. **Shared Functional Folder**
   - 여러 조합의 외근·세무서·은행 산출물을 날짜·업무 중심으로 모은 공통 폴더.
   - Fund Root로 간주하면 안 된다.
4. **Task Evidence**
   - 제출본, 접수증, 기관 회신, 결과물, 스캔본 등 Task 완료를 입증하는 파일.
5. **Completion Evidence**
   - 완료일·완료자·승인·전달 확인 같은 메타데이터와 필요한 Drive Evidence.

논리 근거:

- `notion/model/evidence-model.md`
- `mappings/evidence-control-map.md`
- `templates/request-execution-template.md`

`OBSERVED` — main에는 외근 산출물 Inventory가 없다. Codex Evidence Branch에 CSV 353행과 분석 보고서가 있으며, 이는 관찰·추론 Evidence이고 Canonical Rule이 아니다.

`OBSERVED` — 미병합 WS3 Branch 보고에는 실제 Fund Root와 E2E-03 Evidence Replay 및 승인 후 제한된 Notion Mapping 결과가 기록되어 있다. 외부 시스템의 현재값은 새 작업 전에 재조회해야 한다.

## 11. 테스트와 완료 Gate

### V-Model 연결

| 정의 | 대응 검증 |
|---|---|
| Process·Atomic Step | Coverage, Source Grounding, Rule 상태 |
| Operational Task Contract | ID 고유성, Atomic Mapping, 상태·Actor·완료조건 |
| Physical Schema Mapping | Property Type·Option·Relation·Rollup |
| 실행 Instance | Request 1건·Task 6건, 상태 전이, 실패·재시도 |
| 사용자 업무 적합성 | Human-in-the-loop Acceptance, 실제 사례 |

### 현재 재현 가능한 명령

Node 테스트:

```powershell
node scripts/conversational-intake.test.mjs
```

현재 Snapshot의 결과:

- Parser: PASS
- Transaction 6개 시나리오: PASS
- E2E-03 Mapping·Coverage·ID·Template·미지원 업무 차단: PASS

Orchestration 검증(정상 Python 3 환경):

```powershell
python scripts/validate_orchestration.py
```

Renderer:

```powershell
python scripts/render_orchestration_state.py
```

주의:

- 현재 감사 환경에서는 Python 실행기가 제공되지 않아 두 Python 명령을 직접 실행하지 못했다.
- Node로 같은 JSON parse·필수 필드·Dependency·Cycle·Gate 검사를 재현한 결과, `CP-05-P3`가 governance상 미승인인 `AG-P2`를 통과한다는 오류 1건을 확인했다.
- Renderer 예상 출력과 현재 generated 파일은 일치하지 않았다.
- 따라서 generated 파일을 재생성하거나 Validator 오류를 고치는 일은 별도 Canonical 정합화 TAP 대상이다.

완료 판정은 “테스트 명령이 PASS했다”만으로 충분하지 않다.

- Verification: 구현이 Contract와 Expected에 맞는가
- Validation: 실제 사용자·DB·Drive 환경에서 업무 목적을 달성하는가
- Acceptance: 승인자가 결과와 남은 Gap을 수용했는가

## 12. Claude·Codex·GPT 협업 기준

도구를 영구 고정 역할로 제한하지 않는다. Work Item, 모델, 연결 도구, 권한과 독립성 요구에 따라 선택한다.

- GPT
  - Canonical Workmap, 우선순위, Approval, 병렬 결과 통합
  - 서로 다른 Candidate의 비교·최종 방향 결정
- Codex
  - Git 의존관계·경로·Commit 검증
  - 코드·Contract 구현과 재현 가능한 테스트
  - 승인된 범위의 Notion CRUD 및 사후 재조회
- Claude
  - 독립 Process Review, 반례·Gap, 자연어 Contract 초안
  - 전용 Branch의 Review Evidence
- 사용자·정상준
  - Process Owner, 실제 화면·사례·예외 판단, 외부 Write 승인

실용 기준:

- Build와 기계 검증은 구현 도구가 있는 Agent
- 독립 검토는 원 구현과 분리된 Agent
- Canonical 상태 전이는 GPT·사용자
- 동일 Notion Record의 최종 Writer는 한 Agent

## 13. 세션 Memory·Compact·복원

### Compact 전 보존할 최소 상태

- Work Item ID와 목적
- Base Branch·Base SHA·현재 Branch·HEAD
- 허용·금지 경로
- 변경 파일
- 완료한 Test와 Actual 결과
- 외부 Write 수와 대상의 비민감 Alias
- Partial Failure·Idempotency Log 위치
- Open Gap·다음 Gate·Next Owner

민감한 Page ID, Drive ID, 개인정보를 대화 요약이나 Git에 복제하지 않는다. 재개에 필요한 외부 식별자는 승인된 실행 로그 또는 Connector 재조회로 복원한다.

### Compact 후 복원 순서

1. 대화 요약을 힌트로만 읽는다.
2. `git fetch --all --prune`
3. Branch·HEAD·status·원격 SHA를 확인한다.
4. Workmap·current-state·ready-work를 다시 읽는다.
5. Work Item의 source, run, handoff, latest report를 읽는다.
6. 변경 파일과 staged 파일을 확인한다.
7. 외부 작업이면 실제 반영 상태와 중복을 Read-only로 재조회한다.
8. 같은 실패를 반복하지 말고 누락 단계만 재개한다.

## 14. 자주 발생할 수 있는 오류

| 오류 | 예방 |
|---|---|
| 1. 오래된 Agent Branch에서 새 작업 시작 | `origin/main`과 merge-base를 확인하고 명시 Base에서 새 Branch 생성 |
| 2. generated 파일을 Canonical로 간주 | 항상 `master-workmap.yaml`과 실제 Git을 함께 확인 |
| 3. main에 없는 미병합 결과를 무시하고 중복 구현 | `git branch -r --no-merged origin/main`과 Branch diff 확인 |
| 4. Plan Status와 Run Status 혼용 | Workmap 계획과 `orchestration/runs/**` 실행 상태 분리 |
| 5. 설계 완료를 Physical·Live 완료로 보고 | Conceptual/Logical/Physical/Live와 Test 층을 별도 보고 |
| 6. Form을 Primary Intake로 오해 | 현재 Primary는 Conversational, Form은 Optional Fallback |
| 7. Atomic Task를 Notion Task로 1:1 생성 | Process Step, Operational Task, Instance ID 계층 확인 |
| 8. API 성공을 실제 Write 성공으로 판정 | Write 후 Record·Relation·Rollup 재조회 |
| 9. 부분 실패 재실행에서 중복 생성 | transaction/execution log와 기존 Page를 재사용해 누락분만 생성 |
| 10. 한 사례를 공통 Rule로 확정 | `공통/조건부/기관별/예외`와 Evidence 수를 명시 |
| 11. 외근 공통폴더를 Fund Root로 간주 | Fund Root·Request Source·Shared Folder를 분리 |
| 12. Rollup API `<omitted>`를 성공 또는 실패로 단정 | Schema 경로와 UI 확인을 분리해 보고 |
| 13. `.gitignore` 때문에 Evidence가 누락 | 승인된 정확한 파일만 `git add -f --` 후 staged 경로 검증 |
| 14. README의 오래된 현재 상태를 그대로 사용 | README는 목적·역사 안내로 보고 Workmap·Git으로 현재성 복원 |
| 15. 다른 Agent의 Canonical 경로를 직접 수정 | Proposal 또는 명시된 GPT 결정 기록 TAP 사용 |
| 16. 외부 URL·ID·민감 파일명을 보고서에 복사 | 비민감 Alias·상대 경로·마스킹만 기록 |

## 15. 현재 Open Gap과 다음 안전한 작업

### OBSERVED Gap

1. `master-workmap.yaml`은 AG-P2를 APPROVED로 기록하지만 `orchestration/governance/approval-gates.yaml`은 `approved:false`다.
2. Validator와 같은 Gate 검사를 Node로 수행하면 `CP-05-P3: passes unapproved gate AG-P2` 오류가 난다.
3. `current-state.md`·`ready-work.md`는 Renderer 예상 결과와 일치하지 않는다.
4. Workstream `WS1`은 READY지만 Work Item `WS1-01`은 완료됐고, Workstream `WS2`는 BLOCKED지만 `WS2-01`은 READY다.
5. `current_phase`는 CP-05로 남아 있지만 `next_review`와 실제 다음 Work Item은 CP-06의 WS2-01이다.
6. AG-P3 Packet에는 N-06 미검증 문구가 남아 있으나 Workmap·후속 검증은 N-06 VERIFIED로 기록한다.
7. `mappings/process-to-notion-map.md`의 P03 Operational Task는 5개이고, 후속 Canonical 실행 Contract는 P03-T01~T06 6개다.
8. main은 WS2-01 READY지만 미병합 Branch에 WS2·WS3 6개 Commit이 있다.
9. 외근 Evidence Inventory 2개 파일은 별도 Codex Branch에만 있다.
10. `README.md`는 CP-04 중심 현재 상태와 Form 중심 과거 설명을 길게 보존해 Cold-start 오독 위험이 있다.
11. GitHub Workflow는 없고 CI가 자동 실행되지 않는다.
12. 실제 Notion·Drive 현재값은 이번 Repository Audit에서 재조회하지 않았다.

### INFERRED

- 현재 가장 큰 위험은 기능 부족보다 Plan·generated·미병합 Branch 간 현재성 분열이다.
- WS2·WS3를 새로 구현하기보다 이미 존재하는 Branch 결과를 기술 검토하고 Canonical에 반영할지 결정하는 편이 재작업을 줄인다.

### PROPOSED 다음 안전한 작업

1. GPT·사용자가 미병합 `e2e03-natural-language-contract` 6개 Commit을 검토한다.
2. 승인 시 PR/병합 후 Workmap·AG-P3·generated 상태를 한 번에 정합화한다.
3. AG-P2 governance 충돌과 Renderer drift를 별도 최소 TAP으로 수정한다.
4. Fieldwork Evidence Branch는 Canonical Rule과 분리한 Evidence PR로 검토한다.
5. 그 뒤 CI-09 실제 사례 Pilot 또는 WS4 Architecture의 Input Gate를 재판정한다.

이번 Candidate가 위 작업을 실행하거나 승인하지 않는다.

## 16. 신규 세션 Bootstrap Checklist

```text
[ ] AGENTS.md를 읽었다.
[ ] 필요한 경우 CLAUDE.md를 함께 읽었다.
[ ] 현재 TAP/Work Order의 목적·Owner·Gate를 확인했다.
[ ] git fetch --all --prune을 실행했다.
[ ] current branch / HEAD / origin/main / status를 기록했다.
[ ] 같은 Work Item의 미병합 Branch를 확인했다.
[ ] master-workmap의 source_of_truth, required_inputs를 읽었다.
[ ] current-state와 ready-work가 Canonical이 아님을 확인했다.
[ ] 관련 Process·Contract·Mapping·Report를 읽었다.
[ ] OBSERVED / INFERRED / PROPOSED를 구분했다.
[ ] allowed_paths / forbidden_paths를 기록했다.
[ ] 외부 Write 대상·이전값·승인 문구를 확인했다.
[ ] Preview 전 외부 Write 0을 보장했다.
[ ] Unit / Integration / System / Acceptance 계획을 만들었다.
[ ] 예상 외 변경·삭제·민감정보를 점검했다.
[ ] git diff --check와 관련 테스트를 실행했다.
[ ] Commit 후 원격 SHA와 git status를 확인했다.
[ ] Result / Evidence / Open Gap / Next Owner를 Handoff에 남겼다.
```

## 17. Cold-start 검증 결과

이 Candidate만으로 수행한 Dry Run:

| 질문 | 답 |
|---|---|
| Base Branch | `origin/main`; Snapshot SHA `32d017ce...`, 실행 시 재조회 |
| 현재 Work Item | main 기준 WS2-01; 단, 같은 Base의 미병합 WS2·WS3 결과가 있어 재실행 금지 |
| 먼저 읽을 파일 | AGENTS, CLAUDE(해당 시), Workmap, current/ready, WS1 보고, 관련 Branch diff |
| 허용 Write | 현재 Candidate TAP에서는 Candidate 파일 한 개와 Candidate Branch Commit만 |
| 금지 Write | Canonical·generated·Notion·Drive·다른 Candidate·운영 Record |
| 실행할 Test | 경로·Branch·Commit, Markdown, 민감정보, diff, Cold-start 답변 |
| 완료 보고 | Base, Branch, Commit, Push, Changed File, Tests, Open Gap, Next Owner |
| 다음 안전한 Action | 미병합 WS2·WS3 Branch의 통합·정합화 여부를 GPT·사용자가 판단 |

Cold-start 핵심 질문 5개:

1. **현재 가장 중요한 Work Item은?**

   main은 WS2-01을 가리키지만 미병합 결과가 이미 있으므로 통합 판단이 선행된다.
2. **작업 전 무엇을 읽는가?**

   지침 → Git → Workmap → generated → Work Item source → Branch diff → Test Evidence.
3. **어떤 Write가 승인 대상인가?**

   외부 시스템, Schema, 운영 Record, Canonical Plan, 사람 판단을 포함하는 Write.
4. **설계와 실제 완료를 어떻게 구분하는가?**

   Conceptual/Logical/Physical/Live와 Unit/Integration/System/Acceptance를 함께 표시한다.
5. **다음 안전한 작업은?**

   중복 구현이 아니라 미병합 결과 검토와 Canonical 상태 정합화 제안이다.

판정: `PASS_WITH_REPOSITORY_STATE_GAPS`.

## 18. 근거와 한계

### 주요 참조 경로

- `AGENTS.md`, `CLAUDE.md`, `START_HERE.md`, `README.md`
- `orchestration/plan/master-workmap.yaml`
- `orchestration/plan/dependency-map.yaml`
- `orchestration/plan/roadmap.md`
- `orchestration/generated/current-state.md`
- `orchestration/generated/ready-work.md`
- `orchestration/governance/*.yaml`
- `scripts/validate_orchestration.py`
- `scripts/render_orchestration_state.py`
- `scripts/conversational-intake.mjs`
- `scripts/conversational-intake.test.mjs`
- `processes/00-end-to-end.md`
- `processes/03-unique-number-application.md`
- `contracts/conversational-intake-contract.yaml`
- `contracts/process-execution-mapping.yaml`
- `docs/process-execution-layering.md`
- `notion/model/*.md`
- `notion/schema/support-request-db.md`
- `notion/schema/support-task-db.md`
- `mappings/process-to-notion-map.md`
- `mappings/evidence-control-map.md`
- `reports/cp-04-completion.md`
- `reports/process-integration-qa.md`
- `reports/cp-05-p3-completion.md`
- `reports/ci2-process-alignment-verification.md`
- `reports/ci4-alpha-execution-result.md`
- `reports/alpha-loop/ci5-e2e03/06-final-assessment.md`
- `reports/reviews/claude/ci4-alpha-validation-v2.md`
- `reports/reviews/claude/e2e03-operational-standard-draft.md`

### 조사한 주요 Git

- main merged: CI4 Alpha·Claude Review, CI5 Loop, WS1 Operational Standard
- unmerged: E2E-03 WS2·WS3 Branch, Fieldwork Evidence Branch, 과거 독립 Review Branch
- 이번 Blind Consensus의 Claude Candidate Branch·문서: 조회하지 않음

### 확인하지 못한 사항

- 실제 Notion·Drive의 2026-07-27 현재값
- 사용자 CI6 CASE-01~08의 독립 저장 Report 전체
- 미병합 Branch의 PR 승인 여부
- Python Runtime에서의 원 Validator·Renderer 실행
- AG-P3와 CI-09의 최신 사용자 결정

이 Candidate는 Navigation Manual 후보이며 현재 Plan을 바꾸지 않는다. GPT와 사용자가 다른 Candidate와 비교한 뒤 정확성·현재성·안전성·중복 최소화를 기준으로 최종 위치와 Canonicalization 여부를 결정해야 한다.
