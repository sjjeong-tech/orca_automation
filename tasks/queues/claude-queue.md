# Claude Queue

| TAP | 업무지도 위치 | 작업 | 상태 | Input | Output |
|---|---|---|---|---|---|
| A0-R | CP-04 → Claude Setup | Git·Repo·Worktree 검증 | COMPLETED | Repo | Setup report |
| A1-ROLE-SETUP | Claude Setup | 역할·정책·Handoff 설정 | COMPLETED | AGENTS.md | Claude 운영파일 |
| A1-SYNC | Claude Setup → Variation Review 준비 | Claude Branch 최신 main 동기화 | COMPLETED | origin/main (V1-A/B/C) | 동기화된 Claude Branch, 갱신된 Handoff·Queue |
| A-V0-REVIEW | Variation Planning | Variation 사전설계 독립검토 | SKIPPED_WITH_REASON — V0 계획 산출물은 V1-A/B/C 구현으로 이미 전개됐으며, Coverage Review를 A-V1-SOURCE-COVERAGE에서 통합 수행 | Codex V0 결과 | — |
| A-V1-REVIEW | Variation Model | Variation Model Source 검토 | REPLACED_BY_A_V1_SOURCE_COVERAGE | Variation 산출물 | — |
| A-V1-SOURCE-COVERAGE | V1-A/B/C 완료 → Coverage Audit | Notion 원본·Repo Source·Model 3계층 Coverage 검토 | PARTIAL — institution/account-type/gp-type/fund-type 우선순위 완료, E2E-01~06·09 및 일부 CASE·인터뷰 문서 미검토 | Notion 원본, sources/notion/**, processes/**, variations/** | Claude Review 3종 (source-coverage, gap-register, interview-candidates) |
| A-V1-SOURCE-COVERAGE-R2 | Coverage Audit R1 이후 → 미검토 범위 보완 | E2E-03·04·05·06·09, CASE-02, 관리역 인터뷰 v2 검토 | PARTIAL — 7-1·[AI Cross-check]·[REC_S3_01]·재시연 파일럿 잔여 구간 미검토 | Notion 원본(E2E-03~06·09, CASE-02, 7-2), processes/03~09, variations/** | Claude Review R2 3종 (source-coverage-r2, gap-register-r2, interview-candidates-r2) |
| 후속 GPT Review (Variation) | Coverage Audit R1+R2 이후 | Finding 승인·분류 | COMPLETED — Codex V1-R2에 GAP-REG-01/02/09, GAP-R2-01~04 반영 확인(variation-integration-qa.md) | Claude Review 6종(R1+R2) | 승인된 Finding, Variation Revision |
| A-CP05-P0-REVIEW | CP-05-P0-R 완료 → Master Roadmap 독립 검토 | Operating Model·Roadmap·Approval Gate·Scope Governance 7축 검토 | COMPLETED — PASS_WITH_REVISIONS (Blocking 0, Major 4, Minor 3) | operating-model/**, plans/**, decisions/**, reports/notion-operating-model-gap-analysis.md | Claude Review 3종 (roadmap-review, approval-gate-review, scope-governance-review) |
| 후속 GPT Review (Roadmap) | A-CP05-P0-REVIEW 이후 | Finding 승인·분류, 특히 RM-01/SG-01 | READY | Claude Review 3종 | 승인된 Finding, 사용자 승인 요청 |
| 사용자 Master Roadmap 승인 | GPT Review 이후 | Revised Roadmap 최종 승인 | WAITING | GPT 승인 Finding | 승인 또는 Revision 요청 |
| 후속 Codex CP-05-P1 | 사용자 승인 이후 | Record Unit·DB Architecture | BLOCKED_UNTIL_ROADMAP_APPROVAL | 승인된 Roadmap | P1 설계 |
