# Variation Finding Disposition

## 1. 목적과 판정 원칙

Claude Source Coverage Audit 1차·R2 Finding에 대한 GPT 승인 범위와 Codex 반영 결정을 기록한다. Source Enrichment와 다음 Model Revision을 분리하며 단일 CASE는 공통 Rule로 승격하지 않는다.

참조 Audit:

- `bab8b087233993a574ab381c19ccae9105007278`
- `ebadf27829f2a9adff389daf54ff6d9c7631ab67`

## 2. Finding 결정

| Finding | 결정 | 반영 위치 | 상태 | 사유 | 후속 TAP |
|---|---|---|---|---|---|
| SIC-01 | ACCEPT_SOURCE | `n-05-07.md` | PROVISIONAL | 투자 유형 4종 명칭 존재를 반입하되 적용 Rule은 미확정 | V1-R2 |
| SIC-02 | ACCEPT_SOURCE | `n-05-07.md` | PROVISIONAL | 방문·퀵 채널 존재와 선택 기준을 분리 | V1-R2 |
| SIC-03 | ACCEPT_SOURCE | `n-05-08.md` | PROVISIONAL | 이메일·스캔본, 퀵·원본 옵션 존재 반입 | V1-R2 |
| SIC-04 | ACCEPT_SOURCE | `n-05-10.md` | PROVISIONAL | 팩스·계좌 유형 경로를 추가 검증 필요 상태로 반입 | V1-R2 |
| SIC-05 | ACCEPT_SOURCE | `n-05-03.md` | PROVISIONAL/UNKNOWN | 유형별 착수 근거를 반입하고 신투는 UNKNOWN 유지 | V1-R2 |
| SIC-06 | KEEP_UNKNOWN | 보고서 기록 | UNKNOWN | 농협·농협 외 구분은 승인된 Enrichment 범위를 넘어 세부 Rule이 부족 | V1-R2 |
| SIC-07 | ACCEPT_SOURCE | `n-05-07.md` | PROVISIONAL | 오픈플랫폼팀을 후보 Actor로만 반입 | V1-R2 |
| SIC-08 | ACCEPT_SOURCE | `n-05-07.md` | PROVISIONAL | 내부 요청 유효기간 후보이며 법적·은행 공통 기준 아님 | V1-R2 |
| SIC-09 | DEFER_BACKLOG | 보고서 Backlog | OPEN | Source Extract 전체 템플릿 재작업은 별도 범위 | 별도 Source TAP |
| SIC-10 | ACCEPT_SOURCE | `n-08.md` | PROVISIONAL | E2E 상세 페이지 존재와 요약 한계를 기록 | V1-R2 |
| GAP-REG-01 | ACCEPT_MODEL_NEXT | `account-type.md` 예정 | OPEN | Process 10 계좌 유형 경로의 Source가 보강됨 | V1-R2 |
| GAP-REG-02 | ACCEPT_MODEL_NEXT | `institution.md` 예정 | OPEN | 채널 존재는 잠정 반영하고 선택 기준은 UNKNOWN 유지 | V1-R2 |
| GAP-REG-03 | DEFER_BACKLOG | 보고서 Backlog | OPEN | 전체 Source Extract 재작업은 별도 계획 필요 | 별도 Source TAP |
| GAP-REG-04 | CASE_ONLY | 보고서·Source CASE 참고 | CASE_ONLY | 단일 조합·지점의 서류 수치 | 추가 CASE |
| GAP-REG-05 | CASE_ONLY | `n-05-07.md` CASE 참고 | CASE_ONLY | 특정 지점 1건의 서류·채널·기간 | 추가 CASE |
| GAP-REG-06 | CASE_ONLY | 보고서 기록 | CASE_ONLY | 조합 유형별 문서 매핑이 단일 CASE | 추가 CASE |
| GAP-REG-07 | KEEP_UNKNOWN | 기존 UNKNOWN 유지 | UNKNOWN | 대리·제3자 수령 요건 미해결 | 인터뷰 |
| GAP-REG-08 | KEEP_UNKNOWN | `institution.md` 예정 | UNKNOWN | 채널 선택 Rule 부재 | 인터뷰 |
| GAP-REG-09 | ACCEPT_MODEL_NEXT | `account-type.md` 예정 | PROVISIONAL | 오픈플랫폼팀 후보 Actor만 반영 가능 | V1-R2 |
| SIC-R2-01 | ACCEPT_SOURCE | `n-05-03.md` | PROVISIONAL/UNKNOWN | 개투·벤투·민법 근거 보강, 신투 유보 | V1-R2 |
| SIC-R2-02 | ACCEPT_SOURCE | `n-05-05.md` | PROVISIONAL | 정정 사유 카테고리 존재 반입 | V1-R2 |
| SIC-R2-03 | ACCEPT_SOURCE | `n-05-05.md` | PROVISIONAL | 보완·취하 하위 경로 존재 반입 | V1-R2 |
| SIC-R2-04 | ACCEPT_SOURCE | `n-05-09.md` | CASE_ONLY/UNKNOWN | 지원팀 경로 1건과 표준 Actor 미확정을 분리 | V1-R2 |
| SIC-R2-05 | CASE_ONLY | `n-05-03.md` CASE 참고 | CASE_ONLY | 개인 GP 12종은 고유번호증 구간 단일 사례 | 추가 CASE |
| SIC-R2-06 | CASE_ONLY | 보고서 기록 | CASE_ONLY | 여러 문서가 같은 조합 사례임을 재확인 | 추가 CASE |
| SIC-R2-07 | DEFER_BACKLOG | 보고서 Backlog | OPEN | 인터뷰 프로그램은 사전 검토 단계 | 인터뷰 일정 확인 |
| GAP-R2-01 | ACCEPT_MODEL_NEXT | `fund-type.md` 예정 | OPEN | 개투·벤투·민법 잠정 세분화 가능 | V1-R2 |
| GAP-R2-02 | ACCEPT_MODEL_NEXT | Process 05 예정 | OPEN | 정정 사유 카테고리를 잠정 반영 가능 | V1-R2 |
| GAP-R2-03 | ACCEPT_MODEL_NEXT | Process 05 예정 | OPEN | 보완·취하 하위 경로 잠정 반영 가능 | V1-R2 |
| GAP-R2-04 | ACCEPT_MODEL_NEXT | Process 09 예정 | OPEN | 사례 1건 한정과 표준 Actor UNKNOWN 경고 필요 | V1-R2 |
| GAP-R2-05 | NO_CHANGE | 기존 Process 06·09 | UNKNOWN/CONFLICT | 선후관계 UNKNOWN·REJECTED 유지가 적절함 | V1-I |
| GAP-R2-06 | CASE_ONLY | 보고서·Source CASE 참고 | CASE_ONLY | 12종과 17종은 같은 사례의 다른 업무 구간 | 추가 CASE |
| GAP-R2-07 | KEEP_UNKNOWN | 전체 Variation | UNKNOWN | 공식 V2 인터뷰 미착수로 해소 시점 불명 | 인터뷰 일정 확인 |

