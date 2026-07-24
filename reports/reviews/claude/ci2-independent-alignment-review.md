# CI2 Independent Alignment Review

## 0. 개요

- Base(현재 origin/main): `794343cf5d037afe87c5ab2c1548ef4460a33b09` ("Align conversational intake with canonical process model")
- Review Target Commit(Codex CI2 종료 Commit): `794343cf5d037afe87c5ab2c1548ef4460a33b09` (Base와 동일 — 최신 origin/main이 곧 CI2 종료 지점)
- Branch: `agent/claude/ci2-alignment-review` (origin/main에서 분기, main 미접촉)
- 검증 방식: 문서 대조 + `scripts/conversational-intake.test.mjs` 실제 실행(Node v24.16.0, 전량 PASS 확인) + 독립 Node 스크립트로 어드버서리얼 재현 + Notion 실시간 fetch 3건(Task 페이지, E2E-03, 업무 실행 기본 템플릿) + `docs/work-item-glossary.md`/`master-workmap.yaml` 대조
- 전체 테스트: `ci2-alignment-test-matrix.yaml`(29건)

**Codex 결과를 전제로 PASS 처리하지 않았다.** 특히 N-06 VERIFIED 판정은 실제로 Notion Task 페이지를 재조회해 확인했으며, Fund 미존재 시 자동생성 여부는 코드를 직접 실행해 재현했다.

## A. 계층 분리 검증

**PASS.** `docs/process-execution-layering.md`가 Canonical Process Model(`E2E-03`/`세무서_1`/Atomic `01~16`) — Operational Task Definition(`P03`/`P03-T01~06`) — Request·Task Execution Instance(`transaction_id`/`{transaction_id}-P03-Tnn`) 3계층을 명확히 분리했다. E2E Roadmap DB를 실행 Task DB로 오용한 흔적이 없고, Atomic Step을 Notion Task로 그대로 복제하지 않았으며(16개→6개로 의도적 압축), Legacy ID(`CI1-P03-01`)는 재작성 금지 정책으로 보존된다. Notion에서 기존 CI1 TEST Task 페이지를 실시간 재조회해 Legacy ID가 그대로 유지됨을 확인했다.

## B. E2E-03 Mapping 검증

**PASS(부분 관찰 사항 있음).** Notion `E2E-03 고유번호증 신청·수령` 페이지를 실시간 조회해 Mermaid 흐름(01~16)을 확인하고 `contracts/process-execution-mapping.yaml`과 직접 대조했다.

- Atomic Step 01~16 Coverage: **16/16, 누락 0**
- Task 6개(`P03-T01~T06`) 전체가 실행 Bundle임이 명확히 문서화됨(Task ID 6개, 실행 Instance는 `{transaction_id}-P03-Tnn`)
- 허용 중복: Step `02`(`P03-T02`·`P03-T03`) 1건, 근거 명시됨. 그 외 중복 없음

**관찰(FAIL_NONBLOCKING, ALIGN-B3)**: `P03-T05`(결과물 수령)의 Actor가 `외부기관` 단독으로 지정되어 있으나, Notion 원문은 해당 단계(처리완료 확인·수령)를 "지원팀 / 세무서" 공동 수행으로 명시한다. 지원팀의 내부 책임 소재가 Operational Task Actor에서 누락되어 있다.

## C. 공통양식 정합성

**PASS(경미한 관찰 사항 있음).** Notion `업무 실행 기본 템플릿` 페이지를 실시간 조회해 9개 섹션명을 확인하고 `templates/request-execution-template.md`와 1:1 대조했다 — 전체 일치, 누락 없음. 신규 DB Property 승격 없음(`default_apply: false`, `notion_schema_change_required: false`). `[확인 필요]` 유지 원칙도 `templateValue()`가 빈 값을 `"확인 필요"`로 렌더링해 반영한다.

**관찰(PASS_WITH_NOTE)**: Notion 원문의 착수조건·서류체크리스트·실제처리순서·예외보완·결과물 섹션은 다중행 표 구조이나, Markdown 템플릿은 이를 단일 값 placeholder로 평탄화한다. `docs/process-execution-layering.md`가 이를 "초안"으로 명시해 은폐된 정보손실은 아니지만, Pilot 확장 시 항목별(서류별·Step별) 추적력이 원문보다 낮아질 수 있다.

## D. Contract 검증

Node로 실제 코드를 실행해 검증했다(문서만 읽지 않음).

