# 구현 계획

## 단일 목적

v0.4.2까지의 Contract·API·검증 자산을 유지한 채, View 계층만 화면 A·B·C + Drawer D로
다시 만들어 지원팀 담당자가 "지금 할 일"을 첫 화면에서 판단하게 한다.

## Branch 결정

| 항목 | 값 |
|---|---|
| NEW_BRANCH | `agent/superpowers/admin-console-product-refoundation` |
| BASE | `a3e78a91fc3c8d7935551e4d5bb7b5c0db2331c4` (v0.4.2) |
| WORKTREE | `workspaces/orca_automation/agent-superpowers-admin-console-product-refoundation` |

선택 근거:

1. **Notion Read 스냅샷과 Gap Analysis가 필요한데 Integration에는 없다.** `notion-readiness-snapshot.mjs`는 `2f60b9b`, gap resolution은 `a3e78a9`에서 생겼다
2. **Merge 가능성 유지.** v0.4.2는 Integration 대비 3 ahead / **0 behind**. 되돌려 병합할 때 충돌 없음
3. **UI Legacy 위험은 경로 분리로 관리.** 기존 `public/index.html`을 수정하지 않고 새 경로에 만든다. 파일이 존재하는 것과 Baseline으로 삼는 것은 다르다
4. Integration을 base로 하면 스냅샷 cherry-pick이 필요해 이력이 지저분해진다

기존 Branch는 삭제하지 않는다. Force Push·History Rewrite·main 직접 Commit 금지.

## 범위 계층

| 계층 | 내용 |
|---|---|
| Conceptual | 화면 A·B·C + Drawer D, 한 화면 한 결정 |
| Logical | 기존 API 9개 그대로. View 조립만 재구성 |
| Physical | 새 View 경로 + `business-decision-view.mjs` 확장 + 스냅샷 재생성 |
| Live | Read-only Notion 재조회 1회 (스냅샷 갱신용) |

## 선행 작업 — 스냅샷 재생성

**이걸 먼저 하지 않으면 나머지가 낡은 값 위에 쌓인다.**

`notion-readiness-snapshot.mjs`는 현재 사실과 어긋난다 (`existing-artifact-reuse-matrix.md` 참조).
Read-only 재조회로 다음을 갱신한다.

- Request DB 속성 13개 (기존 기재 9개)
- Task DB 속성 18개 (기존 기재 14개)
- 전용 `Transaction ID` 존재 반영
- `하위 Task` ↔ `상위 요청` 양방향 반영
- Blocking Gap 재산정 (2건 → Dummy Fund 1건 예상)

Notion Write 0. Read만.

## Commit 구조 (4개)

| # | 내용 | Gate |
|---|---|---|
| 1 | Product·UX Contract 문서 8종 + 스냅샷 재생성 | 테스트 22 PASS 유지 |
| 2 | Clickable Prototype (화면 A·B·C·D, Write 0) | UX Test + Interaction Test |
| 3 | Contract 통합 + Browser E2E | E2E PASS, Error 0 |
| 4 | Acceptance 보완 (30건 UX Validation, 산출물 7종) | Visible Artifact Gate |

작은 TAP·Commit·PR을 과도하게 쪼개지 않는다.

## 기술 선택

| 항목 | 결정 | 근거 |
|---|---|---|
| Framework | **도입하지 않음** | 화면 4개·요청 3건 규모. 기존 vanilla JS 430줄로 충분 |
| 외부 CDN | **금지** | 독립 HTML이 오프라인 동작해야 함 |
| 서버 | 기존 `admin-process-console-server.mjs` 유지 | API 9개 그대로 |
| 독립 HTML | 기존 generate 스크립트 3개를 1개로 통합 | 버전마다 스크립트가 늘어나는 구조를 끊음 |

## 테스트 순서 (TDD)

1. UX Test 30건 — 실패 상태로 먼저 작성
2. Interaction Test 10건 — v0.3 회귀 4건 포함
3. Safety Test 7건
4. Notion Preview Test 6건
5. 구현
6. Browser E2E
7. Visible Artifact 생성

## 승인 지점

| 지점 | 필요 승인 |
|---|---|
| 스냅샷 재생성 (Read-only) | 불필요 |
| Prototype 구현 | 불필요 |
| Feature Branch Commit·Push | 불필요 |
| Dummy Fund Record 생성 | **필요** |
| 실제 TEST Write | **필요** — `APPROVE_NOTION_TEST_WRITE` |
| Integration Merge | **필요** |
| main Merge | **필요** |

## 금지 범위

Notion Create·Update·Delete · Schema 변경 · Property 생성 · Dummy Fund Record 생성 ·
운영 데이터 사용 · 미구현 Scenario 3건 확대 · 범용 자연어 Parser · Integration Merge ·
main Merge · 외부 배포 · RAG 등록 · 기존 Branch 삭제

## 완료조건

Acceptance A~F 전항목 PASS + 산출물 7종 존재 + Notion Write 0 + Merge 0.

## 중단조건

- Base SHA 드리프트
- 설명되지 않은 Working Tree 변경
- 승인 없이 Write가 필요한 상황
- 테스트 22건 중 신규 실패 발생

## 다음 Owner

사용자 (제품 목표 확인 3개 항목) → 이후 구현 세션.
