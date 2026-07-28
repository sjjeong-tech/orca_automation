# E2E-03 Current Checkpoint (Claude 세션 인계)

> 대화 전체를 복제하지 않는다. 다음 세션이 재개하는 데 필요한 최소 상태만 남긴다.
> 이 파일이 최신인지 항상 Git으로 재확인한다. 대화 요약은 상태의 근거가 아니다.

## 1. Identity

| 항목 | 값 |
|---|---|
| Project | `vc-support_team-process-rag` |
| Work Item | WS1-01 / WS2-01 / WS3-01 계열 (E2E-03) |
| Process | E2E-03 고유번호증 신청·수령 / `P03-T01`~`P03-T06` |
| Active Branch | `agent/claude/e2e03-natural-language-contract` |
| Main Head | `f25161c` |
| Branch Head | `ffebdaa` |
| Last Completed Commit | A-CP22 보안 수정(아래 11절) |
| Current Gate | P0 수정 완료 → Codex 재검증 대기 |
| Current Mode | **preview_only / 운영 Write 0** |

## 2. 완료된 단계 (Commit·판정만)

| 단계 | Commit | 판정 |
|---|---|---|
| Logical SOP (Task별 20필드) | `47c08e7` | PASS_E2E03_LOGICAL_SOP |
| Notion Physical Prototype (Request 1·Task 6) | `ca86236` | PASS_WITH_ROLLUP_TOOL_LIMITATION |
| Live 상태 전이·View 2개·6-Task Mapping 정합화 | `904f8e2`, `7afea73` | PASS_WITH_VIEW_UI_CONFIRMATION_GAP |
| Evidence Shadow (실제 외근 Evidence 기반) | `3f815cf` | PASS_WITH_HUMAN_CONFIRMATION_GAPS |
| Skill·Plugin Prototype | `efa2c2c` | PASS_REUSABLE_E2E03_SKILL |
| Layer 1 Alignment / Evidence Taxonomy / Document Profiles / Provider·Kernel / Real MCP Read | `ffebdaa` | PASS_A_CP20_RECOVERY 외 8종 |

## 3. Notion Physical 구조 (실제 UUID·URL 미기록)

```
전체관리조합 (FUND 마스터, 1,231행)
   ▲ 조합명 또는 제목  ← 단방향, 역Relation 없음
TO DO LIST (FUND)  (업무건 트래커, 운영 DB)
   ▲ 관련 조합
[TEST]지원팀 업무요청 (Request)
   ▲ 상위 요청 (6) / ▼ 관련 Task (6)
[TEST]지원팀 Task
```

- FUND 마스터에 `조합 Root 폴더`(URL) Property 1개가 승인 후 신설됨 — 값이 채워진 조합은 현재 1건
- Task `관련 조합`은 Rollup이며 **API에서 `<omitted />`** — Relation 체인으로 대체 확인
- 운영 Record(전체관리조합·TO DO LIST·기존 Request 8건) **변경 기본 금지**
- TEST Instance: `[TEST][E2E03-PROTOTYPE]` Request 1 + Task 6, `[TEST][E2E03-EVIDENCE-SHADOW]` Request 1 + Task 6(전 Task `HUMAN_CONFIRMATION_REQUIRED`, 완료 0)

## 4. Evidence 구조

- 4계층: Fund Root / Canonical Source(`1.결성 > 1.고유번호증 신청`) / Request Source(외근 **날짜별** 폴더) / Shared Functional(공통 보안카드 폴더)
- Type: `SUBMISSION_PACKAGE` `RECEIPT` `RESULT_DOCUMENT` `SUPPLEMENT` `SECURITY_CARD` `BANKBOOK_COPY`
- 접두어 의미: **무접두 = 기관 수령 결과물(최고 신뢰도)**, `##합본_`·`#`는 신뢰도 중간, `(x)`는 폐기
- 무효 규칙 8종(`.lnk`·0byte·중복 버전·후속 한정어·중간 산출물·이중 확장자·아카이빙 미완·마스터 대장)
- **핵심 실증: 실제 Evidence만으로 자동 완료 가능한 Task는 6개 중 0개**

