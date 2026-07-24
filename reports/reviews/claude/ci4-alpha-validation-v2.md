# CI4 Alpha Targeted Validation (v2)

## 0. 개요

- Base Commit(origin/main 최신): `ea64dc4ad404584bb69ec90363df0a70c74f5ffc` ("Run E2E-03 schema alpha simulation")
- Reviewed CI4 Commit: `ea64dc4ad404584bb69ec90363df0a70c74f5ffc`(유일한 변경분: `reports/ci4-alpha-execution-result.md`, `reports/ci4-alpha-schema-gap.yaml` 2개 파일 추가)
- Review Commit: 본 파일 커밋(아래 참고)
- 변경 파일: 리뷰 대상 Commit에는 코드 변경 없음(Notion Schema·Record만 실제로 변경됨)
- Branch: `agent/claude/ci4-alpha-targeted-validation`(origin/main에서 신규 분기, 이전 b66a11b 보고서를 덮어쓰지 않음)
- 이전 `b66a11b`(PREMATURE_VALIDATION)는 이번 CI4 실행 실패로 간주하지 않았다 — 이번 리뷰는 완전히 새로운 실행 산출물(`ea64dc4`)을 대상으로 한다.

**검증 방식**: 문서 읽기에 그치지 않고 Notion을 6회 실시간 조회했다 — (1) 지원팀 업무요청 DB Schema, (2) 지원팀 Task DB Schema, (3) `[TEST][ALPHA]` Request 5건 SQL 조회, (4) A01 Task 6건 SQL 조회, (5) A03 Task 6건 SQL 조회, (6) A02/A04/A05 Task 18건 SQL 조회. Rollup 컬럼 직접 SQL 조회는 API 자체가 `no such column` 오류로 거부해, 보고서의 API 제한 주장을 별도 경로로도 재확인했다.

## 1. Test Record 수 — 실측 일치

| 항목 | 보고서 주장 | 실측(Notion SQL 조회) | 판정 |
|---|---|---|---|
| `[TEST][ALPHA]` Request | 5건 | **5건** (A01~A05, 중복 없음) | PASS |
| `[TEST][ALPHA]` Task | 30건 | **30건** (`COUNT(*)=30`) | PASS |

TC-A06(중복 차단)·TC-A07(FUND 미확정 차단)은 추가 Request·Task를 전혀 생성하지 않아 실측 총량(5/30)이 A01~A05만으로 정확히 설명된다. Record 미생성 시나리오라는 주장과 일치한다.

## 2. TC-A01~A07 개별 판정

| TC | 판정 | 근거(직접 조회 결과) |
|---|---|---|
| TC-A01 정상 진행 | PASS | Request 상태=`완료`, 서류 상태=`전달 완료`. Task 6건 전체 `Task 상태=완료`, `Blocker=null`, 완료증빙 6건 모두 개별 텍스트 존재. 활성(진행중) Task 0건 — 정상 종료 상태 |
| TC-A02 서류 미전달 | PASS | Request 상태=`진행 중`, 서류 상태=`미전달`. Task 6건 중 T02만 `진행 중`(Actor=`관리역 확인`, Blocker=`서류 미전달`, Next=`필수서류 전달 요청`), 나머지 5건은 `시작 전` — 활성 Task 정확히 1건 |
| TC-A03 일부 전달·누락 및 복귀 | PASS | 최종 상태 조회 결과 T02 `진행 중`, Actor=`지원팀`(관리역 확인에서 복귀), Blocker=`null`(해소), Next=`보완 수령분 재검수`. **T02 Record가 정확히 1건만 존재** — 보완 후 신규 Task를 만들지 않고 동일 Task로 복귀했음을 직접 확인 |
| TC-A04 날인 오류 | PASS | T03 `진행 중`, Actor=`지원팀`(GP에서 복귀), Blocker=`null`, Next=`재수령 날인본 검수 재개`. T03 Record 1건만 존재 — 동일 Task 복귀 확인. Root(E2E-03)에 없는 별도 상태·Rule 추가 없음(Task 상태 옵션 3개 그대로) |
| TC-A05 기관 추가요청 | PASS | T04 `진행 중`, Actor=`지원팀`(관리역 확인에서 복귀), Blocker=`null`, Next=`추가요청 자료 반영 후 접수 계속`. T04 Record 1건만 존재 |
| TC-A06 중복 요청 | PASS | Request 5건 조회 결과 A06에 대응하는 별도 Request가 없음 — 신규 Request·Task Write 0건을 실측으로 확인 |
| TC-A07 FUND 미확정 | PASS | 별도 Request·Task 생성 없음(실측 5/30과 일치). CI2/CI2-recheck에서 이미 코드 레벨로 `BLOCK_AND_ASK`·`Planned Write 0`·강제 승인 시도도 차단됨을 독립 검증한 바 있어, 이번 Alpha 시뮬레이션 결과와 상충하지 않음 |

