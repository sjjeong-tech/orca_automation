# CP-05-P2 Status, Evidence and Human Control Model

## Executive Summary

판정은 `COMPLETED_WITH_OPEN_UI_GAPS`다. Pilot A 요청은 7개, Task는 6개 Canonical 상태로 설계했다. 대기 원인은 상태를 여러 개로 분리하지 않고 `TS-WAIT + Current Actor + Blocker + Next Action`으로 표현한다. Evidence 9종, Human Approval 8개, Decision Point 10개와 요청 완료 Gate 6개를 정의했다. 실제 Notion·Form·Process·Variation·Source는 변경하지 않았다.

## 역할 경계

| 주체 | Canonical 역할 | 이번 TAP |
|---|---|---|
| Notion AI | Form 초안·질문 구성·UI 탐색·가능한 UI 편집과 제약 보고 | 별도 UI Workstream |
| Codex | Git 기반 Process·Rule·Schema·Status·Evidence·RAG Contract Builder | P2 문서 구축 |
| GPT | Roadmap·우선순위·병렬 결과 통합·Gate·TAP 통제 | AG-P2 Review |
| 사용자·정상준 | Process Owner·Notion UI 최종 확인·Pilot 및 상태·증빙 승인 | AG-P2 승인자 |

## Canonical Model 요약

- 요청 상태: `RQ-NEW`, `RQ-REVIEW`, `RQ-REWORK`, `RQ-READY`, `RQ-ACTIVE`, `RQ-DONE`, `RQ-CANCEL`
- Task 상태: `TS-TODO`, `TS-ACTIVE`, `TS-WAIT`, `TS-REWORK`, `TS-DONE`, `TS-CANCEL`
- Actor: 운영팀, 지원팀, 관리역 확인, GP, 외부기관
- Blocker: 별도 DB 없이 Text 규칙과 Status·Actor·Next Action 조합
- Evidence: Drive 원본 + Notion 비민감 메타데이터, 별도 Evidence DB는 Post-Pilot
- 요청 완료: 필수 Task 완료, 조건부 Task 처분, Evidence, 전달, HA-08, 완료 메타데이터

## 상태 전이

- 요청 허용 전이: 12개
- Task 허용 전이: 12개
- Terminal 상태에서 일반 역전이는 금지한다.
- Formula·Automation 전이는 구현하지 않는다.

## Process별 최소 Evidence

| Process | 최소 Evidence | Human Control |
|---|---|---|
| P01 명판·인감 | EV-PHYSICAL, EV-COMPLETE | 사양·수령 검수 |
| P03 고유번호증 | EV-PACKAGE, EV-RECEIPT, EV-RESULT, EV-SCAN, EV-DELIVERY | 기본정보·서류·결과 전달 |
| P04 보안카드·홈택스 | EV-RESULT 또는 처리 메타데이터, EV-COMPLETE | 민감 입력·결과 확인 |
| P07 계좌개설 | EV-PACKAGE, EV-RECEIPT/EV-RESPONSE, EV-RESULT, EV-DELIVERY | 계좌 유형·서류·결과 |
| P08 계좌 보완 | EV-RESPONSE, EV-PACKAGE, EV-SCAN | 보완 경로·재전달 |

Process 11을 완료 Rule 근거로 사용하지 않았다. 결과 전달은 Pilot A의 Human Gate와 Evidence로만 정의하며 P3에서 Process Mapping을 검증한다.

## Notion 변경 제안

[Property Stage Matrix](../notion/schema/property-stage-matrix.md)에 18개 항목을 기록했다.

- `KEEP`: 13
- `OPTION_CHANGE_PROPOSED`: 3
- `ADD_PROPOSED`: 1
- `DEFER_POST_PILOT`: 1
- 실제 적용: 0

상태 옵션, Actor 옵션, 대표 Evidence URL은 AG-P2 승인 후 별도 Build TAP에서만 적용한다.

## Form UI Workstream

| 항목 | 분류 | Roadmap 반영 |
|---|---|---|
| 1차 Form 제목·질문·필수값 | USER_UI_ACTION / NOTION_AI_DRAFT | UI Workstream |
| 1차 Form 제출·Rollup | VALIDATION / USER_UI_ACTION | 비차단 검증 |
| 2차 Form 질문 구성 | NOTION_AI_DRAFT | P4 Input |
| 기존 DB Filter 검증 오류 | BACKLOG / PLATFORM_CONSTRAINT | 다음 Build 검토 |
| 상태·증빙 Contract | MAIN_ROADMAP_INPUT | IMMEDIATE / P2 |
| Codex의 Form UI 편집 | CODEX_NOT_IN_SCOPE | REJECT |

작업 유형은 `DISCOVERY_ONLY`, `FORM_DRAFT`, `UI_CHANGE_ATTEMPT`, `VALIDATION`, `MAIN_ROADMAP_INPUT`으로 분류하고 Roadmap 처분은 `IMMEDIATE`, `NEXT_PHASE`, `BACKLOG`, `USER_UI_ACTION`, `REJECT` 중 하나로 기록한다.

## P3 Contract

P3는 다음을 각 Operational Task에 연결해야 한다.

- Request Type과 생성 조건
- Process·Atomic Task·Operational Task ID
- 필수·선택·조건부 구분
- 선행·다음 Task와 예외 복귀
- 기본 Actor, Status, 완료조건
- Evidence Type과 Human Approval
- Source Authority와 Verification Status

후보 27개는 P3 전까지 확정 Task Template가 아니다.

## Open Gaps

- 1·2차 Form UI와 실제 제출·Rollup 검증
- 대기·보완 상태의 Pilot 사용성
- Evidence 대표 URL Property 필요성
- 명판·인감의 Pilot A 상세 Operational Task Mapping
- Process 04 결과 Evidence의 화면·파일 표준
- 수탁·기관별 UNKNOWN Rule
- 실제 Pilot 대상·기간·Threshold

## AG-P2 판단 항목

1. 요청 7상태와 Task 6상태
2. 대기를 단일 Status와 Actor로 표현하는 원칙
3. Text 기반 Blocker 운영
4. Evidence 9종과 별도 DB 유예
5. 요청 완료 Gate 6개
6. Human Approval 8개
7. Notion 변경 제안 18개
8. P3 진입과 UI Workstream 비차단 유지

## 범위 검증

- 실제 Notion·Form 변경: 0
- Process·Variation·Source 수정: 0
- Automation·Agent Write·RAG Index 구현: 0
- CP-05-P3 자동 실행: 0
