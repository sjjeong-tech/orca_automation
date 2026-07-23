# Operating Model Principles

1. Process Model과 Live State를 분리한다.
2. Notion은 실제 업무 상태의 단일 기준이다.
3. Orca는 실행 규칙과 자동화 논리의 단일 기준이다.
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

## Process Atomic Task와 Notion Operational Task

- Process Atomic Task는 AI가 업무를 이해·실행하기 위한 최소 행동 단위다.
- Notion Operational Task는 사람이 진행상태를 추적할 가치가 있는 운영 단위다.
- 여러 Atomic Task를 하나의 Operational Task로 집약하거나 핵심 Milestone을 별도 Task로 만들 수 있다.
- Agent 실행 시 Operational Task를 Atomic Task로 다시 분해할 수 있다.
- Process 문서를 그대로 Task DB에 복제하거나 클릭·출력·정렬 등 추적 가치가 낮은 미세행동을 대량 생성하지 않는다.
- 집약 관계, 집약 근거, 사용자 추적 필요성, Agent 재분해 여부와 완료 증빙을 Mapping에 남긴다.
