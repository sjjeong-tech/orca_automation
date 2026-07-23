# Variation Draft — GP 유형

## 1. 목적

개인 GP·법인 GP·공동 GP 구분과 기존 Process Task에 미치는 차이를 공식 Source 범위에서만 기록한다. 유형 구분의 존재와 상세 첨부서류 세트의 확정 여부를 분리한다.

## 2. 적용 대상 Process

- `03-unique-number-application`: `UN-04`~`UN-06`
- `04-security-card-hometax`: `SC-01`~`SC-02`

## 3. 공식 Source 범위

- `sources/notion/n-05-03.md`: `5.3/04~06`, `DV-01`
- `sources/notion/n-05-04.md`: `5.4/03~04`
- `sources/notion/n-06.md`: `6.3`, `6.4` Definition Map
- `sources/notion/n-08.md`: `E2E-03`, `E2E-04`
- `processes/03-unique-number-application.md`: `UN-04`~`UN-06`
- `processes/04-security-card-hometax.md`: `SC-01`~`SC-02`

## 4. GP 유형별 근거 Matrix

| GP 유형 | 관련 Process·Task | 확인된 차이 | Source | 상태 | 비고 |
|---|---|---|---|---|---|
| 개인 GP | 03 `UN-04`~`UN-06` | GP 유형으로 분류하고 유형별 첨부서류를 적용하는 분기가 존재 | `N-05-03/5.3/04~06`, `DV-01` | CONFIRMED | 상세 서류 목록은 미확정 |
| 법인 GP | 03 `UN-04`~`UN-06` | GP 유형으로 분류하고 유형별 첨부서류를 적용하는 분기가 존재 | `N-05-03/5.3/04~06`, `DV-01` | CONFIRMED | 상세 서류 목록은 미확정 |
| 공동 GP | 03 `UN-04`~`UN-06`; 04 `SC-01`~`SC-02` | 공동GP 여부 확인과 적용 가능한 GP 첨부서류 준비 단계가 존재 | `N-05-03/5.3/04~06`, `N-05-04/5.4/03~04` | CONFIRMED | 모든 Process의 별도 절차라는 의미는 아님 |

## 5. 기존 Task 적용 차이

| Variation ID | 적용 조건 | 기준 Process·Task | 차이 유형 | 변경 내용 | Source | 상태 |
|---|---|---|---|---|---|---|
| GP-01 | 개인 GP로 식별 | 03 `UN-04` | DECISION | 개인 GP 분기로 식별한다. 이후 기존 `UN-05`~`UN-06`에서 적용 자료를 확인한다. | `N-05-03/5.3/04~06`, `DV-01` | CONFIRMED |
| GP-02 | 법인 GP로 식별 | 03 `UN-04` | DECISION | 법인 GP 분기로 식별한다. 이후 기존 `UN-05`~`UN-06`에서 적용 자료를 확인한다. | `N-05-03/5.3/04~06`, `DV-01` | CONFIRMED |
| GP-03 | 공동 GP로 식별 | 03 `UN-04` | DECISION | 공동GP 여부를 함께 식별하고 기존 `UN-05`~`UN-06`에서 적용 자료를 확인한다. | `N-05-03/5.3/04~06`, `DV-01` | CONFIRMED |
| GP-04 | 개인 GP | 03 `UN-05`~`UN-06` | DOCUMENT | 개인 GP에 적용할 첨부서류를 확인하되 상세 서류 세트는 확정하지 않는다. | `N-05-03/5.3/04~06` | PROVISIONAL |
| GP-05 | 법인 GP | 03 `UN-05`~`UN-06` | DOCUMENT | 법인 GP에 적용할 첨부서류를 확인하되 상세 서류 세트는 확정하지 않는다. | `N-05-03/5.3/04~06` | PROVISIONAL |
| GP-06 | 공동 GP | 03 `UN-05`~`UN-06`; 04 `SC-02` | DOCUMENT | 공동GP에 적용 가능한 첨부서류를 확인·준비하되 상세 서류 세트는 확정하지 않는다. | `N-05-03/5.3/04~06`, `N-05-04/5.4/03~04` | PROVISIONAL |
| GP-07 | Process 04 착수 대상 | 04 `SC-01`~`SC-02` | DECISION | 공동GP 여부를 확인하고 기존 `SC-02`에서 적용 가능한 GP 첨부서류를 준비한다. | `N-05-04/5.4/03~04` | CONFIRMED |
| GP-08 | GP 유형별 Exception 차이 | 03 `UN-04`~`UN-06`; 04 `SC-01`~`SC-02` 후보 | EXCEPTION | 유형별 별도 예외·복귀 차이 확인 필요 | 지정 공식 Source 내 직접 근거 없음 | UNKNOWN |

