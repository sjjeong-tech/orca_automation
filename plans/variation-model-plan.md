# Variation Model 사전설계

## 1. 목적

Variation Model은 12개 Process Model의 공통 흐름을 다시 작성하지 않고, 공식 Source에서 확인되는 조건별 차이만 분리해 표현한다. 사례 한 건이나 업무 상식만으로 공통 Variation Rule을 확정하지 않으며, 근거가 부족한 항목은 `PROVISIONAL`, `UNKNOWN`, `CONFLICT`로 유지한다.

## 2. Process Model과의 관계

- Process Model은 공통 업무 흐름과 Task ID의 기준이다.
- Variation Model은 기존 Task를 참조해 조건별 적용 차이를 기술한다.
- Variation 때문에 새로운 Process Task를 만들지 않는다.
- Source에 직접 근거가 없는 선후관계나 책임 배정은 추가하지 않는다.
- CASE는 Evidence로만 사용하며 단일 CASE를 공통 Variation으로 승격하지 않는다.

## 3. Variation 적용 단위

| 적용 단위 | 정의 | 작성 기준 |
|---|---|---|
| 추가 Task | 특정 조건에서 기존 Process Task가 추가 적용되는 차이 | 기존 Task ID와 직접 Source가 모두 있을 때만 등록 |
| 제외 Task | 특정 조건에서 기존 Process Task가 적용되지 않는 차이 | Source가 제외 조건을 직접 명시할 때만 등록 |
| Input 차이 | 유형별 필수 정보·서류·요청 입력 차이 | 서류명이나 입력 조건이 Source에서 확인되어야 함 |
| Output 차이 | 결과물·접수 결과·수령물 차이 | 관찰 가능한 Output과 Source를 함께 기록 |
| Decision 차이 | 유형별 판단 조건 또는 분기 차이 | 판단 주체·조건·분기 중 부족한 값은 `UNKNOWN` |
| 문서 차이 | 첨부서류·양식·제출본 구성 차이 | 단순 후보와 확정 서류 세트를 구분 |
| Actor 차이 | 수행·확인·인계 주체 차이 | Source에 없는 RACI 배정 금지 |
| 완료조건 차이 | 유형별 업무 완료 또는 후속 완수 차이 | 관찰 가능한 상태가 직접 확인될 때만 등록 |

## 4. 축별 현재 근거 수준

| Variation 축 | 현재 근거 | 근거 수준 | 설계 판단 |
|---|---|---|---|
| 조합 유형 | 고유번호증 신청 Source에 투자기구 유형 분류 단계가 존재 | 부분 | 개투·벤투·신투·민법의 개별 명칭과 차이는 `UNKNOWN` |
| GP 유형 | 개인·법인·공동GP 구분과 유형별 첨부서류 적용 단계가 존재 | 충분/부분 | 유형 구분은 `CONFIRMED`, 상세 서류 차이는 `PROVISIONAL` |
| 계좌 유형 | 일반·안전계좌 구분 및 서류 차이 확인 단계가 존재 | 충분/부분 | 두 유형과 차이 확인은 후보 등록, 상세 기준은 후속 검증 |
| 수탁계좌 | 공식 Source에서 공통 적용 기준을 확인하지 못함 | 없음 | `UNKNOWN`; Variation Rule 확정 금지 |
| 기관·처리 방식 | 세무서·은행·특정 지점·방문·우편·실물 수령 사례가 공식 Source에 존재 | 충분/부분 | 직접 확인된 방식만 후보 등록하고 일반화는 제한 |
| 퀵·메일·팩스·대리·전자 수령 | 공통 적용 조건을 공식 Source에서 확인하지 못함 | 없음 | `UNKNOWN` |

상세 Source와 상태는 [variation-source-index.md](../mappings/variation-source-index.md)를 기준으로 한다.

## 5. 주요 UNKNOWN

- 개투·벤투·신투·민법 각각의 공식 Source 정의와 Process 차이
- 조합 유형별 Trigger, 제출서류, Actor, 완료조건 차이
- GP 유형별 정확한 첨부서류 세트와 예외 조건
- 일반·안전계좌의 상세 구분 기준과 전체 서류 차이
- 수탁계좌 적용 대상, 수행 주체, 제출·완료 기준
- 지점별 차이를 공통 기관 Variation으로 승격할 수 있는 범위
- 퀵·메일·팩스의 적용 조건과 수신 확인 기준
- 대리 또는 제3자 수령 요건
- 전자 수령과 실물 수령의 선택 조건 및 최종 완료 기준

## 6. Process 11 제외 원칙

`processes/11-result-handover.md`는 독립 공식 Source가 없는 Derived Process이고 현재 Source Coverage가 부족한 DRAFT다. 따라서 Process 11의 Task, Interface, 종료조건은 Variation Rule의 근거로 사용하지 않는다.

다른 공식 Source와 원 Process Task에서 직접 확인되는 저장·전달·수신·실물관리 차이는 해당 원 Source를 근거로만 검토한다. Process 11은 향후 통합 QA에서 Variation 결과와의 정합성을 확인할 수 있으나, 후보의 상태를 `CONFIRMED`로 승격하는 근거가 될 수 없다.

## 7. 실행 경계

- 이번 계획은 Variation 후보와 작업분할만 정의한다.
- Process 및 Source 원본은 수정하지 않는다.
- Variation 구현은 `V1-A`, `V1-B`, `V1-C`에서 각각 수행한다.
- 독립 Source Review와 Findings 반영 후 `V1-I`에서 통합 판정한다.
- 미확정 Interface는 Variation Rule의 근거로 사용하지 않는다.
