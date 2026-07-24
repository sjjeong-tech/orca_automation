# P2 Property Stage Matrix

실제 Notion 변경은 하지 않았다. 아래는 AG-P2 승인 후 별도 Build TAP의 입력이다.

| 대상 DB | 현재 Property | 변경 제안 | 변경 유형 | Pilot 필요성 | 적용 시점 |
|---|---|---|---|---|---|
| 요청 | 요청 상태 | RQ-NEW~RQ-CANCEL 7개 옵션 적용 | OPTION_CHANGE_PROPOSED | 필수 | AG-P2 후 |
| 요청 | 요청일 | 유지 | KEEP | 필수 | 현재 |
| 요청 | 목표일 | 유지 | KEEP | 필수 | 현재 |
| 요청 | 요청자 | 유지 | KEEP | 필수 | 현재 |
| 요청 | 담당 관리역 | 유지 | KEEP | 필수 | 현재 |
| 요청 | 원본 폴더 | 승인된 Drive 경로만 기록 | KEEP | 필수 | 현재 |
| 요청 | 요청 내용 | 원문·확정정보 기록 | KEEP | 필수 | 현재 |
| 요청 | 특이사항 | 예외·조건의 비민감 메모 | KEEP | 선택 | 현재 |
| Task | Task 상태 | TS-TODO~TS-CANCEL 6개 옵션 적용 | OPTION_CHANGE_PROPOSED | 필수 | AG-P2 후 |
| Task | 현재 Actor | ACT-OPS~ACT-EXTERNAL 5개 옵션 정렬 | OPTION_CHANGE_PROPOSED | 필수 | AG-P2 후 |
| Task | Blocker | 구조화 Text 규칙 적용 | KEEP | 필수 | P2 승인 후 운영규칙 |
| Task | 다음 Action | Actor의 다음 행동·재확인 일자 기록 | KEEP | 필수 | 현재 |
| Task | 완료조건 | 관찰 가능한 문장 규칙 적용 | KEEP | 필수 | P3 Mapping |
| Task | 완료증빙 | Evidence ID·대표 경로·확인자 기록 | KEEP | 필수 | P3 Mapping |
| Task | 담당자 | 실행·추적 책임자 유지 | KEEP | 필수 | 현재 |
| Task | 목표일 | 대기 중에도 유지 | KEEP | 필수 | 현재 |
| Task | 대표 증빙 URL | 클릭 가능한 대표 Drive 경로 후보 | ADD_PROPOSED | 선택 | AG-P2 후 검토 |
| Evidence | 별도 DB | Pilot 결과에서 다중 증빙·감사 요구 확인 시 도입 | DEFER_POST_PILOT | 비필수 | B3 이후 |

`RENAME_PROPOSED`와 `REMOVE_NOT_RECOMMENDED` 항목은 없다. 기존 Property 삭제·Type 변경은 권장하지 않는다.
