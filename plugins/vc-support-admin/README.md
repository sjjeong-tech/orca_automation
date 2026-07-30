# Plugin — VC 지원팀 행정업무 (Prototype)

검증된 E2E-03 고유번호증 신청 업무를 **다른 조합·다른 세션·다른 Interface에서 재사용**할 수 있게 만든 Repository 내부 Prototype이다. 외부 배포·설치 대상이 아니다.

## Quick Start

자연어 요청 1건을 넣으면 업무 결과 1건이 나온다. Intent를 사용자가 입력하지 않는다.

```
node plugins/vc-support-admin/session-runner.mjs --input <input.json> [--results <results.json>] [--out <out.json>]
```

`input.json`

```json
{
  "user_message": "그로스테스트조합 고유번호증 신청 지금 어디까지 진행됐어?",
  "fund_hint": null,
  "folder_hint": null,
  "interface": "agent_session",
  "runtime_config": { "...": "config.example.yaml 참고 — 실제 ID는 Commit하지 않는다" }
}
```

Node는 MCP를 직접 호출하지 못한다. 그래서 Runner는 **필요한 Tool 호출을 먼저 알려주고**, 세션이 실행한 응답을 받아 이어서 계산한다.

```
STATUS=NEEDS_TOOL_RESULTS      ← pending[].key / tool / params 출력
  → 세션이 그 Tool을 호출
  → 응답을 results.json 에 key 그대로 저장
  → 같은 명령 재실행 (보통 2~4회)
STATUS=COMPLETE                ← 사용자 결과 출력
```

Write Tool은 Runner에서 영구 차단된다(`WRITE_BRIDGE_DISABLED`). 코드에서 직접 쓰려면 `runUserRequest()`.

### Scenario A — 조합별 고유번호증 상태 조회

- **사용자 요청**: "○○조합 고유번호증 신청 지금 어디까지 진행됐어?"
- **Plugin 수행**: 조합 확정 → Request·Task 조회(Relation 기준) → Fund Root + `1.결성 > 1.고유번호증 신청` Evidence 조회 → 상태 계산
- **예상 결과**: 현재 판단 / 완료·진행 중·시작 전 단계 / 현재 Actor / 다음 Action / Blocker / 인정·불인정 Evidence / 사람 확인사항 / Notion 기록과 Evidence 판단 차이
- **실제 Write**: 없음

### Scenario B — 외근 산출물 확인

- **사용자 요청**: "7월 28일 외근 폴더에 들어온 고유번호증 산출물 확인해줘."
- **Plugin 수행**: 외근 Root의 날짜 폴더 해소(당월 `MMDD`는 Root 직하, 지난 달은 `YYYY.MM` 아래) → 파일 분류 → 조합 후보·연결 Task 후보 추출
- **예상 결과**: `VERIFIED` / `HUMAN_CONFIRMATION_REQUIRED` / `CANDIDATE` / `INVALID_SHORTCUT` / `ZERO_BYTE` / `DUPLICATE_OR_STALE` / `OUT_OF_SCOPE` 로 분류된 목록. 날짜를 지정하지 않으면 폴더 후보를 제시한다
- **실제 Write**: 없음

### Scenario C — Notion 변경 Preview

- **사용자 요청**: "확인한 결과로 Notion 변경안 만들어줘."
- **Plugin 수행**: Notion 실제값과 Evidence 판단을 대조 → 차이 건에 대해 Typed Preview(`preview_id`·`preview_hash`) 생성
- **예상 결과**: 대상 Task·Property·현재값·제안값·근거 Evidence·신뢰도·사람 확인사항·승인 필요 여부. 차이가 없으면 "사람 확인 후 완료로 바꿀 수 있는 단계"를 대신 보여준다
- **실제 Write**: 없음 (`write_mode=preview_only`, 승인해도 이 모드에서는 반영되지 않는다)

### Scenario D — 매니저 공유문 생성

- **사용자 요청**: "현재 진행상황을 담당 매니저에게 공유할 문구로 만들어줘."
- **Plugin 수행**: 상태 계산 결과를 공유용 문장으로 변환 (조합 / 현재 단계 / 확인된 Evidence / 필요한 확인 / 다음 Action / 요청사항)
- **예상 결과**: 그대로 붙여넣을 수 있는 초안
- **실제 Write**: 없음 — **실제 Slack·메일 발송은 하지 않는다** (`send_enabled=false`)

## 실행 (테스트)

```
node plugins/vc-support-admin/tests/smoke.test.mjs      # 사용자 기능 U1~U4
node plugins/vc-support-admin/tests/harness.test.mjs    # 기존 회귀
node plugins/vc-support-admin/tests/security.test.mjs   # 보안 게이트
```

기존 저장소 Runtime(zero-dependency Node ESM)만 사용한다. 신규 Framework·Package Manager를 도입하지 않는다.

## 구조

| 경로 | 역할 |
|---|---|
| `plugin.yaml` | Manifest — 권한·승인 대상·정책 |
| `skills.yaml` | Skill Registry (현재 E2E-03 1개) |
| `index.mjs` | Entry Point — 사용자 대면 `runUserRequest()` + 기존 `processRequest()` |
| `session-runner.mjs` | MCP 실행 경계 — Tool 호출 산출·응답 주입·CLI (Write Tool 영구 차단) |
| `kernel/intent.mjs` | 자연어 Intent Router · 조합명·날짜 추출 |
| `kernel/format.mjs` | 사용자 친화적 Result Formatter (마스킹 통과 보장) |
| `adapters/notion.yaml` | Logical Field ↔ Property Mapping·권한·검증 |
| `adapters/drive.yaml` | Evidence Source 계층·분류·유효성 규칙 |
| `adapters/slack.yaml` | 메시지 Contract·승인 발화 판정 (발송 비활성) |
| `prompts/` | intake · preview · result |
| `config.example.yaml` | 주입 Config 예시 (실제 ID 없음) |
| `tests/harness.test.mjs` | Unit·Approval·Case·Invariant·Interface·ID Scan·Registry |

