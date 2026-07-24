# Operating Model Principles

1. Process Model과 Live State를 분리한다.
2. Notion은 실제 업무 상태의 단일 기준이다.
3. `vc-support_team-process-rag` Repository는 Process·Rule·Variation·RAG Knowledge와 자동화 논리의 단일 기준이다.
4. 수동 → 반자동 → 승인 기반 자동 순서를 지킨다.
5. Human Approval을 외부 쓰기와 중요 상태 변경보다 앞에 둔다.
6. 단일 `CASE_ONLY`를 공통 Rule로 일반화하지 않는다.
7. `UNKNOWN` Rule은 자동 실행하지 않는다.
8. 모든 Agent Write는 Actor, 시각, 입력, 변경 전후, 승인, 결과를 Audit할 수 있어야 한다.
9. Pilot 검증 전 전사 확대를 금지한다.
10. Scope 밖 발견을 현재 TAP에서 즉시 구현하지 않는다.
11. Master Roadmap 밖 작업을 실행하지 않는다.
12. 미승인 기준은 선택지와 권장안으로 기록하되 확정값으로 쓰지 않는다.
13. Notion에는 민감정보 실제 값을 저장하지 않고 승인된 비민감 상태·경로·메타데이터만 기록한다.
14. 실패·Rollback·재시도 기준이 없는 Write 자동화는 허용하지 않는다.
15. 후속 TAP은 자동 실행하지 않는다.

## Multi-Agent 역할 경계

- Notion AI는 Form 초안·질문 구성·Notion UI 탐색과 가능한 UI 편집을 담당한다.
- Codex는 Git 기반 Builder로 Process·Rule·Schema·Status·Evidence·RAG Contract를 구축한다.
- GPT는 Master Roadmap, 우선순위, 병렬 결과 통합, Approval Gate와 TAP 발행을 통제한다.
- 사용자·정상준은 Process Owner, Notion UI 최종 확인자와 Pilot 승인자다.
- Form UI 미완료는 Git 기반 상태·증빙 설계를 차단하지 않으며 별도 UI Workstream으로 관리한다.
- Notion AI의 결과는 `DISCOVERY_ONLY`, `FORM_DRAFT`, `UI_CHANGE_ATTEMPT`, `VALIDATION`, `MAIN_ROADMAP_INPUT`으로 분류하고 GPT가 Roadmap 반영 여부를 판단한다.

## 상태·Actor·Blocker

- Status는 업무의 진행 단계를, Current Actor는 다음 행동·응답 주체를, Blocker는 전이를 막는 구체적 원인을 의미한다.
- 대기 원인은 Actor와 Blocker로 구분하며 필요 이상으로 Status를 늘리지 않는다.
- `UNKNOWN` Rule이나 미승인 상태 전이를 Agent가 실행하지 않는다.
- Task 완료에는 관찰 가능한 완료조건과 Evidence가 필요하고 요청 완료에는 Human 최종 확인이 필요하다.

## Process Atomic Task와 Notion Operational Task

- Process Atomic Task는 AI가 업무를 이해·실행하기 위한 최소 행동 단위다.
- Notion Operational Task는 사람이 진행상태를 추적할 가치가 있는 운영 단위다.
- 여러 Atomic Task를 하나의 Operational Task로 집약하거나 핵심 Milestone을 별도 Task로 만들 수 있다.
- Agent 실행 시 Operational Task를 Atomic Task로 다시 분해할 수 있다.
- Process 문서를 그대로 Task DB에 복제하거나 클릭·출력·정렬 등 추적 가치가 낮은 미세행동을 대량 생성하지 않는다.
- 집약 관계, 집약 근거, 사용자 추적 필요성, Agent 재분해 여부와 완료 증빙을 Mapping에 남긴다.
