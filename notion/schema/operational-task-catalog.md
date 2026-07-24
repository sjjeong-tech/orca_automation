# Operational Task Status·Evidence Contract

이 문서는 [Operational Task 후보](operational-task-candidates.md)에 P2 상태·증빙 계약을 덧붙인다. 후보 27개를 확정 Template로 승격하지 않는다.

| Task 범주 | 생성 조건 | 시작 상태 | 완료조건 Pattern | 최소 Evidence | 기본 Actor | Human Gate |
|---|---|---|---|---|---|---|
| Intake | 요청·업무 Record 생성 | TS-TODO | 필수 요청정보와 경로가 식별됨 | EV-SOURCE | ACT-OPS/ACT-SUPPORT | HA-01~02 |
| 요청 검수 | 2차 요청 접수 | TS-TODO | 누락 여부와 착수 가능 판정이 기록됨 | EV-SOURCE, EV-COMPLETE | ACT-SUPPORT | HA-02 |
| 서류 준비 | Process 착수 | TS-TODO | 제출 대상 서류가 준비·열람 가능함 | EV-PACKAGE | ACT-SUPPORT | HA-03 |
| 기관 접수·전달 | 제출 세트 검수 통과 | TS-TODO | 기관 수신 또는 접수 사실이 기록됨 | EV-RECEIPT 또는 EV-RESPONSE | ACT-SUPPORT/ACT-EXTERNAL | HA-03 |
| 기관 처리 대기 | 기관 수신 확인 | TS-WAIT | 회신 또는 다음 조치가 식별됨 | EV-RESPONSE | ACT-EXTERNAL | 조건부 HA-05 |
| 결과 수령·저장 | 완료 회신 | TS-TODO | 결과가 저장·열람되고 수신자가 확인함 | EV-RESULT, EV-SCAN, EV-DELIVERY | ACT-SUPPORT | HA-07 |
| 보완 | 누락·기관 추가요청 | TS-REWORK | 보완본 검수와 수신·심사 재개가 기록됨 | EV-RESPONSE, EV-PACKAGE | 원인별 Actor | HA-05~06 |
| 실물 수령·전달 | 실물 대상 발생 | TS-TODO | 실물 보유·수령·전달 상태가 기록됨 | EV-PHYSICAL | ACT-SUPPORT | HA-07 |

P3는 각 `OT-*`에 Process Atomic Task ID, 순서, 집약 근거, 완료조건, Evidence Type, 예외와 Approval ID를 매핑한다.
