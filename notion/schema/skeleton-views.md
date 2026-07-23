# Fast Skeleton View 명세

View는 실제 화면 검증에 필요한 최소치로 제한한다. 업무 DB 4개, Task DB 5개이며 이 중 각 1개는 Optional이다.

## 지원팀 업무 DB

| View명 | DB | 목적 | Filter | Sort | 표시 Property | 사용 주체 | S1 필수 |
|---|---|---|---|---|---|---|---|
| 전체 업무 | 업무 DB | 전체 Record와 Relation 확인 | 없음 | 목표일 오름차순 | 업무명, 조합명, 업무 유형, 전체 상태, 현재 단계, 지원팀 담당자, 목표일, 다음 Action, Blocker | 관리역·지원팀 | Yes |
| 진행 중 | 업무 DB | 실행 중 업무 집중 | 전체 상태=`진행 중` | 목표일 오름차순 | 업무명, 현재 단계, 지원팀 담당자, 목표일, 다음 Action, Blocker | 지원팀 | Yes |
| 대기·보완 | 업무 DB | 멈춤 원인 확인 | 전체 상태=`대기` 또는 `보완` | 최근 업데이트 내림차순 | 업무명, 전체 상태, 현재 단계, Blocker, 관리역 확인 필요, 지원팀 담당자 | 관리역·지원팀 | Yes |
| 목표일 임박 | 업무 DB | 기한 위험 관찰 | 완료·중단 제외, 목표일 있음 | 목표일 오름차순 | 업무명, 전체 상태, 목표일, 다음 Action, 지원팀 담당자 | 지원팀 | Optional |

`담당자별`은 별도 View를 늘리지 않고 `전체 업무`에서 지원팀 담당자 Group 또는 Filter를 시험한다. 고정 View 필요 여부는 S1 관찰 후 P4에서 판단한다.

## 지원팀 Task DB

| View명 | DB | 목적 | Filter | Sort | 표시 Property | 사용 주체 | S1 필수 |
|---|---|---|---|---|---|---|---|
| 전체 Task | Task DB | Relation과 전체 후보 확인 | 없음 | 상위 업무, Operational Task ID 오름차순 | Task명, 상위 업무, Process ID, Task 상태, 담당자, 목표일, Blocker | 지원팀 | Yes |
| 내 Task | Task DB | 개인 실행 목록 | 담당자=`Me`, 완료·제외 제외 | 목표일 오름차순 | Task명, 상위 업무, Task 상태, 목표일, 완료조건, Blocker | 지원팀 | Yes |
| 진행 중 | Task DB | 현재 수행 항목 확인 | Task 상태=`진행 중` | 목표일 오름차순 | Task명, 상위 업무, 현재 Actor, 담당자, 완료조건, Blocker | 지원팀 | Yes |
| 대기 | Task DB | 대기 원인 확인 | Task 상태=`대기` | 최근 수정 내림차순 또는 목표일 오름차순 | Task명, 상위 업무, 담당자, Blocker, 비고 | 관리역·지원팀 | Yes |
| 완료 전 Task | Task DB | 남은 Task 전체 확인 | Task 상태가 `완료`, `제외`가 아님 | 상위 업무, Operational Task ID 오름차순 | Task명, 상위 업무, Process ID, Task 상태, 담당자, 목표일 | 지원팀 | Optional |

## S1 제약

- Formula, Rollup 기반 Filter는 사용하지 않는다.
- 임시 상태값을 이용한 수동 Filter만 사용한다.
- Person `Me` Filter가 권한 또는 테스트 계정 때문에 동작하지 않으면 `내 Task`만 QA 보류로 기록한다.
- View 증식은 금지하며 추가 요구는 P2~P4 Backlog로 남긴다.
