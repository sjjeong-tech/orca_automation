# CP-05-P0 Scope Governance Review

## Scope Control

`operating-model/scope-control.md`는 각 TAP이 Master Roadmap에 등록된 Input·Output·변경 범위만 수행하도록 명시하고, Scope 밖 발견에 대한 5단계 처리 절차(구현 금지 → decisions/pending-approvals.md 또는 Backlog 기록 → 영향·Deliverable·Gate 기록 → 후속 TAP 지정 → GPT·사용자 검토 전 미실행)를 정의한다. 이 절차는 이번 A-CP05-P0-REVIEW TAP 자체가 요구받은 처리 방식과 동일하여 자기 일관성이 있다. **PASS.**

`CP-05-S1`의 "Skeleton 예외 범위" 절은 Automation·Slack·Agent Write·전체 Process Mapping·Process 05/06/09/10/11·미확정 상태 전이·미승인 Formula/Rollup을 명시적으로 범위 밖으로 규정해, 최초 Build 단계에서의 Scope Creep 가능성을 사전에 차단한다. **PASS.**

## Auto-run 통제

- Roadmap Control 절: "후속 TAP Auto-run: 금지"가 최상위에 명시됨.
- `roadmap-governance.md` Gate 원칙: "TAP 순서 변경은 GPT 제안과 사용자 승인이 필요", "Skip과 후속 TAP Auto-run을 금지".
- Master Roadmap 표의 모든 행에 "다음 허용 TAP" 컬럼이 있어 각 TAP 종료 시 다음 단계가 명시적으로 지정됨.
- 이번 TAP 자체 지시서(`A-CP05-P0-REVIEW`)에도 "다음 TAP 자동 실행 금지"가 반복 명시됨.

이 원칙은 문서 전반에 걸쳐 일관되게 반복되어 통제가 견고하다. **PASS.** 다만 `CP-05-R1`은 "다음 허용 TAP: CP-05-P2"로 지정되어 있으나, R1의 Exit Criteria가 사람의 실제 확인(대표님 응답)을 요구하지 않고 문서 완성만 요구하므로, "다음 TAP 자동 실행 금지" 원칙이 R1→P2 구간에서는 형식적으로만 지켜질 뿐 실질적 승인 없이도 통과 가능하다는 우회 경로가 존재한다(SG-01).

## Change Control

`roadmap-governance.md`의 "계획 변경 절차"는 변경 제안 기록 → 영향 분석(목표·산출물, Scope·Deliverable·Gate) → GPT 검토 → 사용자 승인 → Master Roadmap 갱신 → Gate·Queue 갱신 → 후속 TAP 재설계의 8단계로 구성되며, "Master Roadmap 갱신 전에는 변경된 작업을 실행하지 않는다"는 명확한 종료 조건이 있다. **PASS.**

## Backlog 처리

`scope-control.md`의 Backlog 등록 기준(현재 Exit Criteria에 불필요/선행 승인 없음/다른 Deliverable 소유/Pilot 데이터 필요/권한·보안·외부발송 영향)은 구체적이며, "Backlog 등록은 승인이나 구현을 의미하지 않는다"고 명확히 선을 긋는다. **PASS.** 다만 `decisions/pending-approvals.md`의 "신규 Backlog" 표 8개 항목 중 4개(조합 Master DB=AG-05, 알림 Queue DB=AG-06, Process 11 MVP=AG-12, Skeleton Property검증=AG-S1)가 이미 정식 Gate ID를 가진 결정사항과 사실상 동일 내용을 재기술하고 있어, "이것이 Backlog인가 이미 Gate로 추적 중인 결정인가"의 경계가 실무자에게 혼란을 줄 수 있다(SG-02).

## 역할 분리

RACI(`roles-and-ownership.md`)는 정상준을 모든 Activity의 최종 `A`로, GPT/Codex/Claude를 각각 R/R/C(독립 QA에서는 Claude가 R)로 일관되게 배정한다. "향후 Agent"는 "행정 수행·증빙"에서 "승인 전 제안"으로, "Agent Write 승인"에서 "R(실행이지 승인이 아님)"으로 명시되어, **AI가 미승인 운영 판단을 대신하는 경로는 발견되지 않았다.** **PASS.**

## Roadmap 외 실행 방지

각 TAP 행에 "자동화 금지사항"과 "Repo 변경 예상 범위" 컬럼이 있어, Codex가 해당 TAP에서 건드릴 수 있는 파일 범위가 사전에 제한된다. 이번 리뷰에서 검토한 범위 내에서 이 제약을 우회할 수 있는 경로(예: 특정 TAP만 파일 범위 컬럼이 비어 있거나 모호한 경우)는 발견되지 않았다. **PASS.**

## 발견된 우회 경로

| ID | 등급 | 통제 영역 | Gap | 발생 가능한 Scope Leak | 권장 조치 |
|---|---|---|---|---|---|
| SG-01 | MAJOR | Auto-run 통제 / Approval Gate | CP-05-R1의 Exit Criteria가 "11개 섹션 작성 완료"까지만 요구하고 대표님의 실제 응답 수신을 요구하지 않음. Roadmap의 "다음 허용 TAP"이 R1 종료 즉시 P2로 지정되어 있어, 문서만 작성되면 형식적으로 다음 TAP 진입 조건이 충족됨 | 대표님이 TI를 검토·응답하기 전에 P2 설계가 시작되는 경로가 열려 있음(설계 단계라 즉각적 위험은 낮으나, "Human Approval을 외부 쓰기와 중요 상태 변경보다 앞에 둔다"는 Principle 5의 정신과는 어긋남) | R1 Exit Criteria에 "대표님 응답 수신 확인" 조건 추가, 또는 P2 선행조건 컬럼에 명시 |
| SG-02 | MINOR | Backlog 처리 | `pending-approvals.md` "신규 Backlog" 표의 4개 항목이 이미 Gate ID(AG-05/06/12/S1)를 가진 결정사항과 중복 기술됨 | Backlog와 정식 Approval Gate의 경계가 흐려져, 실행 담당자가 "Backlog니까 지금 결정 안 해도 된다"고 오인해 이미 존재하는 Gate 요건을 놓칠 위험 | Backlog 표에서 기존 Gate ID를 직접 참조하는 방식으로 정리(중복 서술 제거) |
| SG-03 | MINOR | Change Control 문서정합성 | `roadmap-governance.md`의 일반 Build 금지 원칙이 `scope-control.md`의 S1 예외를 참조하지 않음 | 향후 담당자가 `roadmap-governance.md`만 보고 S1을 Scope 위반으로 오판하거나, 반대로 이 원칙을 근거로 다른 조기 Build를 정당화할 위험(원칙의 예외 범위가 문서상 불분명) | `roadmap-governance.md`에 S1 예외 근거를 명시적으로 각주 처리 |

## 결론

Scope Governance의 핵심 메커니즘(Scope 밖 발견 처리, Change Control, Backlog 기준, 역할 분리, Roadmap 외 실행 방지)은 견고하게 설계되어 있으며 Blocking 수준의 통제 공백은 없다. 유일하게 주목할 부분은 SG-01(R1→P2 handoff가 실질적 사람 승인 없이도 통과 가능)로, 이는 P2가 설계 전용 단계라 즉각적 위험은 낮지만 문서화된 원칙(Human Approval First)과의 정합성을 위해 보완을 권장한다.
