# Roadmap Governance

## 고정 순서

`CP-05-P0 → P1 → P2 → P3 → P4 → P5 → B1 → B2 → B3 → CP-06-P1 → B1 → B2 → CP-07-P1 → B1 → CP-08-P1`

## Gate 원칙

- TAP 순서 변경은 GPT 제안과 사용자 승인이 필요하다.
- Skip과 후속 TAP Auto-run을 금지한다.
- Build는 P1~P5 설계 및 Build 승인 전 금지한다.
- Pilot은 Build QA 전 금지한다.
- Automation은 Pilot 결과 승인 전 금지한다.
- Agent Write는 Write Governance 승인 전 금지한다.
- 운영팀 확장은 지원팀 MVP 안정화 전 금지한다.
- 각 TAP은 하나 이상의 Master Deliverable과 종료 Gate를 가진다.
- 승인되지 않은 운영기준은 확정값으로 기록하지 않는다.

## Gap Resolution

CP-04 Known Gap 해소는 독립 선행 Checkpoint가 아니라 모든 설계·Build·Pilot·Automation 단계에 걸친 `CROSS_CUTTING_WORKSTREAM`이다. 각 Gate 통과에 필요한 Gap만 우선 해결한다.

## 계획 변경 절차

1. `decisions/decision-log.md`에 변경 제안 기록
2. 기존 목표·산출물 영향 분석
3. Scope·Deliverable·Gate 영향 분석
4. GPT 검토
5. 사용자 승인
6. Master Roadmap 갱신
7. Approval Gate와 Queue 갱신
8. 후속 TAP 재설계

Master Roadmap 갱신 전에는 변경된 작업을 실행하지 않는다.