TC-A04·A05는 실제 사례가 아니라 가상 시뮬레이션(TEST FUND, 가상 담당자)으로 표시되어 있으며, Root E2E-03의 Mermaid 분기(GP 재요청, 세무서 현장 추가요청)와 성격이 일치한다.

## 3. Test Case–Record 매핑 (테스트 격리)

- 각 TC는 서로 다른 Request(A01~A05, URL 고유)와 그에 속한 6개 Task만 사용했다 — 실측 결과 Task명에 `[Axx]` Prefix가 명확히 박혀 있어 Test 간 데이터가 섞이지 않았음을 확인했다.
- 모든 TEST Record가 `[TEST][ALPHA]` Prefix를 사용했다.
- 한 테스트의 최종 상태가 다른 테스트에 영향을 주었다는 증거 없음 — A02는 여전히 대기 중, A03~A05는 각각 독립적으로 복귀 완료 상태를 보이며 서로 다른 Operational Task(T02/T03/T04)에서 발생해 물리적으로도 겹치지 않는다.
- 상태 변경 이력(보완 전 Blocker 값 등)은 Notion 페이지 자체에는 남지 않으므로, 이번 검증은 "현재 최종 상태가 주장과 일치하는가"까지만 실측 확인했다 — 중간 과정 자체의 재현은 보고서 서술에 의존한다(NOT_VERIFIABLE_BEYOND_FINAL_STATE, 아래 참고).

## 4. Request/Task Schema 변경 검증

### Request DB — 서류 상태

- 실측: `서류 상태` Select Property 존재, 옵션 정확히 `["미전달", "일부 전달", "전달 완료", "보완 필요"]` 4개 — **PASS**
- 기존 `실물서류 전달 여부` Checkbox: 5건 전체 `__NO__`(false)로 CI4가 건드리지 않음 — **PASS**(legacy Backfill 0)
- TC-A01~A05에서 실제로 서로 다른 값(전달 완료/미전달)이 사용됨을 실측으로 확인 — **PASS**

**판정(일부 전달 vs 보완 필요 의미 중복 여부)**: `일부 전달`(수령 범위)과 `보완 필요`(검수 결과)는 개념적으로 다른 축이지만, 이번 Alpha에서는 TC-A03(일부 전달→보완 완료 후 `전달 완료`로 전이)에서 `보완 필요`를 실제로 사용하지 않고도 시나리오를 표현했다. 단일 Select에 두 의미가 공존하는 것은 **현재 범위에서는 운용 가능**하나, 두 축이 동시에 참일 수 있는 실제 사례(예: 서류 일부만 왔는데 그 일부에도 오류가 있는 경우)가 나오면 Select 하나로는 두 상태를 동시에 표현할 수 없어 혼동 위험이 있다. 이번 TAP은 신규 Schema를 제안하지 않으므로 이 관찰만 기록한다.

### Task DB — 취소 미적용

실측 확인: Task DB `Task 상태` Status 옵션은 정확히 `["시작 전", "진행 중", "완료"]` 3개뿐이며 `취소` 옵션이 없다 — 보고서 주장과 100% 일치.

