# Skill — E2E-03 고유번호증 신청·수령

## Quick Start

### 언제 호출하는가

사용자가 **고유번호증 신청 업무의 상태·증빙·다음 할 일·Notion 반영안·공유문**을 물을 때. 조합 이름이 없어도 호출한다(대상 확정은 이 Skill이 처리한다).

### 사용자 발화 예시

| 발화 | Intent |
|---|---|
| 그로스테스트조합 고유번호증 신청 지금 어디까지 진행됐어? | `get_fund_process_status` |
| 오늘 외근 폴더에 들어온 고유번호증 산출물 확인해줘. | `inspect_fieldwork_evidence` |
| 확인한 결과로 Notion 변경안 만들어줘. | `build_notion_preview` |
| 이 내용을 담당 매니저에게 공유할 문구로 만들어줘. | `build_manager_update` |

Intent 이름을 사용자에게 묻지 않는다. 발화에서 판정하고, 모호할 때만 확인 질문을 **1회** 한다.

### 반드시 읽을 Canonical

`contract.yaml` → `evidence-taxonomy.yaml` → `canonical-reference.yaml` 순. 아래 "Canonical References" 표의 경로가 Source of Truth이며, 규칙 본문을 재작성하지 않는다.

### 필요한 Connector

| Connector | 용도 | 필수 |
|---|---|---|
| Notion | FUND 마스터·Request·Task 조회 | 필수 |
| Google Drive | 폴더·파일 **메타데이터만** (본문 미열람) | 선택 — 없으면 Notion 기록만으로 판단하고 그 사실을 밝힌다 |
| Slack | 공유문 Preview | 선택 — 발송 불가 |

### 실행 순서

```
node plugins/vc-support-admin/session-runner.mjs --input <input.json> [--results <results.json>]
```

1. Runner가 실행할 Tool 호출 목록(`pending`)을 반환한다
2. 세션이 그 Tool을 실제로 호출한다
3. 응답을 `results.json`에 `pending[].key` 그대로 넣는다
4. 같은 명령을 다시 실행한다 (보통 2~4회면 `STATUS=COMPLETE`)

코드에서 직접 쓰려면 `runUserRequest({ user_message, runtime_config, providers })`.

### 반환 형식

`intent` `resolved_fund` `fund_match` `process_id` `current_status` `task_summary` `evidence_summary` `blockers` `next_actions` `human_confirmations` `notion_preview` `manager_message` `approval_required` `handoff` `reads` `writes` `errors` `display`

`display`는 업무자가 그대로 읽는 한국어 결과문이다. 내부 Provider 응답을 사용자에게 그대로 보여주지 않는다.

### 금지

운영 Record Write · Schema/DB/View 생성 · Drive Write · 실제 Slack·메일 발송 · **Evidence만으로 Task 완료 처리** · 조합 자동 확정(부분일치는 확인 대상) · 자연어만으로 승인 인정

---

## Skill ID

`e2e03-tax-id-application`

## Purpose

자연어 요청을 받아 고유번호증 신청 업무의 **현재 상태·필요 Evidence·다음 Action·Blocker**를 계산하고, 승인된 범위에서만 Notion TEST Record를 기록한다. 특정 조합·Page·Drive 폴더에 고정되지 않으며 입력으로 대상이 결정된다.

## Supported Process

- Process: `P03` (E2E-03 고유번호증 신청·수령)
- Operational Task: `P03-T01` ~ `P03-T06`
- 미지원: P01·P04·P07·P08 (Contract `supported=false`)

## Trigger Phrases

`고유번호증 신청`, `고유번호증 진행상태`, `세무서 고유번호`, `외근 산출물 확인`, `고유번호증 다음 업무`

## Required Inputs

`user_message`

## Optional Inputs

`fund_hint`, `process_hint`, `evidence_context`, `target_date`, `actor_hint`, `approval_context`, `interface`

## Canonical References

Rule 본문을 이 문서에 복제하지 않는다. 아래 경로를 Source of Truth로 참조한다.

| 대상 | 경로 |
|---|---|
| 실행표준·SOP | `reports/reviews/claude/e2e03-operational-standard-draft.md` |
| 실행 Task 정의 | `contracts/process-execution-mapping.yaml` |
| Intake 계약 | `contracts/conversational-intake-contract.yaml` |
| 계층 정의 | `docs/process-execution-layering.md` |
| Process 원문 | `processes/03-unique-number-application.md` |
| Notion Mapping | `mappings/process-to-notion-map.md` (P03 현행 Mapping 절) |

