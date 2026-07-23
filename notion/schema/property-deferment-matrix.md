# Realigned Property 유예 Matrix

| 영역 | Property | S1 | 후속 TAP | 사유 |
|---|---|---|---|---|
| 기존 FUND | 기존 Property | REUSE | S1 | 삭제·Type 변경 금지 |
| 기존 FUND | 지원팀 요청 단계 | CANDIDATE | P4 | 기존 Property 대체 확인 |
| 기존 FUND | 결성 확정 수준 | CANDIDATE | P2/P4 | 상태 의미 미확정 |
| 기존 FUND | 예상 결성일 | CANDIDATE | P4 | 기존 일정 Property 확인 |
| 요청 DB | 요청명·관련 조합·유형·요청자·관리역 | REQUIRED | P4 | 2차 Form 최소 Input |
| 요청 DB | 요청일·목표일·상태 | REQUIRED_PROVISIONAL | P2/P4 | 상태·기한 Rule 미확정 |
| 요청 DB | 원본 폴더·실물 전달·요청 내용 | REQUIRED | P2/P4 | 착수 Input |
| 요청 DB | 특이사항 | OPTIONAL | P4 | 조건부 입력 전 Text |
| 요청 DB | 관련 Task | REQUIRED | P3 | 핵심 1:N Relation |
| Task DB | Task명·상위 요청·관련 조합 | REQUIRED | P3 | 계층·문맥 |
| Task DB | Process ID·Operational Task ID | REQUIRED | P3 | Mapping 추적 |
| Task DB | 상태·담당자·Actor·목표일 | REQUIRED_PROVISIONAL | P2/P3 | 상태·책임 Rule 미확정 |
| Task DB | 다음 Action·Blocker·완료조건 | REQUIRED | P2/P3 | 수동 가시성 |
| Task DB | 완료증빙·비고 | OPTIONAL | P2 | 증빙 모델 전 Text |
| Task DB | Input·Output·다음 Task·예외 유형 | DEFERRED | P3 | Mapping 전 생성 금지 |
| Task DB | 자동화·Agent 상태 | DEFERRED | CP-06/07 | Pilot·Governance 전 금지 |
| 지원팀 업무 DB | 기존 P1 Property 전체 | POST_PILOT_OPTION | B3 | Pilot A Build 대상 아님 |

## S1 목표

- 기존 FUND 신규 Property 후보: 최대 3개, 실제 추가 수는 0개일 수 있음
- 요청 DB: 13개
- Task DB: 14개
- 신규 DB Property 합계: 27개
