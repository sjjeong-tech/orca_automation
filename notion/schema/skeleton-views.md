# Realigned Fast Skeleton View 명세

## 기존 TO DO LIST (FUND)

| View | 유형 | 목적 | S1 |
|---|---|---|---|
| 조합 결성 예정 등록 | Form View 후보 | 1차 Form으로 `조합(결성)` Record 생성 | 후보 1개 |

기존 View는 수정하지 않는다.

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
