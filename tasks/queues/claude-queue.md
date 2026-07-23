# Claude Queue

| TAP | 업무지도 위치 | 작업 | 상태 | Input | Output |
|---|---|---|---|---|---|
| A0-R | CP-04 → Claude Setup | Git·Repo·Worktree 검증 | COMPLETED | Repo | Setup report |
| A1-ROLE-SETUP | Claude Setup | 역할·정책·Handoff 설정 | COMPLETED | AGENTS.md | Claude 운영파일 |
| A1-SYNC | Claude Setup → Variation Review 준비 | Claude Branch 최신 main 동기화 | COMPLETED | origin/main (V1-A/B/C) | 동기화된 Claude Branch, 갱신된 Handoff·Queue |
| A-V0-REVIEW | Variation Planning | Variation 사전설계 독립검토 | SKIPPED_WITH_REASON — V0 계획 산출물은 V1-A/B/C 구현으로 이미 전개됐으며, Coverage Review를 A-V1-SOURCE-COVERAGE에서 통합 수행 | Codex V0 결과 | — |
| A-V1-REVIEW | Variation Model | Variation Model Source 검토 | REPLACED_BY_A_V1_SOURCE_COVERAGE | Variation 산출물 | — |
| A-V1-SOURCE-COVERAGE | V1-A/B/C 완료 → Coverage Audit | Notion 원본·Repo Source·Model 3계층 Coverage 검토 | PARTIAL — institution/account-type/gp-type/fund-type 우선순위 완료, E2E-01~06·09 및 일부 CASE·인터뷰 문서 미검토 | Notion 원본, sources/notion/**, processes/**, variations/** | Claude Review 3종 (source-coverage, gap-register, interview-candidates) |
| 후속 GPT Review | Coverage Audit 이후 | Finding 승인·분류 | READY | Claude Review 3종 | 승인된 Finding, Codex TAP 설계 |
| 후속 Codex V1-R | GPT 승인 이후 | Variation Revision | BLOCKED_UNTIL_GPT_APPROVAL | 승인된 Finding | Variation Revision |
