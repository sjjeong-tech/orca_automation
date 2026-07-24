# Status·Evidence RAG Metadata Contract

## 목적

향후 RAG가 Process Rule과 Notion 운영상태를 혼동하지 않고 현재 상태, 다음 Actor, 누락정보, 완료 Evidence와 예외를 검색하도록 하는 메타데이터 계약이다. Vector DB와 Embedding은 이번 범위가 아니다.

| Metadata Key | 의미 | 값 예시·형식 | Source of Truth | 필수 |
|---|---|---|---|---|
| `process_id` | Process 식별자 | `P03`, `P07` | Repository Process | 필수 |
| `atomic_task_id` | 근거 Atomic Task | `UN-11`, `AO-12` | Repository Process | 조건부 |
| `operational_task_id` | Notion 추적 Task | `OT-P03-03` | P3 Mapping | 필수 |
| `request_status_id` | 요청 상태 | `RQ-ACTIVE` | Notion Request | 필수 |
| `task_status_id` | Task 상태 | `TS-WAIT` | Notion Task | 필수 |
| `current_actor` | 다음 행동·응답 주체 | `ACT-EXTERNAL` | Notion Task | 필수 |
| `request_type` | 요청 업무 유형 | 고유번호증 신청 | Notion Request | 필수 |
| `fund_type` | 조합 유형 | 벤처·UNKNOWN | Notion/FUND + Variation | 조건부 |
| `gp_type` | GP 유형 | 개인·법인·공동·UNKNOWN | Notion/FUND + Variation | 조건부 |
| `account_type` | 계좌 유형 | 일반·안전·UNKNOWN | Notion + Variation | 조건부 |
| `decision_point_id` | 필요한 판단 | `DP-04` | Human Control Model | 조건부 |
| `approval_id` | 필요한 승인 | `HA-04` | Human Control Model | 조건부 |
| `evidence_type` | 완료 Evidence 유형 | `EV-RESPONSE` | Evidence Model | 조건부 |
| `exception_type` | 예외·보완 유형 | 기관 추가요청 | P3 Mapping/Notion | 조건부 |
| `blocker_summary` | 전이 차단 원인 | 비민감 요약 | Notion Task | 조건부 |
| `next_action` | 다음 수동 Action | 재확인 예정 | Notion Task | 필수 |
| `source_authority` | 지식 근거 등급 | CONFIRMED·PROVISIONAL·UNKNOWN·CASE_ONLY | Repository Source/Model | 필수 |
| `verification_status` | 운영값 검증 상태 | VERIFIED·HUMAN_REVIEW_REQUIRED | Notion/QA | 필수 |
| `effective_date` | Rule·상태 기준일 | ISO date | Repository/Notion | 필수 |

## Retrieval 통제

- 상태 질문은 Notion Live State를 우선하고 Rule 질문은 Repository를 우선한다.
- `UNKNOWN`, `PROVISIONAL`, `CASE_ONLY`는 답변에 상태를 함께 노출한다.
- 민감 원문을 인덱싱하지 않고 승인된 경로와 비민감 메타데이터만 사용한다.
- Agent는 RAG 결과만으로 Human Approval을 대체하지 않는다.

## 지원 질문

- 현재 업무와 Task 상태, 다음 행동 주체
- 누락 Input과 Blocker
- 완료에 필요한 Evidence
- 계좌개설 전 선행 Task
- 기관 회신 대기 업무
- 과거 동일 보완 사유
- 관리역 확인이 필요한 Approval
