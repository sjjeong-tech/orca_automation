# Variation Integration QA

## 1. 판정

`CP-04_COMPLETE_WITH_KNOWN_GAPS`

As-Is Process Model v1의 네 Variation 축과 관련 Process 연결은 후속 Gap 해소 단계의 입력으로 사용할 수 있다. 차단 상태 오류, 근거 없는 `CONFIRMED` 승격, `CASE_ONLY` 일반화는 발견되지 않았다. 남은 불확실성은 `PROVISIONAL`, `UNKNOWN`, `CASE_ONLY` 또는 Backlog로 분리되어 있다.

## 2. QA 범위와 집계 기준

- Variation: `fund-type`, `gp-type`, `account-type`, `institution`
- Process: 03, 05, 07, 08, 09, 10
- 교차검증 Process: 00, 04, 06, 11
- Source: N-05-03, N-05-05, N-05-07, N-05-08, N-05-09, N-05-10, N-08
- Mapping·Finding: `variation-source-index`, `variation-finding-disposition`, unresolved Gap 및 기존 Process QA 3종
- 상태 집계의 공식 기준은 `mappings/variation-source-index.md`의 33개 근거 항목이다.
- Variation 문서의 `FT/GP/AT/IV` Rule ID는 별도 모델 계층으로 집계한다. Source Index와 단순 합산하지 않는다.

## 3. Source-State 정합성

| 검사 | 결과 | 근거 |
|---|---|---|
| Source `PROVISIONAL`의 Model 승격 | PASS | 관련 Model은 `PROVISIONAL` 또는 `UNKNOWN` 유지 |
| Source `UNKNOWN` 유지 | PASS | 신투 Trigger, 채널 선택, 수령 요건, Actor·시스템 기준 미승격 |
| CASE 일반화 | PASS | GP 수량 4건과 특정 지점 사례가 `CASE_ONLY`로 분리됨 |
| Source 추적성 | PASS | Variation은 Repo Source ID를 참조하고 7개 보강 Source에 Notion URL 존재 |
| Claude Finding의 공식 Source 오인 | PASS | Finding은 감사 이력이며 공식 근거는 N-05 Source Extract로 연결 |
| 상태 불일치 | PASS | 차단 오류 유형 0건 |

`STATE_ESCALATION`, `SOURCE_MISSING`, `CASE_GENERALIZATION`, `TRACEABILITY_GAP`, `STATUS_MISMATCH`는 모두 0건이다.

## 4. 축별 Variation QA

### 4.1 Source Index 상태 집계

| 축 | CONFIRMED | PROVISIONAL | UNKNOWN | CASE_ONLY | CONFLICT | 합계 |
|---|---:|---:|---:|---:|---:|---:|
| 조합 유형 | 1 | 4 | 1 | 0 | 0 | 6 |
| GP 유형 | 3 | 1 | 0 | 4 | 0 | 8 |
| 계좌 유형 | 3 | 3 | 1 | 0 | 0 | 7 |
| 기관·처리 방식 | 5 | 5 | 2 | 0 | 0 | 12 |
| **합계** | **12** | **13** | **4** | **4** | **0** | **33** |

### 4.2 Variation Rule ID 보조 집계

| 문서 | CONFIRMED | PROVISIONAL | UNKNOWN | CONFLICT | Rule ID 합계 |
|---|---:|---:|---:|---:|---:|
| fund-type | 1 | 3 | 1 | 0 | 5 |
| gp-type | 4 | 3 | 1 | 0 | 8 |
| account-type | 4 | 5 | 6 | 0 | 15 |
| institution | 5 | 6 | 4 | 0 | 15 |
| **합계** | **14** | **17** | **12** | **0** | **43** |

GP 서류 수량 12종·17종·20종·안전계좌 추가 2종은 Rule ID가 아니라 `CASE_ONLY` 증거 주석 4건이다.

### 4.3 경계 검사

- fund-type: 조합 유형만 다루며 신기술투자조합 Trigger·근거자료는 `UNKNOWN`이다.
- gp-type: 유형과 단일 사례 수량을 분리했으며 수량을 표준 서류 세트로 사용하지 않는다.
- account-type: 잔액증명서 유형별 경로의 존재는 `PROVISIONAL`, 세부 Actor·시스템·선택 Rule은 `UNKNOWN`이다. 오픈플랫폼팀은 후보 Actor다.
- institution: 채널 존재와 선택 기준을 분리했다. 특정 지점 사례는 일반화하지 않았고 농협·농협 외 구분, 대리·제3자 수령 요건은 `UNKNOWN`이다.

## 5. Process 연결 QA