## 5. Skill·Plugin 구조

| 구성 | 경로 |
|---|---|
| Skill | `skills/e2e03-tax-id-application/` (SKILL.md, contract.yaml, canonical-reference.yaml, evidence-taxonomy.yaml, document_profiles/ 6종, tests/) |
| Plugin | `plugins/vc-support-admin/` |
| Entry Point | `plugins/vc-support-admin/index.mjs` → `processRequest()` |
| Kernel | `plugins/vc-support-admin/kernel/` (evidence·state·guards·filename·sanitize) |
| Providers | `plugins/vc-support-admin/providers/` (base·notion·drive·slack, 13-operation 공통 Interface) |
| Tests | `tests/harness.test.mjs`, `tests/provider.test.mjs`, `tests/live.test.mjs` |

**Runtime Boundary**: Node는 MCP를 직접 호출할 수 없다. Provider는 호출 Payload 생성·응답 정규화·마스킹만 담당하고, 실제 MCP 호출은 Claude 세션이 수행해 응답을 주입한다. 이 경계를 "실 Provider 연결 완료"로 과장하지 않는다.

## 6. 보안 상태

| 항목 | 값 |
|---|---|
| `write_mode` | `preview_only` |
| `operating_write_enabled` | `false` (코드에서 강제) |
| `slack.send_enabled` | `false` (config가 true여도 강제 차단) |
| Drive | read-only, 광역검색 off |
| `test_write` 승격 | **금지 — 사용자 승인 필요** |
| 하드코딩 ID(비테스트 산출물) | 0 |
| 이전 Codex P0 | **4건 + 신규 2건(P0-05·P0-06)** — 재감사 `4c0cf88`, 보고서 `reports/codex/e2e03-security-reaudit.md` |
| 현재 Codex 재감사 | `ffebdaa` 대상 완료 — 판정 FAIL(2/10). A-CP22에서 수정 |
| 규칙 | **P0 PASS 전 어떤 Write도 하지 않는다** |

## 7. Canonical Conflict (C1~C7, 전부 미해소)

| ID | 요약 | 심각도 |
|---|---|---|
| C1 | Layer1 '초안·인터뷰 반영' ↔ repo `processes/03` 16행 전건 CONFIRMED | HIGH |
| C2 | Layer 2 "검증 전 자동화·Agent 설계 보류" ↔ repo에 Preview-only Skill·Plugin 존재 | HIGH |
| C3 | Layer1 현행 ID `세무서_고유번호증_NN` ↔ repo가 `세무서_1`을 현행으로 선언 | MEDIUM |
| C4 | Layer1 Actor는 담당매니저·관리역 ↔ repo는 전 단계 '지원팀' | MEDIUM |
| C5 | Layer1 접수 구간 자체 완료조건 ↔ repo `receipt_is_not_process_completion=true` | LOW |
| C6 | Layer1 "보안카드 항상 연계 아님" ↔ repo IF-03-04 미반영 | LOW |
| C7 | Layer1 내부 불일치(§2 규범 `은행_2_NN` vs 실제 `은행_계좌보완_NN`) | LOW |

## 8. C2 거버넌스 정리 — `PROPOSED_GOVERNANCE_INTERPRETATION`

**아직 승인되지 않았다. Notion Layer 2 원문은 수정하지 않았다.**

Layer 2의 "자동화 보류"를 다음 4가지 금지로 해석할 것을 제안한다.

- 운영 자동화
- 운영 Record Write
- Evidence 기반 자동 완료
- 실제 Interface 발송

다음은 운영 자동화로 보지 않을 것을 제안한다.

- Git 기반 Process 설계
- Skill·Plugin Prototype
- Read-only 조회
- Preview 생성
- TEST DB·Shadow 검증
- Fixture·Provider Test

### 현재 실제 상태

