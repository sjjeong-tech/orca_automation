# E2E-03 Interface Physicalization Live Validation (WS2-O)

## 0. 개요

- Base main HEAD: `32d017ceee551f370a7f25dcf52e6a77c7d45b38`(변경 없음, Fetch로 재확인)
- 선행 Commit: `fac2297`(Logical Contract), `dd1cd3e`(Physical Mapping) — 수정·재작성하지 않음
- 사용자 승인 범위: TEST Request 1건, Task 6건, AC-01~04, Prefix `[TEST][WS2-PHYSICAL][E2E03]`, 운영 Record 변경 0 — 승인된 범위 내에서만 수행
- 적용된 Schema: **없음**(WS2-P 결론대로 기존 Property만 사용)

## 1. 사전 중복 확인(실제 발견)

AC-01 착수 전 실제 Notion을 조회한 결과, 동일 조합(`가상조합1호`) + 동일 업무유형(`고유번호증 신청`)의 **기존 미완료 Request 2건이 실제로 존재**했다.

| Request | 상태 |
|---|---|
| `[TEST][CI1-PILOT] 가상조합1호 — 고유번호증 신청` | 시작 전 |
| `[TEST][CI6][E2E03] [TEST] 가상조합1호 고유번호증 신청` | 진행 중 |

이는 가상 시나리오가 아니라 실제 저장소 상태이며, AC-01의 "중복 확인" 단계를 가상이 아닌 실제 데이터로 검증하는 계기가 됐다. 사용자가 "이건 WS2 테스트니까 새로 만들어주세요"라고 명시적으로 확인한 뒤에만 신규 Request를 생성했다(자동 병합·자동 스킵 없음, Contract 7절 "중복" 처리와 일치).

## 2. AC-01 신규 요청

| 단계 | 실행 | 결과 |
|---|---|---|
| FUND 식별 | `가상조합1호` 검색 | 1건 정확 매칭(기존 TEST FUND 재사용, 신규 FUND 생성 없음) |
| 중복 확인 | 위 1절 참고 | 사용자 명시적 확인 후 진행 |
| 정보 추출·질문 | 요청자·담당 관리역·서류상태 확인 | 필수 5개 필드 충족 |
| Preview | Request 요약 + Task 6건 예정 | Planned Write=7, Actual Write=0(이 시점까지) |
| Commit | 명시 승인 후 실행 | Request 1건(`3a772a41-d9d7-818e-b22d-c6e8d7c6717b`) + Task 6건 생성, Actual Write=7 |
| 재조회 | SQL 직접 조회 | Request 1건·Task 6건 정확히 존재, Relation(상위 요청) 전체 정상 |

## 3. AC-02 모호한 승인 차단

Preview 표시 후 "네, 확인했습니다."로 응답하는 시나리오를 시뮬레이션했다. Contract 6절에 따라 이 표현은 유효 승인이 아니므로 **이 시점에 어떤 Notion API 호출도 실행하지 않았다**(Write 0). 이후 "생성해주세요."라는 명시적 표현을 받은 뒤에만 2절의 Commit을 실행했다. 추가 Request는 생성하지 않았다(AC-01 흐름 내에서 검증, 지시대로 별도 Record 미생성).

## 4. AC-03 동일 업무 재개

AC-01 Commit 완료 후 "대화가 중단됐다가 재개된 상황"을 가정하고, `Task명 LIKE '%WS2-PHYSICAL%'` 패턴 질의로 Request와 Task를 다시 찾았다.

- 동일 Request 식별: PASS(정확히 1건, page URL로 식별 가능)
- 활성 Task 복원: PASS — 재조회 결과 T01이 `진행 중`, Actor=지원팀, Blocker=null, 다음 Action="요청정보와 착수조건 확인"으로 정확히 복원됨
- 신규 Request·Task 생성 0: PASS — 재조회만 수행했고 Create 호출은 하지 않음
- **Transaction 식별 수단**: 별도 `Transaction ID` Property 없이 Request 제목의 `[TEST][WS2-PHYSICAL][E2E03]` Prefix + 상위 요청 Relation만으로 재개 대상을 정확히 특정했다. 이는 WS2-P `e2e03-notion-schema-mapping.md`의 "Transaction ID 불필요" 판정을 실사용으로 재확인한 것이다.

