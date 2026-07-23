# Approval Gates

이 문서는 Approval Gate의 Canonical Source다. Gate 상태·시점·선택안·권장안 변경은 이 문서를 먼저 갱신하고, 같은 TAP에서 파생 작업 목록인 `decisions/pending-approvals.md`를 동기화한다. 해당 Gate를 처리하는 TAP의 실행 AI가 갱신 책임을 가지며 GPT는 Handoff 검토 시 두 문서의 정합성을 확인한다.

미결 Gate의 권장안은 설계 제안이며 확정값이 아니다. 승인자는 정상준·사용자이며 GPT는 검토·통합한다.

| Gate ID | 결정 내용 | 선택안 | 권장안 | 결정 시점 | 미결정 시 영향 | 승인자 | 상태 | 관련 TAP | 관련 Deliverable |
|---|---|---|---|---|---|---|---|---|---|
| AG-01 | CP-05 목표 재정의 | Gap 선해소 / Control Plane 전환 | Control Plane, Gap은 Cross-cutting | 2026-07-23 | 후속 Roadmap 불명확 | 사용자·정상준 | DECIDED | P0-R | MD-01~11 |
| AG-02 | 상위 Record 단위 | 조합 / 업무 건 / 요청 | 조합별 업무 건 | 2026-07-23 | DB 핵심 Relation 미정 | 사용자·정상준 | DECIDED | P1 | MD-01 |
| AG-03 | 동일 조합 업무 분리 | 통합 / Process별 / 요청별 | 독립 완료조건 업무별 | 2026-07-23 | 중복·상태 충돌 | 사용자·정상준 | DECIDED | P1 | MD-01 |
| AG-04 | 2개 DB MVP | 단일 DB / 업무+Task / 3개 이상 | 지원팀 업무 DB+Task DB | 2026-07-23 | Schema 범위 미정 | 사용자·정상준 | DECIDED | P1,S1 | MD-01,02 |
| AG-05 | 조합 Master DB | 즉시 / Pilot 후 / 미사용 | Skeleton·MVP에서는 미사용, Pilot 후 판단 | Pilot 후 | Pilot 전에는 업무 DB의 조합명으로 운영 | 사용자·정상준 | DEFER_UNTIL_PILOT | B3 | MD-01 |
| AG-06 | 알림 Queue DB | 별도 DB / Task·업무 속성 / 외부 로그 | Skeleton은 별도 DB 없음; P4에서 결정 | P4 전 | 알림 Audit 구조 미정 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_BUILD | P4 | MD-02,06 |
| AG-07 | 상태값 체계 | 단일 / 업무·Task 분리 | 업무·Task 분리 | Build 전 | 상태 전이 구현 불가 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_BUILD | P2 | MD-04 |
| AG-08 | 대기 상태 세분화 | 단일 WAITING / 외부·관리역 분리 | 분리 | Build 전 | 병목 측정 불가 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_BUILD | P2 | MD-04 |
| AG-09 | 완료 최소 증빙 | 상태만 / 파일·수신 / Process별 | 공통 최소+Process별 | Build 전 | 완료 신뢰성 부족 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_BUILD | P2 | MD-04 |
| AG-10 | Operational Task 정의·Atomic Task 집약 | 전체 복제 / Operational+Milestone / 선택 집약 | Pilot은 Operational Task+핵심 Milestone, Agent는 필요 시 Atomic 재분해 | Build 전 | Task 수·추적가치·운영부하 미정 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_BUILD | P3 | MD-02,05 |
| AG-11 | 반복 보완 Task | 동일 Record / 신규 Record / 하위 시도 | 하위 시도 Relation | Build 전 | Rework 이력 손실 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_BUILD | P3 | MD-02,05 |
| AG-12 | Process 11 MVP 포함 | 포함 / 제외 / 제한 상태 | 제외, Handoff 필드만 | Build 전 | DRAFT가 완료로 오인 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_BUILD | P3 | MD-05 |
| AG-13 | Form 작성 주체 | 운영팀 / 지원팀 / 공동 | 요청자 초안+지원팀 검수 | Build 전 | Intake 책임 미정 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_BUILD | P4 | MD-03 |
| AG-14 | Form 필수항목 | 최소 / Process별 / 전체 | 최소+조건부 | Build 전 | 누락·입력부담 불명확 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_BUILD | P4 | MD-03 |
| AG-15 | 정보 부족 상태 | 반려 / 대기 / 임시등록 | 정보확인 대기 | Build 전 | 불완전 Record 처리 불가 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_BUILD | P2,P4 | MD-03,04 |
| AG-16 | Notion 댓글 vs Slack | Notion 우선 / Slack 우선 / 병행 | Notion 원장, Slack 알림 | Build 전 | 협업 이력 분산 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_BUILD | P4 | MD-06 |
| AG-17 | 상태 변경 알림 범위 | 전체 / 중요 상태 / 구독 | 중요 상태+구독 | Build 전 | 과다·누락 알림 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_BUILD | P4 | MD-06 |
| AG-18 | 관리역 확인 Event | 댓글 / Task 상태 / 별도 Queue | Task 상태+Mention | Build 전 | 대기·응답 측정 불가 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_BUILD | P2,P4 | MD-04,06 |
| AG-19 | 자동 댓글 | 금지 / 초안 / 자동게시 | MVP 금지, 이후 초안 | Build 전 | 권한·오발송 위험 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_BUILD | P4,P5 | MD-06,08 |
| AG-20A | Pilot Process 범위 | 03·04·07·08 / 확대 / 축소 | Process 03·04·07·08 | 2026-07-23 | Pilot Mapping 범위 미정 | 사용자·정상준 | DECIDED | B2 | MD-07 |
| AG-20B | 실제 Pilot 대상 조합 | 신규 1건 / 복수 / 과거 재현 | Pilot 전 별도 승인 | Pilot 전 | 실제 Pilot 착수 불가 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_PILOT | B2 | MD-07 |
| AG-21 | Pilot 기간 | 건수 / 기간 / 혼합 | 2~4주 또는 3건 | Pilot 전 | 종료 시점 미정 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_PILOT | B2 | MD-07 |
| AG-22 | Pilot 성공 기준 | 사용성 / 완전성 / 시간 / 혼합 | 완전성+상태 최신성+부하 | Pilot 전 | 검증 판정 불가 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_PILOT | B2 | MD-07 |
| AG-23 | MVP 지속 여부 | 유지 / 재설계 / 중단 | Pilot 결과 후 결정 | Pilot 후 | B3 판정 불가 | 사용자·정상준 | DEFER_UNTIL_PILOT | B3 | MD-07 |
| AG-24 | 자동화 진입 | 진입 / 보완 후 / 중단 | Pilot Gate 후 결정 | Pilot 후 | CP-06 진입 불가 | 사용자·정상준 | DEFER_UNTIL_PILOT | B3 | MD-08 |
| AG-25 | AI Read 권한 | 전체 / 제한 View / 없음 | 최소 필요 View | Automation 전 | 개인정보·범위 위험 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_AUTOMATION | CP-06-P1 | MD-08 |
| AG-26 | AI Write 권한 | 없음 / 제한 / 전체 | 승인 기반 제한 Write | Automation 전 | 무권한 변경 위험 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_AUTOMATION | CP-07-P1 | MD-09 |
| AG-27 | 자동 변경 방식 | 자동 / 승인 후 / 제안만 | 제안→승인 후 변경 | Automation 전 | 책임 경계 미정 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_AUTOMATION | CP-07-P1 | MD-09 |
| AG-28 | Agent Write 범위 | 상태 / Task / 댓글 / 외부 | 상태·Task부터 제한 | Automation 전 | 과도한 권한 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_AUTOMATION | CP-07-P1 | MD-09 |
| AG-29 | Human Approval 필수 Task | 외부발송만 / 중요변경 / 전부 | 외부·법적·기관판단 필수 | Automation 전 | Human-only 경계 미정 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_AUTOMATION | CP-07-P1 | MD-09 |
| AG-30 | 실패·Rollback | 수동 / 자동복구 / 중단 | 즉시 중단+감사+수동복구 | Automation 전 | 장애 확산 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_AUTOMATION | CP-07-P1 | MD-09 |
| AG-31 | Audit Log | 최소 / 전체 변경 / 외부만 | 모든 Agent Write | Automation 전 | 책임 추적 불가 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_AUTOMATION | CP-07-P1 | MD-09 |
| AG-32 | 운영팀 Agent 범위 | 조회 / 초안 / 실행 | 조회·초안부터 | Expansion 전 | 역할 침범 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_AUTOMATION | CP-08-P1 | MD-10 |
| AG-33 | GP 직접 소통 | 금지 / 초안 / 자동 | Human 승인 초안만 | Expansion 전 | 외부 커뮤니케이션 위험 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_AUTOMATION | CP-08-P1 | MD-10 |
| AG-34 | 외부 발송 전 승인 | 항상 / 조건부 / 불필요 | 항상 Human 승인 | Expansion 전 | 오발송·법적 위험 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_AUTOMATION | CP-07-P1,CP-08-P1 | MD-09,10 |
| AG-35 | 운영팀·지원팀 경계 | 요청/실행 / Process별 / 공동 | 요청·판단 vs 실행·기록 | Expansion 전 | 소유권 충돌 | 사용자·정상준 | APPROVAL_REQUIRED_BEFORE_AUTOMATION | CP-08-P1 | MD-10 |
| AG-S1 | Fast Skeleton Build 승인 | 승인 / 보완 후 승인 / 미승인 | `APPROVED_WITH_EXECUTION_CONSTRAINTS`; 기존 FUND 무변경·신규 DB 2개·TEST 데이터만 구축 | 2026-07-23 실행 | 실제 UI·Relation 조기 검증 수행; 제한 항목은 P2·P4로 유예 | 사용자·정상준 | DECIDED | S1 | MD-01,02,06 |

## 상태 집계

| 상태 | 수 |
|---|---:|
| APPROVAL_REQUIRED_NOW | 0 |
| APPROVAL_REQUIRED_BEFORE_BUILD | 14 |
| APPROVAL_REQUIRED_BEFORE_PILOT | 3 |
| APPROVAL_REQUIRED_BEFORE_AUTOMATION | 11 |
| DEFER_UNTIL_PILOT | 3 |
| DECIDED | 6 |
| 합계 | 37 |
