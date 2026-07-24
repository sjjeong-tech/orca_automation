# 세무서·은행 행정업무 표준화·자동화

Repository: `vc-support_team-process-rag`

> Form 실행 원칙: Codex가 DB CRUD·Form Capability Probe를 먼저 수행하고, 지원되지 않는 Form UI 편집과 실제 제출만 사용자가 처리합니다. Notion AI는 기본 실행 주체가 아닙니다.

지원팀 행정업무를 Process 단위로 구조화하고, RAG 기반 검색과 Notion 업무운영 및 향후 Agent 실행을 연결하는 Repository입니다.

핵심 범위:

- 세무서·홈택스·은행·문구점 행정업무
- Process Modeling 및 Rule·Variation·Exception 관리
- 운영팀–지원팀 Intake와 Notion Request·Task Control Plane
- RAG Knowledge Retrieval
- 승인 기반 Agent Automation

## 1. 프로젝트 목적

미라파트너스 지원팀의 세무서·은행 행정업무를 AI Agent가 이해·지원·수행할 수 있는 Process Model로 구조화하는 프로젝트입니다.

단순 사례 기록이나 매뉴얼 작성이 목적이 아닙니다. 현행 업무 이해를 시작으로 표준화, Gap 검증, 자동화 후보 도출, Tracker와 AI Agent 설계까지 이어지는 기반을 만듭니다.

## 2. 전체 업무지도

| 순서 | 단계 | 현재 상태 |
|---:|---|---|
| 1 | Notion Source 확보 | 완료 |
| 2 | Source Extract | 완료 |
| 3 | Source QA | 완료 — `PROCESS READY WITH GAPS` |
| 4 | Process Model | 완료 — Process 12개 생성, Process 11은 DRAFT |
| 5 | Process QA | 완료 — CP-04 통합 QA |
| 6 | Variation Model | 예정 |
| 7 | E2E 통합 QA | 예정 |
| 8 | Gap 기반 CASE 검증 | 예정 |
| 9 | Tracker 설계 | 예정 |
| 10 | AI Agent 설계 | 예정 |
| 11 | 구현·테스트·배포 | 예정 |

## 3. 현재 진행상황

현재 위치는 **CP-04 전체 Process 생성·QA 완료**입니다.

완료된 작업:

- Notion MCP 읽기 연결 검증
- [Source Structure Index](sources/notion/index.md) 확보
- 공식 Source 13개 Extract
- [Source 통합 QA](reports/source-extract-qa.md)
- Process Wave 1 생성 및 [QA 5/5 통과](reports/process-wave-1-qa.md)
- CP-03 외부 독립검토 Findings 반영
- Decision·Exception·Interface 보강 및 [Revision QA 통과](reports/process-wave-1-revision-qa.md)
- Process Wave 2 지원 Process 7개 생성
- [Wave 2 개별 QA](reports/process-wave-2-qa.md), [Source Grounding QA](reports/process-source-grounding-qa.md), [전체 Process 통합 QA](reports/process-integration-qa.md) 완료

Process Wave 1:

- [00 전체 E2E](processes/00-end-to-end.md)
- [03 고유번호증 신청](processes/03-unique-number-application.md)
- [04 보안카드·홈택스](processes/04-security-card-hometax.md)
- [07 계좌개설](processes/07-account-opening.md)
- [08 계좌개설 보완](processes/08-account-supplement.md)

Process Wave 2:

- [01 명판·인감 제작](processes/01-stamp-seal.md)
- [02 우편·등기 발송](processes/02-mail-dispatch.md)
- [05 고유번호증 정정](processes/05-unique-number-correction.md)
- [06 폐업·청산](processes/06-closure-liquidation.md)
- [09 계좌해지](processes/09-account-closure.md)
- [10 잔액증명서](processes/10-balance-certificate.md)
- [11 결과물 전달·후속 완수](processes/11-result-handover.md) — `DRAFT`, Source Coverage 0/7

다음 작업:

1. Variation Model
2. 최종 통합 QA
3. Gap 기반 CASE·인터뷰 검증

## 4. 현재 품질 상태

