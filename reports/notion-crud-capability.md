# CP-05-FT1-LR Notion CRUD Capability

검증일: 2026-07-24

| 기능 | 결과 | 근거 |
|---|---|---|
| Notion DB Read | PASS | FUND, 지원팀 업무요청, 지원팀 Task Schema·View 조회 |
| Record Create | PASS | TEST 요청 1건, TEST Task 6건 |
| Record Update | PASS | Request·Task 상태 2회 전이 |
| Record Delete | NOT_TESTED | 삭제는 범위 밖이며 TEST Record를 보존 |
| Relation Write | PASS | FUND→Request, Request→Task 저장 |
| Relation Read | PASS | Request에서 조합·Task 역참조 확인 |
| Rollup Read | API_LIMITED | Task `관련 조합`은 API에서 `<omitted />` |
| Form Read | PASS | 1차 8문항, 2차 1문항 확인 |
| Form Write | UNSUPPORTED_FOR_QUESTIONS | View 설정 호출은 성공했으나 질문 목록은 변경되지 않음 |
| Form Submit | NOT_TESTED | Connector에 Form 제출 기능 없음 |
| View Update | PASS_WITHOUT_FORM_QUESTION_EFFECT | Form 공개 설정은 호출 성공, 질문은 유지 |

## 대상 URL

- 1차 DB: https://app.notion.com/p/14d72a41d9d7806b878ef2459f181cfa
- 2차 DB: https://app.notion.com/p/c60e9bc03a214735be082ed54905970d
- Task DB: https://app.notion.com/p/b7f50ee986714213befb4268fdd36920
- TEST Request: https://app.notion.com/p/3a772a41d9d781209bc2fc30557d4824

운영 Record, 기존 운영 View·Filter, Template은 변경하지 않았다.
