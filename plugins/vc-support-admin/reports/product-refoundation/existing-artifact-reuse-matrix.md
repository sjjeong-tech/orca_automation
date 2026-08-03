# 기존 산출물 재사용 Matrix

BASE: `a3e78a91fc3c8d7935551e4d5bb7b5c0db2331c4`
테스트 실측: **22개 스위트 / 22 PASS / 0 FAIL**

## 분류

| Component | 경로 | 판정 | 근거 |
|---|---|---|---|
| Skill Kernel | `kernel/` | REUSE_AS_IS | Contract 구현체. UI와 무관 |
| CLI | `cli/admin-process-prototype-replay.mjs` | REUSE_AS_IS | 진입점 변경 없음 |
| Fixture 8종 | `fixtures/` | REUSE_AS_IS | Scenario 3건 입력. 변경 불필요 |
| Notion Read Adapter | `providers/notion.mjs` | **REFACTOR** | 아래 별도 항목 |
| Console Server | `console/admin-process-console-server.mjs` (765줄) | REUSE_WITH_ADAPTER | API 9개 유지, View 조립부만 분리 |
| API 9개 | `/api/preview` 외 8 | REUSE_AS_IS | 데이터 계약 충분. 신규 API 불필요 |
| business-decision-view | `console/business-decision-view.mjs` (231줄) | REUSE_WITH_ADAPTER | 사용자 언어 변환 로직. 화면 A·B에 재사용 |
| notion-readiness-snapshot | `console/notion-readiness-snapshot.mjs` (91줄) | **REFACTOR** | 아래 별도 항목 |
| notion-gap-resolution-preview | `console/notion-gap-resolution-preview.mjs` (89줄) | REUSE_WITH_ADAPTER | Gap 목록 → 화면 B 상단 |
| index.html | `console/public/index.html` (100줄, 패널 20개) | **REJECT** | 단일 장문 구조 자체가 문제 |
| console.js | `console/public/console.js` (430줄) | REFACTOR | 렌더 함수는 재사용, 페이지 조립은 폐기 |
| console.css | `console/public/console.css` (210줄) | REUSE_WITH_ADAPTER | 토큰·컴포넌트 스타일 유지, Layout 규칙 교체 |
| Request Inbox 3건 선택 | console.js | REUSE_AS_IS | 회귀 이력 있음. 그대로 가져간다 |
| selectedRequestId 단일 상태 | console.js | REUSE_AS_IS | v0.3 회귀 방지 장치 |
| 비동기 sequence guard | console.js | REUSE_AS_IS | v0.3 회귀 방지 장치 |
| 승인 상태 Request별 격리 | console.js | REUSE_AS_IS | v0.3 회귀 방지 장치 |
| Event Delegation | console.js | REUSE_AS_IS | v0.3 회귀 방지 장치 |
| Kanban | console.js | REFACTOR | 기본 접힘 + 빈 Column 축약 |
| Current Action Panel | console.js | REFACTOR | 화면 A 최상단 승격, 3영역 분리 |
| Timeline | console.js | REUSE_WITH_ADAPTER | 화면 A 하단 |
| Evidence Panel | console.js | **REFACTOR** | 질문 6 미검증. 부족 사유 표시 추가 |
| Mapping Preview | console.js | REUSE_WITH_ADAPTER | 화면 D로 이동 |
| Approval Simulation | server + console.js | REUSE_WITH_ADAPTER | 화면 B |
| Duplicate Preview | server | REUSE_WITH_ADAPTER | 화면 B |
| Fund Relation Preview | server | REUSE_WITH_ADAPTER | 화면 B |
| Static HTML Export | `generate-v04*-console-artifacts.mjs` ×3 | REFACTOR | 3개로 갈라진 것을 1개로 통합 |
| Headless Screenshot | 동일 | REUSE_AS_IS | Chrome Headless 경로 검증됨 |
| Browser E2E | `tests/admin-process-console.browser.e2e.test.mjs` | REUSE_WITH_ADAPTER | 선택자 갱신 필요, 시나리오는 유지 |
| Security Test | `tests/security.test.mjs` | REUSE_AS_IS | UI 무관 |
| Regression Test | `tests/*.test.mjs` 22종 | REUSE_AS_IS | 전건 통과 상태 유지 |
| Raw JSON | output.json 각 버전 | EVIDENCE_ONLY | 비교 기준 |
| v0.1~v0.4.2 HTML·PNG | `reports/console-pilot/` | EVIDENCE_ONLY | 이력 보존. 삭제하지 않음 |
| v0.4.2 Layout | index.html 구조 | **REJECT** | UI_BASELINE=NONE |
| v0.4.1 UX Validation | `*-ux-validation.json` | REUSE_WITH_ADAPTER | 질문 7개 → 10개로 확장 |
| v0.4.2 Gap Analysis | `*-gap-analysis.json` | **ARCHIVE** | 아래 별도 항목 — 현실과 어긋남 |

