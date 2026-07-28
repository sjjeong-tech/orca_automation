# E2E-03 고유번호증 신청·수령 — Process–DB 실행표준 초안 (WS1-01)

## 0. 개요와 경로 고지

- Base main HEAD: `0c93052c2ac5c87d290095f19db1a65a7f402a82`("Update E2E-03 workmap after human DB alpha")
- 사전조건 확인: 업무지도 `e2e03_operational_standard.status = OPERATIONAL_STANDARD_DRAFT`, `next_work = WS1-01`, Owner `CLAUDE` 확인 완료
- **경로 고지**: 이번 TAP 지시문은 신규 파일 후보로 `process/e2e-03/operational-standard-draft.md`를 제시했으나, Codex가 이미 Canonical Workmap에 등록한 실제 Work Item `WS1-01`의 `allowed_paths`는 `["reports/**", "orchestration/runs/claude/**", "orchestration/handoffs/**"]`뿐이며 그 외 모든 경로(`process/**` 포함)는 화이트리스트에 없다. TAP 자체가 "Codex가 갱신한 업무 지도"를 근거 우선순위 9번으로 지정했고, "기존 구조가 다른 경우 그 구조를 따른다"고 명시했으므로, **제안된 경로 대신 `WS1-01`이 실제로 허용한 `reports/reviews/claude/**` 하위에 이 파일을 생성한다.** 이는 편의상 변경이 아니라 Codex 자신이 등록한 Scope 제약을 우선한 것이다.
- 목적: 새 문서를 늘리는 것이 아니라 CI4·CI5·CI6에서 검증된 사실을 하나의 일관된 실행표준으로 통합하는 것. 새 Process Rule은 만들지 않는다.

## 1. 실행표준 핵심 질문 14개

| # | 질문 | 답 | 근거 |
|---|---|---|---|
| 1 | E2E-03은 언제 시작·완료되는가 | 시작: 담당 관리역이 GP 날인본을 지원팀에 전달하는 시점(Atomic Step 01). 완료: P03-T06(스캔·저장·관리역 전달)이 완료되고 Request 상태가 `완료`로 전환되는 시점 | E2E-03 원문, CI5 S17 |
| 2 | Request는 무엇을 대표하는가 | 하나의 조합(FUND) × 하나의 요청 업무(고유번호증 신청)에 대한 Process Execution Instance의 상위 요청. 관련 조합 정확히 1건, 관련 Task 정확히 6건 | CI2 layering, CI4/CI5/CI6 전 사례 공통 |
| 3 | Task 6건은 각각 무엇을 대표하는가 | P03-T01~T06, 아래 4절 표 참고 | `contracts/process-execution-mapping.yaml`(CI2) |
| 4 | 각 단계에서 어떤 상태를 표현해야 하는가 | Task 상태(시작 전/진행 중/완료) + Request 서류 상태 + Request 요청 상태(시작 전/진행 중/완료) | Notion 실측 Schema(CI2·CI4·CI5) |
| 5 | 현재 Actor는 누구인가 | Task `현재 Actor`(운영팀/지원팀/관리역 확인/외부기관/GP)로 매 단계 명시 | CI5 실측(외부기관→지원팀 전환 등) |
| 6 | 다음 Action은 무엇인가 | Task `다음 Action` 텍스트로 매 단계 명시 | CI4/CI5/CI6 전 사례 |
| 7 | 무엇이 진행을 막는가 | Task `Blocker` 텍스트(원인·해결조건 구조화) | CI5 S4, S8, S11 |
| 8 | 완료조건·증빙 | Task `완료조건`(Yes/No 관찰 가능 문장) + `완료증빙`(구체 텍스트) | CI4/CI5/CI6 전 사례에서 Task별 완료증빙 확인 |
| 9 | 같은 Task에서 보완하는 경우 | 날인 오류(P03-T03), 서류 누락(P03-T02), 세무서 현장 추가요청(P03-T04) — Actor·Blocker만 바뀌고 신규 Task 생성 없음 | CI5 S4~S5, S8~S9, S11~S12; CI6 CASE 결과 |
| 10 | 이전 Task로 복귀하는 경우 | **검증된 사례 없음** — CI4·CI5·CI6 전 시나리오에서 Task 간 역행(예: T04에서 T02로 복귀)은 발생하지 않았다. Root E2E-03 Mermaid에는 `관리역 확인` 이후 `B(날인·기입 검수)`로 되돌아가는 분기가 존재하나, 이는 T01/T02 내부의 재검수 루프이지 이후 Task(T03~T06)에서 앞선 Task로 역행하는 사례는 아니다. **[확인 필요]**로 유지 | E2E-03 Mermaid(CI2에서 확인), CI4~CI6 실측에는 역행 사례 없음 |
| 11 | Request 전체 상태는 언제 변경되는가 | `시작 전`(생성 직후)→`진행 중`(T01 착수 시)→`완료`(T06 완료 확인 후에만) | CI5 S1, S17 |
| 12 | 사용자 대화와 DB 상태 연결 | CI5 `01-conversation-script.md`의 대화턴↔Property 변화 대응표가 검증된 연결 패턴 | CI5 |
| 13 | 검증 완료 vs 후보 구분 | 9절 표 참고 | 전체 |
| 14 | Claude·Codex·Slack 공통 Contract | 8절 Multi-interface Contract | Workmap WS2-01 정의 재사용 |

## 2. Request 실행표준

- Process Execution Instance의 상위 요청이며 관련 조합 정확히 1건, 관련 Task 정확히 6건을 가진다.
- 전체 E2E 상태(시작 전/진행 중/완료)만 표현하고, 활성 Task의 세부 실행정보(Actor·Blocker·다음 Action)는 **중복 저장하지 않는다** — Request DB Schema 실측 결과 이 세 Property가 존재하지 않음을 CI2·CI4에서 이미 구조적으로 확인했다.
- 서류 상태(미전달/일부 전달/전달 완료/보완 필요)는 Request 수준 정보로 유지한다(조합 단위 서류 전체의 진행 상황이지 개별 Task 실행 상태가 아니므로).
- **[확인 필요]**: `일부 전달`과 `보완 필요`가 동시에 참인 상태는 Select 하나로 표현 못한다. CI5에서 검증된 우회 방법(Task Blocker에 수령 범위 병기)을 표준 관행으로 채택할지는 WS2에서 Contract 문서에 명문화할 후보로 남긴다.

## 3. Task 실행표준 — Source of Truth

Task가 실행 상태의 유일한 Source of Truth다(Request에 동일 정보를 중복 저장하지 않는다 — CI4/CI5/CI6 전체에서 일관되게 확인).

| Property | 역할 |
|---|---|
| Task 상태 | 시작 전/진행 중/완료(3옵션. `취소`는 CI4-G01/CI2에서 이미 확인된 미적용 Schema Candidate, 이번 검증 범위에 영향 없음) |
| 현재 Actor | 운영팀/지원팀/관리역 확인/외부기관/GP |
| 다음 Action | 자유 텍스트, 다음 단계 또는 복귀 지시 |
| Blocker | 자유 텍스트, 원인·해결조건 구조화 |
| 완료조건 | Yes/No 관찰 가능 문장 |
| 완료증빙 | 구체적 확인 텍스트 |

## 4. P03-T01~T06 상태 전이 표준

| Task | 시작조건 | 진행 중 상태 예시 | 완료조건 | 완료증빙 예시 | 다음 단계 | 예외 | DB 반영 예시(CI5 검증) |
|---|---|---|---|---|---|---|---|
| P03-T01 요청정보·착수조건 확인 | Request 생성·승인 Commit 완료 | Actor=지원팀 | 필수 요청정보·착수 가능 여부 확인 | "조합 폴더·기본정보 확인 완료" | T02 자동 활성화 | 없음(검증 범위 내 예외 미발생) | CI5 S1~S2 |
| P03-T02 제출서류 수령·누락 검수 | T01 완료 | Actor=지원팀→(누락 시)관리역 확인→지원팀; Blocker=누락서류 목록 | 수령 서류·누락 항목 확인 | "보완 수령분 포함 전체 서류 재검수 완료" | T03 자동 활성화 | 서류 누락·보완(동일 Task 내 처리) | CI5 S3~S6 |
| P03-T03 신청서류 작성·날인본 확인 | T02 완료 | Actor=GP(날인 대기/오류)→지원팀 | 신청서류 작성·날인 검수 완료 | "재날인본 검수 완료, 제출 가능 판정" | T04 자동 활성화 | 날인 오류·재요청(동일 Task 내 처리) | CI5 S7~S10 |
| P03-T04 세무서 제출 준비·접수 | T03 완료 | Actor=지원팀→(추가요청 시)관리역 확인→지원팀 | 접수증 수령 확인 | "접수증 스캔본 확인" | T05 자동 활성화. **접수 완료 ≠ 전체 Process 완료** | 세무서 현장 추가요청(동일 Task 내 처리) | CI5 S11~S13 |
| P03-T05 결과물 수령 | T04 완료 | Actor=외부기관(대기)→지원팀(통지 후) | 고유번호증 결과물 수령 | "고유번호증 실물 수령 확인" | T06 자동 활성화 | 없음(검증 범위 내 예외 미발생) | CI5 S13~S15 |
| P03-T06 스캔·저장·관리역 전달 | T05 완료 | Actor=지원팀 | 결과물 전달 완료 | "스캔본 저장 경로 확인, 관리역 전달 확인" | 전 Task 완료 확인 후 Request `완료` 전환 | 없음 | CI5 S16~S17 |

## 5. 예외 Routing

검증된 후보(Codex 업무지도 `remaining_candidates`와 CI5/CI6 결과 대조):

