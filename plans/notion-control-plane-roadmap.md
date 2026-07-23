# Notion Operations Control Plane Master Roadmap

## Control

- 현재 허용 Stage: `CP-05-P0-R`
- 이전 승인 Gate: `CP-04_COMPLETE_WITH_KNOWN_GAPS`
- 다음 Gate: `A-CP05-P0-REVIEW` 후 GPT·사용자 Revised Master Roadmap 승인
- 후속 TAP Auto-run: 금지
- Gap Resolution: `CROSS_CUTTING_WORKSTREAM`

## 고정 TAP 업무지도

| TAP | 목적 | As-Is | To-Be | Input | Output | 선행 조건 | Exit Criteria | Deliverable | Approval Gate | Claude | GPT | 미확정 항목 | 자동화 금지사항 | Repo 변경 예상 범위 | 다음 허용 TAP |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CP-05-P0 | Operating Model·Roadmap 통제 | CP-04 Model만 존재 | 책임·Gate·Scope·Roadmap | CP-04 보고서·Queue | Operating Model 9종, Roadmap, Decision 문서 | CP-04 완료 | MD·Gate·TAP 연결 및 사용자 검토 준비 | MD-01~10 | AG-01~06 | 권장 | 필수 | 전체 Roadmap 승인 | 구현·Notion 변경 금지 | `operating-model/**`, `plans/**`, `decisions/**`, 보고서, Queue | CP-05-P0-R |
| CP-05-P0-R | Skeleton·Pilot A·TI Targeted Revision | P0 Roadmap에 초기 Build가 늦음 | P1 직후 S1·R1 삽입, Pilot A 확정 | P0 문서, 사용자 결정 7건 | Revised Roadmap·Gate·Decision | P0 완료 | 구조 보존, 결정·순서·상태 정합성 검증 | MD-01~11 | AG-01~04,20A | 권장 | 필수 | Revised Roadmap 승인 | Notion·TI·구현 실행 금지 | 기존 Master 문서·Queue | A-CP05-P0-REVIEW |
| A-CP05-P0-REVIEW | Revised Roadmap 독립 검토 | Codex Revision만 존재 | 상충·누락·과잉통제 Finding | P0-R Commit | Claude Review 보고 | P0-R 완료 | Skeleton 시점, Pilot A, MD-11, Task 경계, Gate 시점 검증 | MD-01~11 | 없음 | 실행 | 결과 통합 | Review Finding | 원본 수정·Build 금지 | Claude Review 보고서 | GPT·사용자 승인 |
| CP-05-P1 | Record Unit·DB Architecture | DB 구조는 결정, Property·Relation 미정 | 상위 조합별 업무 건+하위 Operational Task 명세 | Revised Roadmap, Process 목록, DEC-CP05-01~07 | Record·Relation·최소 Property·View 명세 | Revised Roadmap 승인 | 2개 DB와 Skeleton 생성 범위 명세, AG-S1 판단 준비 | MD-01,02 | AG-02~06,AG-S1 | 선택 | 필수 | 조합 Master는 Pilot 후 | P1에서 DB 생성 금지 | `notion/schema/**`, `operating-model/**`, `decisions/**` | CP-05-S1 |
| CP-05-S1 | Fast Notion Skeleton Build | 실제 UI·Relation 검증 없음 | 최소 2개 DB Skeleton·Relation·View·테스트 Record | P1 Architecture, 생성 위치·권한 | 업무 DB·Task DB Skeleton, Build Log, Skeleton QA | P1 완료, AG-02~04 결정, AG-S1 승인 | 2개 DB·Relation·테스트 연결·수동 상태변경·UI 확인, Scope 외 0 | MD-01,02,06 | AG-S1 | 검토 준비 | 필수 | 최소 Property 최종값 | Automation·Slack·Agent Write·전체 Mapping·P05/06/09/10/11 금지 | 승인된 Notion Skeleton과 Build 기록 | CP-05-R1 |
| CP-05-R1 | Notion AI Intermediate Reporting TI | Skeleton 현황 보고 지시문 없음 | 사실·제안·미확정을 분리한 중간보고 TI | S1 결과, Roadmap, Decision, Pending, Build Log, Pilot A | `notion/reporting/intermediate-report-ti.md`, `intermediate-report-structure.md` | S1 완료 | 11개 필수 섹션, Skeleton 한계·승인 요청·과장 방지, GPT 검토, 사용자 공유 준비 완료 | MD-11 | 별도 Gate 없음 | 선택 | 필수 | 대표님 응답은 Optional Feedback이며 P2 차단 아님 | Notion AI 실행·기능 구현 금지 | `notion/reporting/**` | CP-05-P2 |
| CP-05-P2 | Status & Evidence Model | Skeleton에 최소 상태만 존재 | 업무/Task 상태·Blocker·전이·증빙 | P1 Architecture, S1 UI 관찰, Process 완료조건 | 상태·증빙·전이 명세 | S1·R1 완료 | AG-07~09·15·18 결정 | MD-04 | AG-07~09,15,18 | 선택 | 필수 | 대기 세분화·최소 증빙 | 상태 Automation 금지 | `notion/schema/**`, `notion/mappings/**`, `decisions/**` | CP-05-P3 |
| CP-05-P3 | Process-to-Notion Mapping | Process Atomic Task와 운영 추적 단위 연결 없음 | Atomic→Operational Task 집약·Milestone·Agent 재분해 Mapping | Pilot A Process 03·04·07·08, Variation, P1~P2, S1 | Mapping Coverage와 Task Template 명세 | P2 승인 | Atomic ID, Operational ID, 집약 근거, 추적가치, 재분해, 증빙, Milestone 검증 | MD-02,05 | AG-10~12 | 필수 | 필수 | 집약·Rework·P11 | Process 전체 복제·Task 생성 구현 금지 | `notion/mappings/**`, 보고서, decisions | CP-05-P4 |
| CP-05-P4 | Intake·Collaboration | Slack·구두·실물 분산 | Form·Mention·알림 Event | P1~P3, 역할 모델 | Form·Dashboard·알림 명세 | P3 승인 | AG-13~19 결정 | MD-03,06 | AG-13~19 | 선택 | 필수 | 작성자·채널·자동 댓글 | 댓글·알림 구현 금지 | `notion/schema/**`, `notion/mappings/**`, decisions | CP-05-P5 |
| CP-05-P5 | Pilot-ready MVP Build Specification | Skeleton과 설계 조각 존재 | Skeleton Revision 가능한 단일 명세 | P1~P4, S1 관찰 | Build Spec·QA·Rollback 계획 | P4 승인 | 미결 Build Gate 0, 사용자 Build 승인 | MD-01~07 | AG-04~22,AG-S1 | 필수 | 필수 | 실제 Pilot 조합·Threshold | Build 착수 금지 | `notion/**` 명세, reports, decisions | CP-05-B1 |
| CP-05-B1 | Pilot-ready Notion MVP Revision | 최소 Skeleton만 존재 | P2~P5 상태·Mapping·Form 적용 | P5 승인 Spec, S1 Build Log | Pilot-ready MVP와 Build QA | Build 승인 | Schema·권한·Pilot A Mapping QA PASS | MD-01~07 | AG-04~19,AG-S1 | 선택 | 필수 | 실제 Pilot 조합 | 승인 밖 DB·Automation 금지 | `notion/schema/**`, Build 기록 | CP-05-B2 |
| CP-05-B2 | Manual Pilot A | Pilot-ready 구조, 운영 Record 없음 | P03→P04→P07→필요 시 P08 수동 운영 | Build QA, AG-20A, AG-20B~22 | Pilot 기록·Issue·사용성 Metrics | B1 QA, Pilot 승인 | 구조 완전성·상태 최신성·사용 부담·협업 가시성·지속가능성 평가 | MD-07 | AG-20A,20B,21,22 | 필수 | 필수 | 실제 조합·기간·Threshold | P05/06/09/10/11·Automation·Agent Write 금지 | `notion/pilot/**`, reports | CP-05-B3 |
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
| CP-05-P1 | 업무 Record·조합 구분 미정 | 상위 조합별 업무 건, 하위 Operational Task | Record·DB Architecture | AG-02~06,AG-S1 | 최소 Property·Relation |
| CP-05-S1 | 실제 UI·Relation 없음 | 최소 2개 DB Skeleton | Skeleton·Build Log·QA | AG-S1 | 최소 Property 확정 |
| CP-05-R1 | 중간보고 TI 없음 | Skeleton 기반 Notion AI TI | TI·보고 구조 | 별도 Gate 없음 | 보고 대상·표현 수준 |
| CP-05-P2 | 상태·증빙 기준 없음 | 업무·Task 상태, Blocker, 완료조건, 증빙, 전이 | Status & Evidence Model | AG-07~09,15,18 | 외부/관리역 대기, 최소 증빙 |
| CP-05-P3 | Process 문서만 존재 | Process→Task Template·Trigger·IO·Actor·Evidence·Next·Exception | Mapping Spec | AG-10~12 | 전체 Task, Milestone, 반복 보완 |
| CP-05-P4 | 분산 Intake·알림 없음 | Form·Mention·Slack Event·알림 상태 | Intake & Collaboration Spec | AG-13~19 | 작성 주체, 채널 우선, 자동 댓글 |
| CP-05-P5 | 설계만 존재 | Build 가능한 완전한 명세 | MVP Build Spec | AG-04~22 | 생성 방식, API·Automation, Pilot |
| CP-05-B1~B3 | Skeleton만 존재 | Pilot-ready Revision→Manual Pilot A→Schema Revision | 검증된 MVP | AG-20A,20B~24 | Pilot 조합·기간·Threshold |
| CP-06 | 사람 직접 수행 | 제안·알림·Task 자동화 | Assisted Automation | AG-24,25 | Read·생성 범위 |
| CP-07 | 사람만 Write | 승인 기반 Agent Write | Governance·실행 Pilot | AG-26~31,34 | Write·Rollback·Audit |
| CP-08 | 지원팀 범위 | 운영팀·GP 소통 확장 | Expansion Plan | AG-32~35 | 책임·외부발송 |

