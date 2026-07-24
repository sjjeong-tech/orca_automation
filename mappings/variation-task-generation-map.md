# Variation Task Generation Map

| 축 | 확인된 분기 | 생성/변경 가능한 운영 Task | 금지 | 상태 |
|---|---|---|---|---|
| Fund | UN-04~06 유형·근거 확인 | OT-P03-02의 체크 항목 조건부 확장 | 신기술 Trigger 자동 생성 | PROVISIONAL/UNKNOWN |
| GP | 개인·법인·공동 GP 분기 존재 | OT-P03-02, OT-P04-01의 서류 확인 항목 | 12·17·20·+2종 표준화 | CONFIRMED 분기, 상세 PROVISIONAL/CASE_ONLY |
| Account | 일반·안전 명칭과 서류 차이 확인 지점 | OT-P07-01/02 체크 항목 | 수탁 자동 분류·Task 생성 | CONFIRMED 지점, 상세 UNKNOWN |
| Institution | 세무서·은행 단계 존재 | 기존 접수·대기·보완 OT만 사용 | 채널 자동 선택, 지점 사례 일반화 | CONFIRMED/PROVISIONAL/UNKNOWN |

### GP CASE_ONLY

12종, 17종, 20종, 안전계좌 +2종은 단일 사례 참고다. Task 수·서류 수·완료조건을 생성하는 Rule로 사용하지 않는다.

### 계좌

- 일반·안전계좌는 `DP-04 + HA-04` 후 동일 P07 Task 골격 안에서 서류 체크 항목을 달리한다.
- 수탁계좌 또는 수탁 연계는 `DP-05=UNKNOWN`이면 `TS-WAIT + ACT-MANAGER + Blocker`로 중지한다.
- 오픈플랫폼팀은 후보 Actor이며 표준 책임 주체가 아니다.