## 3. Deferred Backlog

| Finding | 결정 | 반영 위치 | 상태 | 사유 | 후속 TAP |
|---|---|---|---|---|---|
| 7-1 관리역 인터뷰 v1 | DEFER_BACKLOG | Backlog | OPEN | 이번 Revision Gate를 막는 근거 없음 | 별도 Audit |
| AI Cross-check | DEFER_BACKLOG | Backlog | OPEN | 이번 Revision Gate를 막는 근거 없음 | 별도 Audit |
| REC_S3_01 | DEFER_BACKLOG | Backlog | OPEN | 이번 Revision Gate를 막는 근거 없음 | 별도 Audit |
| 재시연 파일럿 잔여 구간 | DEFER_BACKLOG | Backlog | OPEN | 일부 구간 미검토이나 승인 Finding 반영을 막지 않음 | 별도 Audit |

## 4. 결정 집계

| 결정 | 수 |
|---|---:|
| ACCEPT_SOURCE | 12 |
| ACCEPT_MODEL_NEXT | 7 |
| CASE_ONLY | 6 |
| KEEP_UNKNOWN | 4 |
| NO_CHANGE | 1 |
| DEFER_BACKLOG | 7 |
| 합계 | 37 |

## 5. 다음 Gate

- V1-R2는 보강된 Source를 근거로 Variation과 승인된 Process Finding만 수정한다.
- Source의 `PROVISIONAL`, `UNKNOWN`, `CASE_ONLY`를 임의로 `CONFIRMED`로 승격하지 않는다.
- Deferred Backlog는 V1-R2와 V1-I의 비차단 항목으로 유지한다.

