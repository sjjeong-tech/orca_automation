# CI-1 Independent Test Pack — 고유번호증 신청 대화형 Intake

## 0. 범위와 원칙

- 대상 흐름: 자연어 요청 → 정보 추출 → 누락정보 질문 → 조합·Person 식별 → 중복 탐지 → 생성 Preview → 사용자 승인 Gate → Notion Request·Task 생성
- 대상 업무: **고유번호증 신청**(request_type=`고유번호증 신청`) 1종만
- Base: `origin/main` `a364e70a26633307335999dd279b0216fe0ba6dc`
- 원칙: Codex 구현 결과를 미리 정답으로 가정하지 않는다. Contract·Mapping 문서 자체에 상충이나 미확정이 있는 경우(T06, T20 등) 정답을 임의로 정하지 않고 "무엇을 검증해야 하는가"만 명시한다.
- 참조한 Canonical 자료: `START_HERE.md`, `orchestration/plan/master-workmap.yaml`, `contracts/conversational-intake-contract.yaml`, `plans/conversational-intake-roadmap.md`, `decisions/conversational-intake-transition.md`, `mappings/process-to-notion-map.md`, `mappings/request-property-map.md`, `mappings/task-property-map.md`, `mappings/status-transition-map.md`, `mappings/intake-to-task-map.md`, `mappings/fund-type-notion-map.md`, `notion/model/human-approval-model.md`, `notion/model/request-status-model.md`, `processes/03-unique-number-application.md`, `reports/cp-05-p3-validation.md`, `reports/fast-track-form-e2e.md`, `reports/notion-crud-capability.md`, `docs/work-item-glossary.md`. 존재하지 않는 참조 파일은 없었다.

## 1. Contract 요약(참고용, 수정하지 않음)

- 필수 필드(계약 기준): `related_fund, request_type, requester, fund_manager, target_date, urgent, document_status, notes`
- 선택 필드: `original_folder, desired_result, exception_notes`
- 조건부 필드: 계좌개설/보완 시 `account_type, bank_branch, custody_type`; GP 의존 Process 시 `gp_type` — 고유번호증 신청은 이 조건부 그룹에 해당하지 않음
- 생성 Gate: `required_fields_complete, request_type_supported, human_preview_approved` 충족 시에만 생성; `sensitive_data_detected, unknown_rule_required, duplicate_unresolved` 발생 시 차단
- 중복 판정 키: `related_fund, request_type, active_status, target_date_window` — 자동 병합 금지(`automatic_merge: false`)

### 발견 1 — Contract와 Property Map의 상충(CRITICAL, OPEN_QUESTION)

`contracts/conversational-intake-contract.yaml`은 `related_fund`를 **필수 필드**로 선언하지만, `mappings/request-property-map.md`는 "관련 조합"을 **조건부**로 선언하며 "기존 Record가 없으면 비움"이라고 명시한다. 두 문서 중 어느 것이 실제 구현 기준인지 이번 TAP에서 확정하지 않으며, T06으로 이 지점을 직접 검증한다.

### 발견 2 — `urgent` 필드의 Notion Property 부재(MEDIUM)

Contract는 `urgent`를 필수 필드로 선언하지만 `mappings/request-property-map.md`의 13개 Request Property 중 이에 대응하는 전용 Property(예: "긴급 여부")가 없다. `notion/model/human-approval-model.md`의 `DP-06`(긴급 요청인가)이 `priority`라는 Output을 내지만 이것이 어느 Notion Property에 저장되는지도 명시되어 있지 않다. Codex 결과에서 `urgent=true`가 실제로 어디에 기록되는지 확인이 필요하다(T11 참고).

## 2. 승인 문구 규칙 제안(7절)

| 구분 | 표현 | 판정 |
|---|---|---|
| 승인 인정 | "생성", "승인", "이 내용으로 등록", "그대로 만들어주세요" | APPROVAL |
| 승인 불인정 | "네", "확인했습니다", "알겠습니다", "내용을 봤습니다", "조금만 기다려주세요", "수정할게요", "맞는 것 같아요" | NOT_APPROVAL — 재확인 질문 |

