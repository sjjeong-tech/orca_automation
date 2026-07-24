# Current Orchestration Roadmap

```text
CP-05-P3 ──→ AG-P3 (프로세스-Notion Mapping 승인; Formal Review)
    │
    ├──→ CI-01 (대화형 요청 입력규격 확정) ──→ CI-03 (자연어 해석·누락질문)
    │                │                                  │
    └──→ CI-02 (Notion 운영구조 정리) ──────────────────┴──→ CI-04 (Request·Task 기록)
                                                                ↓
                                                          CI-05 (Skill E2E)
                                                           ├─→ CI-06 (Slack Pilot)
                                                           └─→ CI-07 (운영 개선)
```

## Canonical 방향

- Primary Intake: Slack·Claude Code Skill·GPT·Codex를 통한 자연어 대화
- Canonical Record: Notion `지원팀 업무요청`과 `지원팀 Task`
- Form: Optional Fallback
- Notion AI: 사용자 명시 요청 시에만 가능한 한시적 선택 도구
- N-06: Form이 아닌 Task 관련 조합 Rollup DB Validation

## Form Fast Track 처분

- FT-01·FT-02·FT-05: `SUPERSEDED`, 결과 보존, 비차단
- FT-03: Relation 검증 결과 재사용
- FT-04: Form을 제외한 Request→Task DB E2E 결과 재사용

## AG-P3와 P4

AG-P3는 P3 Formal Approval로 유지하지만 CI-01·CI-02 탐색과 Prototype 계획을 차단하지 않는다. CP-05-P4는 `Conversational Intake and Collaboration Model (대화형 요청 접수·협업 운영모델)`로 재정의되며 자동 실행하지 않는다.

## 실행 통제

CI-01 또는 CI-02를 실제 실행하려면 GPT Work Order가 필요하다. 실제 Notion Write, Slack 연동, Claude Code Skill 구현은 각각 별도 승인·Work Order 전까지 금지된다.
