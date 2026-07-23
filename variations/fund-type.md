# Variation Draft — 조합 유형

## 1. 목적

공식 Source에서 확인되는 투자기구 유형 분류 지점과 잠정 유형 명칭·착수 근거를 구분한다. 개인투자조합·벤처투자조합·신기술투자조합·민법상조합의 명칭 존재는 `PROVISIONAL`, 전사 공통 적용 Rule은 `UNKNOWN`으로 유지한다.

## 2. 적용 대상 Process

- `03-unique-number-application`의 `UN-04`~`UN-06`
- Process 04는 조합 유형별 차이의 직접 근거가 없어 적용 대상으로 확정하지 않는다.

## 3. 공식 Source 범위

- `sources/notion/n-05-03.md`: `5.3/04~06`
- `sources/notion/n-05-07.md`: `5.7/09` 투자 유형 명칭 Enrichment
- `sources/notion/n-06.md`: `6.3`이 N-05-03을 보조한다는 Definition Map
- `sources/notion/n-08.md`: `E2E-03`과 N-05-03의 연결
- `processes/03-unique-number-application.md`: `UN-04`~`UN-06`

`N-06/6.3`과 `N-08/E2E-03`은 구조·연결을 보조한다. 상세 적용조건은 `N-05-03` Enrichment 범위를 넘어 확정하지 않는다.

## 4. 유형별 근거 Matrix

| 조합 유형 | 관련 Process·Task | 확인된 차이 | Source | 상태 | 비고 |
|---|---|---|---|---|---|
| 개인투자조합(개투) | 03 `UN-04`~`UN-06` | 유형 명칭과 결성계획 승인공문 관련 확인 경로가 제시됨 | `N-05-03` Claude Finding Enrichment, `N-05-07/5.7/09` | PROVISIONAL | 세부 조건과 모든 건 적용 여부는 UNKNOWN |
| 벤처투자조합(벤투) | 03 `UN-04`~`UN-06` | 유형 명칭과 핵심정보·유형별 근거자료 확인 경로가 제시됨 | `N-05-03` Claude Finding Enrichment, `N-05-07/5.7/09` | PROVISIONAL | 구체 문서 세트는 UNKNOWN |
| 신기술투자조합(신투) | 03 `UN-04`~`UN-06` | 유형 명칭은 제시되나 Trigger·근거자료는 인터뷰 대기 | `N-05-03` Claude Finding Enrichment, `N-05-07/5.7/09` | PROVISIONAL | 유형명 외 실행 Rule은 UNKNOWN |
| 민법상조합(민법) | 03 `UN-04`~`UN-06` | 유형 명칭과 핵심정보·법적 근거자료 확인 경로가 제시됨 | `N-05-03` Claude Finding Enrichment, `N-05-07/5.7/09` | PROVISIONAL | 구체 문서 세트는 UNKNOWN |

## 5. 기존 Task 적용 차이

| Variation ID | 적용 조건 | 기준 Process·Task | 차이 유형 | 변경 내용 | Source | 상태 |
|---|---|---|---|---|---|---|
| FT-00 | 투자기구 유형을 분류해야 하는 경우 | 03 `UN-04`~`UN-06` | DECISION | `UN-04`에서 유형을 분류하고 `UN-05`~`UN-06`에서 유형별 근거자료·구비서류를 확인하는 분기 지점이 존재한다. 구체 유형값과 분기 결과는 확정하지 않는다. | `N-05-03/5.3/04~06` | CONFIRMED |
| FT-01 | 개인투자조합으로 분류되는 경우 | 03 `UN-04`~`UN-06` | DOCUMENT | 결성계획 승인공문 관련 확인 경로를 적용 후보로 기록한다. 세부 조건은 확정하지 않는다. | `N-05-03` Claude Finding Enrichment | PROVISIONAL |
| FT-02 | 벤처투자조합으로 분류되는 경우 | 03 `UN-04`~`UN-06` | DOCUMENT | 핵심정보와 유형별 근거자료 확인 경로를 적용 후보로 기록한다. 구체 문서 세트는 확정하지 않는다. | `N-05-03` Claude Finding Enrichment | PROVISIONAL |
| FT-03 | 신기술투자조합으로 분류되는 경우 | 03 `UN-04`~`UN-06` 후보 | DECISION | Trigger·근거자료는 인터뷰 완료 전 확정하지 않는다. | `N-05-03` Claude Finding Enrichment | UNKNOWN |
| FT-04 | 민법상조합으로 분류되는 경우 | 03 `UN-04`~`UN-06` | DOCUMENT | 핵심정보와 법적 근거자료 확인 경로를 적용 후보로 기록한다. 구체 문서 세트는 확정하지 않는다. | `N-05-03` Claude Finding Enrichment | PROVISIONAL |