## Cross-cutting Known Gaps

신기술투자조합 Trigger·근거자료, 채널 선택 기준, 대리·제3자 수령 요건, 계좌해지 표준 수행주체, 폐업·청산과 계좌해지 선후관계, 수탁계좌 정의·적용 기준, 지점별 서류 차이, 인터뷰 V2 미착수, 독립 CASE 부족, Process 11 미완성을 Build·Pilot Gate의 제약조건으로 사용한다.

## Skeleton 최소 후보

- 업무 DB: 업무명, 조합명, 업무 유형, 담당 관리역, 지원팀 담당자, 현재 단계, 전체 상태, 목표일, 다음 Action, Blocker, Drive 경로, 관련 Task
- Task DB: Task명, 상위 업무, Process ID, 운영 Task ID, Task 상태, 담당 Actor, 담당자, 목표일, 완료 증빙, Blocker, 다음 Task, 비고
- 위 Property는 후보이며 P1과 AG-S1 승인 전 확정값이 아니다.

## CP-05-R1 TI 필수 구조

1. 추진 목적
2. 기존 As-Is
3. 현재 구축 완료 내용
4. Notion DB Skeleton 구조
5. Process 연결 예정 범위
6. Pilot A안
7. 확정된 운영기준
8. 미확정 운영기준
9. 현재 리스크
10. 다음 단계
11. 대표님·승인자 확인 요청사항

