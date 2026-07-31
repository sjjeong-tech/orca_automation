# Request–Task Console v0.3.1 — Interaction Repair Demo

## Repair scope

v0.3의 초기 화면 캡처와 정적 Output은 보존합니다. 이번 보정은 Inbox 선택 시 Request·Task·Mapping·승인 Preview가 같이 전환되도록 한정합니다. Notion API, Notion DB, 운영 Record에는 쓰지 않습니다.

- Local backend: `LOCAL_PREVIEW`
- Notion backend: `NOT_CONNECTED`
- Notion write / operational write: `0`
- Persistent-store duplicate observation: `NOT_RUN`

## User-reported regression and repair

v0.3의 `VISIBLE_ARTIFACT_GATE=PASS`는 초기 렌더링만 확인한 결과로 사후 재분류했습니다.

- `INTERACTION_VALIDATION=INVALIDATED_BY_USER_REPRODUCTION`
- `VISIBLE_ARTIFACT_GATE=PARTIAL_INITIAL_RENDER_ONLY`

원인은 세 가지였습니다. 자연어 Preview용 기본 요청문이 공개 Demo 목록에서 빠져 초기 `REQ-DEMO-001` Preview가 `REQUEST_TEXT_REQUIRED`로 중단됐고, 기존 독립 HTML에는 Inbox 선택 이벤트가 없었으며, 서버는 이전 비동기 응답을 폐기하지 않았습니다. v0.3.1은 `selectedRequestId`와 선택 순번을 단일 상태로 사용해 이 응답을 폐기하고, Request 전환 시 Mapping/승인 상태를 `NOT_REVIEWED`로 초기화합니다.

## Interactive mode

```powershell
node plugins/vc-support-admin/console/admin-process-console-server.mjs
```

브라우저에서 출력된 `http://127.0.0.1:<port>` 주소를 열고 좌측 Inbox의 세 Request를 순서대로 클릭합니다.

1. `REQ-DEMO-001` — `DUMMY-FUND-B`, `SINGLE-P03-02`, 사람 확인·중단
2. `REQ-DEMO-002` — `DUMMY-FUND-A`, `SINGLE-P03-01`, 완료 후보(완료 허용 아님)
3. `REQ-DEMO-003` — `DUMMY-FUND-E`, `COMPOSITE-01`, P03·P04 보존 및 P07만 중단

## Static mode

`request-task-console-v0.3.1.html`을 직접 열어도 동일한 Inbox 선택 동작을 확인할 수 있습니다. Static mode는 검증된 Fixture Snapshot을 표시하며 Skill을 다시 실행하지 않습니다.

## Verification points

1. Request ID, Fund, Scenario가 클릭마다 함께 바뀝니다.
2. Current Action의 Actor, Next Action, Blocker가 선택 Request와 일치합니다.
3. Kanban에는 현재 Task 하나만 해당 Column에 표시됩니다.
4. Mapping Preview와 Raw JSON의 Request ID도 함께 바뀝니다.
5. `REQ-DEMO-001`에서 승인 시뮬레이션 뒤 다른 Request를 고르면 `NOT_REVIEWED`로 초기화됩니다.
6. 빠르게 `REQ-DEMO-001 → REQ-DEMO-003 → REQ-DEMO-002`를 선택하면 최종 화면은 `REQ-DEMO-002`입니다.
7. 모든 화면에서 Write Count는 `0`이며, 승인 시뮬레이션은 실제 Write를 호출하지 않습니다.

## Evidence

- Main interactive screenshot: `request-task-console-v0.3.1.png`
- Static Request screenshots: `request-task-console-v0.3.1-req-001.png`, `request-task-console-v0.3.1-req-002.png`, `request-task-console-v0.3.1-req-003.png`
- Browser interaction assertions: `request-task-console-v0.3.1-interaction.json`

## Current limits

- v0.3.1 only demonstrates the three already implemented prototype scenarios.
- It is preview-only and does not persist Request or Task records.
- A separate, explicitly approved TEST Write TAP is required before any Notion write.
