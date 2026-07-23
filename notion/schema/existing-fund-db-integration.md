# Existing FUND DB Integration

## 기준 DB

- DB: `TO DO LIST (FUND)`
- 적용 범위: `조합(결성)` View용 Record
- 역할: 조합 단위 기준 Record, 조기 예정 등록, 내부 Page, 운영팀·지원팀 공통 진입점

## 보호 원칙

- 기존 다른 View와 Template을 변경하지 않는다.
- 기존 Property를 삭제하거나 Type을 변경하지 않는다.
- 기존 내부 결성 DB와 매뉴얼·체크리스트를 유지한다.
- 상세 행정정보는 상위 DB에 저장하지 않는다.
- 신규 Property는 0~3개 후보만 비교하고 기존 Property로 대체 가능하면 추가하지 않는다.

## Property 후보

| 후보 | 목적 | 기존 Property 대체 확인 | S1 처리 |
|---|---|---|---|
| 지원팀 요청 단계 | 2차 요청 준비·진행 가시성 | 확인 필요 | 후보, 미확정 |
| 결성 확정 수준 | 예정과 착수 가능 상태 구분 | 확인 필요 | 후보, 미확정 |
| 예상 결성일 | 예정 일정 가시성 | 기존 일정 Property 확인 필요 | 후보, 미확정 |

## 조합 내부 Page

1. 조합 기본정보
2. 기존 결성업무 매뉴얼·체크리스트
3. 지원팀 행정업무 요청 Form 링크
4. 관련 조합 Relation으로 필터된 지원팀 업무요청 Linked View
5. 관련 조합 Relation으로 필터된 지원팀 Task Linked View
6. 관리역 확인 대기
7. 완료 업무
8. 관련 파일·폴더

Linked View 2개는 중앙 DB를 호출하며 기존 내부 DB를 대체하지 않는다.