## 6. V1-R2 ACCEPT_MODEL_NEXT 처리 결과

| Finding | 결과 | 실제 수정 파일 | 실제 Variation·Process ID | 미반영·제한 사유 | V1-I 확인 항목 |
|---|---|---|---|---|---|
| GAP-REG-01 | APPLIED | `variations/account-type.md`, `processes/10-balance-certificate.md`, `mappings/variation-source-index.md` | AT-12~AT-14, BC-01~BC-09 | Actor·시스템·선택 Rule은 UNKNOWN | 유형별 경로와 기존 Main Flow 정합성 |
| GAP-REG-02 | APPLIED | `variations/institution.md`, `processes/10-balance-certificate.md`, `mappings/variation-source-index.md` | IV-06~IV-08, IV-14, BC-07~BC-09 | 채널 선택·수신 완료 Rule은 UNKNOWN | AO-11·AS-06·BC-07 추적성 |
| GAP-REG-09 | APPLIED | `variations/account-type.md`, `mappings/variation-source-index.md` | account-type Actor 차이 | 오픈플랫폼팀은 후보 Actor, 표준 RACI는 UNKNOWN | Actor 후보와 책임 주체 분리 |
| GAP-R2-01 | APPLIED | `variations/fund-type.md`, `mappings/variation-source-index.md` | FT-01~FT-04 | 신투 Trigger·근거자료와 공통 적용 Rule은 UNKNOWN | 네 유형 상태·Source 연결 |
| GAP-R2-02 | APPLIED | `processes/05-unique-number-correction.md` | R-5, UC-02 | 카테고리 완전성·빈도·우선순위는 UNKNOWN | PROVISIONAL 카테고리 경계 |
| GAP-R2-03 | APPLIED | `processes/05-unique-number-correction.md` | UC-D03, UC-EX03~UC-EX04 | 감지조건·Actor·복귀 Task·자동 선택 Rule은 UNKNOWN | 세 하위 경로와 예외 정합성 |
| GAP-R2-04 | APPLIED | `processes/09-account-closure.md`, `variations/account-type.md` | AC-01~AC-08, Scope Limitation | 지원팀 경로는 CASE_ONLY, GP 직접·기타 Actor는 후보 | CASE_SUPPORTED DRAFT와 자동화 차단 상태 |

### 처리 결과 집계

| 결과 | 수 |
|---|---:|
| APPLIED | 7 |
| PARTIALLY_APPLIED | 0 |
| NO_CHANGE_JUSTIFIED | 0 |
| DEFERRED | 0 |

- `KEEP_UNKNOWN`, `CASE_ONLY`, `DEFER_BACKLOG` 결정은 기존 상태를 유지한다.
- GAP-R2-05는 `NO_CHANGE` 결정에 따라 Process 06·09 선후관계의 `UNKNOWN`·`REJECTED` 상태를 유지하며 V1-I에서 재확인한다.

## 7. V1-I 통합 QA 확인

| 항목 | 결과 |
|---|---|
| ACCEPT_MODEL_NEXT 7건 | 7/7 APPLIED / VERIFIED |
| KEEP_UNKNOWN 유지 | PASS |
| CASE_ONLY 일반화 방지 | PASS |
| DEFER_BACKLOG 유지 | PASS |
| Source 없는 CONFIRMED 승격 | 0 |
| CP-04 판정 | COMPLETE_WITH_KNOWN_GAPS |

세부 검증 근거는 `reports/variation-integration-qa.md`에 기록한다.
