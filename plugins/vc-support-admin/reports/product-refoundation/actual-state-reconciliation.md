# Actual State Reconciliation — Repository·Superpowers·Notion

TAP: `A-CP25-H00-SUPERPOWERS-REPOSITORY-RELOCATION-AND-STATE-RECONCILIATION`
조회 시각: 2026-08-03 11:48~12:0x KST
BASE: `54a7c6382df341eacc037c5a1300561cb01765d7`
MODE: Read-only 재조회. Notion Write 0 · Schema 변경 0 · Merge 0.

사실은 **OBSERVED**, 해석은 **INFERRED**, 제안은 **PROPOSED**로 구분한다.
이전 세션의 보고서는 그 시점의 증거이지, 현재 외부 상태의 증명이 아니다.

---

## 1. Repository Relocation — 전환 불필요 (이미 대상 저장소)

**OBSERVED**

| 항목 | 값 |
|---|---|
| Workspace Path | `C:\Users\MIR-NOT-XXX-000\orca\vc-support_team-process-rag` |
| `git rev-parse --show-toplevel` | `C:/Users/MIR-NOT-XXX-000/orca/vc-support_team-process-rag` |
| Remote | `https://github.com/sjjeong-tech/vc-support_team-process-rag` |
| 조회 시점 Branch / HEAD | `main` / `f25161c9abf467beba1d3c7a7648a12131ca6b5a` (= `origin/main`) |
| Worktree Status | clean (`git status --porcelain` 무출력) |
| `git worktree list` | 단일 worktree |

TAP의 전제(`CURRENT_PROJECT_REPORTED=lab-plugin-01-2-softpowers`)는 **이 세션에는 해당하지
않는다.** Git Root·Remote·Branch가 모두 대상 저장소를 가리키므로 Phase 2·3의 Clone·전환은
수행하지 않았다.

### 1.1 동일 Remote를 가리키는 다른 Local Clone

**OBSERVED** — 모두 clean, 모두 같은 remote.

| 경로 | Branch | HEAD |
|---|---|---|
| `orca\vc-support_team-process-rag` | `main` | `f25161c` |
| `orca\vc-support_team-process-rag-evidence-integration-clean` | `agent/codex/evidence-integration-clean` | `88c6c53` |
| `orca\vc-support_team-process-rag-evidence-state-mvp` | `agent/codex/evidence-state-mvp` | `2814ce0` |
| `orca\vc-support_team-process-rag-notion-gap-preview-v042` | `agent/orca/notion-blocking-gap-preview-v042` | `a3e78a9` |

**INFERRED** — 4개는 Git worktree가 아니라 독립 Clone이다. 커밋이 흩어질 위험이 있으나
현재 모두 clean이므로 미반영 작업 손실은 없다.

### 1.2 Branch 위치

**OBSERVED**

- `origin/agent/superpowers/admin-console-product-refoundation` = `54a7c63`, `origin/main` 대비 **42 commit ahead**. 실질 tip.
- `main`에는 `plugins/vc-support-admin/` 파일이 **0개**. 콘솔·Plugin 산출물 150개는 전부 위 branch에만 있다.
- WS3 Notion write 기록 commit `88aa2697`은 여전히 `main`에 없다 (reconciliation preview의 HOLD 결정과 일치).

---

## 2. Superpowers — 이 저장소에서 사용 불가

**OBSERVED**

| 항목 | 값 |
|---|---|
| SUPERPOWERS_INSTALL_LOCATION | `C:\Users\MIR-NOT-XXX-000\.claude\plugins\cache\claude-plugins-official\superpowers\6.2.0` |
| SUPERPOWERS_SCOPE | **project** — `projectPath: C:\Users\...\orca\agent-lab-plungin-01-softpowers` |
| 활성화 파일 | `agent-lab-plungin-01-softpowers\.claude\settings.json` → `{"enabledPlugins":{"superpowers@claude-plugins-official":true}}` |
| 사용자 전역 `~/.claude/settings.json` | `enabledPlugins`에 `mira-common@mira-skills`만 존재 |
| 현재 저장소 `.claude/` | **없음** (프로젝트 설정 부재) |
| 캐시 내 Skill 14종 | brainstorming · writing-plans · systematic-debugging · test-driven-development · verification-before-completion · executing-plans · using-superpowers 외 7종 존재 |
| 현재 세션 Skill 목록 | 위 5종 **모두 미노출** |

