# Current Orchestration Roadmap

## E2E-03 실행표준 방향 (2026-07-25)

- 현재 단계: `OPERATIONAL_STANDARD_DRAFT`
- 검증 근거: CI4 Technical Alpha PASS, CI5 `PASS_E2E03_ALPHA_STANDARD_DRAFT`, CI6 CASE-01~08 사용자 DB 통합테스트
- 검증 결과: Atomic Step 16/16, Request 1건 + Task 6건, TEST Request 4건/Task 24건, Expected–Actual 불일치·운영 Record 변경·중복 생성 0건, Relation 무결성 PASS
- 상세 상태와 남은 후보는 `master-workmap.yaml`의 `e2e03_operational_standard`가 기준이다.

진행 순서:

1. WS1-01 — CI4~CI6 결과를 E2E-03 Process–DB 실행표준 초안으로 통합
2. WS2-01 — Channel-neutral Natural Language Contract 핵심 구조 정의
3. WS3-01 — 기존 폴더 Property 적합성 검토 시작
4. WS2 Task별 Contract와 WS3 파일·증빙 Mapping 연결
5. Slack 인터페이스 초안
6. WS4-01 — Multi-interface Agent Architecture
7. 실제 사례 Pilot

WS2와 WS3는 완전 병렬이 아니다. WS1 통합 후 WS2 핵심 구조가 시작되면 WS3 검토를 시차 병렬로 진행한다.

Claude·Codex·Slack을 판단·실행·입력 역할로 영구 고정하지 않는다. 각 인터페이스는 연결된 모델·도구·권한 범위에서 동일한 Process Contract를 사용한다.

다음 작업은 `WS1-01 (E2E-03 실행표준 통합)`이며 Owner는 Claude다.

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
