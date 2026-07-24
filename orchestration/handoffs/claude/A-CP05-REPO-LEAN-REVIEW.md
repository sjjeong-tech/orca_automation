# Handoff — A-CP05-REPO-LEAN-REVIEW

- From: CLAUDE
- To: GPT_AND_USER
- Status: READY_FOR_REVIEW
- Result: COMPLETED (repository unchanged)
- Source Run: `orchestration/runs/claude/A-CP05-REPO-LEAN-REVIEW/run.yaml`
- Base Commit: `a50cce0f7d1467e410e85f237ebbacfb637bcd94`
- Full Report: `reports/reviews/claude/repository-lean-review.md`

## 현행 구조 판정

`OVERDESIGNED` (SEVERELY_OVERDESIGNED는 아님). Blocking 수준의 정보 손실·상태 상충은 없으나, "현재 계획 상태"를 추적하는 메커니즘이 4개(README.md §9.8, tasks/tap-queue.md, orchestration/plan/master-workmap.yaml, orchestration/generated/current-state.md) 공존하고, 2026-07-23 CP-05 Operating Model 체계 위에 2026-07-24 Git-Native Orchestration 체계가 명시적 폐기 선언 없이 병렬로 부트스트랩되어 탐색 비용이 이미 통제 계층 자체를 병목으로 만들고 있다.

## 가장 큰 과설계 5건

1. Work Item 상태가 README/tap-queue.md/master-workmap.yaml/current-state.md 최대 4곳에 중복(O1) — 수동 동기화라 상태 변경 시 최소 2개 파일을 사람이 직접 고쳐야 함(O2).
2. `orchestration/plan/dependency-map.yaml`이 `master-workmap.yaml.dependencies`와 동일 그래프를 별도 파일로 중복 보유.
3. `tasks/tap-queue.md`가 스스로 "Historical Summary"라 선언하면서도 신규 Notion Operations Control Plane Queue(C0~X1) 절이 2026-07-24까지 실시간으로 계속 갱신됨(O6).
4. `operating-model/approval-gates.md`(AG-01~35, 구 체계)와 `orchestration/governance/approval-gates.yaml`+`master-workmap.yaml.approval_gates`(AG-P2/AG-P3, 신 체계)가 관계 선언 없이 병존.
5. 동일 이벤트(예: CP-00-O1 실행, P3/AG-P3 Gap, Fast-Track Form 능력 탐색)를 Run Capsule·산문 Report·Workmap 상태로 3중 기록.

## 유지할 Canonical 파일

- `orchestration/plan/master-workmap.yaml`(계획 상태), `processes/00~11`, `variations/**`, `notion/schema/**`+`notion/model/**`, `decisions/decision-log.md`, `orchestration/generated/ready-work.md`·`current-state.md`(재생성 뷰로서 유지).

## Archive 후보

- `tasks/tap-queue.md`의 레거시 S0~V8 절(완료된 CP-04 이전 TAP 이력) — 삭제 아닌 History 동결.
- `reports/`의 CP-04 QA 시대 문서(`process-wave-*-qa.md`, `source-*-qa.md`) — 이미 참조가 끝난 완료 이력.

## Merge 후보

- `orchestration/plan/dependency-map.yaml` → `master-workmap.yaml.dependencies`로 통합.
- `orchestration/plan/roadmap.md` → 재생성 뷰로 전환하거나 current-state.md와 통합.
- P3/AG-P3 관련 보고서 5종(`ag-p3-conflict-summary.md` 등) → 1개로 통합.
- Fast-Track Form 능력 보고서 5종 → 1개로 통합.
- `orchestration/governance/*.yaml` 5개 → 1개 `policy.yaml`.

## Entry Point 필요 여부

**필요.** 4개 탐색 시나리오 모두 4~9개 파일을 열어야 답이 나와 "5분 내 답변" 원칙을 위반한다.

## 추천 파일명

`START_HERE.md` (Repository Root). 초안은 Review Report Appendix A 참고.

## 즉시 적용할 3가지

1. `START_HERE.md` 신설(Canonical 파일을 가리키기만 함, 복제 금지).
2. `tasks/tap-queue.md` 최상단에 동결 배너 추가, 신규 절 갱신 중단.
3. 핵심 ID(AG-P2/P3, N-04~06, J-01/J-02, FT-01~05, CI-01~07) 용어집을 START_HERE.md에 포함.

## 구조개편 전 주의사항

- `orchestration/` 경로는 `scripts/validate_orchestration.py`, JSON Schema(`orchestration/schemas/**`), Work Order 템플릿이 정확한 경로에 의존하므로 이름 변경·이동 전 스크립트 영향 확인 필요.
- N-06 Task Rollup 검증과 AG-P3 승인이 진행 중이므로, 안 C(초경량 구조로 전면 개편)는 지금 시점에 권장하지 않음(NOT_RECOMMENDED) — 안 B(Canonical 최소화 + History Archive)를 단계적으로 적용할 것을 권고.
- 파일 이동·삭제는 이번 TAP에서 수행하지 않았으며, 위 권고는 모두 향후 별도 TAP·Proposal 대상이다.

## Codex 후속 TAP 필요 여부

**필요.** 제안 TAP명: `CP-00-O4-LEAN-ENTRY`(SAFE_NOW 3건 적용). Owner 후보: Codex(Builder), Claude는 결과만 독립 검증. 상세는 Review Report §15 참고.

## Validation

- notion_changes: 0
- process_changes: 0
- variation_changes: 0
- source_changes: 0
- repository_structure_changes: 0
- outputs_created_only_in: `reports/reviews/claude/**`, `orchestration/runs/claude/**`, `orchestration/handoffs/claude/**`

## Blocking Conditions

- 없음(이번 TAP 자체는 승인 불필요, Read-only 진단). 후속 TAP(`CP-00-O4-LEAN-ENTRY`) 실행은 GPT·정상준의 확인 후 Work Order 발행 필요.

## Open Gaps

- Conversational Intake(CI-01~07)가 `master-workmap.yaml`에 아직 등록되지 않음(결정은 났으나 Canonical 실행계획 미반영) — 별도 확인 필요.
- `AGENTS.md`와 `orchestration/governance/agent-policy.yaml`의 관계 미정.
