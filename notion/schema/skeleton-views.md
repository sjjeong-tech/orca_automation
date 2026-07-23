# Realigned Fast Skeleton View 명세

## 기존 TO DO LIST (FUND)

| View | 유형 | 목적 | S1 |
|---|---|---|---|
| 조합 결성 예정 등록 | Form View | 실제 `결성(진행)` 범위 Record 생성 | 사용자 생성·View 이름 정렬, UI 조치 필요 |

실제 View명이 `결성(진행)`임을 확인했다. 사용자 생성 Form은 15개 질문을 노출하며 Form 제목은 기존 값이다. 기존 View·Filter는 수정하지 않았고 제출 결과는 미검증이다.

## 지원팀 업무요청 DB

| View | Filter | Sort | 주요 Property | S1 |
|---|---|---|---|---|
| 전체 요청 | 없음 | 요청일 내림차순 | 요청명, 관련 조합, 요청 유형, 상태, 관리역, 목표일 | Required |
| 신규 접수 | 상태=`신규 접수` 또는 `검수 중` | 요청일 오름차순 | 요청명, 관련 조합, 요청자, 상태, 원본 폴더 | Required |
| 정보보완 필요 | 상태=`정보보완 필요` | 목표일 오름차순 | 요청명, 관련 조합, 관리역, 요청 내용, 특이사항 | Required |
| 진행 중 요청 | 상태=`접수 완료` 또는 `진행 중` | 목표일 오름차순 | 요청명, 관련 조합, 상태, 목표일, 관련 Task | Optional |

## 지원팀 Task DB

| View | Filter | Sort | 주요 Property | S1 |
|---|---|---|---|---|
| 전체 Task | 없음 | 상위 요청, Operational Task ID | Task명, 관련 조합, 상위 요청, 상태, 담당자 | Required |
| 내 Task | 담당자=`Me`, 완료·제외 제외 | 목표일 오름차순 | Task명, 관련 조합, 상태, 다음 Action, Blocker | Required |
| 진행 중 | 상태=`진행 중` | 목표일 오름차순 | Task명, 담당자, 다음 Action, 완료조건 | Required |
| 대기·보완 | 상태=`대기` 또는 `보완` | 목표일 오름차순 | Task명, 관련 조합, 담당자, Blocker | Required |
| 완료 전 | 완료·제외 제외 | 목표일 오름차순 | Task명, Process ID, 상태, 담당자, 목표일 | Optional |

요청 DB 최대 4개, Task DB 최대 5개를 넘기지 않는다.

## S1 실제 View

- 업무요청 DB: 기본 View(`전체 요청` 역할), `신규 접수`, `정보보완 필요`, `진행 중 요청` — 표 View 4개
- Task DB: 기본 View(`전체 Task` 역할), `내 Task`, `진행 중`, `대기·보완`, `완료 전` — 표 View 5개
- 업무요청 Form: `지원팀 행정업무 요청` 1개

S1-R1에서도 Filter 적용 요청이 유지되지 않았다. 명명된 View는 표시·정렬용 Skeleton이며 Filter 적용 수는 0이다. 필터와 세부 Status 옵션은 CP-05-P2 승인 또는 사용자 UI 조치 후 확정한다.
