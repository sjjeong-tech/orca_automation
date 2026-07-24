# Handoff — A-CP05-CI1-TEST-DESIGN

- From: CLAUDE
- To: GPT_AND_USER
- Status: READY_FOR_REVIEW
- Result: COMPLETED (no repository structure, code, Notion, or Contract changes)
- Source Run: `orchestration/runs/claude/A-CP05-CI1-TEST-DESIGN/run.yaml`
- Base Commit: `a364e70a26633307335999dd279b0216fe0ba6dc`
- Related Codex TAP: `CP-05-CI1-LR` (not yet reviewed against this pack — pack precedes implementation)
- Full Test Pack: `reports/reviews/claude/ci1-independent-test-pack.md`
- Machine-readable Matrix: `reports/reviews/claude/ci1-test-matrix.yaml`

## 요약

고유번호증 신청 대화형 Intake(CI-03/CI-04) 구현을 독립 검증하기 위한 테스트 20건을 설계했다. 구현 결과는 아직 존재하지 않으므로 어떤 시나리오도 실행하지 않았으며, 모든 기대값은 Contract·Mapping 문서에 근거해 사전 정의만 했다.

## Test Pack 핵심 내용

- Test 수: 20 (요구된 최소 18건, 목표 20건 모두 충족)
- Severity 분포: CRITICAL 12, HIGH 5, MEDIUM 2, LOW 1
- 승인 문구 규칙: "생성/승인/이 내용으로 등록/그대로 만들어주세요"만 승인으로 인정, 그 외(네/확인했습니다/알겠습니다 등)는 기본값 비승인(fail-safe)으로 처리하고 재확인 질문
- 조합 식별 정책: 후보 0건이면 신규 FUND Record 자동 생성 금지, 후보 2건 이상이면 사용자 선택 요구(`USER_SELECTION_REQUIRED`)
- Person 식별 정책: 동명이인 등 후보 2건 이상이면 사용자 선택 요구(`USER_SELECTION_REQUIRED`)
- 중복 탐지 정책: 자동 병합 금지, 경고와 명시적 승인 요구(`WARNING_AND_EXPLICIT_APPROVAL`)
- Request→Task 검증 기준: 생성된 Request의 "관련 Task"와 각 Task의 "상위 요청"이 양방향으로 정확히 일치해야 함(T18)
- N-06(Task 관련 조합 Rollup) 검증 기준: 기존 N-06 Work Item(PARTIAL)이 대화형 경로에서도 동일하게 검증되어야 하며, 이 TAP은 새로운 문제가 아니라 기존 Gap의 재확인임을 명시(T19)
- 운영 Record 보호 기준: TEST 전용 FUND·Person·Request·Task만 사용하고 기존 운영 Record·View·Filter·Template 변경 0건이어야 함(T17)

## 발견한 상충·미확정 사항 (Codex 결과 검증 시 우선 확인)

1. **[CRITICAL, OPEN_QUESTION]** `contracts/conversational-intake-contract.yaml`의 `related_fund` 필수 필드 선언과 `mappings/request-property-map.md`의 "관련 조합 조건부(기존 Record 없으면 비움)" 선언이 상충한다. T06으로 이 지점을 직접 겨냥했으며, Claude는 정답을 미리 가정하지 않았다.
2. **[MEDIUM]** Contract의 필수 필드 `urgent`에 대응하는 Notion Request Property가 `mappings/request-property-map.md`에 없다. `notion/model/human-approval-model.md`의 `DP-06`(긴급 요청인가) Output `priority`가 어디에 저장되는지도 불명확하다.
3. **[CRITICAL, OPEN_QUESTION]** Contract의 `error_handling.partial_task_creation`이 "Rollback 또는 Incomplete 표시" 두 선택지를 모두 허용해 정책이 확정되지 않았다. T20으로 이 지점을 겨냥했다.

이 3가지는 Contract 원본을 수정하지 않고 Finding으로만 기록했다.

## Codex 결과 검증 체크리스트

`ci1-independent-test-pack.md` §7에 15개 항목(Parser~사용자 실행 가능성) 표를 준비했으며 현재 모두 `NOT_TESTED`다. Codex 구현 완료 후 Claude 또는 GPT가 이 표를 채우는 후속 검증 TAP을 권고한다.

## Validation

- notion_changes: 0
- process_changes: 0
- variation_changes: 0
- contract_changes: 0
- canonical_workmap_changes: 0
- repository_structure_changes: 0
- outputs_created_only_in: `reports/reviews/claude/**`, `orchestration/runs/claude/**`, `orchestration/handoffs/claude/**`

## Blocking Conditions

- 없음. 이 TAP 자체는 구현 전 독립 설계이므로 승인 불필요. 다만 후속 "Codex 결과 검증" TAP은 CI-03/CI-04 구현 완료 후에만 실행 가능(현재 `orchestration/plan/master-workmap.yaml` 기준 CI-03/CI-04는 `BLOCKED`).

## Open Gaps

- 위 발견 1~3 (Contract 상충·미확정)
- N-06 Task Rollup 실제값 검증은 여전히 PARTIAL(별도 Work Item에서 추적 중, 이 TAP은 재확인만 제안)
- 승인 문구 규칙과 날짜 해석 규칙은 Claude의 제안이며 Contract에 아직 반영되지 않음 — GPT·정상준 검토 후 Contract 갱신 여부 결정 필요

## Next Owner

GPT_AND_USER — Codex의 CP-05-CI1-LR 구현 완료 후 본 Test Pack 기준으로 결과 검증 TAP 발행을 권고한다.
