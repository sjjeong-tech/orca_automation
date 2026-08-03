# UX Acceptance 기준

전부 **실제 DOM 검증**으로 판정한다. Screenshot 한 장으로 PASS 처리하지 않는다.

## A. 10개 핵심 질문 — 요청 3건 × 10문 = 30건

각 질문마다 기록한다: 질문 / 기대 화면 위치 / 실제 DOM 텍스트 / PASS·FAIL / Gap.

| # | 질문 | 화면 | 기존 상태 |
|---|---|---|---|
| 1 | 어떤 요청이 들어왔는가 | A | 기존 PASS 유지 |
| 2 | 어떤 업무 Task가 만들어졌는가 | A | **확장** — 건수가 아니라 Task별 식별 |
| 3 | 지금 누가 무엇을 해야 하는가 | A | 기존 PASS 유지 |
| 4 | 무엇 때문에 진행이 멈췄는가 | A | 기존 PASS 유지 |
| 5 | 사람 확인이 필요한가 | A | **확장** — 질문 원문까지 |
| 6 | 어떤 Evidence가 부족한가 | A | **신규** |
| 7 | Notion 반영 준비가 되었는가 | B | 기존 PASS 유지 |
| 8 | 반영 불가 시 먼저 확인할 것 | B | 기존 PASS 유지 |
| 9 | 실제로 생성된 Record는 무엇인가 | C | **신규** (Placeholder 상태 검증) |
| 10 | 재실행 시 중복이 없었는가 | C | **신규** (Placeholder 상태 검증) |

기존 v0.4.1은 7문 × 3건 = 21건이었다. **30건으로 확장한다.**

## B. Layout 기준

| 기준 | 판정 방법 |
|---|---|
| 1440px 첫 화면에 현재 요청·현재 Action·Blocker가 보인다 | viewport 1440×900 스크린샷에서 셋 다 DOM 가시 |
| 페이지 세로 길이가 v0.4.2보다 짧다 | 화면 A `scrollHeight` 측정, v0.4.2 대비 기록 |
| 기술 JSON이 기본 접힘 | 초기 로드 시 `raw-json` 영역 비가시 |
| 빈 Kanban Column이 화면을 과점하지 않는다 | Kanban 기본 접힘 확인 |
| 좁은 화면 세로 흐름 | viewport 390×844에서 가로 스크롤 0 |
| 색상 단독 상태 전달 없음 | 모든 상태 배지에 텍스트 Label 동반 |
| 비활성 버튼에 이유 표시 | 비활성 시 인접 노드에 사유 텍스트 존재 |

## C. Interaction 기준 (회귀 방지)

| 항목 | 기대 |
|---|---|
| Request 3건 각각 선택 | 3건 모두 본문 갱신 |
| 왕복 선택 | 되돌아와도 정상 갱신 |
| 빠른 연속 선택 | 마지막 선택이 최종 표시 |
| 승인 상태 격리 | Request 변경 시 승인 상태 초기화 |
| 화면 A↔B↔C 이동 | 선택 Request 유지 |
| 기술 상세 열기·닫기 | 정상 토글 |
| 서버형 Console | 전 항목 통과 |
| 독립 HTML | 전 항목 통과 |
| Browser Console Error | **0** |
| Unhandled Rejection | **0** |

## D. Safety 기준

| 항목 | 기대 |
|---|---|
| completion_candidate=true 표시 | "완료"가 아니라 "완료 후보" |
| Request 자동 완료 | 발생하지 않음 |
| Downstream 자동 진행 | 발생하지 않음 |
| Evidence 불명확 시 완료 | 차단 |
| 승인 전 Notion Write | **0** |
| 승인 전 Operational Write | **0** |
| 미구현 Scenario 3건 요청 | 안전 안내, 크래시 없음 |

## E. Notion Preview 기준

| 항목 | 기대 |
|---|---|
| Mapping Preview | 실제 Property 이름·타입 표시 |
| Relation Preview | Request `하위 Task` ↔ Task `상위 요청` 양방향 반영 |
| Duplicate Preview | 전용 `Transaction ID`로 직접 조회 (프록시 아님) |
| Fund Relation Gap | DUMMY-FUND-A/B/E NO_MATCH 표시 |
| Composite Task Process 보존 | P03·P04·P07 각각 유지, 단일 Select 축약 없음 |
| Actual Write | **0** |

## F. 산출물 Gate

| 산출물 | 필수 |
|---|---|
| 실행 가능한 Console | 예 |
| 독립 HTML | 예 |
| PNG | 예 (화면별) |
| Output JSON | 예 |
| Demo Guide | 예 |
| UX Validation JSON (30건) | 예 |
| Browser E2E Evidence | 예 |

## 판정

- A 30건 전부 PASS
- B 7항목 전부 PASS
- C 10항목 전부 PASS (Error 0 포함)
- D 7항목 전부 PASS
- E 6항목 전부 PASS
- F 7종 전부 존재

하나라도 미달이면 FAIL로 보고한다. 부분 통과를 성공으로 쓰지 않는다.
