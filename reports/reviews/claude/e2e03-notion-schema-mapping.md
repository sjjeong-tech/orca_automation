# E2E-03 Natural Language Contract ↔ Notion Schema Mapping (WS2-P)

## 0. 개요

- Base main HEAD(변경 없음 재확인): `32d017ceee551f370a7f25dcf52e6a77c7d45b38`
- 실제 Notion Schema 재조회 결과: Workmap·이전 CI4~CI6 기록과 구조적으로 동일. 유일한 변화는 DB 제목이 `지원팀 업무요청`/`지원팀 Task`에서 `[TEST]지원팀 업무요청`/`[TEST]지원팀 Task`로 표시된 것뿐이며, 이는 Workmap `e2e03_operational_standard.remaining_candidates`에 이미 "DB Title의 [TEST] 유지는 사용자 결정으로 종결"로 기록된 항목이 실제 반영된 것 — Gap 아님, Property·Relation·View 구조는 변경 없음
- 목적: `reports/reviews/claude/e2e03-natural-language-contract-draft.md`의 모든 요소를 A(Request Property)/B(Task Property)/C(Interface transient)/D(현재 Schema로 표현 어려운 후보)로 분류

## A. 기존 Request Property에 저장

| Contract 요소 | Request Property | 근거 |
|---|---|---|
| 업무유형(request_type) | 요청 업무 유형(Select) | CI2~CI6 공통 |
| 대상 조합(related_fund) | 관련 조합(Relation) | CI2~CI6 공통 |
| 요청자(requester) | 요청자(Person) | CI2~CI6 공통 |
| 담당 관리역(fund_manager) | 담당 관리역(Person) | CI2~CI6 공통 |
| 서류상태(document_status) | 서류 상태(Select: 미전달/일부 전달/전달 완료/보완 필요) | CI2~CI6 공통 |
| 목표일(target_date) | 목표일(Date) | CI2~CI6 공통 |
| 원문 요청 보존 | 요청 내용(Text) | **6절 D후보 "원문 요청 보존"은 이미 이 Property로 해결됨 — 신규 불필요** |
| 원본 폴더 언급 | 원본 폴더(URL) | 기존 Property, 이번 TAP에서 변경하지 않음(WS3 범위) |
| 예외·비정형 메모 | 특이사항(Text) | CI2~CI6 공통 |
| Task 연결 | 관련 Task(Relation) | 자동 연결, Contract가 직접 쓰지 않음 |
| Request 전체 상태 | 요청 상태(Status: 시작 전/진행 중/완료) | CI5에서 전이 순서 검증 완료 |

## B. 기존 Task Property에 저장

| Contract 요소 | Task Property | 근거 |
|---|---|---|
| Operational Task ID | Operational Task ID(Text) | CI2~CI6 공통 |
| Process 구분 | Process ID(Select: INTAKE/P03/P04/P07/P08) | CI2~CI6 공통 |
| Task 상태 | Task 상태(Status: 시작 전/진행 중/완료) | CI2~CI6 공통 |
| 현재 Actor | 현재 Actor(Select: 운영팀/지원팀/관리역 확인/외부기관/GP) | CI5에서 GP·외부기관 전환 검증 |
| 다음 Action | 다음 Action(Text) | CI5 전 구간 |
| Blocker | Blocker(Text) | CI5 전 구간, "누락서류: {서류명} {건수}(전체 {총건수} 중 {수령건수} 수령)" 구조화 형식 포함 |
| 완료조건 | 완료조건(Text) | CI2~CI6 공통 |
| 완료증빙 | 완료증빙(Text) | CI5 전 구간 |
| 목표일 | 목표일(Date) | 기존 Property |
| Request 연결 | 상위 요청(Relation) | CI2~CI6 공통 |
| FUND 표시(참고용) | 관련 조합(Rollup) | CI2·CI4에서 API `<omitted />` 확인, UI 육안검증만 가능(기존 제약, 이번 TAP에서 변경하지 않음) |

## C. DB에 저장하지 않는 일시적 인터페이스 상태