1. TC-A01~A07에서 실제 `취소` 상태 사용 여부: **사용되지 않음**(실측 확인)
2. 취소 없이 모든 테스트 의미가 손상됐는가: **손상되지 않음** — 7개 TC 전부 현재 3개 Status + Actor + Blocker + 다음 Action 조합만으로 표현 가능함을 실측으로 확인
3. 현재 미적용이 CI4를 막는 Blocking인가: **아니오**
4. 향후 필요성 검증에 필요한 실제 Case: Request 또는 Task가 실제로 중단·철회되는 사례(예: 조합이 신청을 포기, 중복으로 판명돼 하나를 취소)가 발생할 때
5. Codex가 안전하지 않은 전체 재설정을 중단한 판단: **적절함** — 기존 3개 Status Record 값 보존을 우선한 보수적 판단이며, API가 명시적으로 `Invalid status value`를 반환한 시점에 무리하게 우회하지 않았다

**판정: `NONBLOCKING_SCHEMA_GAP`**

## 5. Relation·Rollup 검증

- FUND→Request, Request→Task, Task→Request(상위 요청) 3개 Relation 경로: Schema 조회로 구조 존재를 확인했고, 개별 Task 30건 조회에서 `상위 요청`이 채워져 있음을 실측 확인
- Task `관련 조합` Rollup: 직접 SQL 조회 시도 결과 **API 자체가 `no such column: "관련 조합"` 오류로 거부**했다(Schema 조회 응답의 `"notAvailableInQuerySql":["관련 조합"]`과 일치). 이는 `<omitted />` page-fetch 결과와는 다른 경로에서 나온 동일한 결론이며, API 자동검증 한계가 실제로 구조적임을 재확인한다.
- N-06 기존 UI 육안검증(계좌·유형·담당자 Rollup)은 유지된 상태이며 이번 신규 Alpha Task(A01~A05)의 Rollup 값은 **UI 육안검증 미실시** 상태다.

**판정: `NOT_VERIFIABLE_BY_API`** — 전체 기능 실패로 과장하지 않는다. N-06의 `USER_NOTION_UI_VISUAL_CONFIRMATION / LIMITED_ROLLUP_VALUE_OMITTED` 기준과 동일하게, Relation 경로 자체는 구조적으로 확인됐고 Rollup 표시값만 API로 확인 불가능한 상태로 분리해 기록한다.

## 6. Source of Truth 검증

- Request DB 실측 Schema에 `현재 Actor`·`다음 Action`·`Blocker`에 해당하는 전용 Property가 **존재하지 않음** — Request 수준에 실행 제어값이 중복 저장되지 않았음을 구조적으로 확인(추가하지 않았다는 주장과 일치)
- 서류 상태는 Request 수준 정보로 적절 — 서류 자체는 Request(요청 건) 단위 속성이지 개별 Task 단위 속성이 아니므로 계층이 맞다
- Task의 Actor·Blocker·다음 Action은 실측상 서로 다른 값을 가지며(예: A02 Actor=`관리역 확인`, Blocker=`서류 미전달`, Next=`필수서류 전달 요청` — 세 값이 각기 다른 정보) 동일 의미를 중복 표현하지 않는다
- Request 상태와 활성 Task 상태 간 충돌 없음 — 실측한 5건 모두 Request `진행 중`/`완료`가 대응 Task 진행 상황과 논리적으로 일치(A01만 전체 완료+Request 완료, 나머지는 활성 Task 존재+Request 진행 중)

**판정: PASS** — Source of Truth 충돌 없음(Task가 유일한 실행 상태 기준)

## 7. 안전성 검증

