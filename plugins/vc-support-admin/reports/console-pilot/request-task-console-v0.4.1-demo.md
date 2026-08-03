# Request–Task Console v0.4.1

## 목적

선택한 요청을 Notion TEST DB에 반영할 수 있는지 검토하고, 부족한 조건과 다음 확인 업무를 안내합니다. 이 Console은 **읽기 전용 Preview**이며 Notion 및 운영 데이터 Write를 실행하지 않습니다.

## 실행

`node plugins/vc-support-admin/console/admin-process-console-server.mjs`

표시되는 Local URL을 엽니다. 서버 없이 보는 정적 시연은 `request-task-console-v0.4.1.html`을 직접 엽니다.

## 시연 순서

1. 좌측 업무 요청 3건을 선택합니다.
2. 상단 **반영 가능 여부**에서 차단 항목 수와 실제 Write 0건을 확인합니다.
3. **차단 사유와 다음 조치**에서 조합 연결 대상과 중복 방지 기준을 확인합니다.
4. **현재 해야 할 일**에서 담당·후속 조치·차단 사유를 확인합니다.
5. **생성 예정 내용**에서 Request 1건과 Task 수를 검토합니다.
6. **TEST 반영 범위 검토**가 비활성인 이유와 실제 Notion 반영 0건을 확인합니다.
7. 필요할 때만 **기술 검증 상세**를 열어 Canonical 값과 Property Mapping을 확인합니다.

## 현재 차단 조건

- DUMMY-FUND-A/B/E의 Exact Match는 현재 0건입니다.
- 전용 Transaction ID Property가 확인되지 않아 durable duplicate protection은 미확정입니다.
- COMPOSITE-01은 Request DB에서 복합 Process Mapping을 추가로 확인해야 합니다.

## 제한

- 구현 Scenario 3/6만 표시합니다.
- Preview-only, Notion Write 0, Operational Write 0입니다.
- 실제 TEST Write와 Request–Task Relation 생성은 별도 승인 TAP 범위입니다.