| Process | 검사 결과 | 판정 |
|---|---|---|
| 05 고유번호증 정정 | 6개 정정 사유는 비폐쇄 `PROVISIONAL`; 하위 경로의 조건·Actor·복귀점은 `UNKNOWN`; 자동 선택 Rule 없음 | PASS WITH GAPS |
| 09 계좌해지 | 지원팀 수행은 `CASE_SUPPORTED DRAFT`; 표준 Actor `UNKNOWN`; GP 직접·기타 Actor는 후보; `NOT_READY_MISSING_RULE` 유지 | PASS WITH GAPS |
| 10 잔액증명서 | 계좌 유형 경로와 스캔본·팩스본 채널은 `PROVISIONAL`; 원본 후속과 Actor·시스템·선택 기준은 `UNKNOWN` | PASS WITH GAPS |
| 07 ↔ 08 | 보완 요청과 AO-12 복귀 Interface 유지, V1-R2 영향 없음 | PASS |
| 06 ↔ 09 | 직접 인계와 선후관계 `UNKNOWN` 유지 | PASS |
| 11 결과 인계 | Coverage 0/7, `DRAFT`; 완료 Process나 확정 Interface로 사용하지 않음 | PASS WITH KNOWN GAP |

V1-R2 전후 Process 05·09·10의 Atomic Task, Decision ID, Exception ID 개수는 변하지 않았다. 신규 Process Task 0건, 신규 Decision 0건, 신규 Exception 0건이며 Source 없는 복귀점도 추가되지 않았다.

## 6. Finding 반영 QA

| Finding | 반영 위치 | 결과 |
|---|---|---|
| GAP-REG-01 | AT-12~AT-14, BC-01~BC-09, Source Index | APPLIED / VERIFIED |
| GAP-REG-02 | IV-06~IV-08·IV-14, BC-07~BC-09, Source Index | APPLIED / VERIFIED |
| GAP-REG-09 | account-type Actor 경계, Source Index | APPLIED / VERIFIED |
| GAP-R2-01 | FT-01~FT-04, Source Index | APPLIED / VERIFIED |
| GAP-R2-02 | Process 05 R-5·UC-02 | APPLIED / VERIFIED |
| GAP-R2-03 | Process 05 UC-D03·UC-EX03~04 | APPLIED / VERIFIED |
| GAP-R2-04 | Process 09 Scope Limitation·AC-01~08, account-type | APPLIED / VERIFIED |

승인 Finding 반영 완료는 7/7이다. `KEEP_UNKNOWN`, `CASE_ONLY`, `DEFER_BACKLOG` 결정은 유지된다.

## 7. Process 영향과 Backlog 집계

| 항목 | 수 | 집계 기준 |
|---|---:|---|
| V1-R2 수정 Process | 3 | Process 05, 09, 10 |
| 신규 Task | 0 | V1-R2 전후 ID 비교 |
| 신규 Decision | 0 | V1-R2 전후 ID 비교 |
| 신규 Exception | 0 | V1-R2 전후 ID 비교 |
| Actor Gap | 3 | 오픈플랫폼팀 표준책임, 계좌해지 표준 Actor, Process 11 공통 Actor |
| 자동화 차단 Gap | 6 | 신투 Trigger, 채널 선택, 제3자 수령, 수탁계좌 기준, 계좌해지 Actor, Process 11 종료 정의 |
| 인터뷰 필요 항목군 | 8 | Known Gap 중 운영자 판단이 필요한 질문군 |
| 추가 CASE 필요 항목군 | 4 | GP 서류, 지점 차이, 계좌해지 Actor, 기관·채널 적용 |
| Source 재작업 Backlog | 2 | SIC-09, GAP-REG-03 |
| 미검토 Notion·Audit Backlog | 4 | 관리역 인터뷰 v1, AI Cross-check, REC_S3_01, 재시연 잔여 구간 |

## 8. Findings

### Blocking

없음.

### Non-blocking

1. 신기술투자조합 Trigger·근거자료
2. 방문·퀵·메일·팩스 등 채널 선택 기준
3. 대리·제3자 수령 요건
4. 계좌해지 표준 수행주체
5. 폐업·청산과 계좌해지 선후관계
6. 수탁계좌 정의·적용 기준
7. 기관·지점별 서류 차이
8. 인터뷰 V2 미착수
9. 독립 CASE 부족
10. Process 11 공통 의미와 최종 종결 정의

## 9. 최종 판정

`CP-04_COMPLETE_WITH_KNOWN_GAPS`

- Blocking 상태 오류: 0
- Unsupported `CONFIRMED` Rule: 0
- `CASE_ONLY` 일반화: 0
- 승인 Finding: 7/7 검증 완료
- Variation 4축: 존재 및 Source 추적 가능
- Process 11: `DRAFT`로 명시

**As-Is Process Model v1 — COMPLETE WITH KNOWN GAPS**
