# 지원팀 업무 DB — Fast Skeleton 명세

## Record 정의

지원팀 업무 DB의 한 Record는 **한 조합에서 독립적인 시작조건과 완료조건을 가진 하나의 행정 업무 건**이다. 동일 조합이라도 완료조건이 독립적이면 별도 Record로 분리한다.

Pilot A에서는 `[조합명] — 신규 행정` 한 건 아래에 Process 03, 04, 07, 08의 Operational Task를 연결한다. 조합 Master DB는 AG-05 결정 전 도입하지 않으며 `조합명`은 Text로 둔다.

## 식별·표시 규칙

- 업무명: `[조합명] — [업무 유형]`
- 업무 ID: 사람이 입력하는 `ADM-YYYYMM-SEQ` 형식
- 권장 이유: 조합명 변경과 무관한 안정적 식별자이며 Formula 없이도 중복을 확인할 수 있다.
- 자동 ID 생성: S1 범위 밖
- 실제 민감정보나 실제 조합 정보: 테스트 Record에 사용 금지

## Property 명세

`S1 포함=Optional`은 DB에 생성하되 테스트에서 값이 없어도 되는 항목이다. 임시 상태·분류값은 `PROVISIONAL_FOR_SKELETON`이며 P2~P4에서 재검토한다.

| Property명 | 내부 Key | Notion Type | 필수 여부 | S1 포함 | 입력 주체 | 생성 시점 | 사용 목적 | 후속 단계 | 비고 |
|---|---|---|---|---|---|---|---|---|---|
| 업무명 | work_name | Title | Required | Yes | 지원팀 | Intake | Record 식별·화면 표시 | P4 | `[조합명] — [업무 유형]` |
| 업무 ID | work_id | Text | Required | Yes | 지원팀 | Intake | 안정적 식별·중복 확인 | Post-Pilot | S1 수동 입력 |
| 조합명 | fund_name | Text | Required | Yes | 관리역/지원팀 | Intake | 조합 식별·검색 | Post-Pilot | AG-05 전 Relation 금지 |
| 업무 유형 | work_type | Select | Required | Yes | 관리역/지원팀 | Intake | 업무 분류·View | P3/P4 | Pilot A는 `신규 행정` |
| 조합 유형 | fund_type | Select | Optional | Optional | 관리역/지원팀 | Intake/진행 | Variation 구분 | P3 | 미확정 시 비움 |
| GP 유형 | gp_type | Select | Optional | Optional | 관리역/지원팀 | Intake/진행 | Variation 구분 | P3 | 미확정 시 비움 |
| 계좌 유형 | account_type | Select | Optional | Optional | 관리역/지원팀 | 진행 | 계좌 Variation 구분 | P3 | 일반·안전·수탁 확정 Rule 아님 |
| 담당 관리역 | operations_owner | Person | Required | Yes | 관리역/지원팀 | Intake | 요청·판단 책임자 표시 | P4 | 실제 Person 매핑은 S1 권한 확인 |
| 지원팀 담당자 | support_owner | Person | Required | Yes | 지원팀 | Intake | 실행 담당자·내 업무 View | P4 | 실제 Person 매핑은 S1 권한 확인 |
| 요청일 | requested_date | Date | Required | Yes | 관리역/지원팀 | Intake | 접수 시점·정렬 | P4 |  |
| 목표일 | target_date | Date | Required | Yes | 관리역/지원팀 | Intake/진행 | 우선순위·임박 View | P2 | 기한 Rule은 미확정 |
| 완료일 | completed_date | Date | Optional | No | 지원팀 | 완료 | 완료 소요시간 | P2 | 완료 Gate 설계 후 |
| 현재 단계 | current_stage | Select | Required | Yes | 지원팀 | Intake/진행 | 업무 위치 표시 | P2 | 상태와 분리 |
| 전체 상태 | work_status | Status | Required | Yes | 지원팀 | Intake/진행/완료 | Live State·Filter | P2 | 임시 상태값 |
| 다음 Action | next_action | Text | Required | Yes | 지원팀 | Intake/진행 | 즉시 할 일 표시 | P3 | S1은 Relation 아님 |
| Blocker | blocker | Text | Required | Yes | 지원팀 | 진행 | 정지 원인·Escalation | P2 | 유형화는 P2 |
| 긴급 여부 | urgent | Checkbox | Optional | No | 관리역/지원팀 | Intake/진행 | 우선순위 보조 | P2 | 긴급 기준 승인 전 제외 |
| 관리역 확인 필요 | owner_confirmation_required | Checkbox | Optional | Optional | 지원팀 | 진행 | 확인 대기 가시성 | P2/P4 | 알림 자동화 없음 |
| 확인 요청 대상 | confirmation_target | Person | Optional | No | 지원팀 | 진행 | Mention·알림 대상 | P4 | 협업 모델 전 제외 |
| 확인 요청 내용 | confirmation_request | Text | Optional | No | 지원팀 | 진행 | 판단 요청 문맥 | P4 | 협업 모델 전 제외 |
| 원본 Drive 경로 | source_drive_url | URL | Required | Yes | 관리역/지원팀 | Intake | 원본 위치 연결 | P4 | 실제 파일은 Drive 보관 |
| 결과물 Drive 경로 | result_drive_url | URL | Optional | Optional | 지원팀 | 진행/완료 | 결과 위치 연결 | P2/P4 | 민감값을 Git에 기록하지 않음 |
| 실물서류 수령 여부 | physical_received | Checkbox | Optional | Optional | 지원팀 | Intake/진행 | 착수 준비상태 표시 | P2 | 최소 증빙은 P2 |
| 관련 Task | related_tasks | Relation | Required | Yes | 시스템/지원팀 | Intake/진행 | 업무 1:N Task 연결 | P3 | 양방향 Relation |
| 최근 업데이트 | last_edited_time | Last edited time | Optional | Optional | 시스템 | 업무 진행 | 최신성 확인 | P2/P4 | 자동 계산 내장 Type |
| 비고 | notes | Text | Optional | Optional | 관리역/지원팀 | Intake/진행 | Skeleton 관찰 기록 | P2~P4 | Rule 저장 용도 아님 |

## S1 Required

S1 Required는 14개다. 업무명, 업무 ID, 조합명, 업무 유형, 담당 관리역, 지원팀 담당자, 요청일, 목표일, 현재 단계, 전체 상태, 다음 Action, Blocker, 원본 Drive 경로, 관련 Task다.

## Deferred Property

- P2: 완료일, 긴급 여부, 상태·기한·Blocker·증빙 기준
- P3: Process/Variation 기반 분류와 다음 Action 생성 규칙
- P4: 확인 요청 대상·내용 및 협업 Event
- Post-Pilot: 조합 Master Relation, 자동 ID

## 예시 Record

| Property | 테스트 값 |
|---|---|
| 업무명 | `[TEST] Pilot A 신규 행정` |
| 업무 ID | `ADM-TEST-001` |
| 조합명 | `[TEST] 신규 조합` |
| 업무 유형 | 신규 행정 |
| 현재 단계 | 고유번호증 |
| 전체 상태 | 진행 중 |
| 다음 Action | 고유번호증 신청서류 준비 |
| Blocker | 없음 |
| 담당 관리역 | 테스트용 표시 |
| 지원팀 담당자 | 테스트용 표시 |
| 목표일 | S1 실행일에 정하는 임시 테스트 일자 |
| 원본 Drive 경로 | `TEST_PATH_ONLY` |