| 확인 항목 | 판정 |
|---|---|
| 미지원 request_type Commit 차단 | PASS |
| Person 모호성 자동선택 없음(0건·2건 이상 모두 차단) | PASS |
| Preview 전 Write 0 | PASS |
| Missing Required 상태에서 write_allowed=true 없음 | PASS |
| 승인 문구 자연어 판별 로직 | NOT_VERIFIABLE — 아래 참고 |
| **Fund 0건 매치 시 BLOCK_AND_ASK 정책 구현 여부** | **FAIL_BLOCKING — 아래 참고** |

### FAIL_BLOCKING — Fund 미존재 시 자동 생성 (ALIGN-D3 / ALIGN-F9)

`contracts/conversational-intake-contract.yaml`의 `fund_resolution.zero_matches`는 `"BLOCK_AND_ASK"`로 선언되어 있다. 그러나 실제 `prepareTransaction`/`buildTransactionPreview`(`scripts/conversational-intake.mjs`)를 독립적으로 재현 실행한 결과:

```
prepare_complete: true
fund.resolution: {"status":"CREATE_ON_COMMIT","page_id":null,"url":null}
commit_plan.fund: {"action":"CREATE","page_id":null,"planned_writes":1}
commit_allowed: true
planned_write_count: 8
```

`prepare_complete`와 `blocked` 판정 로직 모두 Fund 0건 상태를 차단 조건에 포함하지 않는다(오직 `AMBIGUOUS`, 즉 2건 이상만 차단 대상). 즉 승인 시 이 시스템은 **신규 FUND(조합) Notion Record를 자동으로 생성할 계획을 세운다** — Contract가 명시한 "차단하고 확인 질문"과 다른 동작이다. `scripts/conversational-intake.test.mjs`의 `missingFundPrepared`/`missingFundPreview` 테스트도 이 `action: "CREATE"` 동작을 의도된 것으로 단정하고 있어, Contract 문서와 실제 구현·테스트가 서로 다른 정책을 전제하고 있다.

조합(FUND)은 공유 운영 자산이며 Rollup·Relation의 상위 기준 Record다. 오탈자나 표현 차이로 조합명이 매칭되지 않았을 뿐인데 신규 조합 Record가 생성되면 FUND DB 무결성이 훼손될 위험이 있다. Preview 단계에서 "fund: CREATE"가 표시되긴 하지만, 이는 여러 항목 중 하나로 노출될 뿐 별도의 명시적 확인 질문(예: "이 조합은 신규 등록 대상이 맞습니까?")을 거치지 않는다.

**GPT·정상준 결정 필요**: (a) Contract를 실제 구현(자동 CREATE 후보 제시)에 맞춰 개정하거나, (b) 구현을 Contract(BLOCK_AND_ASK)에 맞춰 수정해야 한다. Claude는 어느 쪽이 옳은지 가정하지 않는다.

### NOT_VERIFIABLE — 승인 문구 판별 로직 (ALIGN-D6)

`conversational-intake.mjs` 전체를 검색한 결과 Contract의 `approval_tokens`(`승인`/`생성`/`확인 완료`)를 자연어 텍스트에서 실제로 판별하는 함수가 없다. `commitTransaction`은 외부에서 전달되는 boolean `approved` 플래그만 사용한다. 이는 버그라기보다 아직 구현되지 않은 Interface 계층(Claude Code Skill 등, CI-05 이후 확장 영역)의 몫으로 보이나, "승인 전 Write 0"이 실제 자연어 대화에서도 지켜지는지는 이번 Commit만으로 검증할 수 없다.

## E. Canonical 상태 검증

| 확인 항목 | 판정 |
|---|---|
| CI-01~05 상태 | PASS — 전체 `APPROVED` |
| CI-08 완료 여부 | PASS — `APPROVED`/`COMPLETED` |
| CI-09·CI-10 선후관계 | PASS — CI-08→CI-09(READY)→CI-10(BLOCKED), dependencies 배열과 일치, 모순 없음 |
| **N-06 VERIFIED** | **FAIL_BLOCKING — 아래 참고** |
| CI-07 blocking_reason 최신성 | FAIL_NONBLOCKING — CI-05가 APPROVED로 바뀌었는데 CI-07의 사유 텍스트("Conversational pilot pending")가 갱신되지 않음(로직 오류는 아니며 BLOCKED 유지 자체는 타당할 수 있음) |

### FAIL_BLOCKING — N-06 VERIFIED 판정의 근거 부재 (ALIGN-E1)