| 예외 유형 | Routing 대상 | 근거 | 판정 |
|---|---|---|---|
| 근거자료·증빙서류 추가 | P03-T02 | CI5 S3~S6(누락서류 보완), CI6 CASE 결과 | 검증됨 |
| 신청서 기재·날인 수정 | P03-T03 | CI5 S7~S10(날인 오류·재요청) | 검증됨 |
| 접수 방식·제출 형식 보완 | P03-T04 | CI5 S11~S12(세무서 현장 추가요청) | 검증됨 |
| 분류 불명확 | 사람 판단 | Root E2E-03에 명시적 분류 기준 없음 | **[확인 필요]** — 이 TAP에서 새 Rule로 확정하지 않음 |

**Root Canonical 충돌 검토**: E2E-03 원문 Mermaid는 검수 오류를 "지원팀 자체 보완", "관리역 확인", "GP 재요청" 3갈래로 구분한다(CI2에서 확인). 위 Routing(T02/T03/T04)은 이 3갈래 구분을 각 Operational Task 내부의 Actor 전환으로 흡수한 것이며, Root와 정면 충돌하지 않는다. 다만 Root는 "분류 불명확" 시 처리 기준을 명시하지 않으므로 이 항목만 `[확인 필요]`로 유지한다. **모든 예외 처리에서 신규 Task는 생성되지 않았다**(CI4·CI5·CI6 실측 공통 확인).

## 6. FUND 식별 표준

| 상황 | 규칙 | 검증 상태 |
|---|---|---|
| 1건 정확 일치 | 진행 | 검증됨(CI2/CI4/CI5/CI6 공통) |
| 0건 | Write 0, 확인 질문 | 검증됨(CI2 recheck에서 코드 레벨 확정, `BLOCK_AND_ASK`) |
| 복수건 | 사용자 선택 전 Write 0 | 검증됨(CI2 recheck) |
| 유사 후보 검색 | 사용자 확인 필요 | **[확인 필요]** — Codex 업무지도가 "유사 FUND명 후보 검색은 개선 필요"로 명시한 항목, 이번 TAP에서 해결하지 않음 |
| CASE-01 FUND 예외 | 일반 Rule로 확장하지 않음 | CI6 결과에 따라 단일 사례로 격리 유지 |

## 7. 승인 규칙

- Preview 전 Notion Write 0 — 검증됨(CI2/CI4/CI5/CI6 전 사례)
- 명시적 승인 후에만 Commit — 검증됨
- Commit 후 즉시 재조회 — CI5에서 매 Snapshot마다 실시간 재조회로 확인, CI6에서 Expected–Actual 불일치 0건으로 확인
- Expected–Actual 불일치 시 후속 중단 — CI2 Partial Failure 처리(Rollback/Incomplete 표시) 로직으로 검증됨
- 재실행 시 중복 0 — CI2 Idempotency(`transaction_id` 기반) 검증됨, CI6 중복 생성 0건으로 재확인

## 8. Multi-interface Contract

Claude·Codex·Slack을 판단·실행·입력 역할로 영구 고정하지 않는다. 각 인터페이스는 연결된 모델·도구·권한 범위 내에서 아래 공통 Process Contract를 사용해 전체 또는 일부 업무를 수행할 수 있다(Workmap `WS2-01.multi_interface_principle`과 동일 원칙 재사용, 신규 결정 아님).

| Contract | 정의 |
|---|---|
| Input Contract | 자연어 요청에서 `related_fund, request_type, requester, fund_manager, document_status`(필수) + `target_date, urgent, original_folder, notes`(선택)를 추출한다(CI2 Contract 재사용) |
| State Contract | Request(시작 전/진행 중/완료) + Task(시작 전/진행 중/완료) + Actor + Blocker + 다음 Action의 조합만으로 실행 상태를 표현한다(3~6절) |
| Preview Contract | PREPARE→PREVIEW 단계에서 Planned Write, FUND/Person 해소 상태, 중복 후보를 표시하고 Actual Write=0을 보장한다 |
| Approval Contract | 명시적 승인 토큰(`승인`/`생성`/`확인 완료` 등, 인터페이스별 실제 텍스트 판별 로직은 각 인터페이스 구현 담당) 확인 후에만 COMMIT 진입 |
| Commit Contract | FUND 확정(1건)→Request 생성→Relation 검증→Task 생성 순서, 부분 실패 시 로그 재사용해 누락분만 재시도(CI2 Idempotency) |
| Evidence Contract | 완료조건·완료증빙은 Task Property에 기록하고, 실제 파일은 Google Drive에 두고 Git·Notion에는 비민감 경로·메타데이터만 기록(AGENTS.md 공통 원칙 재사용) |
| Error Contract | 필수정보 부족(질문 후 대기), FUND/Person 모호(선택 요구), 중복(경고 후 명시적 승인 요구), 부분 실패(생성분 로그·재시도) — CI2/CI5/CI6에서 검증된 4가지 실패 모드 |
| Handoff Contract | 각 인터페이스는 자신의 Run·Handoff만 기록하고 Canonical Workmap은 GPT만 갱신한다(기존 orchestration 원칙 재사용, 신규 아님) |

이 Contract는 WS2-01(자연어 Contract 상세 설계)의 골격 입력이며, 이번 TAP에서 WS2 상세 설계 자체를 완성하지 않는다(범위 외).

## 9. 검증 완료(Validated) vs 후보(Candidate) 구분

### 검증 완료

- Atomic Step 16/16 Coverage
- Request 1건 + Task 6건 구조
- Task가 실행 상태의 단일 Source of Truth(Request 중복 저장 없음)
- 접수 완료(T04)와 전체 Process 완료(T06 이후) 구분
- P03-T02/T03/T04의 동일 Task 내 예외 복귀(서류 보완, 날인 오류, 세무서 추가요청)
- FUND 0건/복수건 차단, 중복 Request 차단
- Preview-Approval-Commit-Verify 흐름과 부분 실패 재시도
- CI6 CASE-01~08: TEST Request 4건/Task 24건, Expected–Actual 불일치 0, 중복 생성 0, 운영 Record 변경 0, Relation 무결성 PASS

### 후보([확인 필요], 이번 TAP에서 확정하지 않음)

1. 이전 Task로의 역행(T04→T02 등) — 검증 사례 없음
2. `일부 전달`/`보완 필요` 동시 표현(Select 한계, Blocker 텍스트 우회는 검증됨)
3. 예외 분류 불명확 시 처리 기준(현재는 "사람 판단"만 명시, 세부 기준 없음)
4. 유사 FUND명 후보 검색 개선
5. CASE-01 FUND 예외(단일 사례로 격리, 일반화 금지)
6. CASE-03/04 Transaction 혼재(구조적 손상 없음으로 확인됐으나 근본 원인 재검토는 후보)
7. Transaction ID Property 확정 여부(현재 SCHEMA_CANDIDATE, Schema 변경 아님)
8. DB Title의 `[TEST]` 유지 여부(사용자 결정으로 이미 종결 — 후보 아님, 참고용으로만 기재)

## 10. 과설계 점검

- 신규 Property, 신규 Task, 신규 DB, Schema 변경 없음(이번 TAP 범위 밖으로 명시적 제외)
- 신규 파일 1개만 생성(본 파일), 기존 CI2/CI4/CI5/CI6 산출물은 재작성하지 않고 인용만 함
- Contract·Canonical·Notion·조합유형 분기 미실행(TAP 금지 범위 준수)

## 11. WS2·WS3·WS4 입력 요약

- **WS2(Interaction Contract) 입력**: 8절의 8개 Contract 골격, 특히 Input/Approval/Error Contract의 이미 검증된 4가지 실패 모드
- **WS3(Fund Folder & Evidence) 입력**: 6절 FUND 식별 표준(특히 유사 FUND명 후보 검색 후보 항목), 3절 완료증빙 Property가 실제 파일 경로와 어떻게 연결되어야 하는지의 출발점(단, 폴더 Property 자체는 이번 TAP에서 변경하지 않음)
- **WS4(Multi-interface Agent Architecture) 입력**: 8절 전체 Contract가 Claude Skill·Codex Skill·Slack Adapter가 공유할 단일 Process Contract의 초안

## 12. 독립 검토 체크리스트

| 확인 항목 | 결과 |
|---|---|
| Atomic Step 16/16 보존 | PASS |
| Task 6건 보존 | PASS |
| Request·Task 역할 충돌 없음 | PASS |
| 접수 완료와 Process 완료 혼동 없음 | PASS |
| 보완 시 Task 남발 없음 | PASS |
| 사용자 대화와 DB 상태 연결 가능 | PASS |
| WS2 입력으로 사용 가능 | PASS |
| WS3 입력으로 사용 가능 | PASS |
| WS4 입력으로 사용 가능 | PASS |
| 검증값과 후보 구분 | PASS(9절) |
| 과설계 없음 | PASS(10절) |

---

# Gate A 보완 — Evidence 기반 실행 SOP (TAP A-CP15-R1)

## 13. Gate A 개요

