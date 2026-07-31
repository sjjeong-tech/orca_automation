# Request–Task Console v0.3 데모

Console v0.3은 검증된 Skill Preview를 기존 TEST LAB Request·Task Schema에 **어떻게 매핑할지** 보여주는 로컬 시뮬레이션입니다. Notion Record·Schema·View는 생성하거나 수정하지 않습니다.

## 지원 Scenario

- `SINGLE-P03-02`: 자연어 Preview — 날인본 원본 누락, 사람 확인 및 중단
- `SINGLE-P03-01`: Fixture Preset — 완료 후보이지만 완료 Write는 금지
- `COMPOSITE-01`: Fixture Preset — P03·P04 보존, P07만 중단

## 실행

```powershell
node plugins/vc-support-admin/console/admin-process-console-server.mjs
```

출력된 `http://127.0.0.1:<port>` 주소를 엽니다. 기본 포트는 `4173`이며, 이미 사용 중이면 다른 로컬 포트를 사용합니다.

## 시연 순서

1. Request Inbox에서 대상 Request를 선택하고 `실행 Preview`를 확인합니다.
2. `DB Mapping Preview`를 눌러 생성 예정 Request 1건과 Task N건을 확인합니다.
3. Property Mapping Table에서 실제 TEST LAB Property명, Write Value, `CONFIRM_REQUIRED`·`UNMAPPED` Gap을 검토합니다.
4. Validation Summary에서 Duplicate Check가 `NOT_RUN_PERSISTENT_STORE`임을 확인합니다.
5. `Notion 반영 Preview 열기`에서 대상 DB·Record 수·Relation 계획·Write Count를 확인합니다.
6. `승인 시뮬레이션`을 눌러 `APPROVED_FOR_TEST_WRITE`와 `Write Count 0`을 확인합니다.
7. 다음 단계가 별도 TEST Write TAP임을 확인합니다.

## 실제 Schema Mapping 기준

- Request DB: `[TEST LAB] 지원팀 업무요청`
- Task DB: `[TEST LAB] 지원팀 Task`
- Transaction ID 전용 Property는 현재 Schema에 없으므로 `현재 요약` 조합 Preview로만 표시하며 `CONFIRM_REQUIRED`입니다.
- Dummy Fund는 실제 `FUND 업무` Relation Page가 확정되지 않았으므로 `NOT_WRITTEN`·`CONFIRM_REQUIRED`입니다.
- Canonical Stage는 Notion Property를 새로 만들지 않고 Console/Skill Vocabulary로만 유지합니다.
- `완료 후보`는 기존 `Task 상태=완료`로 쓰지 않습니다.

## 제한

- Preview-only, Notion API Write 0, Operational Write 0
- Persistent Store Duplicate 관찰은 미실행
- 실제 TEST Write는 별도 승인·Relation Exact Match·재조회 Gate가 필요
- 구현 Scenario는 Contract 6건 중 3건입니다.

## 산출물

- [정적 HTML](request-task-console-v0.3.html)
- [Output JSON](request-task-console-v0.3-output.json)
- [PNG](request-task-console-v0.3.png)
