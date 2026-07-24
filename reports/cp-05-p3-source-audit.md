# CP-05-P3 Source and Contract Audit

## 판정

`PASS_WITH_NON_BLOCKING_GAPS`. P3 입력 Gate인 AG-P2 승인과 J-01 통과가 사용자·GPT 결정으로 충족됐다. Pilot A의 Mapping 대상은 P01·P03·P04·P07·P08, 총 61개 Atomic Task다.

## Canonical 입력

| 우선순위 | 계약 | 범위 | 판정 |
|---|---|---|---|
| 1 | `processes/01,03,04,07,08` | 행동·Input·Output·Actor·Source | 사용 |
| 2 | `notion/model/*` P2 계약 | 요청 7상태, Task 6상태, Evidence 9종, Approval 8개 | 변경 없이 사용 |
| 3 | `notion/schema/support-request-db.md`, `support-task-db.md` | 실제 Skeleton Property 13·14개 | 사용 |
| 4 | GPT TEST Record·사용자 화면 검증 | Person, 기본상태, Relation 선택성, View 노출 | J-01 근거 |
| 5 | `variations/*` | 조합·GP·계좌·기관 차이 | 상태 경계 유지 |

## 중복·노후 문서

- `operational-task-candidates.md`는 후보 목록이며 확정 Template이 아니다.
- `operational-task-catalog.md`는 P2 상태·증빙 Contract이지만 P3에서 Atomic ID와 집약 관계를 추가해야 한다.
- `property-deferment-matrix.md`보다 P2 이후의 `property-stage-matrix.md`와 승인된 P2 보고서를 우선한다.
- S1의 3상태 Skeleton은 실제 Notion 현황이며, P3의 Canonical 의미는 승인된 P2 7/6상태다. 실제 옵션 변경은 별도 Build Work Order 대상이다.

## 경계 판정

- Process Atomic Task는 전부 추적하되 Notion Task Record와 1:1로 강제하지 않는다.
- Notion Operational Task는 사람이 상태·담당·기한·증빙을 추적할 가치가 있는 집약 단위다.
- Request는 업무 전체 Lifecycle, Task는 실행 Lifecycle이다.
- P3는 Mapping만 작성하며 Notion·Process·Variation·Source를 수정하지 않는다.

## 미차단 Gap

N-06 Rollup 실제값, 1·2차 Form UI 최종 구성, 신기술 조합 명칭 정규화, 수탁계좌 기준, 기관·지점 선택 기준은 확인 필요다. N-06만 J-02 Build 전 필수이며 P3를 차단하지 않는다.