- Base main HEAD: `f25161c9abf467beba1d3c7a7648a12131ca6b5a`(PR #4 통합본), 현재 Branch는 main 병합 후 진행
- 목적: 1~12절의 실행표준을 **실제 수행 가능한 SOP 수준**으로 상세화하고 Evidence Source를 연결한다
- 신규 SOP 문서를 만들지 않고 본 문서에 13~18절을 추가한다(TAP "기존 구조 우선 재사용")
- 이 절 작성 시점 Notion Write 0 / Schema 변경 0 / Drive 변경 0
- 판정 등급: `OBSERVED`(직접 확인) / `CONFIRMED_RULE`(Canonical Source 확정) / `INFERRED`(추론) / `CONFIRMATION_REQUIRED`(확인 필요)

## 14. Evidence Source Contract

### 14-1. Source 4계층

| 계층 | 정의 | E2E-03에서의 실체 | 판정 |
|---|---|---|---|
| **Fund Root** | 조합 1건의 장기 기준 폴더 | FUND 마스터 `조합 Root 폴더`(URL)로 지정. 하위에 `1. 결성` / `2. 운영` 및 조합 기준자료(규약·조합원명부·인감·통장사본) | OBSERVED(사례 1건) |
| **Request Source Folder** | 특정 요청·외근·스캔·제출 작업 위치 | 외근 산출물 Root의 **날짜별 폴더**(`MMDD`). 조합별이 아니라 수행일 기준 | OBSERVED |
| **Shared Functional Folder** | 업무유형 결과물을 여러 조합에 걸쳐 일괄 보관 | 공통 드라이브의 보안카드 취합 폴더 | OBSERVED |
| **Git Evidence Inventory** | 사례·산출물 분포 검증용 참고 | `reports/evidence/fieldwork-output-inventory/**` | OBSERVED. **운영 파일의 Source of Truth 아님** |

### 14-2. E2E-03 Canonical Source Folder

Fund Root 하위 `1. 결성 > 1. 고유번호증 신청`이 T02~T04의 Primary Source다. 발급 결과물은 Fund Root 최상위에 저장된 사례가 확인됐다. **OBSERVED(사례 1건, 표준 확정은 CONFIRMATION_REQUIRED)**

`processes/03-unique-number-application.md`의 `R-4`와 `GAP-04`는 폴더 탐색 표준을 각각 PROVISIONAL·미해결로 유지하고 있다. 본 절은 그 Gap을 **1개 사례로 좁힌 관찰**이며 공통 Rule로 승격하지 않는다.

### 14-3. Evidence Type

Codex 외근 Evidence Inventory가 정의한 Type을 재사용한다(신규 체계를 만들지 않는다). **OBSERVED**

| Type | E2E-03 대응 | 사용 Task |
|---|---|---|
| `SUBMISSION_PACKAGE` | 신청서류 합본 | T03·T04 |
| `RECEIPT` | 세무서 접수증 | T04 |
| `RESULT_DOCUMENT` | 발급 고유번호증 | T05·T06 |
| `SUPPLEMENT` | 보완·추가 제출자료 | T02·T04 |
| `SECURITY_CARD` | 보안카드(후속 Process) | T06 후속 판단 |

### 14-4. Evidence 판정 규칙 **CONFIRMED_RULE**

1. 파일 존재만으로 Task 완료를 확정하지 않는다.
2. 파일 부재를 업무 미수행으로 확정하지 않는다. Blocker로 남긴다.
3. `.lnk`(Windows 바로가기)는 실물 Evidence로 인정하지 않는다.
4. 0byte placeholder 파일은 실물 수령 증빙으로 계수하지 않는다.
5. 폴더·파일명 괄호 메모는 조합명에서 분리하고(`operational_note`) 상태·Blocker로 자동 해석하지 않는다.
6. 동일 파일이 Root·외근·공통 폴더에 중복 존재해도 오류가 아니다(운영상 복사본 허용).
7. 탐색은 확정된 Root·parentId 기준 단계 조회만 사용한다. 광역 키워드 검색은 무관 조합의 민감 서류를 노출하므로 기본 방식으로 쓰지 않는다.
8. 본문을 열어야 판정 가능한 사실(날인 여부·수령자 요건 등)은 자동 판정하지 않고 사람 확인으로 넘긴다.

## 15. P03-T01~T06 실행 SOP

공통 전제: Actor·상태·Blocker·완료조건·완료증빙은 **Task Property가 유일한 Source of Truth**(3절). Request에 중복 저장하지 않는다.

### P03-T01 요청정보·착수조건 확인 — Atomic Step 01·03·04

- **목적**: 요청을 실행 가능한 상태로 확정하고 대상 조합·유형·폴더를 식별한다
- **Trigger**: 담당 관리역이 GP 날인본 실물서류를 지원팀에 전달(UN-01) **CONFIRMED_RULE**
- **시작조건**: Request 생성·승인 Commit 완료
- **Actor**: 지원팀
- **필수 입력정보**: 대상 조합, 요청 업무 유형, 요청자, 담당 관리역, 서류 상태
- **필요 파일**: 조합 기본정보, 투자유형·GP유형 판단자료
- **Primary Evidence Source**: FUND 마스터 Record + Fund Root
- **Fallback Evidence Source**: 담당 관리역 확인(사람)
- **수행 순서**: ① FUND 정확 1건 매칭 → ② Fund Root 식별 → ③ 투자유형·GP유형·공동GP 분류(UN-04)
- **판단 Rule**: FUND 1건 정확 일치만 진행. 0건·복수건은 Write 0 후 질문(6절) **CONFIRMED_RULE**
- **누락 질문**: "대상 조합명을 정확히 알려주세요" / "담당 관리역은 누구인가요" / "GP 유형(개인·법인·공동)을 확인해주세요"
- **승인점**: 없음(조회 단계). Request 생성 자체는 선행 승인 완료 상태
- **Output**: 확정된 FUND·Root 경로·유형 판단 결과
- **다음 상태**: T02 활성화, Request `진행 중`
- **Exception**: 유형 식별 불가 → 관리역 확인 후 UN-04 재수행(UN-D01) **CONFIRMED_RULE**
- **중단조건**: FUND 0건·복수건 / Root 미지정 / 조합구분 불명
- **완료조건**: 필수 요청정보와 착수 가능 여부를 확인한다
- **완료증빙**: 조합 Record·Root 경로·유형 판단 결과 확인 텍스트
- **Agent 자동 범위**: FUND 매칭, Root 존재 확인, 조합구분 조회, 누락 필드 질문 생성
- **사람 확인 범위**: GP 유형 최종 확정, 실물 날인본 인계 사실

### P03-T02 제출서류 수령·누락 검수 — Atomic Step 02·05·06·07

- **목적**: 제출에 필요한 서류를 수령하고 누락·오류를 식별한다
- **Trigger**: T01 완료
- **시작조건**: 대상 조합·유형 확정
- **Actor**: 지원팀 →(누락 시)관리역 확인 → 지원팀 **OBSERVED(CI5 S3~S6)**
- **필수 입력정보**: 유형별 필요 서류 목록, 현재 수령 범위
- **필요 파일**: 규약 또는 규약(안), 승인공문·근거자료, 조합원명부·투자조합 세부명세, 주소 증빙, GP 관련 서류, 인감 관련 자료
- **Primary Evidence Source**: Fund Root `1. 결성 > 1. 고유번호증 신청`
- **Fallback Evidence Source**: Fund Root 최상위(규약·조합원명부 등 조합 기준자료), 담당 관리역 재전달
- **수행 순서**: ① 유형별 근거자료 확인(UN-05) → ② 구비서류 확인(UN-06) → ③ 세부명세 합계·정보 검수(UN-07)
- **판단 Rule**: 누락 시 Blocker를 `누락서류: {서류명} {건수}(전체 {총건수} 중 {수령건수} 수령)` 구조로 기록 **OBSERVED(CI5-G01 형식, WS2 재사용)**
- **누락 질문**: "{서류명}이 확인되지 않습니다. 전달 예정인가요, 이미 전달하셨나요?"
- **승인점**: 보완 수령 확정 시 사용자 확인
- **Output**: 검수 완료된 제출서류 세트
- **다음 상태**: T03 활성화. 누락 시 Request 서류 상태 `보완 필요`
- **Exception**: 서류 누락·세부명세 오류(UN-EX02) → **동일 Task 내** Actor·Blocker만 변경, 신규 Task 생성 금지 **CONFIRMED_RULE**
- **중단조건**: 필수 서류 판정 불가 / 유형별 목록 미확정(PROVISIONAL 구간)
- **완료조건**: 수령 서류와 누락 항목을 확인한다
- **완료증빙**: "보완 수령분 포함 전체 서류 재검수 완료" 형식
- **Agent 자동 범위**: 파일 존재·수량 확인, 누락 목록 생성, 세부명세 합계 검증
- **사람 확인 범위**: 서류 적합성·진위, 유형별 필요 목록의 최종 판단(`R-1` 세부목록 미확정)

### P03-T03 신청서류 작성·날인본 확인 — Atomic Step 02·08

- **목적**: 신청서류를 작성하고 날인본을 검수해 제출 가능 상태로 만든다
- **Trigger**: T02 완료
- **시작조건**: 제출서류 검수 통과
- **Actor**: 지원팀 →(날인 대기·오류 시)GP → 지원팀 **OBSERVED(CI5 S7~S10)**
- **필수 입력정보**: 신청서 양식 버전, 날인 필요 문서 목록
- **필요 파일**: 고유번호증 신청서, 사용인감계, 날인본, 제출용 실물 묶음(UN-08)
- **Primary Evidence Source**: Fund Root `1. 결성 > 1. 고유번호증 신청`
- **Fallback Evidence Source**: 외근 날짜폴더(작성·합본 작업본)
- **수행 순서**: ① 신청서 작성 → ② 날인·기재 검수(UN-02 재참조) → ③ 제출용 실물 묶음 구성(UN-08)
- **판단 Rule**: 날인 여부는 파일명·메타데이터로 자동 판정하지 않는다 **CONFIRMED_RULE(14-4 규칙 8)**
- **누락 질문**: "날인본이 최종본인지 확인이 필요합니다. 검수 완료된 버전인가요?"
- **승인점**: 제출 가능 판정 시 사용자 확인
- **Output**: 날인 완료된 제출용 서류 묶음(`SUBMISSION_PACKAGE`)
- **다음 상태**: T04 활성화
- **Exception**: 날인 오류·재요청(UN-EX01) → **동일 Task 내** 처리 **CONFIRMED_RULE**
- **중단조건**: 날인본 진위 확인 불가 / 구양식 판별 불가(`GAP-02` UNKNOWN)
- **완료조건**: 신청서류 작성과 날인본 확인을 완료한다
- **완료증빙**: "재날인본 검수 완료, 제출 가능 판정" 형식
- **Agent 자동 범위**: 신청서·인감계 파일 존재 확인, 합본 구성 여부 확인
- **사람 확인 범위**: **날인 실물 확인(필수)**, 양식 최신성 판단

### P03-T04 세무서 제출 준비·접수 — Atomic Step 09·10·11·12

- **목적**: 제출 전 스캔을 확보하고 세무서에 접수해 접수증을 수령한다
- **Trigger**: T03 완료
- **시작조건**: 제출용 묶음 확정
- **Actor**: 지원팀 →(현장 추가요청 시)관리역 확인 → 지원팀 **OBSERVED(CI5 S11~S13)**
- **필수 입력정보**: 제출 기관, 제출 예정일
- **필요 파일**: 사전 스캔본(UN-09), 접수증(`RECEIPT`), 현장 보완 자료(`SUPPLEMENT`)
- **Primary Evidence Source**: Fund Root `1. 결성 > 1. 고유번호증 신청`
- **Fallback Evidence Source**: 외근 날짜폴더(접수 당일 산출물)
- **수행 순서**: ① 전체 스캔·병합(UN-09) → ② 현장 작성·보완(UN-10) → ③ 접수·접수증 수령(UN-11) → ④ 접수증 공유·저장(UN-12)
- **판단 Rule**: **접수 완료 ≠ 전체 Process 완료.** T04 완료로 Request를 `완료` 전환하지 않는다 **CONFIRMED_RULE**
- **누락 질문**: "접수증이 확인되지 않습니다. 접수는 완료되었나요?"
- **승인점**: 접수 완료 기록 시 사용자 확인
- **Output**: 접수증 + 저장·공유 완료 상태
- **다음 상태**: T05 활성화, Actor=외부기관
- **Exception**: 세무서 현장 추가요청(UN-EX04) → **동일 Task 내** 처리. 증빙·근거자료 성격이면 T02, 신청서·날인 성격이면 T03으로 라우팅(5절) **OBSERVED**
- **중단조건**: 접수 가능 여부 판정 불가 / 기관별 요구 차이(`GAP-03` PROVISIONAL)
- **완료조건**: 제출 준비와 세무서 접수 및 접수증 저장을 확인한다
- **완료증빙**: "접수증 스캔본 확인" + 저장 위치
- **Agent 자동 범위**: 스캔본·접수증 파일 존재 확인, 접수일 후보 추출(파일명·메타데이터 기준)
- **사람 확인 범위**: 현장 대응, 추가요청 내용 해석, 실제 접수 사실

### P03-T05 결과물 수령 — Atomic Step 13·14·15

- **목적**: 처리완료를 확인하고 고유번호증 실물을 수령한다
- **Trigger**: T04 완료(접수증 확보)
- **시작조건**: 기관 처리 대기
- **Actor**: 외부기관(대기) → 지원팀(통지 후) **OBSERVED(CI5 S13~S15)**
- **필수 입력정보**: 접수번호, 처리완료 통지 여부, 수령자 정보
- **필요 파일**: 처리완료 알림, 접수증, 발급 고유번호증(`RESULT_DOCUMENT`)
- **Primary Evidence Source**: Fund Root 최상위(발급본 저장 위치) **OBSERVED(사례 1건)**
- **Fallback Evidence Source**: 외근 날짜폴더(수령 당일 스캔본)
- **수행 순서**: ① 처리완료 확인(UN-13) → ② 수령자료·자격 점검(UN-14) → ③ 실물 수령·결과 공유(UN-15)
- **판단 Rule**: 발급본이 여러 위치에 있으면 중복 오류로 보지 않고 **최신본 후보를 사람 확인 대상으로 표시**
- **누락 질문**: "고유번호증 발급본이 확인되지 않습니다. 수령하셨나요?"
- **승인점**: 수령 완료 기록 시 사용자 확인
- **Output**: 고유번호증 실물 + 촬영·스캔 공유본
- **다음 상태**: T06 활성화
- **Exception**: 수령자 요건 미충족(UN-EX05) → UN-14 복귀. **제3자 수령요건은 UNKNOWN**(`GAP-01`) **CONFIRMED_RULE(미확정 유지)**
- **중단조건**: 제3자 수령 여부 판정 필요 / 발급본 최신성 판정 불가
- **완료조건**: 고유번호증 결과물을 수령한다
- **완료증빙**: "고유번호증 실물 수령 확인"
- **Agent 자동 범위**: 발급본 파일 존재·발급일 후보 확인
- **사람 확인 범위**: 실물 수령, 수령자 자격, 고유번호 진위

### P03-T06 스캔·저장·관리역 전달 — Atomic Step 16

- **목적**: 결과물을 지정 위치에 저장하고 담당 관리역에게 전달해 업무를 종료한다
- **Trigger**: T05 완료
- **시작조건**: 실물 수령 완료
- **Actor**: 지원팀
- **필수 입력정보**: 저장 대상 폴더, 전달 대상 관리역
- **필요 파일**: 고유번호증 스캔본(Fund Root 저장본)
- **Primary Evidence Source**: Fund Root
- **Fallback Evidence Source**: 공통 취합 폴더(후속 보안카드 연계 시)
- **수행 순서**: ① 스캔·저장(UN-16) → ② 실물 전달 → ③ 후속 Process 필요 여부 판단
- **판단 Rule**: 저장 파일 존재와 관리역 실물 수령이 **모두** 확인돼야 완료 **CONFIRMED_RULE**
- **누락 질문**: "관리역 전달이 완료되었나요?"
- **승인점**: Request `완료` 전환 시 사용자 확인
- **Output**: 저장본 + 전달 완료 상태
- **다음 상태**: 전 Task 완료 확인 후 Request `완료`. 후속은 Process 04(보안카드·홈택스) / 07(계좌개설)로 인계(IF-03-04, IF-03-07 — PROVISIONAL)
- **Exception**: 검증 범위 내 예외 미발생
- **중단조건**: 전달 증빙 확인 불가
- **완료조건**: 결과물을 스캔·저장하고 관리역에게 전달한다
- **완료증빙**: "스캔본 저장 경로 확인, 관리역 전달 확인"
- **Agent 자동 범위**: 저장 위치 파일 존재 확인, 후속 Process 후보 제시
- **사람 확인 범위**: 관리역 전달 사실, 후속 Process 착수 판단

## 16. 조합 유형별 차이

FUND 마스터 `조합구분` 실측 옵션: `전체·신투·벤투·개투·민법·고유·기타·r투` **OBSERVED**

| 유형 | 착수 Trigger | 승인공문·근거자료 | 추가서류 | 판정 |
|---|---|---|---|---|
| 민법조합 | 관리역의 GP 날인본 인계 | 규약(안)·사업계획서(안)·조합원명부·출자자 리스트, 민법상조합 법적근거 | 임대인동의서 또는 무상사용승낙서(주소 증빙), 사용인감계 | **OBSERVED(사례 1건)** — 단일 사례이므로 공통 Rule 아님 |
| 개인투자조합 | 동일 Trigger 추정 | 결성계획 승인공문 관련 확인 경로 | 미확정 | `CONFIRMATION_REQUIRED`(`mappings/fund-type-notion-map.md` PROVISIONAL) |
| 벤처투자조합 | 동일 Trigger 추정 | 핵심정보·유형별 근거자료 확인 경로 | 구체 문서세트 UNKNOWN | `CONFIRMATION_REQUIRED` |
| 신기술사업투자조합 | **Trigger UNKNOWN** | 근거자료 UNKNOWN | 미확정 | `CONFIRMATION_REQUIRED`(`process-to-notion-map.yaml` known_gap) |

`processes/03` `R-1`에 따라 GP유형(개인·법인·공동)별 첨부서류 세부 목록은 추정하지 않는다. 위 표의 민법조합 항목도 **1개 사례 관찰**이며 AGENTS.md 원칙에 따라 잠정으로 유지한다.

## 17. Logical Gap Register

| ID | Gap | 근거 | 처리 |
|---|---|---|---|
| **LG-1** | **P03 5-Task와 6-Task Mapping 병존** — `mappings/process-to-notion-map.{md,yaml}`은 `OT-P03-01~05`, `contracts/process-execution-mapping.yaml`과 본 표준은 `P03-T01~T06`. 단순 분할이 아니라 Atomic Step 그룹 자체가 다름(예: 5-Task는 UN-02를 OT-P03-01에, 6-Task는 Step 02를 T02·T03에 배치. 5-Task는 UN-09를 OT-P03-03에, 6-Task는 Step 09를 T04에 배치) | 두 파일 직접 대조 **OBSERVED** | **수정하지 않음.** GPT·사용자 Process 결정 대상(Reconciliation G-9와 동일 판정) |
| **LG-2** | 폴더 탐색 표준 미확정 | `processes/03` `R-4`·`GAP-04` PROVISIONAL. 14-2는 사례 1건 관찰 | 표준으로 승격하지 않음 |
| **LG-3** | 유형별 첨부서류 세부목록 미확정(특히 신기술) | `R-1`, `fund-type-notion-map.md` | 16절 `CONFIRMATION_REQUIRED` 유지 |
| **LG-4** | 제3자 수령요건 UNKNOWN | `GAP-01`, `UN-D03` | T05 중단조건으로만 반영 |
| **LG-5** | `일부 전달`·`보완 필요` 동시 표현 불가(Select 한계) | 2절 기존 기재 | Blocker 텍스트 병기로 우회(검증됨) |
| **LG-6** | 이전 Task로의 역행 사례 없음 | 1절 질문 10 | `CONFIRMATION_REQUIRED` 유지 |

## 18. Gate A Verification

### Unit

| 항목 | 결과 |
|---|---|
| 6개 Task 전부 존재 | PASS(15절) |
| Task별 20개 필드(목적~사람 확인 범위) | PASS(6/6) |
| 시작조건·완료조건 명시 | PASS |
| Input·Output 명시 | PASS |
| 정상·예외 경로 구분 | PASS |
| Actor 명시 | PASS |
| Evidence Source(Primary·Fallback) | PASS |
| 승인점 명시 | PASS |

### Integration

| 항목 | 결과 |
|---|---|
| Task 간 상태 전이 연결(T01→T06) | PASS |
| Request–Task 역할 분리 유지(중복 저장 없음) | PASS |
| Fund Root–Evidence 연결 | PASS(14절) |
| 보안카드 후속 Process 연결 | PASS(T06 다음 상태, IF-03-04) |
| Natural Language Contract 연결 | PASS(8절 Contract 재사용, 누락 질문·승인점이 Contract 항목과 대응) |
| Atomic Step 16/16 보존 | PASS(01~16 전부 T01~T06에 배치, Step 02는 기존 허용 중복) |
| 5-Task Mapping과의 충돌 | **미해소 — LG-1로 기록(의도적)** |

### 이번 Gate에서 하지 않은 것

- Notion Write·Schema 변경·Drive 변경: 각 0건
- 5↔6 Task Mapping 수정: 하지 않음(LG-1)
- 신규 Rule 확정: 없음. 모든 신규 관찰은 사례 1건 기준 잠정 표기

---

# Gate C·D — Notion Physical Prototype과 Live 검증 (TAP A-CP16-R2)

## 19. 실제 Record Chain과 Physical 결과

### 19-1. TEST Asset 정체성 (Write 전 확인)

| 항목 | 실측 | 판정 |
|---|---|---|
| Master Record | `[TEST] 가상조합1호`(전체관리조합) | 정확 1건 |
| FUND Work Record | `[TEST][CI1-PILOT] 가상조합1호`(TO DO LIST) — 구분=결성, 상태=확인전, 업무분류=조합결성 | 정확 1건 |
| Relation | TO DO LIST `조합명 또는 제목` → Master | 일치 확인 |
| 운영 조합 여부 | `검토/결과`에 "사용자 Pilot 검증용 가상 조합 Record — 운영 조합 아님" 명시 | 운영 아님 |
| 명칭 차이 | 사용자 표현 `TEST CI1 PILOT 1` ↔ 실제 `[TEST][CI1-PILOT] 가상조합1호` | **표시명 차이로 기록, 동일 자산** |

중복 검사(Write 직전): Prefix `[TEST][E2E03-PROTOTYPE]` Request 0건·Task 0건 → 신규 생성 경로. 동일 FUND Work Record에 연결된 기존 Request 8건은 Prefix가 달라 중복 Instance로 판정하지 않음(TAP 규정).

### 19-2. 실제 Relation Chain (재조회 확인)

```
[전체관리조합] [TEST] 가상조합1호
      ▲ 조합명 또는 제목 (단방향 — 역Relation 없음)
[TO DO LIST (FUND)] [TEST][CI1-PILOT] 가상조합1호
      ▲ 관련 조합
[Request] [TEST][E2E03-PROTOTYPE] 가상조합1호 — 고유번호증 신청
      ▲ 상위 요청 (6) / ▼ 관련 Task (6)
[Task] P03-T01 … P03-T06
```

### 19-3. Expected–Actual

| Requirement | Expected | Actual | Evidence | Result |
|---|---|---|---|---|
| Request 생성 | 1건 | 1건 | 재조회 | PASS |
| Request→TO DO LIST Relation | 1건 | 1건 | 재조회 | PASS |
| Request Property | 유형·상태·서류상태·요청일·Prefix 일치 | 전부 일치 | 재조회 | PASS |
| 비움 지정 Property | 원본 폴더·목표일·담당 관리역 = 빈 값 | 전부 null | 재조회 | PASS |
| Task 생성 | 6건 | 6건 | 재조회 | PASS |
| Operational Task ID | 6종(P03-T01~T06) | 6종, 중복 0 | `COUNT DISTINCT`=6 | PASS |
| Process ID | 6건 모두 P03 | 일치 | 재조회 | PASS |
| Task→Request Relation | 6건 | 6건 | 재조회 | PASS |
| Request→Task 역Relation | 6건 | 6건 | 재조회 | PASS |
| 초기 상태 | T01 진행 중 / T02~T06 시작 전 | 일치 | 재조회 | PASS |
| Actor | T05만 외부기관, 나머지 지원팀 | 일치 | 재조회 | PASS |
| Blocker | T01 Evidence 미연결, T02~T06 선행 Task 미완료 | 일치 | 재조회 | PASS |
| 완료증빙 초기값 | 6건 모두 빈 값 | 전부 null | 재조회 | PASS |
| Task `관련 조합` Rollup | 값 관측 | `<omitted />` | Page fetch | **TOOL_LIMITATION** |

Rollup 항목은 `RELATION_CHAIN_CONFIRMED_BUT_ROLLUP_NOT_OBSERVABLE`로 분리한다. Relation 체인(Task→Request→TO DO LIST→Master)은 전부 확인됐으므로 **기능 결함이 아니라 API 관측 한계**이며, Property Write로 보완하지 않았다.

Physical 불일치: **0건**.

### 19-4. Write 집계

| 항목 | 수 |
|---|---|
| Notion Record 생성 | **7**(Request 1 + Task 6) |
| Notion Record 수정 | 0 |
| Schema 변경 | 0 |
| Database 생성 | 0 |
| View 생성 | 0 |
| 운영 Record 변경 | 0(전체관리조합·TO DO LIST·기존 Request 8건 전부 무변경) |
| Drive Write | 0 |

## 20. Live Prototype 결과 (AC-01~AC-05)

| AC | 시나리오 | 결과 | 근거 |
|---|---|---|---|
| **AC-01** | "TEST CI1 PILOT 1의 고유번호증 신청 업무 상태와 다음 업무를 확인해줘" | **PASS** | 명칭→TO DO LIST Record 정확 1건 해석 → Master 확인 → Prototype Request 조회 → 활성 Task = P03-T01(진행 중, Actor 지원팀), 다음 Action·Blocker 안내 |
| **AC-02** | `네`·`진행해주세요`처럼 대상이 모호한 승인 | **PASS** | 어떤 Task를 어떤 상태로 바꾸는지 특정 불가 → **API 호출 0건**, 확인 질문으로 전환(Contract 6절 fail-safe) |
| **AC-03** | 동일 요청 재처리 | **PASS** | 재조회 결과 Request 1 / Task 6 / distinct OTID 6 — **신규 생성 0건** |
| **AC-04** | Evidence 누락 | **PASS** | TEST Asset에 Drive Evidence 미연결 → T01 자동 완료하지 않음, 완료증빙 빈 값 유지, Blocker "실제 Evidence·실물서류 미연결" 표시, 필요한 Evidence 목록 안내(20-1) |
| **AC-05** | "요청정보 확인이 끝났다고 처리해줘" | **PASS(Preview only)** | 예상 변경값을 표로 제시하고 **실제 상태 Write 0건**. 필요한 사람 확인 항목 함께 제시(20-2) |

### 20-1. AC-04에서 안내한 필요 Evidence (T01 기준)

조합 기본정보·투자유형·GP유형 판단자료, 그리고 착수 근거가 되는 실물 날인본 인계 사실. TEST 자산에는 실제 Drive Root가 없으므로 Blocker 유지가 정상이다.

### 20-2. AC-05 상태변경 Preview (미실행)

| 대상 | 현재 | 변경 예정 | 필요한 사람 확인 |
|---|---|---|---|
| P03-T01 | 진행 중 / Blocker 있음 / 완료증빙 빈 값 | 완료 / Blocker 해제 / 완료증빙 기록 | GP 유형 확정, 실물 날인본 인계 사실 |
| P03-T02 | 시작 전 / Blocker "P03-T01 미완료" | 진행 중 / Blocker 해제 | 없음(T01 완료 시 자동 해소) |
| Request | 진행 중 | 변경 없음 | — |

예상 Write 2건. **별도 명시 승인 전 실행하지 않는다.**

## 21. 외근 Evidence 연결 후보 (Logical만, Write 0)

Git Inventory는 참고 Evidence이며 운영 Source of Truth가 아니다.

| Evidence Type | Process | Task 후보 | 필요한 사람 확인 | 완료증빙 후보 | 자동 완료 |
|---|---|---|---|---|---|
| `SUBMISSION_PACKAGE` | E2E-03 | T03·T04 | 날인 실물·양식 최신성 | 합본 파일 확인 텍스트 | **금지** |
| `RECEIPT` | E2E-03 | T04 | 실제 접수 사실 | 접수증 확인 + 저장 위치 | **금지** |
| `RESULT_DOCUMENT` | E2E-03 | T05 | 실물 수령·수령자 자격 | 발급본 확인 | **금지** |
| `SUPPLEMENT` | E2E-03 | 해당 Task Blocker | 보완 요구 내용 해석 | 보완 수령 재검수 텍스트 | **금지** |
| `SECURITY_CARD` | P04(후속) | T06 이후 후속 판단 | 발급·수령·전달 주체 | 후속 Process 인계 상태 | **금지** |
| `BANKBOOK_COPY` | P07(은행) | 범위 외 | — | — | **금지** |

## 22. 매니저 공유 Prototype (신규 Property·View 0)

### 22-1. 현재 Prototype 요약(기존 Property만으로 생성)

진행 중 업무 = P03-T01 / 다음 담당 주체 = 지원팀 / Blocker = 실제 Evidence·실물서류 미연결 / 필요한 Evidence = 20-1 / 후속 Action = 요청정보와 착수조건 확인.

### 22-2. 검증된 설계 발견

`Blocker IS NOT NULL` 단독 필터는 **6건 전부**를 반환한다(T02~T06의 "선행 Task 미완료"가 모두 Blocker이기 때문). 실제 조치 대상만 뽑으려면 **`Task 상태 = 진행 중` 조건을 결합**해야 하며, 이 조건으로 재조회한 결과 정확히 **1건(P03-T01)** 만 반환됐다. **[OBSERVED — 이번 실측]**

시사점: 선행 의존성은 Blocker가 아니라 `다음 Action`으로 표현하는 편이 공유 뷰 노이즈를 줄인다. **[PROPOSED — 확정하지 않음]**

### 22-3. View A 후보 (생성하지 않음)

- 이름: `[TEST] 매니저 공유 — 진행·Blocker`
- 기준 DB: `[TEST]지원팀 Task`
- Filter: `Task 상태 ≠ 완료` AND (`현재 Actor = 관리역 확인` OR (`Task 상태 = 진행 중` AND `Blocker` 비어있지 않음))
- Sort: `목표일` 오름차순 → `Operational Task ID` 오름차순
- 표시 Property: 관련 조합(Rollup), Task명, Task 상태, 담당자, 현재 Actor, 다음 Action, Blocker, 목표일
- 기대 사용자: 담당 관리역·지원팀 리드
- 기존 View 대비 차이: 조합 단위가 아닌 **조치 필요 항목 중심** 집계
- 실제 발송: 없음. `마지막 공유일` Property 생성하지 않음

## 23. 조합별 트래킹 Prototype (신규 DB 0)

### 23-1. 체인으로 구성 가능 여부

TO DO LIST Record → Request → Task 체인이 실제 Relation으로 확인됐으므로(19-2) 조합별 집계는 **기존 Relation만으로 구성 가능**하다. 신규 DB 없이 Linked View로 충족된다.

| 조합 | 진행 중 Request | Task 상태 | 현재 Actor | 다음 Action | Blocker | 완료증빙 |
|---|---|---|---|---|---|---|
| [TEST] 가상조합1호 | [TEST][E2E03-PROTOTYPE] 1건 | T01 진행 중 / T02~T06 시작 전 | 지원팀(T05 외부기관) | T01 요청정보·착수조건 확인 | T01 Evidence 미연결 | 전 Task 빈 값 |

### 23-2. View B 후보 (생성하지 않음)

- 이름: `[TEST] 조합별 행정업무 트래킹`
- 기준 DB: `[TEST]지원팀 Task`(Task 단위가 상태 SoT이므로 Request보다 적합)
- Filter: `Process ID` 지정(예: P03) — 조합 필터는 `관련 조합` Rollup 기준
- Group by: `관련 조합`(Rollup)
- Sort: `Operational Task ID` 오름차순
- 표시 Property: 관련 조합, Operational Task ID, Task명, Task 상태, 현재 Actor, 다음 Action, Blocker, 완료조건, 완료증빙
- 기대 사용자: 조합 담당 관리역
- 기존 View 대비 차이: 조합 축 그룹핑 제공
- **제약**: `관련 조합`이 Rollup이라 API로 값이 관측되지 않는다(19-3). Group by 동작은 **UI 육안 확인 필요** `[확인 필요]`
- **신규 트래킹 DB 비권장 결론 유지**: 체인이 이미 존재하므로 Projection DB는 동기화 부채만 추가

## 24. Gate C·D 판정

**RESULT=PASS_WITH_ROLLUP_TOOL_LIMITATION**

Physical Expected–Actual 불일치 0건, Live AC-01~AC-05 전부 PASS. 유일한 미관측 항목은 Rollup 값의 API 노출 한계이며 Relation 체인 자체는 확인됐다.

STATUS=E2E03_PHYSICAL_AND_LIVE_PROTOTYPE_VERIFIED
NEXT_OWNER=GPT_AND_USER

---

# 25. TEST 상태 전이·View·Legacy Mapping 정합화 (승인 실행 결과)

## 25-1. TEST 상태 전이 (Notion Write 2건)

| Task | 전 | 후 | 비고 |
|---|---|---|---|
| P03-T01 | 진행 중 / Blocker 있음 / 완료증빙 빈 값 | **완료** / Blocker 해제 / 완료증빙 기록 | 완료증빙·비고에 **"실제 업무 완료 아님, TEST Prototype 상태 전이"** 명시 |
| P03-T02 | 시작 전 / Blocker "P03-T01 미완료" | **진행 중** / Blocker **"실제 제출서류·날인본 Evidence 미연결"** | 비고에 TEST 명시 |
| P03-T03~T06 | — | **변경 없음** | |
| Request | 진행 중 | **진행 중 유지** | 변경 없음 |

재조회 검증: Request 1건·Task 6건 유지, 중복 생성 0, Expected–Actual 불일치 0.

## 25-2. TEST View 생성 (View 2건, 신규 Property·DB 0)

| View | 기준 DB | Filter | Sort | 검증 |
|---|---|---|---|---|
| `[TEST] 매니저 공유 — 현재 Action` | `[TEST]지원팀 Task` | `완료증빙 IS EMPTY` | `Operational Task ID` ASC | 실행 결과 **완료 처리한 P03-T01만 정확히 제외**, T02~T06 포함 |
| `[TEST] 조합별 행정업무 트래킹` | `[TEST]지원팀 업무요청` | 없음 | `요청일` DESC, Group by `관련 조합` | 표시 Property 9종·정렬 동작 확인 |

### 신규 TOOL_LIMITATION (격리 검증 완료)

View DSL의 필터는 **`status` 타입 Property에서 무시된다.** 동일 DSL로 비교 실험한 결과:

| Property 타입 | 예시 | 결과 |
|---|---|---|
| text | `비고 CONTAINS`, `완료증빙 IS EMPTY` | 적용됨(`string_contains`/`is_empty`) |
| select | `현재 Actor != 외부기관` | 적용됨(`enum_is_not`) |
| **status** | `Task 상태 != 완료`, `Task 상태 IN (...)` | **무시됨(빈 filter group)** |

따라서 View A의 의도된 조건 `Task 상태 ≠ 완료`를 API로 설정할 수 없어, **계약상 동등한 `완료증빙 IS EMPTY`** 로 대체했다(본 SOP상 완료증빙은 Task 완료의 필수 요건이므로 논리적으로 동치이며, 완료증빙 없는 완료 Task는 오히려 노출되어야 한다). Status 기준 필터가 필요하면 **Notion UI에서 직접 추가** 필요 `[확인 필요]`.

## 25-3. Legacy Mapping 정합화

E2E-03 실행·상태관리 기준을 **`P03-T01~T06`(6개)** 로 통일(사용자 Process 결정). Legacy `OT-P03-01~05`는 보존·표기만.

| 파일 | 처리 | 건수 |
|---|---|---|
| `mappings/process-to-notion-map.md` | P03 행 현행 병기, Legacy 표기, **현행 6-Task 표 + Legacy↔현행 Bridge 신설** | 6 → 표기 전환 |
| `mappings/process-to-notion-map.yaml` | 16행에 `current_operational_task_id` **병기**(Legacy `operational_task_id` 보존) | 16 |
| `mappings/fund-type-notion-map.md` | `P03-T02(Legacy OT-P03-02)` 표기 | 3 |
| `mappings/variation-task-generation-map.md` | `P03-T01·T02` / `P03-T02` 표기 | 2 |
| `mappings/human-approval-map.md` | `P03-T01/T02(Legacy OT-P03-01/02)` 표기 | 1 |

**치환하지 않고 보존한 범위(Historical·Test Evidence·후보안)**

| 파일 | 건수 | 사유 |
|---|---|---|
| `notion/schema/operational-task-candidates.md` | 7 | **제3의 `OT-P03-01~06` 후보안**(이름·UN 범위 모두 상이). 문서가 스스로 "확정 Task Template 아님" 선언 → 폐기 여부 `[확인 필요]` |
| `notion/schema/skeleton-test-records.md` | 4 | TEST Record Historical 기록 |
| `rag/metadata/status-evidence-metadata.md` | 1 | 메타데이터 예시값 (승인 범위 밖) |
| `reports/**` | 5 | 과거 판정·분석 기록 |

### 추적성 검증

- Contract 6개 ID ↔ Mapping 현행 ID: **6/6 일치, 누락 0**
- Atomic Step: Contract 16/16, Mapping UN-01~UN-16 전수 16행 보존
- `process-to-notion-map.yaml` JSON 유효성: VALID
- Legacy 값 보존: 16/16
- Notion Schema·운영 Record 변경: **0**

## 25-4. Gate 판정

**RESULT=PASS_E2E03_TRANSITION_VIEW_AND_MAPPING**(단, View 필터는 status TOOL_LIMITATION 우회 적용)

---

# 26. A-CP17 실행 결과 (상태 전이·View 규격 정렬·Mapping 분류)

## 26-1. Bootstrap 실측과 재실행 판정

A-CP17 착수 시점에 상태 전이·View 2개는 **직전 승인분으로 이미 반영된 상태**였다. Phase 3 재실행 규칙("이미 목표 상태이면 추가 Write 불필요")에 따라 **상태값 Write는 0건**으로 처리하고, A-CP17이 명시한 **문구 4곳만 정렬**했다.

| 항목 | Before | After(A-CP17 규격) |
|---|---|---|
| T01 `다음 Action` | `P03-T02 제출서류 수령·누락 검수로 이관` | `P03-T02에서 수령 서류와 누락 항목을 확인한다` |
| T01 `완료증빙` | 서술형 장문 | `[TEST] E2E-03 상태 전이 Prototype 검증용. 실제 업무 완료증빙이 아님.` |
| T02 `다음 Action` | `수령 서류와 누락 항목을 확인한다` | `실제 제출서류를 연결하고 누락·적합성을 확인한다` |
| T02 `Blocker` | `실제 제출서류·날인본 Evidence 미연결` | `실제 제출서류와 날인본 Evidence가 TEST Instance에 연결되지 않음` |

상태값(T01 완료 / T02 진행 중 / T03~T06 시작 전 / Request 진행 중)·Actor·완료조건은 **변경 없음**. 추가 Record 0, OTID 중복 0, Relation 6건 유지.

## 26-2. View 규격 정렬 결과

| View | A-CP17 규격 | 실제 적용 | 판정 |
|---|---|---|---|
| A `[TEST] 매니저 공유 — 현재 Action` | Filter `Task 상태 = 진행 중` / Sort `목표일 ASC` / 표시 10종 | Sort·표시 10종 **적용**, **Filter 미적용** | **UI 확인 필요** |
| B `[TEST] 조합별 행정업무 트래킹` | Filter `요청명 contains [TEST][E2E03-PROTOTYPE]` / Sort `요청일 DESC` / 표시 9종 / Grouping 없음 | **전부 적용**, Grouping 제거 완료 | PASS — 실행 결과 Request **정확히 1건** |

### status 필터 TOOL_LIMITATION 최종 확정

View DSL의 status 타입 필터는 **연산자 3종 모두 무시**된다(빈 filter group). text·select는 정상 동작한다.

| 연산자 | 결과 |
|---|---|
| `Task 상태 = "진행 중"` | 무시 |
| `Task 상태 != "완료"` | 무시 |
| `Task 상태 IN ("시작 전","진행 중")` | 무시 |
| (대조) `비고 CONTAINS`, `완료증빙 IS EMPTY` — text | 적용 |
| (대조) `현재 Actor != "외부기관"` — select | 적용 |

View A는 A-CP17 규격을 임의 대체하지 않고 **필터 미설정 상태로 두었다.** Notion UI에서 `Task 상태 = 진행 중`을 직접 추가해야 한다 `[확인 필요]`. (대안: 이전에 실증된 `완료증빙 IS EMPTY` 프록시 — 사용자 선택 대기)

## 26-3. Live Acceptance

| Phase | 자연어 | 결과 |
|---|---|---|
| 6 매니저 공유 | "현재 매니저나 지원팀이 확인해야 할 고유번호증 업무를 공유해줘" | **PASS** — 동일 조건 DB 조회에서 `진행 중` = **P03-T02 1건만** 반환, T03~T06 미노출. Blocker와 다음 Action 구분 표시. 실제 발송 0 |
| 7 조합별 트래킹 | "TEST 가상조합1호의 진행 중인 행정업무와 다음 단계를 보여줘" | **PASS** — Request 1건(고유번호증 신청, 진행 중), T01 완료 / T02 진행 중 / T03~T06 시작 전, Evidence Blocker 안내. 신규 Record 0 |

## 26-4. Legacy Mapping 위치 분류 (28곳)

| 분류 | 위치 | 건수 | 처리 |
|---|---|---|---|
| **CURRENT_MAPPING** | `process-to-notion-map.yaml` | 16 | 6-Task 기준 `current_operational_task_id` 병기, Legacy 값 보존 |
| **CURRENT_MAPPING** | `process-to-notion-map.md` | 6→(주석 포함 19) | Legacy 표기 + 현행 6-Task 표·Bridge 신설 |
| **CURRENT_MAPPING** | `fund-type-notion-map.md` | 3 | `P03-T02(Legacy OT-P03-02)` |
| **CURRENT_MAPPING** | `variation-task-generation-map.md` | 2 | `P03-T01·T02` / `P03-T02` |
| **CURRENT_MAPPING** | `human-approval-map.md` | 1 | `P03-T01/T02(Legacy OT-P03-01/02)` |

승인 범위 밖(치환 금지, 원문 보존):

| 분류 | 위치 | 건수 |
|---|---|---|
| **SUPERSEDED** | `notion/schema/operational-task-candidates.md` — 제3의 `OT-P03-01~06` 후보안, 자칭 "확정 Template 아님" | 7 |
| **HISTORICAL_EVIDENCE** | `notion/schema/skeleton-test-records.md` | 4 |
| **HISTORICAL_EVIDENCE** | `reports/**`(reconciliation preview·본 문서 Bridge 설명) | 5 |
| **CURRENT_MAPPING(범위 밖)** | `rag/metadata/status-evidence-metadata.md` 예시값 `OT-P03-03` | 1 |

`TEST_EXPECTED` 분류에 해당하는 회귀 테스트 Expected는 **없다** — `scripts/conversational-intake.test.mjs`는 Contract(`P03-T01~T06`) 기준이며 Legacy ID를 참조하지 않는다(회귀 PASS로 확인).

## 26-5. 전역 ID Naming 충돌 (변경하지 않음, 보고만)

E2E-03만 `P03-T0n`을 쓰고 다른 Process는 전부 `OT-P0n-nn` 규약을 유지한다.

| Process | mappings 내 `OT-*` 참조 |
|---|---|
| P01 명판·인감 | 15 |
| P04 보안카드·홈택스 | 18 |
| P07 계좌개설 | 23 |
| P08 계좌개설 보완 | 15 |
| **합계(P03 제외)** | **71** |

| 대안 | 내용 | 평가 |
|---|---|---|
| **A1(권장)** | E2E-03은 `P03-T01~T06` 유지, 타 Process는 현행 유지 | Notion TEST Record 66건과 일치, 변경 0. Process별 규약 혼재는 감수 |
| A2 | E2E-03을 `OT-P03-01~06`으로 재명명 | **비권장** — 기존 TEST Instance 66건 재명명 필요(금지 사항) + Contract 변경 |
| A3 | 전 Process를 `Pnn-Tnn`으로 전역 이관 | 71곳 + 향후 Notion Record 영향, **별도 승인·별도 TAP 필요** |

## 26-6. 검증 결과

| 구분 | 결과 |
|---|---|
| Unit | Task 6개·ID 중복 0·T01~T06 누락 0·Trigger/Output/Evidence 연결 확인 — PASS |
| Integration | SOP→Contract→Mapping→TEST Task→View→Evidence Type 연결 확인 — PASS |
| Regression | Intake 테스트 3개 스위트 PASS / JSON·YAML 17개 파싱 PASS / `git diff --check` OK / Historical Evidence 무변경 — PASS |
| Expected–Actual | 불일치 0 |

## 26-7. A-CP17 판정

**RESULT=PASS_WITH_VIEW_UI_CONFIRMATION_GAP**

View A의 `Task 상태 = 진행 중` 필터만 API로 설정 불가하여 UI 확인이 필요하고, 그 외 상태 전이·View B·Mapping 정합화·Live Acceptance는 전부 PASS다.

---

# 27. A-CP18 실제 Evidence 기반 Live 검증 (TEST Shadow)

민감정보 보호: 아래 기록에 Drive 직접 URL·File ID·문서 본문은 포함하지 않는다.

## 27-1. 대표 사례 선정

| Candidate | FUND Match | Evidence Coverage | Root Availability | Risk |
|---|---|---|---|---|
| **그로스브릿지-바이오투자조합** | **EXACT_1** | 신청서류·접수증·보완서류·발급본·보안카드 전 구간 | **확정(FUND Property에 저장된 유일 조합)** | 낮음 |
| 아이씨에프 제오십삼·사·오호 | EXACT_1 | Codex Inventory상 신청·접수·결과 | **없음(Root null)** | Root 탐색 선행 필요 |
| 아타카마13호·테크브릿지·블리스바인2호·휴먼비젼·테일프론티어3호 | **0건(정확)** | 넓음 | 없음 | FUND Gate 미충족 |

**선정: 그로스브릿지-바이오투자조합.** FUND EXACT_1이면서 마스터 1,231행 중 **Root가 확정 저장된 유일 조합**이라 광역검색 없이 parentId 조회만으로 전 구간 검증이 가능하다. 정정·폐업 사례 아님.

## 27-2. Evidence 분류

| Evidence | Source | Type | File Validity | Task Candidate | Human Check |
|---|---|---|---|---|---|
| 고유번호증 신청서류 합본 | Fund Root/1.결성/1.고유번호증 신청 | `SUBMISSION_PACKAGE` | VERIFIED | T03·T04 | 구성 적합성 |
| 고유번호증 접수증 | 동상 | `RECEIPT` | VERIFIED | T04 | 본문 조합명·접수일 |
| 규약·조합원 선임 동의서(세무서 보완 제출용) | 동상 | `SUPPLEMENT` | VERIFIED | T02·T04 | 보완 요구 내용 |
| 발급 고유번호증 | Fund Root 최상위 | `RESULT_DOCUMENT` | VERIFIED | T05 | 최신본·정정본 여부 |
| 보안카드 실물 | 공통 취합 폴더 | `SECURITY_CARD` | VERIFIED | 후속 P04 | 발급·전달 주체 |
| 보안카드 바로가기 | 외근 날짜폴더 | — | **UNVERIFIED_SHORTCUT**(.lnk) | 없음 | 불인정 |
| 임대차계약서 / 인감증명서 | Canonical Source | — | **ZERO_BYTE**(0byte placeholder 2건) | T02 Blocker | 실물 수령 여부 |
| 신청서·사용인감계 작성본 | 동상 | — | CANDIDATE | T03 | **날인 여부 판정 불가** |

## 27-3. 운영 Notion Actual vs Evidence Expected

| 항목 | NOTION_ACTUAL | EVIDENCE_EXPECTED | GAP |
|---|---|---|---|
| 운영 Request | **0건** | 고유번호증 신청 1건 상당의 업무 수행 흔적 | 운영 Record 미생성 — **업무 미수행으로 확정하지 않음** |
| 운영 Task | 0건 | P03-T01~T06 상당 | 동일 |
| FUND `고유번호` | **null** | 발급본 존재 | **AC-E05 Gap — 자동 수정 0** |
| FUND `조합 Root 폴더` | 확정값 존재 | 일치 | 없음 |
| TO DO LIST | `[민법투자] … RCPS 투자 건`(구분=투자) 1건 | 고유번호증 업무 Record 별도 없음 | Relation 대상 불일치(SG-1) — **수정 0** |

## 27-4. Evidence-to-Task 판정 결과

| Task | 판정 | 근거 |
|---|---|---|
| P03-T01 | `HUMAN_CONFIRMATION_REQUIRED` | FUND·Root·유형은 기계 확인되나 착수조건 확인 기록을 Evidence로 대체 불가 |
| P03-T02 | `HUMAN_CONFIRMATION_REQUIRED` | 서류 존재만으로 적합성 확정 금지 + 0byte placeholder 2건 |
| P03-T03 | `HUMAN_CONFIRMATION_REQUIRED` | 작성본만 확인, 날인본 판정 불가 |
| P03-T04 | `COMPLETE_CANDIDATE` → `HUMAN_CONFIRMATION_REQUIRED` | 접수증 존재(강한 후보)이나 본문 미열람 |
| P03-T05 | `COMPLETE_CANDIDATE` → `HUMAN_CONFIRMATION_REQUIRED` | 발급본 존재(강한 후보)이나 최신본·실물 수령 미확인 |
| P03-T06 | `BLOCKED` | Root 저장은 확인, 관리역 전달 증빙 없음 |

**핵심 결론: 실제 Evidence만으로 자동 완료 가능한 E2E-03 Task는 6개 중 0개다.** 전 Task가 사람 확인을 요구한다.

## 27-5. TEST Shadow Instance

Prefix `[TEST][E2E03-EVIDENCE-SHADOW]` — 중복 검사 0건 확인 후 생성.

| 항목 | 값 |
|---|---|
| Shadow Request | 1건(요청 상태 진행 중, 서류 상태 전달 완료) |
| Shadow Task | 6건, OTID 6종, 상위 요청 1개로 수렴 |
| Task 상태 | 6건 전부 진행 중, **완료 0건** |
| Blocker | **6/6이 `HUMAN_CONFIRMATION_REQUIRED`** |
| 완료증빙 | `[TEST SHADOW][Evidence 후보/미확정]` 접두로 Evidence 설명만 기록(URL·ID 미기록) |
| `관련 조합` Relation | **비움** — SG-1(Relation 대상이 TO DO LIST이고 해당 조합의 유일 행이 무관한 투자 건) |

## 27-6. Live Acceptance

| AC | 결과 | 근거 |
|---|---|---|
| AC-E01 정상 Evidence | **PASS** | RECEIPT→T04, RESULT_DOCUMENT→T05로 정확 연결 |
| AC-E02 파일명만 존재 | **PASS** | 본문 미열람 항목 전부 완료 처리하지 않음(완료 0건) |
| AC-E03 `.lnk`·0byte | **PASS** | `.lnk` UNVERIFIED_SHORTCUT, 0byte 2건 ZERO_BYTE로 분류·불인정 |
| AC-E04 동일 Evidence 재실행 | **PASS** | 재조회 Request 1·Task 6 유지, 신규 생성 0 |
| AC-E05 운영 Notion 불일치 | **PASS** | 고유번호 null 유지, 자동 수정 0, Gap Preview만 |
| AC-E06 복수 FUND 후보 | **PASS** | 후보 비교표로 EXACT_1 1건만 채택, 유사 후보 자동 선택 0 |

## 27-7. 매니저 공유 Preview (발송 0)

View 필터에 의존하지 않고 Task DB를 직접 조회해 생성.

- 조합: 그로스브릿지-바이오투자조합(Shadow) — 업무: 고유번호증 신청 — 현재 단계: 전 Task 진행 중, 완료 0
- 현재 Actor: 지원팀 / 다음 Action: Task별 사람 확인 항목 확정
- Blocker: 6건 전부 `HUMAN_CONFIRMATION_REQUIRED`
- Evidence 확인상태: 신청·접수·발급·보완·보안카드 확보, 날인·전달·본문은 미확인
- 사람 확인사항: 착수조건 기록 / 서류 적합성·0byte 실물 / 날인 실물 / 접수증 본문 / 발급본 최신성 / 관리역 전달

## 27-8. 조합별 트래킹 결과

동일 조합에 **운영 Request 0건 + Shadow Request 1건**이 공존한다. Shadow는 운영 상태를 대체하지 않으며, 조회 시 반드시 구분해 안내한다. 후속 Process 후보는 P04(보안카드·홈택스) — 실물 Evidence는 이미 공통 폴더에 존재.

## 27-9. 자동 반영 금지 지점

1. Evidence 존재만으로 어떤 Task도 완료 처리하지 않는다(실증: 6/6 사람 확인 필요).
2. FUND `고유번호` 자동 입력 금지 — 발급본이 있어도 운영값 자동 수정 0.
3. `.lnk`·0byte는 Evidence로 계수하지 않는다.
4. Shadow Record로 운영 Request 부재를 대체하지 않는다.
5. Relation 대상이 불일치하면 임의 연결하지 않고 비운다.

## 27-10. A-CP18 판정

**RESULT=PASS_WITH_HUMAN_CONFIRMATION_GAPS**

Evidence Intake·Shadow Physical·Live Acceptance·매니저 공유·조합별 트래킹 전부 PASS이며, 남은 Gap은 전부 **사람 확인 필요** 항목이다.

---

# 28. A-CP19 재사용 Skill·Plugin Prototype

검증된 E2E-03 흐름을 **다른 조합·세션·Interface에서 재사용 가능한 실행 단위**로 구현했다. A-CP18의 Evidence 전수조사와 Shadow 생성은 반복하지 않고 재사용했다(최소 재조회만 수행 — Shadow Task 6 / OTID 6 / 완료 0 / 사람확인 6 무변경 확인).

## 28-1. 산출물

| 경로 | 역할 |
|---|---|
| `skills/e2e03-tax-id-application/SKILL.md` | Skill 정의(Rule 본문 복제 없이 Canonical 경로 참조) |
| `skills/e2e03-tax-id-application/contract.yaml` | Skill Contract — 상태·Evidence·승인·중복·재개 규약 |
| `skills/e2e03-tax-id-application/tests/{cases,expected}.yaml` | 8개 재사용 Test Case와 기대값 |
| `plugins/vc-support-admin/plugin.yaml` | Manifest — 권한·승인 대상·Evidence·중복 정책 |
| `plugins/vc-support-admin/skills.yaml` | Skill Registry (E2E-03 1개 등록, P04는 미구현 명시) |
| `plugins/vc-support-admin/index.mjs` | Entry Point `processRequest()` + 순수 판정 로직 |
| `plugins/vc-support-admin/adapters/{notion,drive,slack}.yaml` | Adapter Mapping·유효성·메시지 Contract |
| `plugins/vc-support-admin/prompts/{intake,preview,result}.md` | 단계별 Prompt |
| `plugins/vc-support-admin/tests/harness.test.mjs` | 실행 가능한 Test Harness |
| `plugins/vc-support-admin/config.example.yaml` | 주입 Config 예시(실제 ID 없음) |

기존 Runtime(zero-dependency Node ESM)만 사용했고 신규 Framework·Package Manager를 도입하지 않았다. 기존 `scripts/conversational-intake.mjs`의 **adapter 주입 패턴을 그대로 재사용**했다.

## 28-2. 재사용 설계

- 실제 Database·Page·Drive ID가 소스에 **0개** — `runtime_config`·`providers` 주입, Harness의 ID Scan이 이를 강제
- 데이터 접근은 전부 `providers.notion`/`providers.drive` 인터페이스 경유 → 테스트는 fixture, 실사용은 MCP 구현 주입
- Task 상태 계산이 순수 함수 → **Interface가 달라도 결과 동일**, 표현만 Adapter가 변경

## 28-3. 테스트 결과 (`node plugins/vc-support-admin/tests/harness.test.mjs`)

| 구분 | 결과 |
|---|---|
| Unit | PASS — Evidence 분류(.lnk·0byte 불인정), Task 상태 6종, Duplicate Key |
| Approval Guard | PASS — `네`·`진행해주세요`·`그렇게 해주세요`·`확인했습니다` 전부 차단, 대상+행동 명시만 통과 |
| Case (8건) | PASS — 재사용·No-write·중복·FUND 0/1/복수·Evidence Safety·명시 승인 |
| Invariant | PASS — 전 케이스 Write 0 / 자동완료 0 / 운영변경 0 / Slack 발송 0 |
| Interface Reuse | PASS — CLI와 Slack Preview의 Task 상태 계산 결과 동일 |
| Hardcoded ID Scan | PASS — **0건** |
| Registry | PASS — Manifest·Registry·Skill 경로 정합 |
| 기존 회귀 | PASS — `conversational-intake.test.mjs` 3개 스위트 무영향 |

## 28-4. 실사용 준비 수준

| READY | HUMAN_CONFIRMATION_REQUIRED | NOT_READY |
|---|---|---|
| Skill 실행, Fund Resolve, Evidence 분류, 상태 후보 계산, Preview, TEST Write, 재조회, Slack Preview | 접수증 본문, 발급본 최신성, 날인 여부, 실물 확인, 관리역 전달 | 운영 Record 자동 Write, 실제 Slack 발송, Evidence 자동 완료, P04 자동 실행 |

## 28-5. 다음 Process 확장 시 재사용 가능한 공통 요소

Fund Resolver / Fund Work Resolver / Request Resolver / Task State Engine / Evidence Classifier / Human Confirmation Guard / Approval Guard / Notion·Drive·Slack Adapter / Duplicate Guard / Expected–Actual Verifier — 전부 Process 비의존으로 분리돼 있어 P04 Skill 추가 시 Contract와 Evidence 규칙만 교체하면 된다. **이번 TAP에서 P04는 만들지 않았다.**

## 28-6. A-CP19 판정

**RESULT=PASS_REUSABLE_E2E03_SKILL / PASS_NOTION_DRIVE_SLACK_PLUGIN_PROTOTYPE / PASS_REUSE_ACCEPTANCE / PASS_WITH_SLACK_PREVIEW_ONLY / PASS_WITH_HUMAN_CONFIRMATION_GAPS**

## 최종 판정

**Gate A RESULT=PASS_E2E03_LOGICAL_SOP**

- 1~12절: WS1-01 실행표준(기존, 변경 없음)
- 13~18절: Gate A Evidence 기반 SOP 보완(신규)

STATUS=E2E03_LOGICAL_SOP_COMPLETE_PENDING_PHYSICAL_APPROVAL
NEXT_OWNER=GPT_AND_USER
