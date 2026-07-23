# Pending Approvals

권장안은 설계 제안이며 사용자 승인 전 확정값이 아니다. 상세 선택안·영향·Deliverable 연결은 `operating-model/approval-gates.md`를 기준으로 한다.

| Gate ID | 미결정 항목 | 상태 | 결정 필요 시점 | 관련 TAP |
|---|---|---|---|---|
| AG-01 | CP-05 목표 재정의 | DECIDED | 2026-07-23 | P0-R |
| AG-02 | 상위 Record 단위 | DECIDED | 2026-07-23 | P1 |
| AG-03 | 동일 조합 업무 분리 기준 | DECIDED | 2026-07-23 | P1 |
| AG-04 | 2개 DB MVP | DECIDED | 2026-07-23 | P1,S1 |
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
| AG-20A | Pilot Process 03·04·07·08 | DECIDED | 2026-07-23 | B2 |
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

## 신규 Backlog

| Backlog | 영향 | 관련 Deliverable | 후속 TAP | 상태 |
|---|---|---|---|---|
| 조합 Master DB 도입 시점 | Relation·중복 | MD-01 | P1·B3 | APPROVAL_REQUIRED |
| 알림 Queue 별도 DB | Audit·운영 복잡도 | MD-02,06 | P1·P4·B3 | APPROVAL_REQUIRED |
| Process 11 MVP 처리 | 완료·Handoff 왜곡 | MD-05 | P3 | APPROVAL_REQUIRED |
| 인터뷰 v1·V2 통합 | Known Gap 해소 | MD-04,05,07 | P1~B2 | BACKLOG |
| 미검토 Source·재시연 | Pilot 대표성 | MD-07 | B2 | BACKLOG |
| Skeleton 최소 Property 검증 | 실제 UI·운영 부담 | MD-01,02,06 | P1,S1 | APPROVAL_REQUIRED |
| Notion AI TI 보고 대상·표현 수준 | 중간보고 적합성 | MD-11 | R1 | BACKLOG |
| Pilot A 실제 조합·기간·Threshold | Pilot 대표성·판정 | MD-07 | B2 | APPROVAL_REQUIRED |