`orchestration/plan/master-workmap.yaml`은 이번 Commit에서 N-06을 다음과 같이 변경했다.

```
status: BLOCKED → APPROVED
execution_status: PARTIAL → VERIFIED
requirement_satisfied: (없음) → true
blocking_for_J02: true → false
source_of_truth: "reports/cp-05-p3-validation.md#N-06-Build-Test-Contract" → "CI-05 user pilot transaction verification"
remaining_test: "...Rollup 실제값" → ""
```

그러나 이 변경의 근거로 제시된 `CI-05 user pilot transaction`의 실제 기록(`reports/conversational-intake-ci1-e2e.md`, base commit `80cb01d`)은 **동일 Rollup 검증을 명시적으로 미완료로 남겼다**:

> N-06 remains `PARTIAL_UI_CONFIRMATION_REQUIRED`: Task schema contains the Rollup, but the page API returned its actual value as `<omitted />`. ... UI 확인: 브라우저 연결이 제공되지 않아 미실행

Claude는 이 주장을 그대로 받아들이지 않고 실제 Notion Task 페이지(`https://app.notion.com/p/3a772a41d9d781d0b23aed739886ca40`, `[TEST][CI1][01] 요청정보·착수조건 확인`)를 이번 TAP 실행 시점에 직접 재조회했다. 결과:

```json
"관련 조합": "<omitted />"
```

**지금 이 순간에도 실제 Rollup 값은 여전히 `<omitted />`다.** VERIFIED 판정을 뒷받침할 새로운 확인 근거(UI 스크린샷, 사용자 확인 기록 등)가 리포지토리 어디에도 없다. 이는 Canonical Workmap의 상태 선언이 실제 Evidence와 상충하는 명백한 사례이며, `J-02`(Notion Build Readiness) Join Gate의 통과 조건 중 하나(`N-06=VERIFIED`)가 검증되지 않은 채 충족된 것으로 표시되고 있다.

**GPT·정상준 결정 필요**: N-06을 다시 `PARTIAL`/`BLOCKED`로 되돌리거나, 실제 UI 확인이 별도로 이루어졌다면 그 증거를 리포지토리에 남겨야 한다.

## F. Regression 검증(12개 항목)

전부 `node scripts/conversational-intake.test.mjs`를 실제 실행(결과: 3개 그룹 전체 `PASS` 출력 확인)하고, 일부는 독립 Node 스크립트로 별도 시나리오를 재현해 확인했다.

| # | 항목 | 판정 |
|---|---|---|
| 1 | 기존 Parser 테스트 | PASS |
| 2 | 조사 제거 | PASS |
| 3 | 서류 상태 | PASS |
| 4 | 긴급 부정 | PASS |
| 5 | Transaction Preview Write 0 | PASS |
| 6 | 동일 Transaction 중복 방지 | PASS |
| 7 | Partial Failure 복구 | PASS |
| 8 | 기존 FUND 재사용 | PASS |
| 9 | 미존재 FUND CREATE_ON_COMMIT | **FAIL_BLOCKING(D3과 동일 근거)** |
| 10 | Relation 검증 후 Task 생성 | PASS |
| 11 | Process Mapping 없는 업무 차단 | PASS |
| 12 | Template Rendering | PASS |

## Blocking Issue 종합(중복 제거, 실질 2건)

1. **Fund 0건 매치 시 자동 CREATE 계획**(ALIGN-D3, ALIGN-F9는 동일 근본 원인) — Contract의 `BLOCK_AND_ASK` 선언과 실제 구현·테스트가 상충
2. **N-06 VERIFIED 판정의 근거 부재**(ALIGN-E1) — 실시간 Notion 재조회로 `<omitted />` 지속 확인, Canonical 상태가 실제 Evidence를 반영하지 않음

## Nonblocking Issue

1. `P03-T05` Actor가 "외부기관" 단독 지정, 원문은 "지원팀/세무서" 공동(ALIGN-B3)
2. Markdown 템플릿이 다중행 표를 단일값으로 평탄화(ALIGN-C3, 초안으로 이미 고지됨)
3. `CI-07` blocking_reason 텍스트 미갱신(ALIGN-E3)

## 최종 판정

**`FAIL_BLOCKING`**

Blocking Issue 2건 중 하나라도 해소되지 않으면 `CI-09 실제 사례 Pilot` 착수를 권고하지 않는다. 특히 N-06 문제는 Join Gate `J-02`의 전제 조건 신뢰성에 직접 영향을 준다.
