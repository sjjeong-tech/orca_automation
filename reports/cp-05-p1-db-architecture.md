# CP-05-P1-R1 — Existing Notion Architecture Realignment

## 판정

**PASS — 기존 FUND DB를 재사용하는 AG-S1 검토용 Architecture로 정렬했다.**

## 변경 전·후

| 구분 | 기존 P1 | P1-R1 |
|---|---|---|
| 상위 Record | 신규 지원팀 업무 DB | 기존 `TO DO LIST (FUND)`의 `조합(결성)` Record |
| 신규 DB | 업무 DB + Task DB | 업무요청 DB + Task DB |
| Relation | 업무 → Task | FUND → 요청 → Task |
| 1차 Form | 미구체화 | 기존 FUND DB 원본 |
| 2차 Form | 미구체화 | 신규 업무요청 DB 원본 |
| 기존 업무 DB 설계 | S1 Build 대상 | `POST_PILOT_OPTION` |

## S1 Architecture

| 항목 | 값 |
|---|---|
| 신규 DB | 지원팀 업무요청 DB, 지원팀 Task DB — 2개 |
| 재사용 DB | `TO DO LIST (FUND)` — 1개 |
| Relation | FUND↔요청, 요청↔Task — 2개 |
| 기존 DB 신규 Property | 후보 최대 3개, 실제 추가는 기존 Property 확인 후 0개 가능 |
| 요청 DB Property | 13개 |
| Task DB Property | 14개 |
| View | 기존 Form 후보 1, 요청 4, Task 5 — 최대 10개 |
| Linked View | 조합 Page 내 요청·Task 2개 |
| TEST | 안전한 TEST 조합 1개 참조, 요청 1개, Task 8개 |

## Form 경계

- 1차 Form `조합 결성 예정 등록`: 기존 FUND DB에 조기 예정·기준 Record를 만든다.
- 2차 Form `지원팀 행정업무 요청`: 착수 가능한 확정정보·서류를 요청 DB에 저장한다.
- 1차 정보 재입력은 금지하고 관련 조합 Relation을 사용한다.
- 조건부 입력과 자동 Task 생성은 P4/P3 전 확정하지 않는다.

## 기존 DB 보호

- 기존 다른 View·Template·Property를 변경하거나 삭제하지 않는다.
- 기존 내부 결성 DB와 매뉴얼·체크리스트를 유지한다.
- 중앙 요청·Task DB는 조합 Page의 필터된 Linked View로 표시한다.
- 상위 DB에는 상세 행정정보를 저장하지 않는다.

## 테스트 권장안

기존에 격리된 TEST Template 또는 TEST Record를 먼저 확인해 활용하는 **선택안 A**를 권장한다. 없거나 안전성이 확인되지 않으면 사용자가 승인한 별도 `[TEST] 조합 결성 예정` Record를 만든다. 실제 Record Read-only 참조 방식은 오연결·정보 노출 위험 때문에 권장하지 않는다.

## AG-S1 승인자료

| 승인 항목 | 요청 |
|---|---|
| 기존 DB | `TO DO LIST (FUND)`와 `조합(결성)` View의 읽기 확인·Relation 대상 사용 |
| 신규 생성 | 업무요청 DB와 Task DB |
| Form | 기존 DB Form 후보 1개, 요청 DB 최소 Form |
| Relation | 2개 |
| View | 요청 3~4개, Task 3~5개 |
| Page | Form 링크 영역, Linked View 2개 |
| TEST | A안 우선, B안은 별도 승인 |
| 권한 | DB·Relation·View·Form·TEST Record 생성 권한 |
| 금지 | 기존 View/Property/Template 삭제·변경, Automation, Slack, Agent Write, 전체 Mapping |
| Rollback | TEST Task → TEST 요청 순서 정리; 기존 FUND 자산은 삭제하지 않음 |

AG-S1은 아직 `APPROVAL_REQUIRED_BEFORE_BUILD`다. 실제 Notion 위치·Property·권한을 읽기 확인한 뒤 GPT와 사용자가 S1 범위를 승인해야 한다.

## S1 Build Input

- [기존 FUND DB 연계](../notion/schema/existing-fund-db-integration.md)
- [1·2차 Form Architecture](../notion/schema/intake-form-architecture.md)
- [업무요청 DB](../notion/schema/support-request-db.md)
- [Task DB](../notion/schema/support-task-db.md)
- [Relation](../notion/schema/support-db-relations.md)
- [View](../notion/schema/skeleton-views.md)
- [TEST 방식](../notion/schema/skeleton-test-records.md)
- [Property 유예](../notion/schema/property-deferment-matrix.md)
- [Operational Task 후보](../notion/schema/operational-task-candidates.md)
- [Post-Pilot 업무 DB 옵션](../notion/schema/support-work-db.md)

## Scope

- Notion 변경: 0
- Process·Variation·Source 변경: 0
- Approval Gate 승인: 0
- CP-05-S1 실행: 0