## Source of Truth

- 실행 상태: Notion Task Property (Request에 중복 저장하지 않음)
- Evidence 실물: Google Drive
- Rule: 위 Canonical 경로
- 대화 요약은 상태 근거가 아니다

## State Machine

`P03-T01 → T02 → T03 → T04 → T05 → T06`

- 각 Task: `시작 전 → 진행 중 → 완료`
- 예외(서류 누락·날인 오류·세무서 추가요청)는 **동일 Task 내** Actor·Blocker 변경으로 처리하고 신규 Task를 만들지 않는다
- Request는 전 Task 완료 후에만 `완료`. **접수 완료(T04) ≠ 전체 완료**

## Evidence Rules

Evidence Type: `SUBMISSION_PACKAGE` `RECEIPT` `RESULT_DOCUMENT` `SUPPLEMENT` `SECURITY_CARD` `BANKBOOK_COPY`

Validity: `VERIFIED` `CANDIDATE` `UNVERIFIED_SHORTCUT` `ZERO_BYTE` `STALE_OR_DUPLICATE` `MISSING` `ACCESS_BLOCKED`

- `.lnk` → `UNVERIFIED_SHORTCUT`, Evidence 불인정
- 0byte → `ZERO_BYTE`, Evidence 불인정
- **Evidence 존재만으로 어떤 Task도 자동 완료하지 않는다** (A-CP18 실증: 6/6 사람 확인 필요)
- 파일이 여러 위치에 중복 존재해도 오류로 보지 않는다
- 탐색은 확정 Root·parentId 우선, 광역 검색은 fallback

## Human Confirmation Rules

| Task | 사람이 확인해야 완료 가능한 사실 |
|---|---|
| T01 | 착수조건 확인 기록(Evidence로 대체 불가) |
| T02 | 서류 적합성·누락·최신본 |
| T03 | **날인 실물** |
| T04 | 접수증 본문의 조합명·접수일 |
| T05 | 발급본 최신성·정정본 여부·실물 수령 |
| T06 | 저장과 **관리역 전달이 모두** 확인 |

## Approval Gates

승인으로 인정하려면 **대상 Request·대상 Task·변경 Action·변경 값**이 모두 식별돼야 한다.
다음만으로는 Write 금지: `네` `진행해주세요` `그렇게 해주세요` `확인했습니다`

## Allowed Reads

Notion FUND 마스터·FUND 업무 Record·Request·Task, Drive 폴더·파일 메타데이터

## Allowed Writes

TEST Prefix Record의 생성·수정만. 기본 `write_mode = preview_only`

## Forbidden Writes

운영 Record 수정, Schema·Property·Database·View 생성, Drive 파일 변경, 실제 Slack·메일 발송, Credential 저장

## Duplicate Prevention

Duplicate Key = `fund_key | process_id | request_type | record_prefix`
동일 Key의 Instance가 있으면 **재사용(재개)** 하고 신규 생성 0.

## Retry·Resume

- 재개 식별: Record 제목 Prefix + 상위 Relation (별도 Transaction ID Property 불필요)
- 부분 생성 시 후속 생성 중단, 생성분 보고, 임의 삭제·재생성 금지

## Error Handling

`FUND_NOT_FOUND` `FUND_MULTIPLE` `MISSING_REQUIRED_INPUT` `APPROVAL_AMBIGUOUS` `EVIDENCE_ACCESS_BLOCKED` `PARTIAL_WRITE` `EXPECTED_ACTUAL_MISMATCH` — 전부 Write 0으로 처리하고 사유를 반환한다.

## Completion Conditions

Skill 실행이 성공했다는 것은 **상태 계산과 Preview가 생성됐다**는 뜻이며, 업무 완료를 의미하지 않는다. 업무 완료는 사람 확인 후에만 판정한다.

## Output Contract

`resolved_fund` `fund_match_result` `process_id` `existing_request` `task_states` `evidence_summary` `missing_information` `human_confirmation` `blockers` `preview` `approval_required` `allowed_changes` `committed_changes` `verification` `manager_share_preview` `next_action` `handoff` `errors`

## Handoff

다음 Owner·미확인 항목·필요한 사람 확인·재개 Key를 반환한다.

## Test Cases

`tests/cases.yaml`, 기대값 `tests/expected.yaml`, 실행 `plugins/vc-support-admin/tests/harness.test.mjs`