| 요소 | 처리 방식 | 근거 |
|---|---|---|
| 현재 질문 문구 | 대화 세션 내에서만 존재, DB 미저장 | Contract 2·5절 |
| 미확정 추론 후보(FUND 유사후보 등) | PREPARE 단계 메모리에서만 유지, Preview에 표시 후 폐기 | Contract 4절 |
| 승인 전 Preview | Notion Write 0, 대화 세션에만 존재 | Contract 2·10절 |
| 메시지 표현 형식 | 인터페이스별 자유(8절 Response Pattern은 내용 요소만 고정) | Contract 8절 |
| 대화 중 임시 파싱 결과 | Commit 성공 시에만 Property 값으로 확정, 그 전엔 세션 상태 | Contract 3절 |
| 승인 이력(누가·언제·어떤 표현으로 승인했는지) | Notion Property로 저장하지 않음 — Git 커밋 로그·본 TAP 보고서에만 기록 | 이번 TAP 신규 판단(아래 D 표 근거 참고) |
| 마지막 검증 시점 | Notion 자체 `createdTime`/최근 편집 시각으로 충분, 별도 Property 불필요 | 이번 TAP 신규 판단 |

## D. 현재 Schema로 표현하기 어려운 후보 — 평가 결과

| 후보 | 실업무 필수? | 중복방지 필수? | 기존 Property 대체 가능? | Request/Task 중 | 영속 저장 필요? | 실제 검증 사례 | 판정 |
|---|---|---|---|---|---|---|---|
| Transaction ID | 아니오 — CI4·CI5·CI6 전부 Request page URL/ID와 `[TEST][...]` 명명 규칙만으로 식별·재개·중복방지가 실제로 작동함 | 아니오 — 중복탐지는 `(관련 조합, 요청 업무 유형, 미완료 상태)` 조합 질의로 이미 작동(CI2 recheck·CI6) | 예 — Request page ID(URL)가 사실상의 영속 Transaction 식별자 역할을 함 | Request | 아니오 | CI4(5 Request), CI5(1 Request, 17 Snapshot), CI6(4 Request) 전부 별도 Property 없이 성공 | **불필요 — 신규 Property 생성하지 않음** |
| Slack Thread ID / Interface Session ID | 아니오(Slack 미구현, 이번 범위 아님) | 아니오 | 해당 없음(미래 후보) | 미정 | 미정 | 검증 사례 없음 | **평가 보류 — WS4(Multi-interface Architecture) 이후 재검토, 이번 TAP에서 결정하지 않음** |
| 승인 이력 Property | 아니오 — Commit 자체가 승인의 증거(Commit 전 Write 0, Commit 후 Record 존재)이며 별도 감사이력 요구가 이번 범위에 없음 | 아니오 | 예 — 필요시 완료증빙·비고에 텍스트로 기록 가능 | Request 또는 Task | 아니오(이번 범위) | 검증 요구 없음 | **불필요(이번 범위) — 향후 Audit 요구사항이 명시되면 재검토** |
| 원문 요청 보존 | 이미 충족됨 | - | 예 — Request `요청 내용` | Request | 이미 충족 | CI2~CI6 전 사례 | **이미 A절 기존 Property로 해결됨, D 후보 아님** |
| 마지막 검증 시점 | 아니오 | 아니오 | 예 — Notion 자체 편집 이력 또는 완료증빙 텍스트에 시점 포함 가능 | 해당 없음 | 아니오 | 검증 요구 없음 | **불필요** |
| Interface Source(어떤 인터페이스가 기록했는지) | 아니오(이번 범위는 Claude 단일 인터페이스 실사용 테스트) | 아니오 | 필요시 비고 텍스트로 기록 가능 | Task | 아니오(이번 범위) | 검증 요구 없음 | **불필요(이번 범위) — WS4 Multi-interface 실제 구현 시 재검토** |

## 결론

**모든 Contract 요소가 기존 Request·Task Property(A/B) 또는 저장 불필요한 Interface transient(C)로 충분히 표현된다. D 후보 6개는 전부 "이번 범위에서 불필요" 또는 "이미 A절로 해결됨" 또는 "WS4 이후 재검토"로 판정됐다.**

**신규 Property 생성 필요성: 없음.**

## 사용자 승인 필요 여부

- Schema 변경 자체는 없으므로 "최소 변경 승인" 절차는 필요하지 않다.
- 다만 Phase 3에서 `[TEST][WS2-PHYSICAL][E2E03]` Prefix로 신규 TEST Request·Task를 실제로 생성하므로, 이 **Record 생성 계획**에 대한 사용자 승인은 8절 Preview 형식으로 별도 요청한다(아래 완료 보고 이후 텍스트 참고).
