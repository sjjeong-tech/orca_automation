# Git-Native Orchestration

이 디렉터리는 계획 상태와 Agent 실행 상태를 분리한다.

## Source of Truth

- Canonical plan: `plan/master-workmap.yaml` — owner: GPT
- Governance: `governance/**` — owner: GPT
- Work Orders: `work-orders/**` — owner: GPT
- Approval packets: `approvals/**` — owner: GPT
- Agent execution: `runs/<agent>/**`
- Handoff: `handoffs/**`
- Plan change request: `proposals/**`
- Generated views: `generated/**` — 재생성 가능, Source of Truth 아님

CP-00-O1은 최초 Bootstrap 예외로 Codex가 사용자 명세에 따라 GPT 소유 파일을 생성했다. 이 Commit 이후 Codex·Claude는 GPT 소유 경로를 직접 수정하지 않고 Proposal을 제출한다.

## Execution

1. Agent는 GPT가 발행한 Work Order와 Base Commit을 확인한다.
2. Run Capsule을 생성하고 허용 경로 안에서만 실행한다.
3. Validation·Commit·Push 후 Handoff를 제출한다.
4. 승인이나 사용자 Input이 필요하면 정지한다.
5. Master Workmap의 계획 상태는 GPT만 변경한다.

기존 `tasks/tap-queue.md`는 사람용 Historical Summary다.