TI는 확정 사실·제안·미확정을 분리하고 Skeleton 단계임을 명시한다. Process 11, Automation, 미완성 기능을 완료로 표현하거나 Notion AI가 근거 없이 추정하도록 지시하지 않는다.

## Pilot A

- 포함: Process 03 고유번호증 신청, 04 보안카드·홈택스, 07 계좌개설, 08 계좌개설 보완
- 흐름: 업무 유입 → P03 → P04 → P07 → 필요 시 P08 → Pilot 완료 판정
- 제외: P05 정정, P06 폐업·청산, P09 계좌해지, P10 잔액증명서, P11 DRAFT, 기타 비대상 Process, GP 소통 자동화, 외부기관 자동 발송, Agent Write
- 실제 Pilot 조합, 기간과 Threshold는 Pilot 전에 별도 승인한다.

## Pilot 성공 지표

| 영역 | 측정 후보 |
|---|---|
| 구조 완전성 | 필요한 업무 Record·Operational Task 생성, Relation 오류 0 |
| 상태 최신성 | 실제/Notion 불일치, 갱신 지연, 다음 Action 누락 |
| 사용 부담 | 등록 시간, 상태 변경 횟수, 중복 입력, 불필요 Property, 조작 부담 |
| 협업 가시성 | 상태 이해 시간, Blocker·관리역 대기 식별, 중요 알림 누락 |
| 지속 가능성 | 개인 메모 없이 인계, Record 기반 다음 Action 이해, 계속 사용 의사 |

구체 Threshold는 AG-22에서 Pilot 전에 결정한다.

## Claude A-CP05-P0-REVIEW 검토 항목

Skeleton Build 시점, Pilot A 범위, MD-11, Atomic/Operational Task 구분, AG-05·06 시점, 문서 과잉 통제, P1→S1→R1→P2 연결성과 CP-04 정합성을 검토한다.