**판정: SUPERPOWERS_READY=NO.** 파일은 디스크에 있으나 이 프로젝트에서 활성화되어 있지
않다. 프롬프트에 이름이 적혀 있다는 이유로 설치됐다고 판정하지 않았다.

또한 TAP이 지목한 `lab-plugin-01-2-softpowers`가 아니라 **철자가 다른 별도 저장소
`agent-lab-plungin-01-softpowers`**에 활성화되어 있다. 두 디렉터리 모두 로컬에 존재한다.

### 2.1 Remediation Preview (미승인 · 미실행)

캐시는 사용자 레벨 공유 경로이므로 **`lab-plugin` 저장소에서 파일을 복사할 필요가 없다.**
설정 한 줄만 추가하면 된다. 아래는 Preview이며 실행하지 않았다.

- 안 A (권장) — 현재 저장소에 `.claude/settings.local.json` 생성 (git 미추적):
  `{"enabledPlugins":{"superpowers@claude-plugins-official":true}}`
  영향 범위가 이 저장소로 한정된다.
- 안 B — `~/.claude/settings.json`의 `enabledPlugins`에 동일 키 추가.
  전 프로젝트에 적용되므로 다른 작업에도 Skill이 노출된다.

두 안 모두 **세션 재시작 필요**(`SESSION_RESTART_REQUIRED=YES`).

---

## 3. Notion Actual State — Read-only 재조회

대상 3개 Data Source. 셋 다 이름이 `[TEST LAB]`로 시작하는 **테스트 전용 DB**다.

| 이름 | Data Source ID |
|---|---|
| `[TEST LAB] 지원팀 업무요청` (Request) | `2f564502-66aa-41d8-b95f-55d7b03d5f91` |
| `[TEST LAB] 지원팀 Task` (Task) | `1d06db48-32b8-49d7-b4bb-27e822df87a1` |
| `[TEST LAB] TO DO LIST (FUND)` | `3526c8ab-b9b0-4c39-bcdd-1a60d3c4b988` |

### 3.1 Transaction ID Property — 존재 확인

**OBSERVED**

| DB | Property | Type |
|---|---|---|
| Request | `Transaction ID` | `text` (rich_text) |
| Task | `Transaction ID` | `text` (rich_text) |

사용자가 말한 "번호표"에 대응하는 **별도 Property는 없다.** `Transaction ID` 하나뿐이며
`unique_id`·`formula`가 아닌 **평문 text**다.

**INFERRED** — 자동 채번 기능이 없다. 값은 매번 외부에서 계산해 써야 하고, 중복 방지도
DB가 보장하지 않는다. "번호표"라는 표현이 자동 순번을 뜻했다면 현재 구현은 그 의미와 다르다.

### 3.2 양방향 Relation — 확인

**OBSERVED**

- Task `상위 요청` → `collection://2f564502-…`, partner property `QD8-Ww`
- Request `하위 Task` → `collection://1d06db48-…`, partner property `dEo8XA`
- 두 Property가 서로를 상호 참조 → **dual property(양방향) relation 성립**

### 3.3 Record 실측 — Property는 있으나 값이 하나도 없다

**OBSERVED**

| 항목 | Request DB | Task DB |
|---|---:|---:|
| 전체 Record | 9 | 24 |
| `LAB 여부 = YES` | 9 | 24 |
| `Transaction ID` 값 보유 | **0** | **0** |
| 상대편 Relation 연결 보유 | `하위 Task` **0** | `상위 요청` **0** |
| 최초 생성 | 2026-07-28 13:32:35Z | 2026-07-28 13:40:44Z |
| 최종 생성 | 2026-07-29 05:09:47Z | 2026-07-29 05:10:06Z |

Page 단위 교차 확인 — `[TEST LAB] 그로스브릿지-바이오투자조합 — 고유번호증 신청`
(`3ac72a41-d9d7-81df-b3ab-d2a5ade94d61`): `"Transaction ID": ""`, `하위 Task` 미출력(빈 관계),
`FUND 업무`는 1건 연결됨.

