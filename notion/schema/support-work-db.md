# 지원팀 업무 DB — Post-Pilot Option

## 재분류

기존 CP-05-P1의 신규 상위 업무 DB 설계는 삭제하지 않고 `POST_PILOT_OPTION`으로 재분류한다. Pilot A에서는 생성하지 않는다.

현재 상위 Record는 기존 `TO DO LIST (FUND)`의 `조합(결성)` Record다. 신규 중앙 DB는 `지원팀 업무요청 DB`와 `지원팀 Task DB` 두 개만 검토한다.

## 도입 재검토 조건

- 동일 조합에서 독립 완료조건을 가진 반복 요청이 증가한다.
- 조합 Record와 요청 Record만으로 업무 묶음·성과·담당 범위를 표현하기 어렵다.
- Pilot에서 요청과 Task 사이에 별도 실행 단위가 필요하다는 증거가 축적된다.
- AG-05 및 Pilot Review에서 사용자가 도입을 승인한다.

## 보존한 설계 원칙

- 독립 완료조건을 가진 업무는 서로 분리한다.
- 실제 상태는 Notion, Process Rule은 Orca에 둔다.
- 실제 파일은 Drive에 두고 Notion에는 경로와 비민감 메타데이터만 둔다.
- 자동 ID·상태 전이·Rollup은 Pilot 검증 전 만들지 않는다.

## Pilot A 처리

| 항목 | 처리 |
|---|---|
| 신규 지원팀 업무 DB | 생성하지 않음 |
| 상위 조합 Record | 기존 `TO DO LIST (FUND)` 재사용 |
| 요청 원문 | 신규 `지원팀 업무요청 DB` |
| 실행 상태 | 신규 `지원팀 Task DB` |
| 향후 판단 | CP-05-B3 Pilot Review |
