# Exception Routing Map

| 감지 | 상태 | Actor | Route | 복귀/종료 | Evidence | 경계 |
|---|---|---|---|---|---|---|
| 요청 Input 누락 | RQ-REWORK | ACT-OPS/ACT-MANAGER | 보완 요청 | RQ-REVIEW | EV-SOURCE | HA-02 |
| Task 서류 오류 | TS-REWORK | 원인별 Actor | 수정·재날인 | TS-ACTIVE | EV-PACKAGE | HA-03/06 |
| 기관 추가 요청 | TS-WAIT 또는 TS-REWORK | ACT-EXTERNAL→지원팀 | HA-05 판단 | 기존 Task 또는 P08 | EV-RESPONSE | 기관 사례 일반화 금지 |
| 관리역 확인 | TS-WAIT | ACT-MANAGER | 확인값 수신 | TS-ACTIVE | 확인 기록 | Agent 승인 대체 금지 |
| GP 재요청 | TS-WAIT | ACT-GP | 재날인·자료 요청 | TS-REWORK/ACTIVE | EV-PHYSICAL | HA-06 |
| 수탁 여부 UNKNOWN | TS-WAIT | ACT-MANAGER | 공식 근거 확인 | P07 계속/보류 | EV-SOURCE | 자동 선택 금지 |
| 대리·제3자 수령 | TS-WAIT | ACT-MANAGER | 요건 확인 | 수령 Task 계속 | EV-SOURCE | UNKNOWN 유지 |
| 채널 선택 불명 | TS-WAIT | ACT-MANAGER | 기관 확인 | 제출 Task 계속 | EV-RESPONSE | 방문·퀵·이메일 자동 선택 금지 |
| 결과 오류·재발급 | TS-REWORK 또는 새 Request 후보 | ACT-MANAGER | DP-10 | 승인 경로 | EV-RESULT | 새 Request 기준 확인 필요 |
| 선택 Task 미발생 | TS-CANCEL | 지원팀/관리역 | 처분 사유 기록 | RC-02 허용 | EV-COMPLETE | 단순 삭제 금지 |
