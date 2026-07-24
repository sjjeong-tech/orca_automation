# CP-00-O1 Git-Native Orchestration Control Layer

## Executive Summary

Git-native 계획·실행 분리 구조를 Bootstrap했다. Canonical Plan·Governance·Work Order·Approval은 GPT 소유, Run·Handoff·Proposal은 Agent 소유로 분리했다. 현재 CP-05-P2 실행 결과를 `APPROVAL_REQUIRED`로 이관했고 AG-P2만 `READY`다. CP-05-P3, Claude Review와 Notion UI 후속 작업은 Work Order·Approval·Input Gate 없이는 실행할 수 없다.

## P2 Git 검증

| 항목 | 검증 결과 |
|---|---|
| Full Commit | `482c570d5da6222d609a0e5dfe5c76c726cee807` |
| origin/main Push | 확인 |
| Worktree at Gate | clean |
| DEC-CP05-11 | DECIDED |
| DEC-CP05-12 | DECIDED |
| Report | `reports/cp-05-p2-status-evidence-model.md` |
| Queue | `PAUSED_FOR_AG-P2_REVIEW` |
| Notion 변경 | 0 |
| Process·Variation·Source 변경 | 0 / 0 / 0 |

P2 출력문이 아니라 Git Commit과 Repository 파일을 Source of Truth로 사용했다. 수정이 필요한 불일치는 발견하지 않아 `P-P2-OUTPUT-CORRECTION` Proposal은 만들지 않았다.

## 생성 구조

- Master Workmap: Work Item 14개
- Dependency: 15개
- Join Gate: 1개 (`J-01`)
- Approval Gate: 1개 (`AG-P2`)
- Governance Policy: 6개
- Work Order Template: 3개
- JSON Schema: 5개
- 현재 Work Order: CP-00-O1 1개
- Proposal: N-06 분류 권고 1개
- Run Capsule: CP-00-O1
- Handoff: CP-05-P2 → AG-P2

## 계획·실행 상태 분리

- 계획 상태는 `orchestration/plan/master-workmap.yaml`에서 GPT만 관리한다.
- 실행 상태는 Agent별 `runs/**`에서 관리한다.
- Agent 완료가 Plan 승인이나 다음 Work Item READY를 의미하지 않는다.
- Generated View는 재생성 가능하며 Canonical Source가 아니다.

## Runtime Control

- 단일 Work Order: 최대 90분
- Checkpoint: 30분 주기, 최대 무Checkpoint 45분
- Work Order당 Commit: 최대 3개
- 세션당 연속 Work Order: 최대 3개
- 세션 총 실행: 최대 4시간
- 예상 90분 초과 시 PLAN·BUILD·VALIDATE·REVIEW_PREP 분할

## 현재 Workmap

| Work Item | 계획 상태 | 실행·입력 상태 |
|---|---|---|
| CP-05-P2 | APPROVAL_REQUIRED | 실행 완료, Commit 검증 |
| AG-P2 | READY | GPT+사용자 승인 필요 |
| N-04 | BLOCKED | WAITING_FOR_USER |
| N-05 | BLOCKED | N-04 필요 |
| N-06 | BLOCKED | N-05 필요, 분류 Proposal 제출 |
| CLAUDE-P2-REVIEW | PLANNED | GPT Work Order 미발행 |
| CP-05-P3 | BLOCKED | AG-P2와 J-01 필요 |

## J-01 Pilot Input Readiness

필수 입력은 AG-P2 승인, N-05 검증, Form 초기 상태 처리, `결성(진행)` 표시, Person 저장, Relation 미선택 제출 검증이다.

N-06은 Codex가 확정하지 않았다. `P-N06-ROLLUP-CLASSIFICATION`에서 `REQUIRED_BEFORE_BUILD`를 권고했으며 GPT 결정 전에는 계획에 반영되지 않는다.

## Validation

- YAML 파일은 JSON-compatible YAML 1.2 형식이다.
- JSON 구문과 Schema 파일 구문을 실제 검증했다.
- Work Item 필수 필드, ID 중복, Dependency 존재, Cycle, 상태값, Work Order–Run 연결, Base Commit, Output Contract와 Ownership을 검증했다.
- Python 런타임은 현재 Windows App execution alias만 존재해 실행할 수 없었다.
- 동일 로직을 Node로 실행해 검증하고 Python Validator·Renderer는 의존성 없이 제공했다.
- `git diff --check`, 허용 경로, 민감정보 검사를 수행했다.

## 결과와 정지점

- AG-P2 승인 처리: 하지 않음
- P3 실행: 하지 않음
- Claude Review 시작: 하지 않음
- 실제 Notion·Form 변경: 0
- 외부 시스템 Write: Git Commit·Push 외 0
- 다음 Owner: GPT + 사용자
- 전체 상태: `PAUSED_FOR_AG_P2_AND_UI_WORKSTREAM`
