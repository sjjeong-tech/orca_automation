# Pending Approvals

이 문서는 미결 Gate만 보여주는 파생 작업 목록이며 Canonical Source가 아니다. Gate 상태·시점·선택안·권장안·영향의 최종 기준은 `operating-model/approval-gates.md`다. 상태 변경은 Canonical 문서를 먼저 갱신하고 같은 TAP에서 이 목록을 동기화한다. 해당 Gate를 처리하는 TAP의 실행 AI가 갱신 책임을 가지며 GPT는 Handoff 시 정합성을 확인한다. 불일치 시 Canonical Source가 우선한다.

아래 상태는 작업 편의를 위한 Canonical 상태의 복제다. `DECIDED` Gate는 원칙적으로 목록에서 제외한다.

| Gate ID | 작업 항목 | 상태(파생) | 결정 필요 시점 | 관련 TAP |
|---|---|---|---|---|
| AG-05 | 조합 Master DB | DEFER_UNTIL_PILOT | Pilot 후 | B3 |
| AG-06 | 알림 Queue DB | APPROVAL_REQUIRED_BEFORE_BUILD | P4 전 | P4 |
| AG-07 | 상태값 체계 | APPROVAL_REQUIRED_BEFORE_BUILD | Build 전 | P2 |
| AG-08 | 대기 상태 세분화 | APPROVAL_REQUIRED_BEFORE_BUILD | Build 전 | P2 |
| AG-09 | 완료 최소 증빙 | APPROVAL_REQUIRED_BEFORE_BUILD | Build 전 | P2 |
| AG-10 | Atomic Task 생성 범위 | APPROVAL_REQUIRED_BEFORE_BUILD | Build 전 | P3 |
| AG-11 | 반복 보완 Task 방식 | APPROVAL_REQUIRED_BEFORE_BUILD | Build 전 | P3 |
| AG-12 | Process 11 MVP 포함 | APPROVAL_REQUIRED_BEFORE_BUILD | Build 전 | P3 |
| AG-13 | Form 작성 주체 | APPROVAL_REQUIRED_BEFORE_BUILD | Build 전 | P4 |
| AG-14 | Form 필수항목 | APPROVAL_REQUIRED_BEFORE_BUILD | Build 전 | P4 |
| AG-15 | 정보 부족 상태 | APPROVAL_REQUIRED_BEFORE_BUILD | Build 전 | P2,P4 |
| AG-16 | Notion 댓글 vs Slack | APPROVAL_REQUIRED_BEFORE_BUILD | Build 전 | P4 |
| AG-17 | 상태 변경 알림 범위 | APPROVAL_REQUIRED_BEFORE_BUILD | Build 전 | P4 |
| AG-18 | 관리역 확인 Event | APPROVAL_REQUIRED_BEFORE_BUILD | Build 전 | P2,P4 |
| AG-19 | 자동 댓글 허용 | APPROVAL_REQUIRED_BEFORE_BUILD | Build 전 | P4,P5 |
| AG-20B | 실제 Pilot 대상 조합 | APPROVAL_REQUIRED_BEFORE_PILOT | Pilot 전 | B2 |
| AG-21 | Pilot 기간 | APPROVAL_REQUIRED_BEFORE_PILOT | Pilot 전 | B2 |
| AG-22 | Pilot 성공 기준 | APPROVAL_REQUIRED_BEFORE_PILOT | Pilot 전 | B2 |
| AG-23 | MVP 지속 여부 | DEFER_UNTIL_PILOT | Pilot 후 | B3 |
| AG-24 | 자동화 진입 여부 | DEFER_UNTIL_PILOT | Pilot 후 | B3 |
| AG-25 | AI Read 권한 | APPROVAL_REQUIRED_BEFORE_AUTOMATION | Automation 전 | CP-06-P1 |
| AG-26 | AI Write 권한 | APPROVAL_REQUIRED_BEFORE_AUTOMATION | Automation 전 | CP-07-P1 |
| AG-27 | 자동 변경 vs 승인 후 변경 | APPROVAL_REQUIRED_BEFORE_AUTOMATION | Automation 전 | CP-07-P1 |
| AG-28 | Agent Write 범위 | APPROVAL_REQUIRED_BEFORE_AUTOMATION | Automation 전 | CP-07-P1 |
| AG-29 | Human Approval 필수 Task | APPROVAL_REQUIRED_BEFORE_AUTOMATION | Automation 전 | CP-07-P1 |
| AG-30 | 실패·Rollback | APPROVAL_REQUIRED_BEFORE_AUTOMATION | Automation 전 | CP-07-P1 |
| AG-31 | Audit Log | APPROVAL_REQUIRED_BEFORE_AUTOMATION | Automation 전 | CP-07-P1 |
| AG-32 | 운영팀 Agent 범위 | APPROVAL_REQUIRED_BEFORE_AUTOMATION | Expansion 전 | CP-08-P1 |
| AG-33 | GP 직접 소통 | APPROVAL_REQUIRED_BEFORE_AUTOMATION | Expansion 전 | CP-08-P1 |
| AG-34 | 외부 발송 전 Human 승인 | APPROVAL_REQUIRED_BEFORE_AUTOMATION | Expansion 전 | CP-07-P1,CP-08-P1 |
| AG-35 | 운영팀·지원팀 책임 경계 | APPROVAL_REQUIRED_BEFORE_AUTOMATION | Expansion 전 | CP-08-P1 |
| AG-S1 | 최소 2개 DB Fast Skeleton Build | APPROVAL_REQUIRED_BEFORE_BUILD | P1 완료 후 | S1 |

## CP-05-P1-R1 — AG-S1 판단 Input

AG-S1의 Canonical 상태는 변경하지 않았다. 아래는 GPT·사용자 승인에 필요한 파생 요약이다.

| 항목 | P1 결과 |
|---|---|
| 기존 DB 재사용 | `TO DO LIST (FUND)`의 `조합(결성)` Record |
| 신규 DB | 지원팀 업무요청 DB, 지원팀 Task DB — 2개 |
| S1 Property | 요청 13개, Task 14개 — 합계 27개; 기존 DB 신규 후보 최대 3개 |
| Relation | FUND↔요청, 요청↔Task — 2개 |
| View | 기존 Form 후보 1개, 요청 3~4개, Task 3~5개 |
| Linked View | 조합 Page 내 요청·Task 2개 |
| 테스트 | 기존 안전한 TEST Record 우선; TEST 요청 1건·Task 8건 |
| 생성 위치 | 확인 필요 — 사용자가 지정할 Notion 상위 페이지 |
| 권한 | 기존 DB 읽기 확인, 신규 DB·Relation·View·Form·TEST Record 생성 |
| 금지 | 기존 View·Property·Template 변경/삭제, Automation, Slack, Agent Write, 전체 Mapping |
| 판단 자료 | `reports/cp-05-p1-db-architecture.md` |

## 신규 Backlog

| Backlog | 영향 | 관련 Deliverable | 후속 TAP | 상태 |
|---|---|---|---|---|
| 인터뷰 v1·V2 통합 | Known Gap 해소 | MD-04,05,07 | P1~B2 | BACKLOG |
| 미검토 Source·재시연 | Pilot 대표성 | MD-07 | B2 | BACKLOG |
| Pilot A 실제 조합·기간·Threshold | Pilot 대표성·판정 | MD-07 | B2 | APPROVAL_REQUIRED |
