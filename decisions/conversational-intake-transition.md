# Conversational Intake Transition Decision

## 결정

`DEC-CP05-CI-01` — 2026-07-24 사용자·정상준 결정

Primary Intake를 Notion Form에서 자연어 대화형 입력으로 전환한다.

기존 경로:

```text
1차 Form → 조합 Record → 2차 Form → 업무요청 → Task
```

변경 경로:

```text
Slack·Claude Code Skill·GPT·Codex
→ 자연어 해석
→ 누락정보 질문
→ 사용자 확인
→ Notion 지원팀 업무요청 생성
→ 표준 Task 생성
→ 상태·담당자·Evidence 관리
```

## 변경 이유

- Form 구조는 읽을 수 있지만 질문 편집의 저장 효과가 확인되지 않았다.
- Codex가 사용할 수 있는 실제 Form Submit 인터페이스가 확인되지 않았다.
- Form 완성에는 반복적인 사용자 UI 설정이 필요하다.
- DB CRUD, Request→Task Relation, 상태 전이와 운영 필드 저장은 이미 검증됐다.
- 대화형 Interface는 누락정보 확인과 향후 승인 기반 Agent 실행에 더 직접적으로 연결된다.

## 재사용 자산

- `지원팀 업무요청` DB와 `지원팀 Task` DB
- Request→Task Relation 및 관련 조합 Rollup 계약
- Request·Task 상태 모델
- Current Actor, Next Action, Blocker, Evidence
- P3 Process→Notion Mapping
- FT-03 Relation 검증 및 FT-04 DB E2E 결과

## 보존 및 폐기하지 않는 것

기존 Form, Form 보고서, TEST 결과와 당시 PASS/PARTIAL 판정은 Historical Evidence로 보존한다. Form은 삭제하지 않고 Optional Fallback으로 유지한다.

## Source of Truth

| 영역 | Source of Truth |
|---|---|
| 입력 규격 | `contracts/conversational-intake-contract.yaml` |
| 실행 계획 | `plans/conversational-intake-roadmap.md` |
| 현재 계획 상태 | `orchestration/plan/master-workmap.yaml` |
| 실제 운영 Record | Notion `지원팀 업무요청`·`지원팀 Task` DB |

## 역할 경계

- GPT: Canonical Workmap, Intake Contract 승인, Gate와 우선순위
- Codex: Repository·Notion CRUD Builder, Parser·Skill·Task 생성 로직과 E2E
- Claude Code Skill: 자연어 추출, 누락질문, Preview, 사용자 확인, 기록 호출 Interface
- Slack: CI-06 이후 목표 운영 Interface이며 현재 필수 Dependency가 아님
- 사용자·정상준: Process Owner, Human Approval, Pilot와 예외 판단
- Notion AI: 2026-07-29 이전 사용자 명시 요청 시에만 가능한 `OPTIONAL_TEMPORARY_TOOL`

## 제한

본 결정은 실제 Notion 변경, Slack 연동 또는 Claude Code Skill 구현을 승인하지 않는다. 해당 변경은 별도 Work Order와 승인 범위가 필요하다.
