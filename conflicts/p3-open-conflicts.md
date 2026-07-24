# P3 Open Conflicts

| ID | 항목 | 근거 | 처리 | P3 차단 | Build 차단 |
|---|---|---|---|---|---|
| P3-C01 | Atomic Task와 Operational Task의 1:1 여부 | Process는 최소 행동, 승인 원칙은 운영 추적 단위 집약 | 모든 Atomic ID를 매핑하되 `operational_task_id`로 집약 | No | No |
| P3-C02 | `신기술투자조합`과 `신기술사업투자조합` 명칭 | 현재 Variation과 TAP 표현 차이 | Canonical 모델 명칭을 유지하고 정규명 확인 필요 | No | 조건부 |
| P3-C03 | Task `관련 조합` Rollup 실제값 | Relation 저장은 검증, Rollup 결과는 미검증 | N-06 `PARTIAL`, J-02 전 안전한 TEST 필수 | No | Yes |
| P3-C04 | P2 상태와 현재 Notion 3상태 | P2 7/6상태 승인, Skeleton은 3상태 | P3 의미 계약은 P2 사용, 실제 옵션 변경은 별도 Build | No | Yes |
| P3-C05 | Form UI 최종 질문·필수값 | Form UI Workstream 미완료 | Interface Contract만 작성, UI 변경 금지 | No | 조건부 |
| P3-C06 | 수탁계좌 정의·적용 기준 | `variations/account-type.md`의 UNKNOWN | 자동 Task 생성 금지, Human 확인 | No | 해당 경로 Yes |
| P3-C07 | 기관·지점별 제출 채널 선택 | 채널 존재 PROVISIONAL, 선택 Rule UNKNOWN/CASE_ONLY | 후보만 표시, 자동 선택 금지 | No | 해당 경로 Yes |

추정으로 해소한 Conflict는 0개다.
