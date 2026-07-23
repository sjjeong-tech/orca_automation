# Existing FUND·요청·Task Relation 명세

## 구조

```text
기존 TO DO LIST (FUND) 조합 Record 1
                    │ 관련 조합
                    ▼
지원팀 업무요청 DB N
                    │ 상위 요청
                    ▼
지원팀 Task DB N
```

## Relation

| Relation | From | To | Cardinality | S1 | 목적 |
|---|---|---|---|---|---|
| 관련 조합 / 지원팀 요청 | 업무요청 DB | 기존 FUND DB | 조합 1:N 요청 | Required | 요청 원문을 조합 Record에 연결 |
| 관련 Task / 상위 요청 | 업무요청 DB | Task DB | 요청 1:N Task | Required | 요청에서 실행 Task 추적 |

Task의 `관련 조합`은 직접 Relation 또는 상위 요청을 통한 Rollup 중 실제 UI가 단순한 방식을 S1에서 선택한다. 복잡한 Rollup은 금지한다.

## Linked View

- 조합 Page의 업무요청 Linked View: `관련 조합=현재 조합`
- 조합 Page의 Task Linked View: `관련 조합=현재 조합`
- 기존 내부 결성 DB는 유지한다.

## QA

1. 안전한 TEST 조합 Record를 식별하거나 승인된 테스트 Record를 만든다.
2. TEST 요청 1건을 관련 조합에 연결한다.
3. TEST Task 6~9건을 상위 요청에 연결한다.
4. 조합 Page의 Linked View 2개에서 요청과 Task가 각각 보이는지 확인한다.
5. 다른 조합 Record에 노출되는 항목이 0건인지 확인한다.
6. 기존 View·Template·Property 변경이 0건인지 확인한다.

## Rollback

외부 Record 정리는 대상 확인과 승인 후 Task → 요청 순서로 수행한다. 기존 FUND Record, View, Template과 내부 DB는 삭제하지 않는다.