## 6. Input 차이

- `UN-04`의 공통 Input이 조합·GP 정보라는 사실만 확인된다.
- 개인투자조합·벤처투자조합·민법상조합의 확인 Input 카테고리는 `PROVISIONAL`이며, 구체 필드와 신기술투자조합 Input은 `UNKNOWN`이다.

## 7. 문서 차이

- `UN-05`에서 유형별 승인공문 또는 근거자료를 확인하고 `UN-06`에서 신청 구비서류를 확인한다.
- 개인투자조합의 승인공문 관련 확인, 벤처투자조합·민법상조합의 근거자료 카테고리는 `PROVISIONAL`이다.
- 구체 서류 세트, 필수 여부, 발급 주체와 신기술투자조합 근거자료는 `UNKNOWN`이다.

## 8. Decision 차이

- 유형 분류 Decision의 존재는 `CONFIRMED`다.
- 네 유형의 명칭은 `PROVISIONAL`이지만 판별 조건, 판단 우선순위, 복수 유형 가능 여부는 `UNKNOWN`이다.

## 9. Actor 차이

- `UN-04`~`UN-06`의 기존 Actor는 지원팀이다.
- 조합 유형별로 담당 관리역·GP·기관의 책임이 달라진다는 직접 근거가 없어 Actor 차이는 `UNKNOWN`이다.

## 10. 완료조건 차이

- 공통 Task의 완료 관찰값은 유형 판단 결과, 근거자료 확인 결과, 누락 서류와 보완 주체의 식별이다.
- 조합 유형별 별도 완료조건은 확인되지 않아 `UNKNOWN`이다.

## 11. 유형별 Trigger

- 개인투자조합·벤처투자조합·민법상조합의 착수 확인 경로는 `PROVISIONAL`이다.
- 신기술투자조합 Trigger는 `UNKNOWN`이며 공통 Trigger를 유형별 Rule로 재작성하지 않는다.

## 12. 적용·제외 Task

- 직접 Source가 있는 ADD 또는 EXCLUDE 차이는 0건이다.
- `UN-04`~`UN-06`은 공통 Process의 기존 Task이며 Variation에서 새로 추가하거나 제외하지 않는다.

## 13. UNKNOWN

- 네 유형의 공식 정의와 판별 기준
- 유형별 승인공문·근거자료·구비서류 목록
- 유형별 Actor 또는 승인 책임 차이
- 유형별 예외·보완·복귀 차이
- 유형별 Trigger, Output, 업무 완료와 후속 완수 차이

## 14. 인터뷰·CASE 검증 필요항목

- 네 조합 유형을 공식적으로 구분하는 필드와 근거 문서는 무엇인가.
- `UN-05`의 승인공문 또는 근거자료가 유형별로 어떻게 달라지는가.
- `UN-06`의 신청 구비서류가 유형별로 어떻게 달라지는가.
- 유형별 판단 주체와 예외 승인 주체가 다른가.
- 특정 유형에서 적용 또는 제외되는 기존 Task가 있는가.

CASE 답변은 Evidence로 기록하되 추가 공식 Source에서 검증되기 전에는 공통 Variation Rule로 확정하지 않는다.

## 15. 상태

- Draft 상태: `DRAFT`
- CONFIRMED: 투자기구 유형 분류와 유형별 자료 확인 지점의 존재
- PROVISIONAL: 네 유형 명칭, 개인투자조합·벤처투자조합·민법상조합의 착수 근거 카테고리
- UNKNOWN: 전사 공통 적용 Rule, 구체 서류 세트, 신기술투자조합 Trigger·근거자료
- CONFLICT: 없음
- Source 없는 신규 Rule: 0건
- 새 Process Task: 0건
