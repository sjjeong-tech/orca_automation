# To-Be Operating Model

## 목표 흐름

업무요청·실물서류 유입 → Notion 업무 DB 등록 → Process 기반 또는 수동 Task 생성 → 운영팀·지원팀 상태 공유 → 댓글 Mention·알림 → 증빙·Blocker·완료조건 기록 → AI 다음 Action 제안 → 승인 기반 반자동 처리 → Agent 실행 → 운영팀·GP 소통 범위 확장

## 책임 경계

| 주체 | To-Be 책임 | 책임 밖 |
|---|---|---|
| Notion | 실제 업무 상태·증빙·담당자·기한·댓글·Blocker의 System of Record | Process Rule 원본·자동화 코드 |
| Orca | Process·Variation·Task Template·상태 전이·Automation Rule의 기준 | 실제 업무 건의 최신 상태 |
| GPT | 업무지도, TAP, Approval Gate, Agent Orchestration | 미승인 운영기준 확정 |
| Codex | 승인된 구조·Schema·Mapping·Automation 구현 | 운영 승인 대행 |
| Claude | 독립 누락·상충·운영 적합성 검토 | 원본 최종 승인 |
| 정상준 | 운영 기준 최종 승인, Pilot 판정 | 기술 구현 |
| 운영팀 | 요청·기본정보·관리역 판단 | 지원팀 실행기록 대행 |
| 지원팀 | 행정 수행·상태 갱신·증빙·예외 Escalation | 미승인 Rule 결정 |
| Slack | 승인된 알림·협업 Interface | 상태의 최종 원장 |
| 향후 Agent | 승인 범위 내 제안 또는 Write | 권한 밖 변경·외부 발송 |

## 발전 단계

1. **Phase 1 Manual**: 사람이 Intake, Task, 상태, 증빙을 기록한다.
2. **Phase 2 Assisted**: AI가 읽기·누락 탐지·다음 Action·Task 후보를 제안한다.
3. **Phase 3 Approval-based Agent Write**: Human Approval과 Audit Log를 전제로 제한된 Write를 수행한다.
4. **Phase 4 Operations-team Expansion**: 지원팀 MVP 안정화 후 운영팀·GP 소통·초안·날인 요청으로 확장한다.

각 Phase는 이전 Phase의 QA와 사용자 승인 없이는 시작하지 않는다.

## 계획된 Repo Layer

- `operating-model/**`: 책임, 원칙, Gate, Governance
- `notion/schema/**`: 승인된 DB·Property 명세
- `notion/mappings/**`: Process·Task·상태와 Notion 구조 연결
- `notion/pilot/**`: Pilot 범위·기록·평가
- `automation/interfaces/**`: 외부 Interface 계약
- `automation/workflows/**`: 승인된 Workflow
- `automation/validations/**`: 상태·권한·증빙 검증
- `automation/agents/**`: 승인된 Agent 역할·권한
- `decisions/**`: 결정·미결 승인

이번 TAP은 이 구조를 계획만 하며 구현용 디렉터리를 만들지 않는다.