## 6. Input 차이

- 03의 공통 Input은 조합·GP 정보, 유형 판단 결과, 근거자료, 신청서와 첨부서류다.
- 04는 공동GP 여부와 적용 가능한 GP 첨부서류를 확인한다.
- 개인·법인·공동GP별 정확한 Input 필드와 문서 목록은 `PROVISIONAL` 또는 `UNKNOWN`이다.

## 7. 첨부서류 차이

- GP 유형별로 첨부서류를 달리 적용하는 분기의 존재는 `CONFIRMED`다.
- `N-05-04/5.4/03~04`는 공동GP 여부 확인과 GP 첨부서류 준비 단계를 직접 지원한다.
- 유형별 전체 필수서류 세트, 발급 시점, 유효기간, 원본·사본 기준은 확인되지 않아 확정하지 않는다.

## 8. Decision 차이

- 03 `UN-04`: 개인·법인·공동GP 유형 및 공동GP 여부를 식별한다. — `CONFIRMED`
- 04 `SC-01`: 공동GP 여부를 확인한다. — `CONFIRMED`
- 유형 판별에 필요한 공식 필드와 애매한 경우의 판단 주체는 `UNKNOWN`이다.

## 9. Actor 차이

- 기존 Process에서 03 `UN-04`~`UN-06`과 04 `SC-01`~`SC-02`의 Actor는 지원팀이다.
- GP 유형별로 담당 관리역·GP·기관의 책임이 달라진다는 추가 근거는 없어 새 Actor를 배정하지 않는다.

## 10. 완료조건 차이

- 03: 적용할 서류 분기, 근거자료 확인 결과, 누락 서류와 보완 주체가 식별된 상태를 사용한다.
- 04: 공동GP 여부와 적용 가능한 첨부서류 파일의 존재·열람 가능 여부가 기록된 상태를 사용한다.
- GP 유형별 별도 완료조건은 공식 Source에서 확인되지 않아 `UNKNOWN`이다.

## 11. 적용·제외 Task

- 직접 Source가 있는 ADD 또는 EXCLUDE 차이는 0건이다.
- `UN-04`~`UN-06`, `SC-01`~`SC-02`는 기존 Task를 조건에 맞게 적용할 뿐 새 Task가 아니다.
- 공동GP라는 이유만으로 다른 Process Task를 추가하거나 제외하지 않는다.

## 12. Exception·보완 차이

- N-05-03은 날인·조합정보·공동GP 서류 오류에 대한 보완 흐름의 존재를 지원한다.
- 개인·법인·공동GP별 감지 조건, 대응 주체, 수정 문서, 복귀 Task가 서로 다르다는 직접 근거는 없다.
- 따라서 유형별 Exception 차이는 `UNKNOWN`이며 기존 Process의 공통 Exception을 재작성하지 않는다.

## 13. UNKNOWN

- 개인·법인·공동GP별 전체 첨부서류 목록
- 유형 판별의 공식 필드와 판단이 애매할 때의 승인 주체
- GP 유형별 Trigger, Output, 완료조건 차이
- GP 유형별 Exception·보완·복귀 차이
- 공동GP가 Process 03·04 외 다른 Process에 미치는 차이

## 14. 인터뷰·CASE 검증 필요항목

- 개인·법인·공동GP별 공식 필수서류 목록과 근거 문서는 무엇인가.
- 공동GP일 때 각 GP의 서류를 모두 준비하는지, 별도 판단 기준이 있는가.
- GP 유형 판별값은 어디에서 확인하며 누가 최종 판단하는가.
- 유형별 누락·오류의 보완 요청 대상과 복귀 Task가 다른가.
- Process 04에서 개인·법인 GP와 공동GP의 첨부서류 차이는 무엇인가.

CASE 답변은 Evidence로만 사용하고 추가 공식 Source 확인 전에는 공통 Rule로 확정하지 않는다.

## 15. 상태

- Draft 상태: `DRAFT`
- CONFIRMED: 개인·법인·공동GP 구분, 유형별 첨부서류 분기 존재, 공동GP 여부 확인
- PROVISIONAL: 개인·법인·공동GP별 상세 첨부서류 적용 내용
- UNKNOWN: 유형별 전체 서류 세트, Actor·Trigger·완료조건·Exception 차이
- CONFLICT: 없음
- Source 없는 신규 Rule: 0건
- 새 Process Task: 0건
