# Request–Task Console v0.1 Demo Guide

## 시연 목적

가상의 운영팀 관리역 요청이 기존 `admin-process-prototype-replay` Skill의 Preview 결과로 전개되고, 사람 확인·중단·완료 차단이 한 화면에서 구분되는 과정을 보여준다.

## 실행 방식 A — 독립 HTML

`request-task-console-v0.1.html`을 더블클릭해 연다. 서버나 Skill 재실행 없이 검증된 Output Snapshot을 정적으로 보여준다.

## 실행 방식 B — Interactive Console

```powershell
node plugins/vc-support-admin/console/admin-process-console-server.mjs
```

서버가 출력한 `http://127.0.0.1:<port>` URL을 연다. 기본 입력은 다음과 같다.

> DUMMY-FUND-B의 고유번호증 신청 건을 확인해줘. 신청서 초안은 있지만 날인본 원본은 아직 준비되지 않았어.

`Preview 실행`을 선택한다. 이 Console은 `SINGLE-P03-02`만 실제 실행한다.

## 시연 순서

1. Request Inbox에서 요청 원문, 조합, Process, Scenario, Transaction ID와 Preview 여부를 확인한다.
2. Task Kanban에서 `요청 접수 → Evidence 검토 → 사람 확인 → 중단`의 진행 이력을 확인한다.
3. 현재 Task 카드에서 Actor(`사람 확인`), Blocker(`날인본 원본 미확보`), 다음 Action(`유효한 날인본 원본 재수집`)을 서로 분리해 읽는다.
4. Interaction Panel에서 사람 확인 질문을 확인한다.
5. Evidence Panel에서 canonical `STAMPED_ORIGINAL / MISSING`과 legacy 호환 값을 함께 확인한다.
6. Execution Safety에서 Request 완료, Task 완료, 후속 자동 진행, 운영 Write가 모두 차단되어 있고 Write Count가 `0`인지 확인한다.
7. Timeline에서 `RECEIVED → EVIDENCE_REVIEW → HUMAN_CONFIRMATION → BLOCKED` 순서를 확인한다.
8. 필요하면 Raw JSON을 펼쳐 기존 Skill의 Preview payload를 검토한다.

## 현재 제한

- 실제 지원 Scenario는 `SINGLE-P03-02` 하나다.
- Preview-only이며 Notion, Drive, Slack, 파일시스템 및 운영 Record Write를 수행하지 않는다.
- Persistent Store가 없고 범용 자연어 Parser가 아니다.
- Notion Backend는 연결하지 않았고, Schema는 검증된 참조 전용이다.
- 지원 범위 밖 요청에는 가짜 결과를 만들지 않고 안전한 안내만 표시한다.