| 항목 | 판정 |
|---|---|
| Source | `PROCESS READY WITH GAPS` |
| Process Wave 1 | QA `PASS 5/5` |
| Process Wave 1 Revision | `PASS WITH NON-BLOCKING GAPS` |
| Process Wave 2 | `PASS WITH NON-BLOCKING GAPS` |
| 전체 Process 통합 QA | `PASS WITH NON-BLOCKING GAPS` |
| Process 11 | `DRAFT` — 0/7 |
| 차단 Conflict | 없음 |

주요 미확정 항목:

- 제3자 수령요건
- 수탁계좌 기준
- 구양식 판별
- 폴더 표준
- 기관·지점별 제출 방식
- 저장·실물 후속관리

확정되지 않은 사항은 `PROVISIONAL`, `UNKNOWN`, `CONFLICT` 상태로 유지하며 자동화 Rule로 사용하지 않습니다. 전체 목록은 [unresolved.md](conflicts/unresolved.md)에서 관리합니다.

## 5. 저장소 구조

| 경로 | 역할 | 현재 상태 |
|---|---|---|
| `sources/notion/` | 공식 Notion Source Index와 Source Extract | 생성됨 |
| `processes/` | Process Model | 12개 생성됨; Process 11 DRAFT |
| `variations/` | 조합·GP·계좌·기관 Variation | 예정 — 디렉터리 미생성 |
| `reports/` | Source·Process QA 보고서 | 생성됨 |
| `mappings/` | Source·Process 관계와 인터페이스 | 일부 생성됨 |
| `conflicts/` | 미해결 Gap·Conflict | 생성됨 |
| `cases/` | 비식별 CASE Evidence | 기존 사례 존재 |
| `tasks/` | Queue·오케스트레이션 정책·실행계획 | 생성됨 |
| `schemas/` | Tracker 등 관리 스키마 | 기존 초안 존재 |

`rules/`와 `docs/`는 기존 보조 자료 영역이며, 현재 Process Wave 완료 범위로 간주하지 않습니다.

## 6. 근거 사용 원칙

- Notion 공식 Source를 Process 구조의 기준으로 사용합니다.
- CASE는 Evidence로만 사용하며 공식 Source를 대체하지 않습니다.
- 단일 CASE만으로 공통 Rule을 확정하지 않습니다.
- 민감정보 실제 값, 원본 증빙, 인증정보를 Git에 저장하지 않습니다.
- 확인되지 않은 내용은 확정 표현으로 작성하지 않습니다.

## 7. 운영 방식

- Orca/Codex가 선행 Gate와 Checkpoint가 있는 TAP Queue를 실행합니다.
- Source Agent와 Process Agent는 지정된 파일을 단일 소유합니다.
- 각 Wave는 QA 통과 후 Commit·Push합니다.
- Checkpoint에서 외부 검토 후 다음 구간을 재개합니다.
- GitHub 원격 산출물과 Orca 실행 결과를 교차검증합니다.

## 8. 주요 산출물

현재 생성됨:

- [Notion Source Extract](sources/notion/)
- [Source QA](reports/source-extract-qa.md)
- [Process Wave 1](processes/)
- [Process Wave 1 QA](reports/process-wave-1-qa.md)
- [Process Wave 1 Revision QA](reports/process-wave-1-revision-qa.md)
- [Process Wave 2 QA](reports/process-wave-2-qa.md)
- [Process Source Grounding QA](reports/process-source-grounding-qa.md)
- [Process 통합 QA](reports/process-integration-qa.md)
- [Source 관계맵](mappings/source-relationship-map.md)
- [미해결 Gap](conflicts/unresolved.md)

예정:

- Variation Model
- E2E Interface Map
- Gap Analysis
- Tracker Schema 현행화
- Agent Architecture

## 9. Notion Operations Control Plane

> 실제 Notion Skeleton은 제한적으로 구축했으며 Form UI 안정화 과제가 남아 있습니다. 자동화와 Agent Write는 아직 구축하지 않았습니다.

### 9.1 적용 위치