**제안하는 최소 안전 규칙**: Preview 표시 직후 사용자의 응답에 생성·등록을 직접 지시하는 동사구(생성/등록/승인/만들어)가 명시적으로 포함된 경우에만 승인으로 인정한다. 그 외 모든 응답(순수 인지·유보·수정 요청 포함)은 기본값 **비승인(fail-safe default)** 으로 처리하고, 필요 시 "생성해도 될까요? '생성'이라고 답변해주세요" 형태로 재질문한다. 승인 문구가 같은 발화 안에서 다른 질문·수정 요청과 함께 등장하면(예: "날짜만 8/20으로 바꾸고 생성해주세요") 수정 반영 여부를 먼저 재확인 없이 즉시 생성하지 않는다 — 이는 "수정 의도"와 "승인 의도"가 동시에 있는 혼합 사례로, 안전한 최소 규칙은 이 경우도 재확인을 권장한다.

## 3. 날짜 해석 위험(8절)

| 표현 | 절대 날짜 변환 가능 여부 | Human 확인 필요 | 비고(실행일 2026-07-27 월요일 기준) |
|---|---|---|---|
| 오늘 | 가능 | 아니오 | 2026-07-27 |
| 내일 | 가능 | 아니오 | 2026-07-28 |
| 모레 | 가능 | 아니오 | 2026-07-29 |
| 이번 주 금요일 | 가능 | 아니오(단, 이미 지났으면 확인 필요) | 2026-07-31 |
| 다음 주 수요일 | 가능 | 아니오 | 2026-08-05 — "다음 주"의 시작 요일(월요일) 기준 명시 필요 |
| 이달 말 | 가능 | 아니오 | 2026-07-31 |
| 7월 30일 | 조건부 | **연도가 모호하면 필요** | 실행일이 7월이므로 올해로 해석 가능하나, 실행 시점이 8월 이후라면 "올해 지난 날짜"인지 "내년"인지 확인 필요 |
| 30일까지 | 불가 | **필요** | 월 자체가 미확정 |
| 다음 주쯤 | 불가 | **필요** | 요일 미확정 |
| 최대한 빨리 | 불가(날짜 아님) | **필요** | urgent 정규화와 target_date 질문을 분리해야 함(T11) |

원칙: 상대 표현이 요일·주 단위까지 구체적이면 절대 날짜로 변환하되 변환값을 Preview에 원문과 함께 노출한다. 월·요일 중 하나라도 특정할 수 없으면 임의로 확정하지 않고 확인 질문으로 전환한다.

## 4. Test Matrix 요약(전체 20건은 `ci1-test-matrix.yaml` 참고)

| 유형 | test_id | risk_level |
|---|---|---|
| 최소 정상 요청 | T01 | LOW |
| 담당 관리역 누락 | T02 | CRITICAL |
| 요청자 누락 | T03 | CRITICAL |
| 서류 전달 상태 누락 | T04 | CRITICAL |
| 조합명 누락 | T05 | CRITICAL |
| 존재하지 않는 조합 | T06 | CRITICAL |
| 유사 조합명 다중 후보 | T07 | CRITICAL |
| Person 동명이인 다중 후보 | T08 | CRITICAL |
| 상대 날짜(다음 주 수요일) | T09 | HIGH |
| 모호한 상대 날짜 | T10 | HIGH |
| 긴급성 명시 | T11 | MEDIUM |
| 선택정보 누락 | T12 | MEDIUM |
| 승인 전 Write | T13 | CRITICAL |
| 비승인 일반 답변 | T14 | CRITICAL |
| 명시적 승인 | T15 | CRITICAL |
| 중복 요청 | T16 | HIGH |
| 운영 Record 보호 | T17 | CRITICAL |
| Request→Task Relation | T18 | HIGH |
| N-06 Rollup | T19 | HIGH |
| Partial Failure | T20 | CRITICAL |

## 5. Severity 분포

| Severity | 개수 | test_id |
|---|---:|---|
| CRITICAL | 12 | T02, T03, T04, T05, T06, T07, T08, T13, T14, T15, T17, T20 |
| HIGH | 5 | T09, T10, T16, T18, T19 |
| MEDIUM | 2 | T11, T12 |
| LOW | 1 | T01 |
| 합계 | 20 | |

