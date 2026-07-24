# Status Transition Matrix

## 요청 상태 전이

| From | To | 허용 | 전이 조건 | Human Gate |
|---|---|---|---|---|
| RQ-NEW | RQ-REVIEW | Yes | 지원팀이 접수·검수를 시작 | 없음 |
| RQ-NEW | RQ-CANCEL | Yes | 중복·철회 사유 승인 | 요청자 또는 관리역 |
| RQ-REVIEW | RQ-REWORK | Yes | 누락 Input 식별 | 지원팀 |
| RQ-REVIEW | RQ-READY | Yes | 착수 필수 Input 검수 통과 | HA-02 |
| RQ-REVIEW | RQ-CANCEL | Yes | 수행 불가·철회 승인 | 관리역 |
| RQ-REWORK | RQ-REVIEW | Yes | 보완 수신 | 지원팀 |
| RQ-REWORK | RQ-CANCEL | Yes | 미보완 종료 승인 | 관리역 |
| RQ-READY | RQ-ACTIVE | Yes | 첫 필수 Task 착수 | 지원팀 |
| RQ-READY | RQ-CANCEL | Yes | 착수 전 취소 승인 | 관리역 |
| RQ-ACTIVE | RQ-REWORK | Yes | 요청 수준 Input 재보완 필요 | 지원팀·관리역 |
| RQ-ACTIVE | RQ-DONE | Yes | 완료 Gate 전부 충족 | HA-08 |
| RQ-ACTIVE | RQ-CANCEL | Yes | 진행 중 중단 승인 | 관리역 |

그 밖의 전이는 금지한다. Terminal 상태 재개는 상태 역전이 아니라 승인된 새 요청 또는 후속 Revision 절차로 처리한다.

## Task 상태 전이

| From | To | 허용 | 전이 조건 | Human Gate |
|---|---|---|---|---|
| TS-TODO | TS-ACTIVE | Yes | 담당자·Input·완료조건 확인 후 착수 | 조건부 |
| TS-TODO | TS-CANCEL | Yes | 선택 Task 제외 또는 요청 취소 승인 | 관리역·지원팀 |
| TS-ACTIVE | TS-WAIT | Yes | 응답 대상·재확인 일자 식별 | 없음 |
| TS-ACTIVE | TS-REWORK | Yes | 오류·누락·추가요청 식별 | 조건부 |
| TS-ACTIVE | TS-DONE | Yes | 완료조건·증빙·승인 충족 | Task별 Gate |
| TS-ACTIVE | TS-CANCEL | Yes | 중단 사유 승인 | 관리역·지원팀 |
| TS-WAIT | TS-ACTIVE | Yes | 필요한 응답 수신 | 지원팀 |
| TS-WAIT | TS-REWORK | Yes | 회신이 추가 보완을 요구 | 조건부 |
| TS-WAIT | TS-CANCEL | Yes | 대기 종료·업무 중단 승인 | 관리역 |
| TS-REWORK | TS-ACTIVE | Yes | 보완본 검수 통과 | 지원팀 |
| TS-REWORK | TS-WAIT | Yes | 보완 요청 후 회신 대기 | 없음 |
| TS-REWORK | TS-CANCEL | Yes | 보완 불가·중단 승인 | 관리역 |

## 전이 검증 규칙

1. 모든 전이는 변경자, 변경 시각, 이전·이후 상태를 감사 가능하게 남긴다.
2. `TS-WAIT`에는 Actor, Blocker, 다음 Action, 목표일이 모두 필요하다.
3. `TS-DONE`에는 완료조건과 해당 Evidence가 필요하다.
4. `RQ-DONE`에는 필수 Task 완료, 선택 Task 처분, 결과 전달, HA-08 승인이 필요하다.
5. Formula·Automation 전이는 Pilot 승인 전 구현하지 않는다.