- 기존 Notion DB: [`TO DO LIST (FUND)`](https://app.notion.com/p/14d72a41d9d7806b878ef2459f181cfa?v=26c72a41d9d78021880e000c6508539e)
- 적용 범위: `조합(결성)` View
- 기존 다른 View와 Template: 유지
- 상위 DB Property: 필요한 항목만 최소 추가

### 9.2 목표 운영 흐름

```mermaid
flowchart LR
    A[조합 결성 예정 인지] --> B[1차 Form<br/>조합 결성 예정 등록]
    B --> C[TO DO LIST FUND<br/>조합 결성 Record 생성]
    C --> D[조합 내부 Page]
    D --> E[2차 Form<br/>지원팀 행정업무 요청]
    E --> F[지원팀 업무요청 DB]
    F --> G[지원팀 Task 생성]
    G --> H[운영팀·지원팀 상태 공유]
    H --> I[AI 다음 Action 제안]
    I --> J[승인 기반 Agent 실행]
```

### 9.3 1차 Form — 조합 결성 예정 등록

| 항목 | 내용 |
|---|---|
| 목적 | 예정 건 조기 가시화, 조합 Record·내부 Page 생성, 후속 지원팀 요청의 기준 Record 확보, 계좌개설 예상 건 연결 |
| 작성자 | 원칙: 운영팀 관리역 / 예외: 지원팀 대리등록 |
| 입력 원칙 | 기존 `TO DO LIST (FUND)` Property 최대 활용, 신규 Property 2~3개 이내 검토 |
| 사용성 | 1분 내 작성 가능한 최소 입력 |
| 제외 | 상세 행정정보 수집 |

### 9.4 2차 Form — 지원팀 행정업무 요청

- Trigger: 지원팀이 실제 업무에 착수할 수 있는 확정정보와 서류가 준비된 시점
- 목적: 실제 업무 착수, 공통정보 재사용, 업무별 확정정보·서류 수집, Operational Task 생성 Input 제공
- 대상 업무: 고유번호증 신청, 명판·인감, 보안카드·홈택스, 계좌개설, 계좌개설 보완
- 원칙:
  - 1차 Form 정보 재입력 금지
  - 기존 조합 Record와 Relation
  - 업무별 Toggle 또는 조건부 입력
  - 요청 원문과 실행 Task 분리 가능

1차 Form은 예정 건과 기준 Record를 만드는 최소 Intake이고, 2차 Form은 실제 지원팀 착수를 위한 확정정보 Intake다. Form의 최종 Property와 조건부 입력은 CP-05-P4 전까지 미확정이다.

### 9.5 Notion DB와 Repository 역할

| 영역 | 역할 |
|---|---|
| `TO DO LIST (FUND)` | 조합 단위 상위 Record와 조기 예정 관리 |
| 조합 내부 Page | 결성 매뉴얼, 지원팀 요청, 관련 Task 확인 |
| 지원팀 업무요청 DB | 2차 Form 응답과 요청 원문 저장 |
| 지원팀 Task DB | 상태, 다음 Action, Blocker, 증빙 관리 |
| `vc-support_team-process-rag` | Process Rule, Mapping, RAG Knowledge, Automation Logic의 기준 저장소 |
| Notion | 실제 운영상태의 System of Record |

Pilot A에서는 신규 상위 업무 DB를 만들지 않고 기존 `TO DO LIST (FUND)`의 `조합(결성)` Record를 상위 기준으로 재사용한다. 신규 DB는 지원팀 업무요청 DB와 지원팀 Task DB 두 개다.

기존 조합별 내부 결성 DB는 당장 삭제하거나 대체하지 않는다. 기존 DB는 결성 전체 업무 매뉴얼·체크리스트를 유지하고, 신규 중앙 DB는 Linked View로 실제 지원팀 요청·Task를 보여준다. 신규 DB의 Relation·Property는 Skeleton 승인 전까지 설계안이다.

### 9.6 Pilot A

```text
고유번호증 신청
→ 보안카드·홈택스
→ 계좌개설
→ 필요 시 계좌개설 보완
```

Pilot A 제외 범위:

- 고유번호증 정정
- 폐업·청산
- 계좌해지
- 잔액증명서
- Process 11
- Slack 자동화
- Agent Write

### 9.7 단계별 To-Be

| 단계 | 목표 |
|---|---|
| To-Be 1 | 운영팀–지원팀 업무요청 표준화 및 Notion 문서화 |
| To-Be 2 | 지원팀 업무의 AI 제안·검수·승인 기반 Agent화 |
| To-Be 3 | 운영팀 결성업무의 Notion Process화 |
| To-Be 4 | 운영팀 업무의 승인 기반 Agent화 |

수동 운영 검증 후 AI 제안, 승인 기반 Write, 운영팀 확장 순으로 진행한다. 현재 Agent가 실제 운영업무를 자동 실행하고 있지는 않다.

### 9.8 현재 진행상태

| 단계 | 상태 |
|---|---|
| CP-04 | As-Is Process Model v1 완료 — Known Gaps 유지 |
| CP-05-P0~R3 | Operating Model·Master Roadmap·책임 경계 정리 완료 |
| CP-05-P1-R1 | 기존 Notion 구조 기반 Architecture 정렬 완료 |
| CP-05-S1 | `PARTIAL_WITH_SAFE_CONSTRAINTS` — 요청 DB·Task DB·TEST Relation 구축, 기존 FUND DB 무변경 |
| CP-05-N1 | Repository Rename·Remote·현행 참조 정렬 완료 |
| CP-05-S1-R1 | `PARTIAL_WITH_UI_ACTIONS` — 1차 Form 이름 정렬, 질문·Filter·Rollup UI 검증 과제 명시 |
| CP-05-P2 | `COMPLETED_WITH_OPEN_UI_GAPS` — Status·Evidence·Actor·Human Control Contract 작성, AG-P2 검토 대기 |

S1에서 [지원팀 업무요청](https://app.notion.com/p/c60e9bc03a214735be082ed54905970d)과 [지원팀 Task](https://app.notion.com/p/b7f50ee986714213befb4268fdd36920)를 생성했다. 사용자 생성 1차 Form은 `조합 결성 예정 등록`으로 이름을 정렬했지만 질문 축소·필수값·제출 검증이 필요하다. 2차 Form은 질문 1개의 골조 상태이며, 상세 결과는 [S1-R1 Stabilization Report](reports/cp-05-s1-r1-skeleton-stabilization.md)에 기록한다. Automation과 Agent Write는 아직 구현하지 않았다.

### 9.9 관련 설계문서

- [Notion Control Plane Master Roadmap](plans/notion-control-plane-roadmap.md)
- [As-Is Operating Model](operating-model/as-is.md)
- [To-Be Operating Model](operating-model/to-be.md)
- [Operating Principles](operating-model/principles.md)
- [Master Deliverables](operating-model/master-deliverables.md)
- [Decision Log](decisions/decision-log.md)
- [CP-05-P0 Claude Finding Disposition](reports/cp-05-p0-claude-finding-disposition.md)
- [CP-05-P1 DB Architecture](reports/cp-05-p1-db-architecture.md)
- [P2 Status·Evidence Model](reports/cp-05-p2-status-evidence-model.md)
- [Request Status Model](notion/model/request-status-model.md)
- [Task Status Model](notion/model/task-status-model.md)
- [Evidence Model](notion/model/evidence-model.md)
- [Human Approval Model](notion/model/human-approval-model.md)

## 10. Git-Native Orchestration

계획 상태와 Agent 실행 상태를 분리한다.

- [Master Workmap](orchestration/plan/master-workmap.yaml): GPT 소유 Canonical Plan
- [Current State](orchestration/generated/current-state.md): 재생성 가능한 사람용 View
- [Ready Work](orchestration/generated/ready-work.md): 현재 READY 요약
- [Governance](orchestration/governance/): 실행·승인·소유권·Runtime 정책
- [AG-P2 Review Packet](orchestration/approvals/ag-p2-review.yaml)
- [CP-00-O1 Report](reports/cp-00-o1-orchestration-control-layer.md)

Codex·Claude는 GPT Work Order가 있는 작업만 실행하고 자신의 Run·Handoff·Proposal만 기록한다. 현재 다음 실행 단계는 AG-P2 사용자·GPT 검토이며 CP-05-P3는 승인과 Join Gate 전 실행하지 않는다.