**이것이 이번 재조회의 핵심 발견이다.** Schema 층은 바뀌었지만 Data 층은 그대로다.
양방향 relation과 Transaction ID는 **껍데기만 존재하고 어떤 Record도 쓰지 않았다.**

### 3.4 Dummy Fund

**OBSERVED** — Request 1건이 `[TEST LAB] TO DO LIST (FUND)`의 Record
`3ac72a41-d9d7-8113-bad1-d5973c6c17b6`에 연결되어 있다.
**[미확인]** — 이것이 v0.4.2 Gap Analysis가 말한 "Dummy Fund"와 동일 Record인지는
Gap Analysis 원본과 대조하지 않아 확정할 수 없다.

### 3.5 확인하지 못한 것

| 항목 | 사유 |
|---|---|
| Property 생성 시각 | Notion MCP가 schema 변경 이력을 제공하지 않음 |
| 변경 Actor | 동일 |
| Rollback 가능 여부 | Property 삭제는 값 손실을 동반. 현재 값이 0건이므로 데이터 손실은 없으나, 삭제 자체가 승인 대상 |
| 운영(비-LAB) 쌍둥이 DB 존재 여부 | Query Data Source 사용량 한도 도달로 추가 조회 중단 |

---

## 4. Expected–Actual 표

| Requirement | Previous Assumption | Actual | Evidence | Result | Open Gap |
|---|---|---|---|---|---|
| Transaction ID Property | H01 TAP: 미승인·미생성 / 직전 세션 보고서: 양쪽 DB 생성됨 | 양쪽 DB에 `text` 타입으로 **존재** | data-source schema | MATCH (직전 보고서 기준) | 자동 채번 아님 |
| 번호표 Property | 별도 Property로 생성됐다고 추정 | **별도 Property 없음.** `Transaction ID` 하나로 통합 | data-source schema | MISMATCH | 사용자 의도가 자동 순번이었는지 확인 필요 |
| Request–Task Relation | Task→Request 단방향 | `상위 요청` ↔ `하위 Task` | partner propertyUrl 상호 참조 | MATCH | — |
| 양방향 Relation | 직전 세션에 dual 전환됨 | **dual 확인** | 동일 | MATCH | — |
| Relation 실제 연결 | E2E-03 검증에서 Request–Task가 연결됐다고 전제 | **0건 / 33 Record 전부 미연결** | SQL 집계 + page fetch | MISMATCH | 아래 G-A |
| Transaction ID 값 | 번호표가 "만들어졌다"고 전제 | **0건** | SQL 집계 + page fetch | MISMATCH | 아래 G-B |
| Dummy Fund Record | Blocking Gap 잔존 | FUND Record 1건 연결됨 | page properties | PARTIAL | 동일 Record 여부 [미확인] |
| Schema 변경 범위 | Property 2 + Relation 1 | 그 외 예상 밖 변경 관측 없음 | schema 전수 조회 | MATCH | — |
| TEST Record | TEST 범위 | Request 9 / Task 24, **전부 `LAB 여부=YES`** | SQL 집계 | MATCH | — |
| 운영 Record 영향 | 없음 | DB 3종 모두 `[TEST LAB]` 접두. 운영 Record 변경 관측 **0** | DB title + LAB 집계 | MATCH | 운영 쌍둥이 DB 존재 여부 [미확인] |
| Duplicate Query | Transaction ID 기반 중복조회 가능 | 값이 0건이라 **현재 동작 불가** | 3.3 | MISMATCH | 아래 G-C |
| Notion Write Count (직전 세션 54a7c63) | 0 | commit 메시지 "Notion write 0" 및 코드 변경 0과 일치 | `git show 54a7c63` | MATCH | 실제 write는 그 이전 대화 세션. Git 기록 없음 |

---

## 5. 변경 영향 분류

### ACCEPT_AS_EXISTING_ACTUAL

- 양방향 Relation (`상위 요청` ↔ `하위 Task`) — 사용자 지시와 일치, TEST 범위, 운영 영향 없음.
- TEST 범위 격리 — 3개 DB 전부 `[TEST LAB]`, Record 33건 전부 `LAB 여부=YES`.

### ACCEPT_WITH_REVIEW

- `Transaction ID` Property (양쪽 DB, `text`) — 생성 자체는 지시와 일치하나
  "번호표"가 자동 채번을 뜻했다면 type이 맞지 않는다. **확인 1**의 대상.

