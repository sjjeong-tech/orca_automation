# Master Deliverables

권장안과 미확정 항목은 승인 전 확정 Schema나 운영 Rule이 아니다. 허용 상태는 `NOT_STARTED`, `PLANNING`, `SKELETON`, `READY_FOR_BUILD`, `PILOT`, `VALIDATED`, `COMPLETE`, `BLOCKED`다.

| Deliverable ID | 최종 산출물 | 목적 | 완료조건 | 관련 TAP | 현재 상태 | 승인 Gate | 선행 의존성 | 후속 의존성 | 미확정 항목 |
|---|---|---|---|---|---|---|---|---|---|
| MD-01 | Notion 지원팀 업무 DB | 업무 건의 상위 Live Record | P1 Architecture 완료, Record 단위·Relation·필수 Property 승인, S1 Skeleton QA 및 Pilot 검증 | P1,S1,P5,B1~B3 | PLANNING | AG-02~05,AG-S1 | CP-04 Model | MD-02,03,06,07 | 조합 Master 도입 시점; AG-S1 승인 대기 |
| MD-02 | Notion 지원팀 Task DB | Operational Task·Milestone·Rework 추적 | P1 Architecture 완료, 업무 Relation, Task 상태, 완료조건, Atomic Task 집약 기준과 반복 이력 검증 | P1,S1,P3,P5,B1~B3 | PLANNING | AG-04,06,10,11,AG-S1 | MD-01,04,05 | MD-06~09 | Operational Task 집약 기준; P1 후보 23개는 P3 전 미확정 |
| MD-03 | Intake Form | 요청 유입 표준화 | 작성자·필수항목·정보부족 처리 승인 및 Pilot 입력 성공 | P4,P5,B1~B3 | NOT_STARTED | AG-13~15 | MD-01 | MD-06,07 | 작성 주체·필수항목 |
| MD-04 | Status & Evidence Model | 상태·대기·Blocker·증빙·전이 표준 | 업무/Task 상태, 최소 증빙, 대기·완료 Gate 승인 | P2,P5,B1~B3 | NOT_STARTED | AG-07~09,15,18 | CP-04 Gaps | MD-01,02,07~09 | 대기 세분화·최소 증빙 |
| MD-05 | Process-to-Notion Mapping | Process Rule을 Task Template로 연결 | Process ID, Trigger, Input, Output, Actor, Evidence, Next, Exception Coverage 검증 | P3,P5,B1~B3 | NOT_STARTED | AG-10~12 | CP-04 Process·Variation | MD-02,07,08 | Task 생성 수준·Process 11 |
| MD-06 | Dashboard & Collaboration Model | 운영팀·지원팀 실시간 공유와 알림 | View, Mention, Event, 알림 상태와 책임 경계 Pilot 검증 | P4,P5,B1~B3 | NOT_STARTED | AG-06,16~19 | MD-01~04 | MD-07,08 | Slack 우선순위·자동 댓글 |
| MD-07 | Pilot Operating Model | Manual MVP 운영·평가 | 대상·기간·성공기준 승인, Pilot 완료, Revision 판정 | P5,B1~B3 | NOT_STARTED | AG-20~24 | MD-01~06 | MD-08,09 | Pilot 범위·성공기준 |
| MD-08 | Assisted Automation | Read-only 제안·Task·알림 자동화 | AI Read 범위, Human Gate, 실패 경로와 Pilot 효과 검증 | CP-06-P1,B1,B2 | NOT_STARTED | AG-24,25 | MD-07 | MD-09 | Read 권한·자동화 범위 |
| MD-09 | Agent Write Governance | 승인 기반 Write·Audit·Rollback | 권한, 승인, Human-only, Audit, Rollback 승인·검증 | CP-07-P1,B1 | NOT_STARTED | AG-26~31,34 | MD-08 | MD-10 | Write 범위·승인 수준 |
| MD-10 | Operations-team Expansion | 운영팀·GP 소통·초안·날인 요청 확장 | 책임 경계·외부 승인·지원팀 MVP 안정성 확인 | CP-08-P1 | NOT_STARTED | AG-32~35 | MD-07~09 | 후속 Roadmap | GP 소통·외부발송 범위 |

## Communication Milestone

| ID | 명칭 | Owner | Codex Owner | Claude Review | 선행 조건 | 후속 TAP 차단 | Repo 산출물 | 실행 여부 |
|---|---|---|---|---|---|---|---|---|
| CM-01 | Skeleton Intermediate Reporting | GPT + 사용자 정상준 | 없음 | 없음 | CP-05-S1 완료 | 없음 | 필수 아님 | 사용자 판단 |

CM-01은 Master Build Deliverable이 아니다. 대표님 중간보고 구성, Notion AI용 TI, 공유 문구와 확인 요청사항은 ChatGPT·Notion에서 관리하며 사용자가 명시적으로 요청할 때만 Repo 참고자료로 저장할 수 있다.
