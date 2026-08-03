# 제품 목표

TAP: A-CP25-H01-SUPERPOWERS-PRODUCT-UX-REFOUNDATION-HANDOFF
BASE_COMMIT: a3e78a91fc3c8d7935551e4d5bb7b5c0db2331c4
UI_BASELINE: NONE

## 한 문장

운영팀의 자연어 요청을 지원팀 실행 Task로 전개하고, 담당자가 **지금 무엇을 해야 하는지**를
한 화면에서 판단한 뒤, 검증된 Notion Request·Task DB에 중복 없이 안전하게 반영할 수 있는
Pilot Console.

## 재설계가 필요한 이유 — 정보가 아니라 구조

v0.4.1 UX 검증(`request-task-console-v0.4.1-ux-validation.json`)은 요청 3건 × 질문 7건을
전부 PASS로 기록했다. 정보는 이미 화면에 있다.

그런데 `console/public/index.html`은 **패널 20개를 한 페이지에** 쌓는다.

```
업무 요청 목록 · 요청 원문 · 반영 전 확인 필요 · 차단 사유 · 현재 요청 · 메타데이터 ·
누가 무엇을 확인 · 생성 내용 미리보기 · 필수 확인 항목 · TEST 반영 범위 검토 ·
현재 업무 Kanban · 복합 요약 · 확인 질문 · 제출 자료 · 완료와 반영 차단 · 진행 흐름 ·
Backend Status · Mapping · Relation Preview · Duplicate Preview · Property Mapping ·
Expected-Actual · Audit · Raw JSON
```

**결론: 이번 작업은 콘텐츠 재작성이 아니라 결정 순서 재설계다.**
데이터·API·Contract 계층은 대부분 그대로 쓰고, View 계층만 다시 만든다.

## 성공 기준

사용자가 화면을 보고 아래 10개에 즉답할 수 있어야 한다.

| # | 질문 | v0.4.1 검증 여부 |
|---|---|---|
| 1 | 어떤 요청이 들어왔는가 | PASS |
| 2 | 어떤 업무 Task가 만들어졌는가 | 부분 (생성 예정 건수만) |
| 3 | 지금 누가 무엇을 해야 하는가 | PASS |
| 4 | 무엇 때문에 진행이 멈췄는가 | PASS |
| 5 | 사람 확인이 필요한가 | 부분 |
| 6 | 어떤 Evidence가 부족한가 | **미검증** |
| 7 | Notion에 반영할 준비가 되었는가 | PASS |
| 8 | 반영할 수 없다면 무엇을 먼저 확인해야 하는가 | PASS |
| 9 | 실제로 생성된 Record는 무엇인가 | 부분 (0건만) |
| 10 | 재실행 시 중복이 발생하지 않았는가 | **미검증** |

**6번과 10번은 지금까지 한 번도 검증되지 않았다.** 이번 Acceptance에서 신규로 다룬다.

## Pilot 범위

포함:

- Request 선택 (3건)
- Task 전개
- Actor · Next Action · Blocker
- Evidence 판정과 부족분 식별
- 사람 확인 질문
- Notion 반영 Preview
- 승인 Gate
- 실행 결과 검증 자리(Placeholder)

제외:

- 범용 자연어 Parser
- 운영 자동 완료
- 외부 배포
- 사용자 계정 · 다중 조직 권한
- 미구현 Scenario 3건 (`SINGLE-P07-01` · `SINGLE-P08-01` · `COMPOSITE-02`)
- 운영 데이터 Write

## 이번 TAP에서 하지 않는 것

코드를 수정하지 않는다. 제품 정의와 계획까지다.
Notion Write 0, Merge 0, UI 구현 0.
