# Notion Operations Control Plane Master Roadmap

## Control

- 현재 허용 Stage: `CP-05-P0`
- 이전 승인 Gate: `CP-04_COMPLETE_WITH_KNOWN_GAPS`
- 다음 Gate: GPT·Claude 검토와 사용자 Master Roadmap 승인
- 후속 TAP Auto-run: 금지
- Gap Resolution: `CROSS_CUTTING_WORKSTREAM`

## 고정 TAP 업무지도

| TAP | 목적 | As-Is | To-Be | Input | Output | 선행 조건 | Exit Criteria | Deliverable | Approval Gate | Claude | GPT | 미확정 항목 | 자동화 금지사항 | Repo 변경 예상 범위 | 다음 허용 TAP |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CP-05-P0 | Operating Model·Roadmap 통제 | CP-04 Model만 존재 | 책임·Gate·Scope·Roadmap | CP-04 보고서·Queue | Operating Model 9종, Roadmap, Decision 문서 | CP-04 완료 | MD·Gate·TAP 연결 및 사용자 검토 준비 | MD-01~10 | AG-01~06 | 권장 | 필수 | 전체 Roadmap 승인 | 구현·Notion 변경 금지 | `operating-model/**`, `plans/**`, `decisions/**`, 보고서, Queue | CP-05-P1 |
| CP-05-P1 | Record Unit·DB Architecture | 실제 Record·DB 단위 미정 | 상위 업무 건+하위 Task 구조 | P0, Process 목록 | Record·Relation·DB 선택안 | P0 사용자 승인 | AG-02~06 결정, Architecture 명세 | MD-01,02 | AG-02~06 | 선택 | 필수 | 조합 Master, 업무 분리 | DB 생성 금지 | `notion/schema/**`, `operating-model/**`, `decisions/**` | CP-05-P2 |
| CP-05-P2 | Status & Evidence Model | 상태·증빙 공통 기준 없음 | 업무/Task 상태·Blocker·전이·증빙 | P1 Architecture, Process 완료조건 | 상태·증빙·전이 명세 | P1 승인 | AG-07~09·15·18 결정 | MD-04 | AG-07~09,15,18 | 선택 | 필수 | 대기 세분화·최소 증빙 | 상태 Automation 금지 | `notion/schema/**`, `notion/mappings/**`, `decisions/**` | CP-05-P3 |
| CP-05-P3 | Process-to-Notion Mapping | 문서 Process, 생성 Rule 없음 | Process ID→Task Template·예외 | Process 00~11, Variation, P1~P2 | Mapping Coverage와 Template 명세 | P2 승인 | 핵심 Process Coverage·Gap 검증 | MD-02,05 | AG-10~12 | 필수 | 필수 | 전체 Task, Rework, P11 | Task 생성 구현 금지 | `notion/mappings/**`, 보고서, decisions | CP-05-P4 |
| CP-05-P4 | Intake·Collaboration | Slack·구두·실물 분산 | Form·Mention·알림 Event | P1~P3, 역할 모델 | Form·Dashboard·알림 명세 | P3 승인 | AG-13~19 결정 | MD-03,06 | AG-13~19 | 선택 | 필수 | 작성자·채널·자동 댓글 | 댓글·알림 구현 금지 | `notion/schema/**`, `notion/mappings/**`, decisions | CP-05-P5 |
| CP-05-P5 | MVP Build Specification | 설계 조각만 존재 | Build 가능한 단일 명세 | P1~P4 승인 산출물 | Build Spec·QA·Rollback 계획 | P4 승인 | 미결 Build Gate 0, 사용자 Build 승인 | MD-01~07 | AG-04~22 | 필수 | 필수 | 생성 방식·Pilot 범위 | Build 착수 금지 | `notion/**` 명세, reports, decisions | CP-05-B1 |
| CP-05-B1 | Notion MVP Build | 실운영 DB 없음 | 승인된 업무·Task DB·Form·View | P5 승인 Spec | Notion MVP와 Build QA | Build 승인 | Schema·권한·QA PASS | MD-01~06 | AG-04~19 | 선택 | 필수 | 실제 생성 방식 | 승인 밖 DB·Automation 금지 | `notion/schema/**`, Build 기록 | CP-05-B2 |
| CP-05-B2 | Manual Pilot | 운영 Record 없음 | 실제 수동 Record·Task 운영 | Build QA, Pilot 승인 | Pilot 기록·Issue·Metrics | B1 QA, AG-20~22 | 승인된 건수·기간·성공기준 평가 | MD-07 | AG-20~22 | 필수 | 필수 | 실제 예외 패턴 | Automation·Agent Write 금지 | `notion/pilot/**`, reports | CP-05-B3 |
| CP-05-B3 | Pilot Review·Revision | Pilot 결과 미반영 | 검증된 Schema·운영 방식 | B2 기록·Finding | Revision·MVP 지속·자동화 Gate | B2 완료 | AG-23~24 결정, 재검증 PASS | MD-01~08 | AG-23,24 | 선택 | 필수 | 유지·재설계·중단 | 자동화 선행 구현 금지 | `notion/**`, operating-model, reports | CP-06-P1 |
| CP-06-P1 | Assisted Automation Design | 사람이 직접 판단·입력 | Read-only·Suggestion·Human Gate | B3 승인 MVP | Interface·Workflow·Validation 설계 | 자동화 진입 승인 | AG-25와 위험·Human-only 검증 | MD-08 | AG-24,25 | 필수 | 필수 | AI Read 범위 | Write·외부발송 금지 | `automation/interfaces/**`, `workflows/**`, `validations/**` | CP-06-B1 |
| CP-06-B1 | Read-only·Suggestion | 자동 제안 없음 | 누락·다음 Action·초안 제안 | P1 설계 | Read-only/Suggestion Pilot | P1 승인 | 정확도·오탐·Human Gate QA | MD-08 | AG-25 | 선택 | 필수 | 제안 품질 기준 | Notion Write 금지 | `automation/**`, reports | CP-06-B2 |
| CP-06-B2 | Notification·Task Generation | 수동 알림·Task 생성 | 승인된 Event 기반 생성 | B1 검증, 알림 Gate | 제한 자동화와 Audit | B1 PASS | 알림·Task QA, 무권한 Write 0 | MD-08 | AG-17~19,25 | 선택 | 필수 | 자동 생성 범위 | 외부발송·Agent 자율 Write 금지 | `automation/**`, reports | CP-07-P1 |
| CP-07-P1 | Agent Write Governance | AI Write 권한 없음 | 승인·권한·Audit·Rollback | Pilot·Assisted 결과 | Write Governance 명세 | CP-06 검증 | AG-26~31·34 사용자 승인 | MD-09 | AG-26~31,34 | 필수 | 필수 | Human-only·Rollback | Write 실행 금지 | `operating-model/**`, `automation/agents/**` 명세, decisions | CP-07-B1 |
| CP-07-B1 | Approval-based Execution | 사람이 모든 변경 | 승인 범위 내 제한 Write | P1 승인 Governance | Agent Write Pilot·Audit | Write 승인 | 승인 일치·Rollback·Audit QA | MD-09 | AG-26~31,34 | 선택 | 필수 | Write 대상·한도 | 자율 외부발송 금지 | `automation/agents/**`, reports | CP-08-P1 |
| CP-08-P1 | Operations-team Expansion | 지원팀 MVP 중심 | 운영팀·GP 소통·초안 범위 | 안정화 MVP·Write 결과 | Expansion 설계와 신규 Roadmap | 지원팀 MVP 안정화 | AG-32~35 결정, 사용자 승인 | MD-10 | AG-32~35 | 선택 | 필수 | GP 소통·책임 경계 | 승인 전 확장·외부발송 금지 | `operating-model/**`, `plans/**`, decisions | 후속 승인 TAP |

