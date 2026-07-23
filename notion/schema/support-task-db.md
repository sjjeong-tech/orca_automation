# 지원팀 Task DB — Fast Skeleton 명세

## Operational Task 정의

지원팀 Task DB의 한 Record는 **사람이 담당·상태·기한·완료 증빙을 추적할 가치가 있는 운영 단위**다. Process Atomic Task와 동일하지 않다.

- 여러 Atomic Task를 하나의 Operational Task로 집약할 수 있다.
- 중요한 Milestone은 별도 Operational Task로 둘 수 있다.
- 클릭·출력·정렬 같은 미세행동을 전부 Task로 만들지 않는다.
- P3 Mapping 전의 항목은 `CANDIDATE_FOR_SKELETON`이며 전체 Task Template가 아니다.

## 식별 규칙

- Process ID: `P03`, `P04`, `P07`, `P08`; Intake는 `INTAKE`
- Operational Task ID: `OT-[Process]-[SEQ]`, 예: `OT-P03-01`
- Task Instance ID: 사람이 선택적으로 입력하는 `TSK-YYYYMM-SEQ`
- Operational Task ID는 후보 정의 식별자이고 Task Instance ID는 실제 건별 식별자다.

## Property 명세

| Property명 | 내부 Key | Notion Type | 필수 여부 | S1 포함 | 입력 주체 | 생성 시점 | 사용 목적 | 후속 단계 | 비고 |
|---|---|---|---|---|---|---|---|---|---|
| Task명 | task_name | Title | Required | Yes | 지원팀 | Task 생성 | Task 식별·화면 표시 | P3 | Operational Task명 |
| Task ID | task_id | Text | Optional | Optional | 지원팀 | Task 생성 | Instance 식별 | Post-Pilot | S1 수동, 자동생성 금지 |
| 상위 업무 | parent_work | Relation | Required | Yes | 지원팀/시스템 | Task 생성 | 업무 N:1 연결 | P3 | 업무 DB `관련 Task` 역방향 |
| Process ID | process_id | Select | Required | Yes | 지원팀 | Task 생성 | Process 범위·Filter | P3 | Pilot A와 INTAKE만 |
| Operational Task ID | operational_task_id | Text | Required | Yes | 지원팀 | Task 생성 | 후보·Mapping 추적 | P3 | Atomic Task ID와 구분 |
| Task 상태 | task_status | Status | Required | Yes | 지원팀 | 생성/진행/완료 | 진행 상태·View | P2 | 임시 상태값 |
| 현재 Actor | current_actor | Select | Required | Yes | 지원팀 | 생성/진행 | 역할 가시성 | P3 | 책임 확정 Rule 아님 |
| 담당자 | assignee | Person | Required | Yes | 지원팀 | 생성/진행 | 실제 수행자·내 Task | P4 | 권한 확인 필요 |
| 목표일 | target_date | Date | Required | Yes | 지원팀 | 생성/진행 | 기한·정렬 | P2 | 기한 Rule 미확정 |
| 완료일 | completed_date | Date | Optional | Optional | 지원팀 | 완료 | 완료 시점 기록 | P2 | 완료 전 비움 |
| 다음 Task | next_task | Relation | Optional | No | 지원팀/시스템 | 진행 | 선후관계·재작업 | P3 | 자기 Relation은 S1 제외 |
| Input | task_input | Text | Optional | No | 지원팀/시스템 | 생성 | 착수 입력 | P3 | Process Mapping 후 |
| Output | task_output | Text | Optional | No | 지원팀/시스템 | 진행/완료 | 결과 연결 | P3 | Process Mapping 후 |
| 완료조건 | completion_condition | Text | Required | Yes | 지원팀/시스템 | Task 생성 | 관찰 가능한 종료 기준 | P2/P3 | S1은 후보 문구 |
| 완료 증빙 | completion_evidence | Text | Optional | Optional | 지원팀 | 완료 | 완료 근거 메타데이터 | P2 | 실제 파일은 Drive |
| Blocker | blocker | Text | Required | Yes | 지원팀 | 진행 | 정지 원인 표시 | P2 | 유형화는 P2 |
| 예외 유형 | exception_type | Select | Optional | No | 지원팀/시스템 | 진행 | 보완·Rework 분류 | P3 | 예외 Mapping 후 |
| 비고 | notes | Text | Optional | Optional | 지원팀 | 생성/진행 | 관찰·인계 메모 | P2~P4 | Rule 저장 용도 아님 |
| 자동화 수준 | automation_level | Select | Optional | No | 시스템/설계자 | 설계 | 자동화 범위 표시 | Post-Pilot | CP-06 전 제외 |
| Agent 실행 상태 | agent_run_status | Status | Optional | No | 시스템 | 실행 | Agent Write 추적 | Post-Pilot | CP-07 전 제외 |

## Relation

- `상위 업무`는 필수이며 지원팀 업무 DB의 `관련 Task`와 양방향으로 연결한다.
- S1에서는 Rollup 없이 Relation 이름과 Task명만으로 상위 업무를 식별한다.
- Task 간 `다음 Task` Relation은 P3 전 생성하지 않는다.

## 임시 Task 상태

`예정`, `진행 중`, `대기`, `완료`, `제외`를 `PROVISIONAL_FOR_SKELETON`으로 사용한다. 자동 전이와 Formula는 금지하며 P2에서 다시 설계한다.

## 예시 Task

| Property | 테스트 값 |
|---|---|
| Task명 | 고유번호증 신청서류 준비 |
| Task ID | `TSK-TEST-001` |
| 상위 업무 | `[TEST] Pilot A 신규 행정` |
| Process ID | `P03` |
| Operational Task ID | `OT-P03-01` |
| Task 상태 | 진행 중 |
| 현재 Actor | 지원팀 |
| 담당자 | 테스트용 표시 |
| 완료조건 | 제출 대상 서류 목록과 준비 상태가 Record에 기록되어 있다. |
| Blocker | 없음 |
