# 지원팀 업무·Task DB Relation 명세

## 1:N 구조

```text
지원팀 업무 DB 1
        │ 관련 Task
        ▼
지원팀 Task DB N
        │ 상위 업무
        └──────────► 지원팀 업무 DB 1
```

하나의 업무 Record에는 여러 Operational Task가 연결되고, 각 Task는 정확히 하나의 상위 업무에 연결된다.

## Relation 정의

| Relation | From | To | Cardinality | S1 | 목적 |
|---|---|---|---|---|---|
| 관련 Task / 상위 업무 | 지원팀 업무 DB | 지원팀 Task DB | 1:N, 양방향 | Required | 업무에서 Task 목록을 보고 Task에서 업무·조합 문맥을 찾음 |

- Notion에서는 Task DB의 `상위 업무` Relation을 만들고 업무 DB에 `관련 Task` 역방향 Property를 노출한다.
- Task DB의 View에는 `상위 업무`를 표시해 Rollup 없이 업무명과 조합 문맥을 확인한다.
- S1 Relation 수는 논리 Relation 1개다. 양방향 Property는 두 DB에 각각 1개씩 보인다.

## Rollup 후보

S1 Required Rollup은 0개다. 아래 2개는 P2/P3 이후 후보이며 S1에서 만들지 않는다.

| 후보 | 위치 | 값 | 후속 단계 | 이유 |
|---|---|---|---|---|
| 전체 Task 수 | 업무 DB | 관련 Task Count | P3 | Task Template 확정 전 수치의 의미가 불안정 |
| 미완료 Task 수 | 업무 DB | 완료가 아닌 Task Count | P2/P3 | 상태 체계와 Formula 승인 전 제외 |

## Relation QA

1. 테스트 업무 1건을 만든다.
2. 테스트 Task 9건의 `상위 업무`를 해당 업무로 지정한다.
3. 업무 Record의 `관련 Task`에 동일한 9건이 보이는지 확인한다.
4. Task View에서 상위 업무명이 모두 `[TEST] Pilot A 신규 행정`인지 확인한다.
5. 다른 업무 Record에 잘못 연결된 Task가 0건인지 확인한다.
6. Relation을 해제한 Task가 양쪽 DB에서 동시에 분리되는지 확인한 뒤 복원한다.

## Relation 실패 시 처리

- 역방향 Property가 없으면 새 Relation을 추가하지 말고 기존 Relation 설정에서 양방향 표시를 복구한다.
- 상위 업무가 둘 이상 연결되면 S1 QA 실패로 처리하고 하나만 남긴다.
- 연결 대상 DB가 틀리면 Test Record를 추가하지 않고 Build를 중단한다.
- Rollup으로 문제를 우회하지 않는다.

## 삭제·분리 영향

- 업무 Record 삭제 전 연결 Task 존재 여부를 확인한다.
- S1 Rollback은 테스트 Task를 먼저 보관 또는 삭제한 뒤 테스트 업무를 처리한다.
- 업무 분리 시 Task를 새 업무 Record에 재연결하고 양쪽 Task 수를 대조한다.
- 실운영 Record 삭제·외부 쓰기는 별도 승인 없이는 수행하지 않는다.
