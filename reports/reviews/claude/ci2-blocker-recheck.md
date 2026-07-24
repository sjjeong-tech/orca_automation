# CI2 Blocker Recheck

- Fix Commit: `77c636518f09b40eebf947c801c8763d1177aa14` ("Block intake when fund record is unresolved")
- Prior Review: `reports/reviews/claude/ci2-independent-alignment-review.md` (RESULT=FAIL_BLOCKING)
- 재검증 범위: 기존 Blocking 2건만. PASS 11건·Nonblocking 3건은 재검토하지 않음.
- 검증 방식: `git archive origin/main`으로 클린 스크래치 사본을 만들어 `node scripts/conversational-intake.test.mjs` 실행 + 독립 어드버서리얼 재현(테스트 파일에 없는 시나리오로 직접 함수 호출). 코드·Notion·main은 건드리지 않음.

## 1. FUND 0건 — RESOLVED

| 확인 항목 | 결과 |
|---|---|
| 실제 코드 실행 | 완료 — `node scripts/conversational-intake.test.mjs` 전체 PASS(클린 스크래치 사본, origin/main `77c6365` 기준) |
| BLOCK_AND_ASK 여부 | PASS — `resolution.fund = {"status":"NO_MATCH","action":"BLOCK_AND_ASK"}` |
| Planned FUND Write 0 | PASS — `commit_plan.fund.planned_writes = 0` |
| Commit 차단 | PASS — `commit_allowed:false`; 강제로 `approved:true` + 정상 동작하는 adapter를 주더라도 `commitTransaction`이 `{"stage":"COMMIT_BLOCKED","reason":"PREVIEW_NOT_COMMITTABLE","actual_write_count":0}` 반환(이중 방어 확인) |
| 자동 FUND 생성 경로 없음 | PASS — `commitTransaction`에서 `adapter.createFund` 호출 코드 자체가 제거됨(diff 확인); fund_page_id가 없으면 `EXACTLY_ONE_EXISTING_FUND_REQUIRED`로 즉시 차단 |

독립 재현 결과(테스트 파일에 없는 별도 시나리오, 조합명 "가나다신기술조합" 0건 매치):

```
prepare_complete: false
fund.resolution: {"status":"NO_MATCH","action":"BLOCK_AND_ASK","page_id":null,"url":null}
commit_plan.fund: {"resolution":"NO_MATCH","action":"BLOCK_AND_ASK","page_id":null,"planned_writes":0}
commit_allowed: false
planned_write_count: 0
commitAttempt (forced approve): {"stage":"COMMIT_BLOCKED","reason":"PREVIEW_NOT_COMMITTABLE","actual_write_count":0}
```

Contract(`contracts/conversational-intake-contract.yaml`)도 `preview.missing_fund: "BLOCK_AND_ASK"`, `commit.fund_creation_inside_transaction: false`, `failure_control.fund_no_match: "BLOCK_AND_ASK_BEFORE_COMMIT"`로 일치하게 개정되어 Contract-구현 상충이 해소됐다.

**판정: PASS**

## 2. N-06 — RESOLVED

| 확인 항목 | 결과 |
|---|---|
| 기능 상태를 UI 확인 PASS로 기록했는지 | PASS — `master-workmap.yaml`에 `verification_method: "USER_NOTION_UI_VISUAL_CONFIRMATION"`, `verified_subtests`에 `"TASK_SIX_RELATED_FUND_ROLLUP_UI_PASS"` 추가 |
| API `<omitted />` 한계를 별도 표시했는지 | PASS — `api_verification_status: "LIMITED_ROLLUP_VALUE_OMITTED"` 필드로 API 한계와 완료 근거(UI)를 명확히 분리; `reports/ci2-process-alignment-verification.md`에 "N-06 Verification Basis" 절 신설, "API 재조회에서는 Rollup 실제값이 `<omitted />`로 반환됐다"를 명시적으로 남김 |
| 기능 미검증으로 잘못 해석하지 않았는지 | PASS — 이전처럼 API 한계를 숨기고 VERIFIED만 표시한 것이 아니라, "API 자동검증은 제한되며 Canonical 완료 근거는 사용자 Notion UI 육안검증"이라고 완료 근거의 성격을 정확히 기록함 |

**한계 고지**: 이 판정은 "기록이 정확한가"를 확인한 것이며, Claude가 사용자·GPT의 실제 UI 육안 확인 행위 자체를 재현·재검증한 것은 아니다(그 확인은 본질적으로 Human-only 채널이며, 이는 이 시스템의 다른 Human Approval 지점(HA-01~08)과 동일한 설계 전제다).

**판정: PASS**

## 최종 판정

**RESULT=PASS**

두 Blocking 항목 모두 실제 코드 실행과 독립 재현으로 해소를 확인했다. Nonblocking 3건(P03-T05 Actor 표기, 템플릿 평탄화, CI-07 사유 텍스트)은 이번 재검토 범위에 포함되지 않았으며 이전 판정을 유지한다.
