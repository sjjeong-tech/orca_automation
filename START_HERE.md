# START HERE

이 저장소는 지원팀 행정업무 지식을 구조화하고, 자연어 요청을 Notion의 업무요청·Task 운영 Record로 연결하기 위한 프로젝트다.

## 1. 현재 Primary 방향

Primary Intake는 대화형 입력이다.

`자연어 요청 → 누락정보 확인 → 생성 Preview → 사용자 승인 → Notion 업무요청·Task`

Notion Form은 Optional Fallback이며 선행조건이 아니다.

## 2. Canonical Source

- 계획 상태: [`orchestration/plan/master-workmap.yaml`](orchestration/plan/master-workmap.yaml)
- 사람이 읽는 현재 상태: [`orchestration/generated/current-state.md`](orchestration/generated/current-state.md)
- 실행 가능 작업: [`orchestration/generated/ready-work.md`](orchestration/generated/ready-work.md)
- Intake 계약: [`contracts/conversational-intake-contract.yaml`](contracts/conversational-intake-contract.yaml)
- Process 실행 Mapping: [`contracts/process-execution-mapping.yaml`](contracts/process-execution-mapping.yaml)
- Request 실행 본문 템플릿: [`templates/request-execution-template.md`](templates/request-execution-template.md)

이 문서에는 상태값을 복제하지 않는다. 최신 상태는 위 Canonical 파일에서 확인한다.

## 3. 현재 작업과 Blocker 확인

1. `orchestration/generated/ready-work.md`에서 READY 항목을 확인한다.
2. `orchestration/plan/master-workmap.yaml`에서 Input Gate와 금지 경로를 확인한다.
3. 사용자 승인, Notion Write, 실제 운영 데이터가 관련되면 해당 Gate에서 정지한다.

## 4. 반드시 읽을 파일

- [`AGENTS.md`](AGENTS.md)
- [`README.md`](README.md)
- [`contracts/conversational-intake-contract.yaml`](contracts/conversational-intake-contract.yaml)
- [`docs/work-item-glossary.md`](docs/work-item-glossary.md)
- 현재 Work Order 또는 사용자 TAP

## 5. 경로 소유권

- GPT 소유: `orchestration/plan/**`, `orchestration/governance/**`, `orchestration/work-orders/**`, `orchestration/approvals/**`
- Agent 실행 기록: `orchestration/runs/**`, `orchestration/handoffs/**`, `orchestration/proposals/**`
- Generated: `orchestration/generated/**` — Source of Truth가 아님

명시적 Work Order 예외가 없으면 GPT 소유 경로를 Agent가 수정하지 않는다.

## 6. Agent 역할

- GPT: Canonical 업무지도, 우선순위, Gate와 사용자 결정
- Codex: Git Builder, Intake 로직, 승인된 TEST 범위의 Notion CRUD와 검증
- 사용자·정상준: Process Owner, 생성 승인, 실제 화면·Pilot 검증
- Notion AI: 기본 Dependency가 아닌 사용자 명시 요청 시의 임시 도구

## 7. 주요 단계

- CI-A: CI-01·CI-02 — 입력규격과 DB Mapping
- CI-B: CI-03·CI-04 — 자연어 해석과 Notion 기록
- CI-C: CI-05·CI-06·CI-07 — E2E 검증과 운영 확장
- CI-08: E2E-03·세무서_1·P03 Process Model 실행 정합화
- CI-09: 승인된 실제 사례 Pilot
- CI-10: 실제 사례 검증 이후 다음 Process 확장

상세 ID 뜻은 [`docs/work-item-glossary.md`](docs/work-item-glossary.md)를 참고한다.

## 8. 작업 시작 체크리스트

- `git fetch origin`
- Branch, HEAD, `origin/main`, working tree 확인
- Work Item의 Input Gate와 허용·금지 경로 확인
- 민감정보와 운영 Record 변경 위험 확인
- 외부 Write 전 대상과 승인 확인

## 9. 작업 종료 체크리스트

- 계약·코드·테스트 검증
- 실제 변경과 미검증 항목 구분
- `git diff --check`
- Commit·Push 후 local HEAD와 `origin/main` 일치 확인
- Run Capsule과 Handoff에 다음 Owner·Gate 기록

## 10. 최근 방향 전환

Form 중심 Intake는 대화형 Intake로 전환됐다. 기존 Form·Fast Track Report는 당시 실행 증적으로 보존하며, DB CRUD·Relation·상태 전이 검증 결과는 새 경로에서 재사용한다.

## 11. Current와 Historical 구분

- Current: Canonical Workmap, Generated State, 활성 Contract와 현재 Work Order
- Historical: 과거 TAP Queue, Report, Run Capsule, Handoff

Historical 문서의 당시 판정을 현재 상태로 해석하지 않는다.
