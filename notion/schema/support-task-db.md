# 지원팀 Task DB — Existing FUND Architecture 명세

## Record 정의

지원팀이 실제로 추적·수행하는 Operational Task다. Process Atomic Task를 그대로 복제하지 않으며, 사람이 담당·상태·기한·완료조건을 관리할 가치가 있는 단위로 집약한다.

## S1 Property

| Property명 | 내부 Key | Notion Type | 필수 | 입력 주체 | 생성 시점 | 목적 | 상태 |
|---|---|---|---|---|---|---|---|
| Task명 | task_name | Title | Required | 지원팀 | Task 생성 | 실행 항목 식별 | S1_REQUIRED |
| 상위 요청 | parent_request | Relation | Required | 지원팀/시스템 | Task 생성 | 요청 1:N 연결 | S1_REQUIRED |
| 관련 조합 | related_fund | Relation 또는 Rollup | Required | Relation | Task 생성 | 조합 문맥 | S1_REQUIRED |
| Process ID | process_id | Select | Required | 지원팀 | Task 생성 | P03·P04·P07·P08 추적 | S1_REQUIRED |
| Operational Task ID | operational_task_id | Text | Required | 지원팀 | Task 생성 | 집약 후보 추적 | S1_REQUIRED |
| Task 상태 | task_status | Status | Required | 지원팀 | 생성/진행 | 진행 관리 | S1_REQUIRED_PROVISIONAL |
| 담당자 | assignee | Person | Required | 지원팀 | 생성/진행 | 실행 담당 | S1_REQUIRED |
| 현재 Actor | current_actor | Select | Required | 지원팀 | 생성/진행 | 역할 가시성 | S1_REQUIRED |
| 목표일 | target_date | Date | Required | 지원팀 | 생성/진행 | 기한 관리 | S1_REQUIRED |
| 다음 Action | next_action | Text | Required | 지원팀 | 진행 | 즉시 할 일 | S1_REQUIRED |
| Blocker | blocker | Text | Required | 지원팀 | 진행 | 정지 원인 | S1_REQUIRED |
| 완료조건 | completion_condition | Text | Required | 지원팀/설계 | 생성 | 관찰 가능한 종료 | S1_REQUIRED |
| 완료증빙 | completion_evidence | Text | Optional | 지원팀 | 완료 | Drive 경로·비민감 근거 | S1_OPTIONAL |
| 비고 | notes | Text | Optional | 지원팀 | 생성/진행 | 인계 메모 | S1_OPTIONAL |

Property는 14개다. Task Instance ID, Input·Output, 예외 유형, 다음 Task Relation, 자동화 수준과 Agent 상태는 P2~Post-Pilot로 유예한다.

## 임시 Task 상태

`예정`, `진행 중`, `대기`, `보완`, `완료`, `제외`를 `PROVISIONAL_FOR_SKELETON`으로 사용한다. Formula와 자동 전이는 금지한다.
