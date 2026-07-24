# Form 1 / Form 2 Interface Mapping

| 항목 | 1차 Form | 2차 Form |
|---|---|---|
| 목적 | 결성 가능성 사전예고 | 실제 지원팀 착수 요청 |
| 원본 DB | `TO DO LIST (FUND)` | `지원팀 업무요청` |
| 상태 | GPT 직접 DB 생성·사용자 View 노출 검증; UI 편집 Backlog | Skeleton 질문 미완료 |
| 핵심값 | 임시 조합명, 담당 관리역, 구분, 업무분류, 선택 Relation, 긴급 가능성, 특이사항 | 관련 조합, 요청 유형, 요청자, 담당 관리역, 목표일, 원본 폴더, 실물 여부, 요청 내용 |
| 생성 결과 | FUND 조합 Record | Request Record `RQ-NEW` |
| Task 생성 | 금지 | HA-02 통과 후 Contract 적용 |

## Interface 규칙

1. 1차 정보는 Relation/Rollup으로 재사용하고 재입력을 요구하지 않는다.
2. 기존 조합 Record가 없으면 1차 Title을 사용하고 Relation은 비워둘 수 있다(J-01 검증 완료).
3. 1차 제출은 지원팀 착수 지시가 아니다.
4. 2차 요청은 Process 유형과 실행 Input을 확정한다.
5. Form UI 질문·Required 설정은 별도 UI Workstream이며 P3에서 수정하지 않는다.
6. Task `관련 조합` Rollup은 N-06 검증 전 Build에 사용하지 않는다.
