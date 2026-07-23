# Variation TAP 실행 계획

## 1. 실행 원칙

- Variation 구현은 공식 Source 근거와 기존 Process Task 범위 안에서 수행한다.
- 동일 파일은 한 Agent만 소유하며 동시 수정하지 않는다.
- 한 실행 구간의 Sub-agent는 최대 2개다.
- `A-V1` 이전에 `V1-A`, `V1-B`, `V1-C`의 초안이 모두 완료되어야 한다.
- Claude Review는 독립 검토 결과만 작성하고 Variation 파일을 수정하지 않는다.
- Process 11과 미확정 Interface는 Variation Rule의 근거로 사용하지 않는다.
- 각 TAP은 선행 Gate가 통과한 뒤 별도로 실행한다.

## 2. TAP 분할

| TAP ID | 작업 | 소유 Agent | 읽을 Source | 수정 허용 파일 | 출력 | 예상 작업량 | Codex 사용량 |
|---|---|---|---|---|---|---|---|
| V1-A | 조합 유형·GP 유형 | Codex Variation Agent A | `N-05-03`, `N-05-04`, `N-06` 6.3·6.4, `N-08` E2E-03·04, Process 03·04, Variation Source Index | `variations/fund-type.md`, `variations/gp-type.md` | 조합·GP Variation 초안 | HIGH | HIGH |
| V1-B | 계좌 유형 | Codex Variation Agent B | `N-05-07`~`N-05-10`, `N-06` 6.7~6.10, `N-08` E2E-07~10, Process 07~10, `conflicts/unresolved.md` | `variations/account-type.md` | 계좌 Variation 초안 | MEDIUM | MEDIUM |
| V1-C | 기관·지점·처리 방식 | Codex Variation Agent C | `N-05-02`~`N-05-10` 중 기관·전달 근거, Process 02~10, `conflicts/unresolved.md`, Variation Source Index | `variations/institution.md` | 기관·처리 방식 Variation 초안 | HIGH | HIGH |
| A-V1 | Claude 독립 Source Review | Claude Source Review Agent | Variation 초안 4개, 대응 Source Extract, Variation Source Index, Grounding·Integration QA | `reports/variation-source-review.md` | 독립 Findings와 근거 상태 검토 | MEDIUM | LOW |
| V1-R | Claude Findings 반영 | Codex Variation Revision Agent | `reports/variation-source-review.md`, 지적된 Variation 파일과 직접 Source | Findings가 지정한 `variations/*.md`, `reports/variation-revision-resolution.md` | 수정본과 Finding 처리표 | MEDIUM | MEDIUM |
| V1-I | 통합 Variation QA | Codex Integration QA Agent | Variation 4개, Variation Source Index, Source Grounding QA, Process Integration QA, unresolved Gap | `reports/variation-integration-qa.md` | 통합 QA와 다음 Gate 판정 | MEDIUM | MEDIUM |

## 3. 선행조건과 순서

| 순서 | TAP ID | 선행 TAP | 성공 Gate | 다음 상태 |
|---:|---|---|---|---|
| 1 | V1-A | TAP V0 | PASS 또는 비차단 `PASS WITH ISSUES` | V1-B 평가 |
| 2 | V1-B | V1-A | PASS 또는 비차단 `PASS WITH ISSUES` | V1-C 평가 |
| 3 | V1-C | V1-B | PASS 또는 비차단 `PASS WITH ISSUES` | A-V1 평가 |
| 4 | A-V1 | V1-A, V1-B, V1-C | 독립 Review 완료 | V1-R 평가 |
| 5 | V1-R | A-V1 | Blocking Finding 해소 또는 명시적 차단 판정 | V1-I 평가 |
| 6 | V1-I | V1-R | PASS 또는 `PASS WITH NON-BLOCKING GAPS` | Variation Checkpoint |

`V1-A`, `V1-B`, `V1-C`는 파일 소유권이 분리되어 있으나 Source 재조회와 검토 범위를 통제하기 위해 기본 Queue에서는 순차 실행한다. 병렬 실행이 별도로 승인되더라도 동시에 두 Agent를 초과하지 않는다.

## 4. 산출물 경계

- Variation 초안: `variations/fund-type.md`, `variations/gp-type.md`, `variations/account-type.md`, `variations/institution.md`
- 독립 Review: `reports/variation-source-review.md`
- Revision 처리 기록: `reports/variation-revision-resolution.md`
- 통합 QA: `reports/variation-integration-qa.md`
- Process, Source Extract, README는 이 분할 TAP의 수정 대상이 아니다.
