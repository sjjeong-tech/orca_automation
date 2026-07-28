# Fund Type to Notion Mapping

| 유형 | Source 상태 | Trigger/Input 차이 | Task 생성 영향 | Approval/Evidence | P3 처리 |
|---|---|---|---|---|---|
| 개인투자조합 | 명칭·착수 경로 PROVISIONAL | 결성계획 승인공문 관련 확인 경로 | P03-T02(Legacy OT-P03-02)에서 확인 항목만 추가 | HA-01, EV-SOURCE | 자동 확정 금지 |
| 벤처투자조합 | 명칭·착수 경로 PROVISIONAL | 핵심정보·유형별 근거자료 확인 경로 | P03-T02(Legacy OT-P03-02)에서 확인 항목만 추가 | HA-01, EV-SOURCE | 구체 문서세트 UNKNOWN |
| 신기술투자조합 | 명칭 PROVISIONAL; Trigger·근거 UNKNOWN | 확인 필요 | 새 Task 자동 생성 금지 | HA-01 | `신기술사업투자조합` 명칭 정규화도 확인 필요 |
| 민법상조합 | 명칭·착수 경로 PROVISIONAL | 핵심정보·법적 근거자료 확인 경로 | P03-T02(Legacy OT-P03-02)에서 확인 항목만 추가 | HA-01, EV-SOURCE | 구체 문서세트 UNKNOWN |

전사 공통 적용 Rule, Actor 차이, 유형별 완료조건은 UNKNOWN이다. `DP-01` 결과는 지원팀 Task의 완료증빙에 판단 근거로 남기되 현재 Schema에 Fund Type Property를 임의 추가하지 않는다.
