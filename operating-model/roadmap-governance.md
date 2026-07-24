# Roadmap Governance

## 고정 순서

`CP-05-P0 → P0-R → A-CP05-P0-REVIEW → GPT·사용자 승인 → P1 → S1 → P2 → P3 → P4 → P5 → B1 → B2 → B3 → CP-06-P1 → B1 → B2 → CP-07-P1 → B1 → CP-08-P1`

## Gate 원칙

- TAP 순서 변경은 GPT 제안과 사용자 승인이 필요하다.
- Skip과 후속 TAP Auto-run을 금지한다.
- 일반 Build는 P1~P5 설계 및 Build 승인 전 금지한다. 단, P1 완료와 AG-S1 승인 후 수행하는 CP-05-S1 Fast Notion Skeleton Build는 제한된 조기 검증 예외이며 `operating-model/scope-control.md`의 범위를 따른다.
- Pilot은 Build QA 전 금지한다.
- Automation은 Pilot 결과 승인 전 금지한다.
- Agent Write는 Write Governance 승인 전 금지한다.
- 운영팀 확장은 지원팀 MVP 안정화 전 금지한다.
- 각 TAP은 하나 이상의 Master Deliverable과 종료 Gate를 가진다.
- 승인되지 않은 운영기준은 확정값으로 기록하지 않는다.
- S1은 완성 MVP가 아닌 최소 Skeleton이며 P2~P5 설계의 UI 관찰 Input이다.
- S1은 P1 Architecture의 최소 범위만 구현하며 Automation·Slack·전체 Mapping·Agent Write를 수행하지 않는다.
- S1 이후 구조는 P2~P5에서 변경·재작업될 수 있다.
- B1은 P2~P5 결과를 Skeleton에 적용하는 Pilot-ready Revision이다.

## Communication Ownership

- 중간보고는 Master Roadmap 실행 TAP이 아니다.
- Skeleton 완료 후 필요 시점만 `CM-01` 선택 Milestone으로 표시한다.
- 보고 구성·TI 작성·수정·공유는 GPT와 사용자 정상준이 수행한다.
- Codex·Claude는 대표님 보고 문구 또는 Notion AI TI를 작성·검토하지 않는다.
- 보고 결과에서 새로운 운영결정이 나온 경우에만 Git Decision Log 또는 Approval Gate에 반영한다.
- 보고 작성·공유·응답을 기다리느라 CP-05-P2를 차단하지 않는다.

## Gap Resolution

CP-04 Known Gap 해소는 독립 선행 Checkpoint가 아니라 모든 설계·Build·Pilot·Automation 단계에 걸친 `CROSS_CUTTING_WORKSTREAM`이다. 각 Gate 통과에 필요한 Gap만 우선 해결한다.

### Interview Candidate Reference

- `origin/agent/claude/setup:reports/reviews/claude/a-v1-interview-candidates.md`
- `origin/agent/claude/setup:reports/reviews/claude/a-v1-interview-candidates-r2.md`
- 관련 Coverage 문서:
  - `origin/agent/claude/setup:reports/reviews/claude/a-v1-source-coverage.md`
  - `origin/agent/claude/setup:reports/reviews/claude/a-v1-source-coverage-r2.md`
- 상태: `REFERENCE_ONLY`
- P1~B2에서 특정 Gate 해소에 필요한 질문만 선택적으로 사용하며 전체 인터뷰를 일괄 실행하지 않는다.

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