## As-Is → To-Be 전환

| TAP | As-Is | To-Be | 완료 산출물 | 승인 Gate | 미확정 항목 |
|---|---|---|---|---|---|
| CP-05-P1 | 업무 Record·조합 구분 미정 | 상위 조합별 업무 건, 하위 Atomic Task | Record·DB Architecture | AG-02~06 | 조합 Master, 동일 조합 업무 분리 |
| CP-05-P2 | 상태·증빙 기준 없음 | 업무·Task 상태, Blocker, 완료조건, 증빙, 전이 | Status & Evidence Model | AG-07~09,15,18 | 외부/관리역 대기, 최소 증빙 |
| CP-05-P3 | Process 문서만 존재 | Process→Task Template·Trigger·IO·Actor·Evidence·Next·Exception | Mapping Spec | AG-10~12 | 전체 Task, Milestone, 반복 보완 |
| CP-05-P4 | 분산 Intake·알림 없음 | Form·Mention·Slack Event·알림 상태 | Intake & Collaboration Spec | AG-13~19 | 작성 주체, 채널 우선, 자동 댓글 |
| CP-05-P5 | 설계만 존재 | Build 가능한 완전한 명세 | MVP Build Spec | AG-04~22 | 생성 방식, API·Automation, Pilot |
| CP-05-B1~B3 | 실운영 DB 없음 | Notion MVP→Manual Pilot→Schema Revision | 검증된 MVP | AG-20~24 | Pilot 범위·지속 여부 |
| CP-06 | 사람 직접 수행 | 제안·알림·Task 자동화 | Assisted Automation | AG-24,25 | Read·생성 범위 |
| CP-07 | 사람만 Write | 승인 기반 Agent Write | Governance·실행 Pilot | AG-26~31,34 | Write·Rollback·Audit |
| CP-08 | 지원팀 범위 | 운영팀·GP 소통 확장 | Expansion Plan | AG-32~35 | 책임·외부발송 |

## Cross-cutting Known Gaps

신기술투자조합 Trigger·근거자료, 채널 선택 기준, 대리·제3자 수령 요건, 계좌해지 표준 수행주체, 폐업·청산과 계좌해지 선후관계, 수탁계좌 정의·적용 기준, 지점별 서류 차이, 인터뷰 V2 미착수, 독립 CASE 부족, Process 11 미완성을 Build·Pilot Gate의 제약조건으로 사용한다.
