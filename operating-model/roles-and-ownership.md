# Roles and Ownership

## RACI

`A`는 최종 승인, `R`은 실행, `C`는 검토·자문, `I`는 통지를 뜻한다. 시스템은 책임자가 아니라 기록·실행 수단이다.

| Activity | 정상준 | 운영팀 관리역 | 지원팀 | GPT | Codex | Claude | Notion | Orca | Slack | 향후 Agent |
|---|---|---|---|---|---|---|---|---|---|---|
| 운영 기준 승인 | A | C | C | R | I | C | - | 기록 | I | - |
| 업무 요청·기본정보 | I | A/R | C | - | - | - | 기록 | - | 보조 | - |
| 행정 수행·증빙 | A | C | R | - | - | - | 기록 | Rule 참조 | 보조 | 승인 전 제안 |
| Roadmap·Gate | A | C | C | R | C | C | 기록 후보 | R | I | - |
| Schema·Mapping 구현 | A | C | C | C | R | C | 구현 대상 | 기준 저장 | I | - |
| 독립 QA | A | C | C | C | I | R | 읽기 | 읽기 | - | - |
| 상태의 최신성 | A | C | R | I | I | I | System of Record | - | 알림 | 승인 범위 |
| Agent Write 승인 | A | C | C | R | C | C | Write 대상 | Governance | 알림 | R |
| 외부 발송 | A | C | R | I | - | - | 상태 기록 | 승인 Rule | 알림 | 승인 전 금지 |

## 소유권 규칙

- 동일 Notion Record의 최종 Write 소유자는 한 시점에 한 주체만 지정한다.
- 정상준은 Process Owner이자 운영기준 승인자다.
- 운영팀은 요청·판단, 지원팀은 실행·상태·증빙을 소유한다.
- GPT는 승인 Gate를 통제하되 사용자 승인을 대체하지 않는다.
- Codex와 Claude는 각각 Builder와 Reviewer이며 동일 산출물의 최종 승인자가 아니다.
- Slack은 알림 Interface 후보이며 System of Record가 아니다.
