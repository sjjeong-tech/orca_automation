# As-Is Operating Model

## 기준 상태

- 기준 Gate: `CP-04_COMPLETE_WITH_KNOWN_GAPS`
- 기준 Commit: `c3ae544b0dab046fc6d979a0bc2c4ee9f2c1cbbe`
- 완료 산출물: 공식 Source Extract, Process 00~11, Variation 4축, Source·Process·Variation Mapping, QA와 Known Gap
- Process 11은 Coverage 0/7의 `DRAFT`이며 확정 종료 Process가 아니다.

## 현재 Repo 책임 구조

| Layer | 현재 책임 |
|---|---|
| `sources/**` | Notion 원본에서 추출한 공식 근거 |
| `processes/**` | 세무서·은행 As-Is Process 00~11 |
| `variations/**` | 조합·GP·계좌·기관별 차이 |
| `mappings/**` | Source·Process·Variation 연결 |
| `conflicts/**` | 미확정·상충 항목 |
| `plans/**` | 모델링 계획 |
| `reports/**` | QA·검토·완료 보고 |
| `tasks/**` | TAP Queue·Handoff |
| `AGENTS.md` | 공통 Agent 작업 원칙 |

`agents/**` 전용 Layer는 현재 존재하지 않는다. 향후 구조 후보일 뿐 이번 TAP에서 생성하지 않는다.

## 현재 Live Operations 공백

Repo는 Rule과 근거를 보존하지만 실제 업무 상태를 기록하는 System of Record가 아니다. 실제 조합 업무 유입, 업무 Record, 담당자, 단계, Task 상태, 목표일, Blocker, 증빙, 관리역 알림, 댓글 Mention, Agent 실행, 실제 완료일, 예외·보완 반복 이력이 구조화되어 있지 않다.

## 현재 업무 유입·추적·알림

- 유입: Slack, 구두, 실물서류 등으로 분산되어 있으며 표준 Intake가 없다.
- 추적: Process 문서는 있으나 실제 업무 건과 Atomic Task Record가 없다.
- 알림: 상태 변경, 관리역 확인, 외부기관 대기에 대한 공통 Event·수신 확인 기준이 없다.
- AI: Source·Process 분석과 계획·구현 지원 역할이며 Live State 쓰기 권한과 Audit 기준은 없다.

## 현재 역할

- Notion: 업무 상태·책임자·다음 행동·대기 상태를 관리할 후보 System of Record
- Orca Repo: Process Rule, Variation, Mapping, 향후 Automation Logic의 기준 저장소
- GPT: Master Roadmap, TAP, Approval Gate, Orchestration
- Codex: 구조·Schema·Mapping·Automation Builder
- Claude: 누락·상충·운영 적합성 독립 Reviewer
- 정상준: Process Owner, 운영 기준 승인자, Pilot 사용자
- 운영팀 관리역: 업무 요청자, 기본정보·판단 Actor
- 지원팀: 실제 행정업무 수행자, 상태·증빙 기록자
- Slack: 알림·협업 인터페이스 후보

## 현재 제약

- `UNKNOWN`, `PROVISIONAL`, `CASE_ONLY`를 자동화 Rule로 승격할 수 없다.
- 모든 Gap을 먼저 해소하지 않고 Build·Pilot에 필요한 Gap만 Gate별로 해결한다.
- Notion Schema, DB 개수, Record 단위, 상태값, 증빙, 알림, AI 권한은 미승인이다.