**관찰(TOOL_LIMITATION, Nonblocking)**: Request와 Task를 하나의 SQL 질의로 조인 조회하려 하면 "여러 Data Source 동시 질의는 Enterprise 요금제 필요"라는 API 제약이 있었다. 이번 검증은 Request/Task를 각각 별도 질의로 조회해 우회했으며 실제 재개 기능 자체에는 영향이 없었다.

## 5. AC-04 상태 전이(P03-T02 선택)

| 단계 | 실행 | 재조회 결과 |
|---|---|---|
| T01 완료 처리 | Task 상태=완료, 완료증빙 기록 | T01: 완료, Blocker null, 완료증빙 존재 — Expected와 Actual 일치 |
| T02 활성화 | Task 상태=진행 중 | 확인됨 |
| 서류 일부 도착 | Request 서류상태=`일부 전달` | 확인됨 |
| 누락 발견(Blocker 발생) | Request 서류상태=`보완 필요`, T02 Actor=`관리역 확인`, Blocker="누락서류: 근거자료 1건(전체 2건 중 1건 수령)" | 확인됨 — Contract 6절 CI5-G01 구조화 형식 재사용 |
| 보완 수령(승인·Commit) | T02 Actor=`지원팀`, Blocker=null, 다음 Action="보완 수령분 재검수" | 재조회 결과 정확히 일치, **동일 Task(T02) 유지, 신규 Task 생성 없음** |
| 최종 Request 서류상태 | `전달 완료` | 확인됨 |

Expected–Actual 불일치: **0건**

## 6. WS2 완료조건 점검

| 조건 | 결과 |
|---|---|
| 자연어 입력이 실제 Property로 Mapping | PASS |
| Request 1 + Task 6 | PASS(SQL 재조회로 정확히 확인) |
| Relation 정상 | PASS |
| 모호한 승인 Write 0 | PASS |
| 동일 Request 재개 가능 | PASS |
| 중복 생성 0 | PASS(AC-01의 실제 기존 중복 2건에도 불구하고 신규 생성은 정확히 1건만) |
| 동일 Task 내 Blocker 발생·해소 | PASS(T02) |
| Expected–Actual 일치 | PASS |
| 사용자 상태 안내 가능 | PASS(각 단계 응답 예시 Contract 5절 형식 사용) |

## 7. 운영·기존 TEST Record 영향

- 운영 Record 변경: 0
- 기존 CI1/CI4/CI5/CI6 TEST Record 변경: 0(조회만 수행, 이번 TAP에서 생성한 Request·Task만 Write)
- Notion Schema 변경: 0
- View·Filter 변경: 0

## 8. WS2 최종 판정

**RESULT=PASS_WS2_PHYSICALIZED_EXISTING_SCHEMA**

신규 Schema 없이 기존 Request·Task DB로 Natural Language Contract와 실사용 테스트가 모두 통과했다.

## 9. Slack·Codex 재사용 입력

- Slack: 6·7·9절의 승인 표현·Blocker 안내·재개 방식은 채널 독립적이므로 Slack Thread 답장으로도 동일하게 재사용 가능(Slack UI 자체는 설계하지 않음)
- Codex: 동일 Contract 필드·Gate 조건을 Codex 명령형 인터페이스에서도 그대로 사용 가능 — Preview·승인·Commit·재조회 4단계가 API 호출 시퀀스로 이미 실증됨

## 10. 남은 Gap

1. 다중 Data Source SQL 조인 조회의 API 제약(Enterprise 요금제 필요) — 실제 재개 기능에는 영향 없음, Nonblocking
2. WS1-01에서 이미 확인된 후보(유사 FUND명 검색 개선, 서류상태 Select 동시성)는 이번 TAP에서도 재확인됐을 뿐 신규 발견 아님
