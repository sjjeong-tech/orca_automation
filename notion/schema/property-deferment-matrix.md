# Property 단계별 유예 Matrix

`Required`와 `Optional`은 S1 DB에 생성하고, `Deferred`는 후속 TAP 전 생성하지 않는다.

| DB | Property | 현재 단계 | S1 | 후속 TAP | 사유 |
|---|---|---|---|---|---|
| 업무 | 업무명 | S1_REQUIRED | Required | P4 | 사람이 즉시 식별해야 함 |
| 업무 | 업무 ID | S1_REQUIRED | Required | Post-Pilot | 수동 안정 식별자 |
| 업무 | 조합명 | S1_REQUIRED | Required | Post-Pilot | AG-05 전 Text 사용 |
| 업무 | 업무 유형 | S1_REQUIRED | Required | P3/P4 | Pilot 업무 분류 |
| 업무 | 조합 유형 | S1_OPTIONAL | Optional | P3 | Variation Mapping 전 선택값 |
| 업무 | GP 유형 | S1_OPTIONAL | Optional | P3 | Variation Mapping 전 선택값 |
| 업무 | 계좌 유형 | S1_OPTIONAL | Optional | P3 | 미확정 가능 |
| 업무 | 담당 관리역 | S1_REQUIRED | Required | P4 | 요청·판단 담당 가시성 |
| 업무 | 지원팀 담당자 | S1_REQUIRED | Required | P4 | 수행 담당 가시성 |
| 업무 | 요청일 | S1_REQUIRED | Required | P4 | 접수 시점 |
| 업무 | 목표일 | S1_REQUIRED | Required | P2 | 임시 일자, Rule 미확정 |
| 업무 | 완료일 | DEFER_TO_P2 | Deferred | P2 | 완료 Gate와 함께 설계 |
| 업무 | 현재 단계 | S1_REQUIRED | Required | P2 | 임시 단계 |
| 업무 | 전체 상태 | S1_REQUIRED | Required | P2 | 임시 상태 |
| 업무 | 다음 Action | S1_REQUIRED | Required | P3 | S1 Text, 향후 생성 Rule |
| 업무 | Blocker | S1_REQUIRED | Required | P2 | S1 Text, 향후 유형화 |
| 업무 | 긴급 여부 | DEFER_TO_P2 | Deferred | P2 | 긴급 기준 미승인 |
| 업무 | 관리역 확인 필요 | S1_OPTIONAL | Optional | P2/P4 | 알림 없는 가시성 시험 |
| 업무 | 확인 요청 대상 | DEFER_TO_P4 | Deferred | P4 | Mention 모델 전 제외 |
| 업무 | 확인 요청 내용 | DEFER_TO_P4 | Deferred | P4 | 협업 Event 전 제외 |
| 업무 | 원본 Drive 경로 | S1_REQUIRED | Required | P4 | 원본 위치 연결 |
| 업무 | 결과물 Drive 경로 | S1_OPTIONAL | Optional | P2/P4 | 결과 저장 가시성 시험 |
| 업무 | 실물서류 수령 여부 | S1_OPTIONAL | Optional | P2 | 증빙 기준 미확정 |
| 업무 | 관련 Task | S1_REQUIRED | Required | P3 | 핵심 1:N Relation |
| 업무 | 최근 업데이트 | S1_OPTIONAL | Optional | P2/P4 | 내장 시간으로 최신성 관찰 |
| 업무 | 비고 | S1_OPTIONAL | Optional | P2~P4 | 관찰 메모 |
| Task | Task명 | S1_REQUIRED | Required | P3 | 사람이 추적할 항목 |
| Task | Task ID | S1_OPTIONAL | Optional | Post-Pilot | 자동 생성 전 수동 시험 |
| Task | 상위 업무 | S1_REQUIRED | Required | P3 | 핵심 N:1 Relation |
| Task | Process ID | S1_REQUIRED | Required | P3 | Pilot A 범위 식별 |
| Task | Operational Task ID | S1_REQUIRED | Required | P3 | Atomic Task와 구분 |
| Task | Task 상태 | S1_REQUIRED | Required | P2 | 임시 상태 |
| Task | 현재 Actor | S1_REQUIRED | Required | P3 | 역할 가시성 시험 |
| Task | 담당자 | S1_REQUIRED | Required | P4 | 실제 수행자 |
| Task | 목표일 | S1_REQUIRED | Required | P2 | 기한 Rule 미확정 |
| Task | 완료일 | S1_OPTIONAL | Optional | P2 | 완료 입력 시험 |
| Task | 다음 Task | DEFER_TO_P3 | Deferred | P3 | Mapping 전 선후관계 금지 |
| Task | Input | DEFER_TO_P3 | Deferred | P3 | Process Mapping 후 |
| Task | Output | DEFER_TO_P3 | Deferred | P3 | Process Mapping 후 |
| Task | 완료조건 | S1_REQUIRED | Required | P2/P3 | 후보 문구로 UI 시험 |
| Task | 완료 증빙 | S1_OPTIONAL | Optional | P2 | 증빙 모델 전 Text |
| Task | Blocker | S1_REQUIRED | Required | P2 | S1 Text |
| Task | 예외 유형 | DEFER_TO_P3 | Deferred | P3 | 예외 Mapping 후 |
| Task | 비고 | S1_OPTIONAL | Optional | P2~P4 | 관찰 메모 |
| Task | 자동화 수준 | POST_PILOT | Deferred | CP-06 | Pilot 전 자동화 금지 |
| Task | Agent 실행 상태 | POST_PILOT | Deferred | CP-07 | Write Governance 전 금지 |

## 집계

| 구분 | 업무 DB | Task DB | 합계 |
|---|---:|---:|---:|
| S1 Required | 14 | 10 | 24 |
| S1 Optional | 8 | 4 | 12 |
| Deferred | 4 | 6 | 10 |
| 전체 후보 | 26 | 20 | 46 |