| 허용되어 수행됨 | 금지되어 수행되지 않음 |
|---|---|
| Design, Prototype, Read, Preview, TEST Shadow 검증 이력 | 운영 자동화, 운영 Write, 실제 Slack Send, Evidence 자동 완료 |

### 선택안

| Option | 내용 | 장점 | 단점 | 평가 |
|---|---|---|---|---|
| **G1** 현 상태 유지 | Layer 2 원문 미수정, Skill은 실험용 Preview-only 유지 | 변경 0, 안전 | 문서와 Repository 상태가 계속 모호 | 가능 |
| **G2** 최소 명확화 *(권장)* | Layer 2에 "업무 검증 전 운영 자동화·운영 Write는 보류하되 Read-only 분석·Preview·TEST Shadow Prototype은 허용" 취지를 최소 추가 | 실제 상태와 정합, 운영 자동화와 Prototype 구분 | Notion Canonical 변경 승인 필요 | **권장** |
| **G3** 운영 승인체계 신설 | Prototype·TEST·운영을 명시적 단계화 | 장기적으로 명확 | 현 규모에 과설계 | 비권장 |

## 9. 다음 실행 순서

1. Codex가 `ffebdaa` 보안 재감사
2. P0 결과 판정
3. 필요 시 Claude 보안 수정
4. Codex 재검증
5. `test_write` 승격 여부 **사용자 승인**
6. Preview-only 상태로 실제 업무 활용
7. P04 확장 여부 결정

## 10. Open Gap

1. MCP Runtime 한계 — Node 직접 호출 불가(Provider는 Payload·정규화 담당)
2. C1~C7 미해소, 특히 C2는 사용자 결정 필요
3. 사람 확인 5종(착수기록·서류 적합성·날인·접수증 본문·관리역 전달)
4. `ACCOUNT_RESULT` Evidence Type 채택 보류(본문 미확인)
5. 순수 스캔 접수증의 이미지 폴백 미구현
6. 보안카드 자격증명 평문 — 본문 미독 정책 확정 필요
7. View A의 status 필터가 API로 설정 불가 → UI 적용 필요
8. Request `관련 조합` 값 혼재(일부가 FUND 마스터 Page 지시)

## 11. A-CP22 보안 수정 (Codex 재감사 4c0cf88 대응)

감사 판정 FAIL(필수 10건 중 2 PASS) → 수정 후 **10/10 + 추가 34건 PASS**.

| 항목 | 수정 |
|---|---|
| P0-1 Typed Approval | `kernel/preview.mjs` — Typed Preview(13필드)·핵심값 결정적 `preview_hash`·Typed Approval(8필드)·11개 검증 조건. 자연어는 승인 후보만 생성 |
| P0-2 TEST-only Guard | `kernel/writeguard.mjs` — TEST Data Source Allowlist **와** TEST Prefix·메타데이터를 **둘 다** 요구. process·action allowlist, 완전한 runtime config, 8개 차단 코드 |
| P0-3 Transaction | `kernel/transaction.mjs` — 순차 실행기, 단계별 PASS 요구, 생성 원장, Partial 승격, Idempotency Store(완료=NO_OP, 부분=사람 복구) |
| P0-4 Fail-closed | `kernel/errors.mjs` + Provider — transport 예외 정규화(10코드), 응답 형태 검증, requery 불일치를 실패로 반환, 자동 Write 재시도 영구 금지 |
| P0-05 실사례 Fixture | live fixture·cases.yaml·e2e03-live.yaml의 실제 조합명·Drive URL 전량 합성 교체. 실사례 노출 **0** |
| P0-06 Idempotency | Transaction Store로 재실행 시 신규 Write 0 |
| P1 Bridge | `providers/bridge.mjs` — Bridge Request/Response 계약, 논리 동작→Connector 도구 매핑, Write Bridge 기본 비활성, Raw 미보관 |

여전히 `preview_only`이며 실제 Write Bridge는 비활성이다. `test_write` 승격은 Codex 재검증과 사용자 승인 이후에만 가능하다.
