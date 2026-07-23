# Review and Approval Protocol

## 기본 흐름

Codex 설계 → Claude 독립 검토 → GPT 결과 통합 → 사용자 승인 → 다음 TAP

## 역할

- Codex: 승인 범위 내 설계·구현, 검증 근거와 변경 범위 보고
- Claude: 누락·상충·운영 적합성 독립 검토, 원본 직접 승인 금지
- GPT: Finding 통합, 선택안·권장안·Gate 제안
- 사용자: 업무지도, 운영기준, Build, Pilot, Automation, Write 권한 최종 승인

## 검토 지점

| TAP | Claude | GPT | 사용자 승인 |
|---|---|---|---|
| CP-05-P0 | Roadmap 상충·누락 권장 | 필수 | 전체 업무지도 |
| CP-05-P0-R | Revised Roadmap 상충·누락 권장 | 필수 | Skeleton·Pilot A·TI 경로 |
| CP-05-P1 | 선택 | 필수 | Record 단위·DB 개수 |
| CP-05-S1 | Skeleton 범위·과잉 Build 검토 | 필수 | 실제 Skeleton Build |
| CP-05-R1 | 선택 | 필수 | 보고 내용·공유 대상 확인 |
| CP-05-P2 | 선택 | 필수 | 상태·완료 기준 |
| CP-05-P3 | Mapping Coverage 권장 | 필수 | Build 입력 적합성 |
| CP-05-P4 | 선택 | 필수 | Form·알림 기준 |
| CP-05-P5 | 운영 적합성 권장 | 필수 | Build 승인 |
| CP-05-B2 | Pilot 패턴·예외 권장 | 필수 | Pilot 결과 |
| CP-05-B3 | 선택 | 필수 | 자동화 진입 |
| CP-06-P1 | 위험·Human-only 권장 | 필수 | Assisted 범위 |
| CP-07-P1 | Write Governance 필수 | 필수 | Agent Write 권한 |

### CP-05-R1 상세 Handoff

- Input: S1 Build Log, Decision Log, Pending Approval, Pilot A
- Output: Notion AI TI와 중간보고 구조
- Exit: TI 작성 완료, GPT 검토 완료, 사용자에게 공유 준비 완료
- 대표님 응답: Optional Feedback Input
- Next: CP-05-P2
- P2 차단: 대표님 응답 수신은 차단 조건이 아니다.
- 실제 피드백이 수신되면 Decision Log 또는 Pending Approval에 후속 Input으로 기록한다.
- 대표님 확인이 필요한 운영기준은 기존 Approval Gate 통과 전 확정하지 않는다.

## Revision과 Handoff

- Reviewer Finding은 `ACCEPT`, `REJECT`, `DEFER`, `APPROVAL_REQUIRED`로 분류한다.
- Builder는 승인된 Finding만 반영하고 원본 검토 보고서를 덮어쓰지 않는다.
- Handoff에는 기준 Commit, 읽은 Input, 생성 Output, 미결 Gate, 금지사항, 다음 허용 TAP을 포함한다.
- 실패·차단 시 후속 TAP을 실행하지 않고 Queue를 정지한다.
