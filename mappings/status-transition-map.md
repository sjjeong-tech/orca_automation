# Status Transition Mapping

## Request

| From | To | Process Event | Notion 기록 |
|---|---|---|---|
| RQ-NEW | RQ-REVIEW | 지원팀 검수 착수 | 요청 상태 |
| RQ-REVIEW | RQ-REWORK | 누락 Input 식별 | 상태 + Blocker 성격의 특이사항/Task |
| RQ-REVIEW | RQ-READY | HA-02 통과 | 요청 상태 + 검수 Evidence |
| RQ-READY | RQ-ACTIVE | 첫 필수 Task 착수 | 요청 상태 + 관련 Task |
| RQ-ACTIVE | RQ-REWORK | 요청 수준 재보완 | 요청 상태 + 보완 요청 |
| RQ-ACTIVE | RQ-DONE | RC-01~06·HA-08 | 상태 + 완료 메타데이터 |
| 일반 | RQ-CANCEL | 승인된 중단 | 상태 + 사유·승인자 |

## Task

| From | To | Process Event | Notion 기록 |
|---|---|---|---|
| TS-TODO | TS-ACTIVE | 담당·Input·완료조건 확인 | Task 상태 |
| TS-ACTIVE | TS-WAIT | 응답 대상·재확인일 식별 | 상태 + Actor + Blocker + Next Action |
| TS-ACTIVE | TS-REWORK | 오류·누락·기관 추가요청 | 상태 + 보완 사유 |
| TS-ACTIVE | TS-DONE | 완료조건·Evidence·Gate 충족 | 상태 + 완료증빙 |
| TS-WAIT | TS-ACTIVE | 응답 수신 | 상태 + 응답 Evidence |
| TS-WAIT | TS-REWORK | 응답이 보완 요구 | 상태 + Blocker |
| TS-REWORK | TS-ACTIVE | 보완 검수 통과 | 상태 + 보완본 Evidence |
| TS-REWORK | TS-WAIT | 보완 요청 후 회신 대기 | 상태 + Actor + Next Action |
| 일반 | TS-CANCEL | 선택 Task 제외/중단 승인 | 상태 + 처분 사유 |

이 문서는 P2의 24개 Canonical 허용 전이를 요약 Mapping한다. 전이 자체를 추가·삭제하지 않는다.