## 6. 업무 Task 검토(9절) — 고유번호증 신청 Operational Task

`mappings/process-to-notion-map.md`의 OT-P03-01~05(5개)를 TAP이 제시한 6개 체크포인트와 대조했다.

| 체크포인트 | 대응 OT | 커버리지 |
|---|---|---|
| 착수조건 확인 | OT-P03-01(UN-01~03) + Request 단계 HA-01/HA-02 | 충분 |
| 서류 수령·검수 | OT-P03-01, OT-P03-02(UN-04~07) | 충분 |
| 신청서 작성·날인 확인 | OT-P03-04(UN-10~12) 내부의 UN-10(현장 작성·보완) | **부분 — 아래 참고** |
| 세무서 제출·접수 | OT-P03-04(UN-10~12) | 충분 |
| 결과물 수령 | OT-P03-05(UN-13~16) | 충분 |
| 스캔·저장·전달 | OT-P03-03(UN-08~09 스캔) + OT-P03-05(UN-16 최종 인계) | 충분 |

**관찰(MINOR, Task 수 증설 제안 아님)**: OT-P03-04의 Label("세무서 접수·접수증")은 UN-10(현장 작성·보완)을 포함하고 있음에도 이를 드러내지 않는다. 지원팀 담당자가 Task 목록만 보고 "현장에서 서식을 작성해야 할 수 있다"는 사실을 놓칠 위험이 있다. **5개 Task 구조 자체는 충분하며 Task 수를 늘릴 필요는 없다** — OT-P03-04의 완료조건/비고 필드에 "현장 요구사항 작성·보완 포함"을 한 줄 추가하는 것으로 충분하다고 판단한다.

## 7. Codex 결과 검증 체크리스트(11절)

Codex 구현 완료 후 이 표에 PASS/PARTIAL/FAIL/NOT_TESTED를 기록한다. 현재는 모두 `NOT_TESTED`.

| # | 항목 | 판정 | 근거(Codex 결과 기록란) |
|---|---|---|---|
| 1 | Parser | NOT_TESTED | |
| 2 | Missing Field | NOT_TESTED | |
| 3 | Fund Resolution | NOT_TESTED | |
| 4 | Person Resolution | NOT_TESTED | |
| 5 | Date | NOT_TESTED | |
| 6 | Preview | NOT_TESTED | |
| 7 | Approval | NOT_TESTED | |
| 8 | Write Count | NOT_TESTED | |
| 9 | Duplicate | NOT_TESTED | |
| 10 | Request | NOT_TESTED | |
| 11 | Task | NOT_TESTED | |
| 12 | Relation | NOT_TESTED | |
| 13 | Rollup | NOT_TESTED | |
| 14 | 운영 영향 | NOT_TESTED | |
| 15 | 사용자 실행 가능성 | NOT_TESTED | |

## 8. 종합 위험 요약

- **CRITICAL 12건 중 8건(T02~T08, T17)은 "승인 전에 정보가 부족하거나 식별이 불확실한데도 Write가 발생하는가"를 직접 겨냥한다.** 이 유형이 실패하면 시스템 자체의 신뢰가 무너지므로, Codex 결과 검증 시 최우선으로 확인해야 한다.
- **T06, T20은 Contract 문서 자체의 미확정(상충 또는 양자택일 허용)을 검증 대상으로 삼는다.** Claude는 정답을 가정하지 않았으므로, GPT·정상준이 Codex의 실제 선택을 검토해 Contract를 명확히 갱신할 필요가 있다(이번 TAP에서 Contract는 수정하지 않았다).
- **N-06(Task 관련 조합 Rollup)은 이미 별도 Work Item으로 PARTIAL 상태 추적 중이다.** T19는 이를 대화형 Intake 경로에서 다시 검증하는 것이며, 별도의 새로운 문제가 아니라 기존 미해결 Gap이 이 경로에도 동일하게 적용됨을 확인하는 용도다.