Skill 본체는 `skills/e2e03-tax-id-application/`에 있다.

## 재사용 설계

- 실제 Database·Page·Drive ID는 **소스에 없다.** `runtime_config`와 `providers`로 주입한다(테스트가 ID Scan으로 강제).
- 데이터 접근은 전부 `providers.notion` / `providers.drive` 인터페이스를 통한다. 테스트는 fixture, 실제 실행은 MCP 연결 구현을 주입한다.
- Task 상태 계산은 순수 함수라 Interface(CLI·Slack·Agent 세션)와 무관하게 동일하다. 표현만 Adapter가 다르게 만든다.

## 안전 기본값

| 항목 | 기본값 |
|---|---|
| `write_mode` | `preview_only` |
| 운영 Record Write | 불가 |
| Schema·DB·View 생성 | 불가 |
| Drive Write | 불가 |
| Slack 발송 | 불가(Preview만) |
| Evidence 기반 자동 완료 | **불가 (6/6 사람 확인 필요)** |
| 모호한 승인 | Write 0 + 확인 질문 |
| 중복 Instance | 재사용·재개, 신규 생성 0 |

## 알려진 제약

- Task `관련 조합` Rollup은 API에서 관측되지 않는다 → Relation 체인으로 대체 확인
- Notion View DSL 필터가 `status` 타입에서 무시된다 → Agent는 View 필터에 의존하지 않고 직접 조회
- 기존 Request의 `관련 조합` 값에 대상 불일치 사례가 혼재 → 자동 정리하지 않음
- Task는 제목이 아니라 `상위 요청` Relation으로 Request에 붙는다. 제목 검색만 하면 정상 Instance도 0건으로 보인다
- 운영 Instance마다 Task ID 체계가 다르다(`P03-T01` / `OT-P03-01` / `CI1-P03-01`). 말미 순번으로 대응시키고 그 사실을 사용자에게 보고한다 — 자동 정합화하지 않는다
- 발급 결과물이 Canonical Source 폴더가 아니라 Fund Root 최상위에 저장된 사례가 있어 두 계층을 모두 읽는다
- 외근 폴더는 당월 `MMDD`와 월 아카이브 `YYYY.MM`이 같은 계층에 공존한다
- 파일명만으로 판정하므로 본문 사실(조합명·발급일·날인)은 확정하지 않는다

## Canonical 참조

`skills/e2e03-tax-id-application/SKILL.md`, `reports/reviews/claude/e2e03-operational-standard-draft.md`

### TEST LAB 승인·Commit·Requery 계약

`kernel/test-lab-write-requery.mjs`는 주입된 fixture provider에만 순차 Write를 수행한다. `TEST_LAB`, `test_write`, 명시적 approval token, transaction id, data-source allowlist, `EXACT_0` 중복 확인을 모두 통과해야 하며 운영 환경은 fail-closed로 차단된다. 실패 시 후속 생성·자동 재시도는 0이고 생성된 TEST LAB 목록과 수동 복구 안내를 반환한다.

미리보기 CLI: `node plugins/vc-support-admin/cli/test-lab-write-requery.mjs --fixture plugins/vc-support-admin/fixtures/growthbridge-test-lab-transaction.json`

### Read-only Runtime Snapshot Bridge

An approved session may inject a sanitized TEST LAB snapshot without invoking MCP from Node or writing to Notion. The bridge verifies schema, TEST LAB environment, approved data-source allowlist, transaction, 1/1/6 record counts, relations, sanitization, and SHA-256 integrity before returning a read-only replay result.

```text
node plugins/vc-support-admin/cli/test-lab-write-requery.mjs --runtime-snapshot plugins/vc-support-admin/fixtures/growthbridge-runtime-test-lab-snapshot.json --transaction GB-P03-001 --preview
```

Use `--runtime-snapshot -` to read the same JSON from standard input. The bridge never calls Notion, creates records, completes a Request, or enables operating writes.

### Session Snapshot Transport Adapter

An approved Session Tool read may be supplied as a sanitized packet through the same Skill CLI. `kernel/session-snapshot-transport-adapter.mjs` maps only allowlisted record metadata and Task properties into the runtime snapshot contract. It rejects non-TEST-LAB or unknown data sources, unsafe content (including URLs, local paths, personal identifiers, and raw MCP payload fields), count or relation mismatches, and unknown Tasks. It computes the runtime snapshot hash locally; Node never calls MCP directly.

```text
node plugins/vc-support-admin/cli/test-lab-write-requery.mjs --session-snapshot plugins/vc-support-admin/fixtures/growthbridge-session-read-packet.json --transaction GB-P03-001 --preview
```

The output is `SESSION_TOOL_BRIDGE`, `sanitized=true`, and has zero Notion and operating write counts. The current fixture intentionally preserves the P03-T03 wording difference (`NEEDS_WORDING_FIX`); it is not normalized without a separately approved Actual handoff.