### REMEDIATION_REQUIRED

- **G-A** Relation 연결 0건. 구조는 생겼는데 33개 Record 중 어느 것도 연결되지 않았다.
  `providers/notion.mjs`의 `find_tasks_by_request`는 `상위 요청` LIKE 매칭인데 값이 전부
  NULL이므로 **에러 없이 0건을 반환한다.** 조용한 오답 경로가 실제로 열려 있다.
- **G-B** Transaction ID 값 0건. 번호표가 "만들어졌다"는 이해와 실제가 다르다.
- **G-C** 중복 조회가 Transaction ID에 의존하는데 키 값이 없어 현재 판정 불가.

G-A~G-C 해소는 Record Write를 수반하므로 **이번 TAP 범위 밖**이다.

### ROLLBACK_REVIEW_REQUIRED

- 해당 없음. 값이 0건이라 유지해도 데이터 오염이 없고, 되돌릴 데이터도 없다.

---

## 6. 기존 산출물 인벤토리

`existing-artifact-reuse-matrix.md`(동일 branch)를 그대로 승계한다. 이번 재조회로 바뀐 것:

| 항목 | 직전 판정 | 이번 재조회 후 |
|---|---|---|
| `notion-readiness-snapshot.mjs` | REFACTOR (스냅샷 낡음) | **유지 + 사유 추가** — Property 존재뿐 아니라 **값 0건**까지 스냅샷에 담아야 한다 |
| `*-gap-analysis.json` | ARCHIVE | **유지** — 단, 신규 Gap은 2건이 아니라 G-A·G-B·G-C 3건 |
| `providers/notion.mjs` | REFACTOR (LIKE 우회 제거) | **상향** — 양방향이 생겼어도 값이 없으므로 지금 교체하면 여전히 0건. 데이터 채움이 선행돼야 한다 |
| Duplicate Preview | REUSE_WITH_ADAPTER | **보류** — 키가 비어 있어 재사용 전 재설계 필요 |

`UI_BASELINE=NONE` 유지. v0.4.2 Layout·좌상단 DB 중심 정보구조·단일 장문 화면은 폐기.

---

## 7. Open Gaps

| ID | 내용 | 심각도 | 소유 |
|---|---|---|---|
| G-A | Request–Task Relation 실제 연결 0건 | HIGH | 사용자 승인 후 Write |
| G-B | Transaction ID 값 0건 (번호표 미발급) | HIGH | 사용자 승인 후 Write |
| G-C | 중복 조회 키 부재로 판정 불가 | HIGH | G-B 의존 |
| G-D | Superpowers가 이 저장소에서 비활성 | MEDIUM | 사용자 승인 후 설정 |
| G-E | 콘솔 산출물 150개가 `main`에 없음 (42 commit 미merge) | MEDIUM | Integration 승인 |
| G-F | 동일 remote Local Clone 4개 분산 | LOW | 정리 시점 사용자 판단 |
| G-G | 운영(비-LAB) 쌍둥이 DB 존재 여부 미확인 | MEDIUM | 사용량 한도 회복 후 재조회 |
| G-H | Property 생성 시각·Actor·Rollback 이력 확인 불가 | LOW | Notion MCP 한계 |

---

## 8. 사용자 확인 필요 3건

본문 응답 참조. 요약:

1. `Transaction ID` 텍스트 Property를 그대로 둘 것인가, 자동 채번으로 바꿀 것인가 —
   PROPOSED: 현행 유지(B안, 값 생성 규칙만 별도 확정)
2. 1차 핵심 사용자 — PROPOSED: 지원팀 담당자
3. 첫 화면의 핵심 역할 — PROPOSED: 현재 실행 Task

---

## 9. 이번 TAP의 쓰기 집계

| 항목 | 값 |
|---|---|
| Notion Read 시도 | 10 (data source fetch 3 · SQL 5 · search 1 · page fetch 1) |
| Notion Read 성공 | 8 |
| Notion Read 실패 | 2 (multi-source 쿼리 Enterprise 미보유 1 · Query Data Source 사용량 한도 1) |
| Notion Write | **0** |
| 운영 Record 변경 | **0** |
| Schema 변경 | **0** |
| Integration Merge | **0** |
| main Merge | **0** |
