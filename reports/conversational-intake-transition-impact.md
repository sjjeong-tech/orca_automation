# Conversational Intake Transition Impact

## Executive Summary

2026-07-24 기준 Repository 198개 파일을 대상으로 지정 키워드를 검색했고 134개 파일에서 일치 항목을 확인했다. 다수는 Process 원본, Source 또는 과거 실행 증적이므로 변경하지 않는다. Canonical Current State, Governance, 향후 Roadmap만 대화형 Intake 기준으로 전환한다.

## 분류 결과

| 파일/범위 | 기존 전제 | 분류 | 처리 | 변경 이유 |
|---|---|---|---|---|
| `orchestration/plan/master-workmap.yaml` | FT-01~05와 Form UI가 Fast Track 중심 | A Canonical | 수정 | CI-01~07과 비차단 전환 반영 |
| `orchestration/plan/dependency-map.yaml` | Form 단계가 FT 흐름을 구성 | A Canonical | 수정 | 대화형 Dependency DAG로 교체 |
| `orchestration/plan/roadmap.md` | Form R&R 중심 | A Canonical | 수정 | Conversational Intake 흐름 설명 |
| `orchestration/generated/*.md` | Form UI 후속작업 노출 | A Canonical-derived | 재생성 | CI-01·02 READY 표시 |
| `tasks/tap-queue.md` | Form Fast Track 후속 중심 | A Human summary | 최소 수정 | 방향과 다음 READY 정렬 |
| `README.md` | 1차·2차 Form이 목표 흐름의 필수 단계 | A Current guide | 수정 | Primary·Canonical·Fallback 구분 |
| `orchestration/governance/agent-policy.yaml` | Form Capability 중심 역할 | B Governance | 수정 | Parser·Skill·Slack·Human Gate 역할 추가 |
| `orchestration/governance/execution-policy.yaml` | CODEX→USER Form escalation | B Governance | 수정 | Conversational 실행 및 Write 정지조건 추가 |
| `reports/fast-track-form-e2e.md` | Form Pilot 판정 | C Historical | Supersession Note만 추가 | DB E2E 결과 재사용, 당시 판정 보존 |
| `reports/codex-form-capability-probe.md` | Form Capability 판정 | C Historical | Supersession Note만 추가 | 전환 근거 연결, 원 결과 보존 |
| `orchestration/runs/**`, 기존 `handoffs/**` | 당시 실행·이관 기록 | C Historical | 원문 보존 | 감사 추적 유지 |
| `mappings/form1-form2-interface-map.md` | Form 1·2 Interface Contract | D Future design | 보존, P4에서 재분류 | P3 승인자료이므로 의미 임의 변경 금지 |
| `plans/notion-control-plane-roadmap.md` | Form 중심 P4 명칭 | D Future design | 현재 Canonical 링크로 보완 | 상세 과거 Roadmap 보존 |
| `operating-model/**` | Intake Form Deliverable 포함 | D Future design | 이번 TAP 직접 수정 최소화 | 후속 CI-01/P4에서 Contract 승인 후 정렬 |
| `processes/**`, `variations/**`, `sources/**` | Form·Slack 단어가 일부 존재 | C Evidence/Rules | 변경 없음 | 원본 의미와 근거 보존 |

## 검색 범위

- 전체 파일: 198
- 키워드 일치 파일: 134
- 직접 수정 대상: Canonical/Governance/Generated/README/Queue와 대표 Historical Report
- 보존 대상: Process 12개, Variation 4개, Source 원본 전체, 기존 Run Capsule·P3 Mapping·기존 Handoff

일치 파일은 다음 그룹에 분포했다.

- `orchestration/**`: plan, governance, approvals, handoffs, runs, templates
- `reports/**`: FT, P2/P3, QA와 gap 보고서
- `mappings/**`, `notion/**`, `operating-model/**`, `plans/**`
- `processes/**`, `variations/**`, `sources/**`
- `README.md`, `tasks/**`, `decisions/**`, `conflicts/**`

## 충돌과 처리

1. Workmap Schema의 계획 상태는 `VERIFIED`와 `DEFERRED_OPTIONAL`을 허용하지 않는다.
   - 계획 상태는 `APPROVED` 또는 `SUPERSEDED`를 사용한다.
   - 세부 결과는 `execution_status`, `reusable_results`, `workstream_mode`에 기록한다.
2. AG-P3는 P3 Formal Approval로 유지한다.
   - CI-01·CI-02 탐색·Prototype을 차단하지 않는다.
   - 실제 Agent Write나 운영 적용 승인을 대체하지 않는다.
3. N-06은 Form Dependency가 아니다.
   - Task의 관련 조합 Rollup DB Validation으로 유지한다.

## 변경 후 Source of Truth

- Decision: `decisions/conversational-intake-transition.md`
- Intake Contract: `contracts/conversational-intake-contract.yaml`
- Roadmap: `plans/conversational-intake-roadmap.md`
- Canonical plan: `orchestration/plan/master-workmap.yaml`
- 운영 Record: Notion `지원팀 업무요청`·`지원팀 Task`

## 후속 영향

- CP-05-CI1-LR은 CI-01 Contract 확정과 CI-02 DB 계약 검증부터 시작한다.
- CI-03 전 Parser 구현 범위를 확정하고, CI-04 전 별도 Notion Write Work Order가 필요하다.
- Slack과 Claude Code Skill은 이번 TAP에서 구현하지 않는다.
