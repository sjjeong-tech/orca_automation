# Evidence Control Mapping

| Evidence | 주요 Atomic 범위 | Notion 저장 | 실제 저장 | 필수/조건부 | 검증 |
|---|---|---|---|---|---|
| EV-SOURCE | SS-01~03, UN-02~07, SC-01, AO-03~05 | 요청 `원본 폴더`, Task `완료증빙` | Drive | 착수 전 필수 | HA-01/02 |
| EV-PACKAGE | UN-08~11, SC-02, AO-06~11, AS-03/06 | Task `완료증빙` | Drive | 제출 Task 필수 | HA-03/06 |
| EV-RECEIPT | UN-11~12, SC-03, AO-11 | Task `완료증빙` | Drive | 기관 접수 시 필수 | 지원팀 |
| EV-RESPONSE | UN-13, AO-12, AS-01/08/09 | Task `완료증빙` | Drive 또는 비민감 기록 | 조건부 필수 | HA-05 |
| EV-RESULT | UN-15~16, SC-10, AO-12~13 | Task `완료증빙` | Drive | 결과 Task 필수 | HA-07 |
| EV-SCAN | UN-09/16, SC-02, AO-09~10, AS-07 | Task `완료증빙` | Drive | Process별 조건부 | HA-03/07 |
| EV-DELIVERY | SS-04/06/08/11, UN-12/15/16, SC-11, AO-11/13, AS-06 | Task `완료증빙` | Notion 메타 + Drive | 전달 Task 필수 | HA-07 |
| EV-PHYSICAL | SS-09/11, UN-01/15/16, SC-04/05, AO-01/14, AS-05/08 | 요청 Checkbox + Task Text | 실물, Notion 메타 | 실물 경로 조건부 | Human |
| EV-COMPLETE | 모든 완료 Task/Request | Task 상태·완료증빙, 요청 상태 | Notion | 완료 시 필수 | HA-08 |

민감 파일과 인증값은 Git 또는 Notion에 복제하지 않는다. Agent는 비민감 경로·파일 존재·명명만 검사할 수 있고 내용 승인자는 사람이 맡는다.