| 항목 | 판정 |
|---|---|
| 승인 전 Notion Write 0 | PASS(보고서 §8 명시, 이번 알파는 승인된 Schema 적용 이후의 TEST Record 생성이므로 본 항목은 CI2/recheck에서 이미 코드 레벨로 검증됨) |
| 승인 범위 밖 Schema Write 0 | PASS — 실측 결과 Request `서류 상태`(승인됨)만 추가되었고 Task `취소`는 미적용으로 확인, 승인 범위를 벗어난 변경 없음 |
| 운영 Record 변경 0 | PASS — 조회된 모든 Record가 `[TEST][ALPHA]` 또는 `[TEST][CI1-PILOT]` Prefix, 기존 CI1/CI2 TEST Record와 별도 |
| View·Filter 변경 0 | PASS(Schema 조회 결과 기존 4개 View 구조가 그대로 유지, Default/신규접수/정보보완필요/진행중요청) |
| 기존 Checkbox Backfill 0 | PASS — 실측 5건 모두 `__NO__` |
| Checkbox와 신규 Select 동시 Write 0 | PASS |
| Duplicate Test 추가 Write 0 | PASS — 실측 Request 5건으로 확인 |
| FUND Gate 추가 Write 0 | PASS — 실측 Request/Task 총량과 일치 |
| 실패 후 후속 Write 중단 | PASS(보고서상 취소 Probe 실패 후 강행하지 않음, 실측도 Task 상태 3개 옵션 그대로) |
| git status clean | PASS(리뷰 대상 Commit 자체는 clean; 이번 리뷰 작업도 커밋 후 clean 확인 예정) |
| main Push 완료 | 확인 — 리뷰 대상 Commit(`ea64dc4`)은 이미 origin/main에 반영되어 있음(Codex 작업) |
| 보고서와 실제 결과 일치 | **PASS** — 이번 TAP에서 실시한 6회 실시간 조회 전부가 보고서 서술과 일치, 상충 없음 |

## 8. 종합 판정

| 범주 | 개수 | 항목 |
|---|---:|---|
| PASS | 다수 | TC-A01~A07 전체, Schema 실측 일치, Relation 구조, Source of Truth, 안전성 전 항목 |
| PASS_WITH_NOTE | 1 | Request `서류 상태`의 `일부 전달`/`보완 필요` 개념 중복 가능성(현재는 문제 없음) |
| FAIL_BLOCKING | 0 | 없음 |
| FAIL_NONBLOCKING | 1 | Task `취소` Schema 미적용(`NONBLOCKING_SCHEMA_GAP`) |
| NOT_VERIFIABLE | 1 | Task `관련 조합` Rollup 신규 Alpha 값의 UI 육안검증(API 구조적 제한, 별도 경로로 재확인) |
| OUT_OF_SCOPE | 4 | 조합 유형별 차이(개인/벤처/민법/신기술), GP 유형별 차이(개인/법인/공동), 세무서 관할 차이, 은행·지점 차이 — 이번 Alpha에서 검증된 것으로 간주하지 않는다 |

## 9. 베타 진행 가능 여부

**가능 — `PASS_FOR_BETA`, 조건부**

Root Process(E2E-03)와 실행 결과 사이에 충돌이 없고, Request·Task DB Schema가 공통 흐름·대기·보완·복귀를 실제 Record로 표현 가능함을 직접 조회로 확인했다. Blocking 항목은 없다.

## 10. 베타에서 확인할 조건 (최대 3개)

1. Task `Task 상태=취소` 옵션을 Notion UI에서 기존 3개 옵션 보존한 채 추가(실제 취소/철회 사례가 베타에서 발생하기 전에 선제 적용 권고)
2. 신규 Alpha Task(A01~A05)의 `관련 조합` Rollup을 Notion UI에서 육안으로 1건 이상 확인해 `NOT_VERIFIABLE_BY_API` 상태를 해소
3. `서류 상태`의 `일부 전달`/`보완 필요` 동시 발생 사례가 베타 실제 사례에서 나타나는지 관찰(현재는 이론적 우려일 뿐 실제 충돌 사례 없음)

## 11. 범위 외(Out of Scope) 명시

다음은 이번 Alpha에서 검증되지 않았으며 베타 진행 가능 여부 판단에 포함하지 않았다: 개인투자조합·벤처투자조합·민법상조합·신기술투자조합 간 차이, 개인 GP·법인 GP·공동 GP 차이, 세무서 관할 차이, 은행·지점 차이. 이 항목들이 CI4에서 검증된 것으로 오인되지 않도록 명시한다.

---

**RESULT=PASS_FOR_BETA**

STATUS=CI4_ALPHA_VALIDATION_COMPLETED
NEXT_OWNER=GPT_AND_USER
