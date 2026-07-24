# Variation Source Index

공식 Source에서 직접 확인되는 차이와 아직 확인되지 않은 후보를 구분한다. `CONFIRMED`는 해당 구분 또는 차이의 존재가 확인됐다는 뜻이며, 상세 적용 규칙까지 자동으로 확정하지 않는다.

| Variation 축 | 구분 | 관련 Process | Source | 근거 수준 | 상태 |
|---|---|---|---|---|---|
| 조합 유형 | 투자기구 유형 분류 | 03 | `N-05-03/5.3/04` | 직접 근거 | CONFIRMED |
| 조합 유형 | 개인투자조합 | 03, 07 | `N-05-03`, `N-05-07` Claude Finding Enrichment | 명칭·착수 확인 경로 | PROVISIONAL |
| 조합 유형 | 벤처투자조합 | 03, 07 | `N-05-03`, `N-05-07` Claude Finding Enrichment | 명칭·착수 확인 경로 | PROVISIONAL |
| 조합 유형 | 신기술투자조합 | 03, 07 | `N-05-03`, `N-05-07` Claude Finding Enrichment | 명칭 존재 | PROVISIONAL |
| 조합 유형 | 신기술투자조합 Trigger·근거자료 | 03 | `N-05-03` Claude Finding Enrichment | 인터뷰 대기 | UNKNOWN |
| 조합 유형 | 민법상조합 | 03, 07 | `N-05-03`, `N-05-07` Claude Finding Enrichment | 명칭·착수 확인 경로 | PROVISIONAL |
| GP 유형 | 개인 GP | 03 | `N-05-03/5.3/04~06` | 직접 근거 | CONFIRMED |
| GP 유형 | 법인 GP | 03 | `N-05-03/5.3/04~06` | 직접 근거 | CONFIRMED |
| GP 유형 | 공동GP | 03, 04 | `N-05-03/5.3/04~06`, `N-05-04/5.4/03` | 직접 근거 | CONFIRMED |
| GP 유형 | 유형별 첨부서류 차이 | 03 | `N-05-03/5.3/04~06` | 상세 목록 부분 근거 | PROVISIONAL |
| GP 유형 | 개인 GP 고유번호증 12종 | 03 | `N-05-03` CASE_ONLY 참고 | 단일 조합·업무 구간 | CASE_ONLY |
| GP 유형 | 개인 GP 계좌개설 17종 | 07 | `N-05-07` CASE_ONLY 참고 | 단일 조합·특정 지점 | CASE_ONLY |
| GP 유형 | 법인 GP 계좌개설 20종 | 07 | `N-05-07` CASE_ONLY 참고 | 단일 조합·특정 지점 | CASE_ONLY |
| GP 유형 | 안전계좌 추가 2종 | 07 | `N-05-07` CASE_ONLY 참고 | GP 공통 수량 아님 | CASE_ONLY |
| 계좌 유형 | 일반계좌 | 07 | `N-05-07/5.7/15` | 직접 근거 | CONFIRMED |
| 계좌 유형 | 안전계좌 | 07 | `N-05-07/5.7/15` | 직접 근거 | CONFIRMED |
| 계좌 유형 | 일반·안전계좌 서류 차이 | 07 | `N-05-07/5.7/15` | 직접 근거 | CONFIRMED |
| 계좌 유형 | 수탁계좌 | 07, 09, 10 | `conflicts/unresolved.md` GAP-04 | 공식 기준 없음 | UNKNOWN |
| 계좌 유형 | 일반계좌 잔액증명서 요청 경로 | 10 | `N-05-10` Claude Finding Enrichment | 경로 존재·세부 Rule 없음 | PROVISIONAL |
| 계좌 유형 | 안전계좌 잔액증명서 요청 경로 | 10 | `N-05-10` Claude Finding Enrichment | 경로 존재·세부 Rule 없음 | PROVISIONAL |
| 계좌 유형 | 수탁·기타 계좌 잔액증명서 요청 경로 | 10 | `N-05-10` Claude Finding Enrichment | 경로 존재·범위 미확정 | PROVISIONAL |
| 기관·처리 방식 | 세무서 | 03, 05, 06 | `N-05-03/5.3/10~15`, `N-05-05/5.5/06`, `N-05-06/5.6/06` | 직접 근거 | CONFIRMED |
| 기관·처리 방식 | 은행 | 07~10 | `N-05-07`, `N-05-08`, `N-05-09/5.9/04`, `N-05-10/5.10/06` | 직접 근거 | CONFIRMED |
| 기관·처리 방식 | 특정 지점 | 07 | `N-05-07/5.7/16,36`, `conflicts/unresolved.md` GAP-05 | 특정 지점만 직접 근거 | PROVISIONAL |
| 기관·처리 방식 | 방문 | 02~10 | `N-05-02/5.2/07`, `N-05-03/5.3/10~15`, `N-05-09/5.9/04`, `N-05-10/5.10/06` | 직접 근거 | CONFIRMED |
| 기관·처리 방식 | 우편 | 02 | `N-05-02/5.2/07` | 직접 근거 | CONFIRMED |
| 기관·처리 방식 | 퀵 | 07, 08 | `N-05-07`, `N-05-08` Claude Finding Enrichment | 채널 존재·선택 기준 없음 | PROVISIONAL |
| 기관·처리 방식 | 이메일·스캔본 | 08 | `N-05-08` Claude Finding Enrichment | 채널 존재·선택 기준 없음 | PROVISIONAL |
| 기관·처리 방식 | 팩스본 | 10 | `N-05-10` Claude Finding Enrichment | 수령 채널 존재·완료 기준 없음 | PROVISIONAL |
| 기관·처리 방식 | 직접 수령 | 03, 07, 09, 10 | 개별 Source의 방문·실물 수령 단계 | 공통 적용 조건 부분 근거 | PROVISIONAL |
| 기관·처리 방식 | 대리·제3자 수령 | 03 | `N-05-03` DV-04, `5.3/14` | 요건 근거 없음 | UNKNOWN |
| 기관·처리 방식 | 전자 수령 | 03~10 | 공식 Source 공통 기준 없음 | 근거 없음 | UNKNOWN |
| 기관·처리 방식 | 실물 수령 | 03, 07, 09, 10 | `N-05-03/5.3/15~16` 및 관련 업무 Source | 직접 근거 | CONFIRMED |

## 집계

| 상태 | 후보 수 |
|---|---:|
| CONFIRMED | 12 |
| PROVISIONAL | 13 |
| UNKNOWN | 4 |
| CASE_ONLY | 4 |
| CONFLICT | 0 |
| 합계 | 33 |

직접 Variation 근거가 확인된 Source Extract는 `N-05-02`, `N-05-03`, `N-05-04`, `N-05-05`, `N-05-06`, `N-05-07`, `N-05-08`, `N-05-09`, `N-05-10`의 9개다. `N-05-00`, `N-06`, `N-08`은 후속 TAP에서 구조와 업무 정의를 교차검증하는 Context Source로 사용한다.
