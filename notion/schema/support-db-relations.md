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

| Relation | From | To | Cardinality | S1 결과 | 목적 |
|---|---|---|---|---|---|
| 관련 조합 | 업무요청 DB | 기존 FUND DB | 조합 1:N 요청 | `SAFE_FALLBACK` 단방향 | 요청 원문을 조합 Record에 연결 |
| 관련 Task / 상위 요청 | 업무요청 DB | Task DB | 요청 1:N Task | 양방향 생성·검증 | 요청에서 실행 Task 추적 |

Task의 `관련 조합`은 `상위 요청`을 통한 Rollup으로 생성했다. TEST 요청은 실제 FUND Record에 연결하지 않았으므로 Relation 형식과 Rollup Schema만 확인했고 실제 조합 값 계산은 유예했다.

## Linked View

- 안전한 별도 TEST Page에 업무요청·Task Linked View 블록 2개를 생성했다.
- TEST Page: [지원팀 Skeleton Linked View](https://app.notion.com/p/3a672a41d9d78100a122f78c9c49ef59)
- 실제 조합 Page는 수정하지 않았다.
- `관련 조합=현재 조합` 자동 필터는 실제 FUND Record를 사용하지 않아 미검증이며 수동 필터 방식과 함께 후속 검토한다.
- 기존 내부 결성 DB는 유지한다.

## QA

1. TEST 요청 1건과 TEST Task 8건의 상위 요청 연결을 확인했다.
2. 요청의 역방향 `관련 Task`에서 Task 8건을 확인했다.
3. 별도 TEST Page의 Linked View 블록 2개 생성을 확인했다.
4. 기존 View·Filter·Template·Property·Record 변경은 0건이다.
5. 실제 조합 Relation, Rollup 값, 현재 Page 자동 필터는 안전 제약으로 유예했다.

## Rollback

외부 Record 정리는 대상 확인과 승인 후 Task → 요청 순서로 수행한다. 기존 FUND Record, View, Template과 내부 DB는 삭제하지 않는다.
