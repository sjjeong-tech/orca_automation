# 지원팀 업무요청 DB — Fast Skeleton 명세

## S1 구축 결과

- Notion DB: [지원팀 업무요청](https://app.notion.com/p/c60e9bc03a214735be082ed54905970d)
- Data source: `collection://454b6ef0-a514-45f3-93bf-edaef2ecaa74`
- 구축 상태: `PARTIAL_WITH_SAFE_CONSTRAINTS`
- Property: 13개
- 기존 `TO DO LIST (FUND)`에는 역방향 Property를 추가하지 않고 `관련 조합` 단방향 Relation만 생성했다.

## Record 정의

특정 조합에 대해 특정 시점에 제출된 하나의 지원팀 행정업무 요청이다. 2차 Form 응답 원문, 확정정보, 서류 위치, 목표일과 특이사항을 보존하며 Task 생성의 Input이 된다.

## S1 Property

| Property명 | 내부 Key | Notion Type | 필수 | 입력 주체 | 생성 시점 | 목적 | 상태 |
|---|---|---|---|---|---|---|---|
| 요청명 | request_name | Title | Required | 요청자/지원팀 | 2차 Form | 요청 식별 | S1_REQUIRED |
| 관련 조합 | related_fund | Relation | Required | 요청자/지원팀 | 2차 Form | FUND Record 연결 | S1_REQUIRED |
| 요청 업무 유형 | request_type | Select | Required | 요청자 | 2차 Form | 업무 범위 | S1_REQUIRED |
| 요청자 | requester | Person | Required | 시스템/요청자 | 2차 Form | 요청 책임 | S1_REQUIRED |
| 담당 관리역 | operations_owner | Person | Required | 요청자 | 2차 Form | 판단 Actor | S1_REQUIRED |
| 요청일 | requested_date | Date | Required | 시스템/요청자 | 2차 Form | 접수 시점 | S1_REQUIRED |
| 목표일 | target_date | Date | Required | 요청자 | 2차 Form | 희망 기한 | S1_REQUIRED |
| 요청 상태 | request_status | Status | Required | 지원팀 | 접수/검수 | 접수·누락 상태 | S1_REQUIRED_PROVISIONAL |
| 원본 폴더 | source_folder | URL | Required | 요청자 | 2차 Form | Drive 원본 위치 | S1_REQUIRED |
| 실물서류 전달 여부 | physical_delivery | Checkbox | Required | 요청자/지원팀 | 2차 Form/수령 | 착수 준비 | S1_REQUIRED |
| 요청 내용 | request_details | Text | Required | 요청자 | 2차 Form | 요청 원문 | S1_REQUIRED |
| 특이사항 | special_notes | Text | Optional | 요청자 | 2차 Form | 조건·주의사항 | S1_OPTIONAL |
| 관련 Task | related_tasks | Relation | Required | 지원팀/시스템 | 접수 후 | 요청 1:N Task | S1_REQUIRED |

Property는 13개다. 조건부 업무 항목, 누락 유형, 승인·자동 생성 Rule은 P2~P4까지 유예한다.

## S1 실제 임시 요청 상태

Notion 도구가 생성한 Status 옵션은 `시작 전`, `진행 중`, `완료`다. 요청 상태의 세부 옵션인 `신규 접수`, `정보 확인 중`, `보완 요청`, `착수 가능`은 CP-05-P2에서 상태 전이와 함께 확정한다. 현재 값은 모두 `PROVISIONAL_FOR_SKELETON`이며 자동 전이는 없다.
