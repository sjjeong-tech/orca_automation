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
