# Request–Task Console v0.4

## 목적

실제 Notion Schema를 승인된 Session Tool로 읽어온 뒤, TEST Write 전 Payload·관계·중복 Gate를 **Read-only**로 검토합니다. 이 시연은 Notion Write를 실행하지 않습니다.

## 실행

`node plugins/vc-support-admin/console/admin-process-console-server.mjs`

브라우저에서 표시되는 Local URL을 엽니다. 독립 시연은 `request-task-console-v0.4.html`을 직접 엽니다.

## 시연 순서

1. Request Inbox에서 3개 Request를 선택합니다.
2. Backend Status에서 `NOTION_LIVE_READ_PREVIEW`와 Write Count 0을 확인합니다.
3. DB Mapping Preview에서 실제 Property 이름·타입을 확인합니다.
4. Dummy Fund Exact Match와 Transaction Duplicate Lookup을 확인합니다.
5. TEST Write 범위 승인을 눌러도 Blocking Gap이 있으면 `APPROVAL_BLOCKED`이며 Write는 0임을 확인합니다.

## 현재 Gate

- DUMMY-FUND-A/B/E는 현재 조회된 Relation 대상에서 Exact Match 0건입니다.
- 전용 Transaction ID Property가 없어 durable duplicate protection은 확인되지 않았습니다.
- COMPOSITE-01의 여러 Process는 Request DB의 단일 Select에 자동 축약하지 않습니다.
- 따라서 실제 TEST Write는 별도 승인과 Schema Mapping 확정 전까지 차단됩니다.

## 제한

- 구현 Scenario 3/6만 표시합니다.
- Preview-only, Notion Write 0, Operational Write 0입니다.
- Session Snapshot은 Read 시점 기록이며 Node Runtime이 MCP를 직접 호출하지 않습니다.
