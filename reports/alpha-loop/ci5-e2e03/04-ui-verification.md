# CI5 — UI Verification (Subagent E)

## 도구 한계 고지(TOOL_LIMITATION)

이 세션(Claude Code CLI)에는 "Claude in Chrome" 확장 프로그램 또는 다른 브라우저 자동화 도구가 연결되어 있지 않다. 따라서 이번 TAP이 요청한 6개 Chrome UI Checkpoint는 브라우저 육안 확인 대신 **Notion API 실시간 조회(`notion-fetch`, `notion-query-data-sources`)로 대체**했다. 이는 임의 판단이 아니라 CI2·CI4에서 이미 확립된 `USER_NOTION_UI_VISUAL_CONFIRMATION` vs `API 자동검증 제한` 구분 원칙을 그대로 따른 것이며, API로 확인되지 않는 항목(Rollup 표시값)은 전체 기능 실패로 과장하지 않고 `NOT_VERIFIABLE_BY_API`로 분리 기록한다.

## Checkpoint별 결과

| # | 시점 | 확인 방법 | 결과 |
|---|---|---|---|
| 1 | Request·Task 최초 생성 | `notion-create-pages` 응답 + 이후 재조회 | Request 1건(`3a772a41d9d78124a81bf24e9781563e`), Task 6건 생성 확인, 각 Task `상위 요청` Relation이 Request를 정확히 가리킴 |
| 2 | P03-T02 일부 전달·보완 필요 | `notion-query-data-sources` SQL 재조회(S3~S6) | 서류 상태 `일부 전달`→`보완 필요`→`전달 완료` 순차 전이, Blocker 텍스트에 수령 범위(2/3) 기록 확인 |
| 3 | P03-T03 날인본 대기·수령 | 동일 방식(S7~S10) | Actor `GP`→`지원팀` 전환, Blocker 생성·해소 확인 |
| 4 | P03-T04 접수 완료 | 동일 방식(S11~S13) | 완료증빙 `접수증 스캔본 확인` 기록, Request는 여전히 `진행 중`으로 유지됨을 확인 |
| 5 | P03-T05 결과 대기 | 동일 방식(S13~S15) | Actor `외부기관`→`지원팀` 전환, 완료증빙 `고유번호증 실물 수령 확인` |
| 6 | P03-T06 최종 완료 | 동일 방식(S16~S17) | T06 완료 확인 **이후에만** Request `완료`로 전환됨을 순서대로 확인 |

## Relation·Rollup 재확인

- `상위 요청`(Task→Request) Relation: 6건 전체 정상 — API로 직접 확인 가능
- `관련 조합`(Task Rollup) 표시값: 신규 생성한 T01 페이지를 직접 `fetch`한 결과 여전히 `"관련 조합":"<omitted />"` — CI2·CI4와 동일한 API 구조적 제한이 이번 신규 Record에도 동일하게 적용됨을 재확인
- **판정: `NOT_VERIFIABLE_BY_API`** — Relation 경로 자체(Task→Request→FUND)는 Schema·데이터 구조로 확인됐으나 Rollup 표시값의 육안 확인은 Chrome 등 실제 UI 접근이 없어 이번 TAP에서도 수행하지 못했다. 전체 기능 실패로 간주하지 않는다.

## 민감정보 제외

이번 UI/API 검증 과정에서 실제 개인 연락처, 계좌번호, 인증정보는 조회·기록하지 않았다. Workspace Person(`정상준`)은 기존 CI1~CI4 TEST 관례와 동일하게 재사용했다.
