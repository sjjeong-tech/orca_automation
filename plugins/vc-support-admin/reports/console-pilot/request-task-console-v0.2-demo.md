# Request–Task Console v0.2 데모

이 파일은 구현·검증된 Prototype Scenario 3건을 Inbox에서 선택해 현재 Task를 확인하는 로컬 Preview 시연입니다. 실제 Notion Backend나 운영 Write는 연결하지 않습니다.

## 실행 방법

```powershell
node plugins/vc-support-admin/console/admin-process-console-server.mjs
```

출력된 `http://127.0.0.1:<port>` 주소를 브라우저에서 엽니다. 기본 포트는 `4173`이며, 이미 사용 중이면 사용 가능한 로컬 포트가 표시됩니다.

## 시연 순서

1. 좌측 Request Inbox에서 3건을 확인합니다.
2. `REQ-DEMO-001`을 선택해 사람 확인 질문, 중단 사유, 다음 Action을 확인합니다.
3. `REQ-DEMO-002`를 선택해 `완료 후보`와 `완료 가능=false`가 다름을 확인합니다.
4. `REQ-DEMO-003`을 선택해 P03·P04는 보존되고 P07만 중단되는지 확인합니다.
5. 모든 요청에서 Execution Safety의 Operational Write Count가 `0`인지 확인합니다.
6. 하단 Timeline으로 과거 Stage를, `기술 상세 보기`로 원본 Preview Payload를 확인합니다.

## 지원 범위와 제한

- 구현·표시: `SINGLE-P03-01`, `SINGLE-P03-02`, `COMPOSITE-01` (Contract 6건 중 3건)
- 자연어 Preview: `SINGLE-P03-02`만 지원
- 나머지 두 요청: `FIXTURE_PRESET`임을 화면에 명시
- Backend: `LOCAL_PREVIEW`, `NOTION_SCHEMA=VALIDATED_REFERENCE`, `NOTION_BACKEND=NOT_CONNECTED`
- Notion·Drive·Slack·운영 Write: 모두 `0`
- Persistent Store와 범용 자연어 Parser는 제공하지 않음

## 독립 산출물

- [정적 HTML](request-task-console-v0.2.html): 서버 없이 검증된 Snapshot을 열람합니다.
- [Output JSON](request-task-console-v0.2-output.json): 3건의 검증된 핵심 Preview 결과입니다.
- [PNG](request-task-console-v0.2.png): 기본 선택 Request의 시각 검증 결과입니다.
