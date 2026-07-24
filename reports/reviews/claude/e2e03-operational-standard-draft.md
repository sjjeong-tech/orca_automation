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

## 최종 판정

**RESULT=PASS_OPERATIONAL_STANDARD_DRAFT**

STATUS=E2E03_OPERATIONAL_STANDARD_INTEGRATED
NEXT_OWNER=GPT_AND_USER