## 별도 항목 — Notion 실측값이 저장소보다 낡았다

이 TAP 작성 시점 이후, **직전 세션에서 사용자 지시로 Notion 스키마가 실제로 변경됐다.**

| 변경 | 대상 | 시점 |
|---|---|---|
| `Transaction ID` (text) 추가 | Request DB `2f564502-…` | 직전 세션 |
| `Transaction ID` (text) 추가 | Task DB `1d06db48-…` | 직전 세션 |
| `상위 요청` 단방향 → 양방향 | Task DB | 직전 세션 |
| `하위 Task` relation 자동 생성 | Request DB | 직전 세션 |

따라서 저장소의 아래 값은 **더 이상 사실이 아니다.**

| 파일 | 낡은 주장 | 실제 |
|---|---|---|
| `notion-readiness-snapshot.mjs` | 전용 Transaction ID Property 없음 | **있음 (양쪽 DB)** |
| `notion-readiness-snapshot.mjs` | Request DB `unavailable_required_fields`에 `Task Relation` | **`하위 Task`로 해소** |
| `notion-readiness-snapshot.mjs` | Task DB 속성 14개 | 실제 18개 (`테스트 케이스 ID`·`관련 조합`·`목표일`·`FUND 업무` 누락 기재) |
| `notion-readiness-snapshot.mjs` | Request DB 속성 9개 | 실제 13개 (`요청자`·`담당 관리역`·`목표일`·`관련 조합` 누락 기재) |
| `*-gap-analysis.json` | Blocking Gap 2건 | Transaction Gap 해소, **Dummy Fund Gap 1건만 잔존** |

**조치:** 스냅샷을 다시 떠야 한다. `REFACTOR` 판정 이유가 이것이다.
Gap Analysis는 `ARCHIVE`(이력 보존)하고 새로 생성한다.

## 별도 항목 — providers/notion.mjs REFACTOR 사유

`find_tasks_by_request` (119~125행)가 Request→Task 역참조를 relation 필드의
**부분 문자열 LIKE 매칭**으로 한다.

```js
const token = (raw.split("/").filter(Boolean).pop() ?? raw).replace(/-/g, "").replace(/'/g, "''");
const q = `... WHERE replace("상위 요청", '-', '') LIKE '%${token}%' ...`;
```

문제:

1. URL을 넘기면 제목 slug가 섞여 매칭 실패 → **에러가 아니라 0건**으로 조용히 틀림
2. token 길이 검증 없음 → 짧은 토큰이면 광범위 오탐
3. `%`·`_` 와일드카드 미이스케이프 (98·104·110행도 동일)

**양방향 relation이 생겼으므로 이 우회는 불필요하다.** Request의 `하위 Task`를 직접 읽으면
1·2가 구조적으로 사라진다. 3은 별개 사안으로 남는다.
