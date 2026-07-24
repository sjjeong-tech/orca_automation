# P3 Conflict Register

P3 실행 종료 시 7건이며 최신 N-06 범위 정정 후에도 Open Conflict는 7건이다. 검증된 FUND 원본 Rollup과 미검증 Task Rollup을 구분한다.

| conflict_id | summary | affected_process | affected_mapping | source_a | source_b | impact | recommended_resolution | decision_owner | blocking_level | recommended_timing | user_question_required | status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P3-C01 | Atomic Task와 Operational Task의 1:1 여부 | P01·03·04·07·08 | 61 Atomic → 21 Operational | Process 최소 행동 단위 | 승인된 운영 추적 단위 집약 원칙 | Task 수·사용 부담 | 모든 Atomic ID를 보존하고 운영 Task로 집약 | GPT+USER | BLOCKING_FOR_AG_P3 | AG-P3 | Yes | OPEN |
| P3-C02 | 신기술 조합 명칭 불일치 | P03 | Fund Type | `신기술투자조합` | `신기술사업투자조합` | 검색·표시 정규화 | 공식 명칭 확인 전 alias 후보로만 관리 | USER/PROCESS_OWNER | NON_BLOCKING_BACKLOG | P4 또는 Data Quality | No | OPEN |
| P3-C03 | Task 관련 조합 Rollup 실제값 | 전체 Task | N-06 Task Rollup | FUND 원본 Relation·Rollup 4종 PASS | Task→상위 요청→관련 조합 실제값 미검증 | Build Gate | 안전한 TEST Request·Task로 실제값 확인 | USER+NOTION_AI | BLOCKING_FOR_BUILD | J-02 전 | No | OPEN |
| P3-C04 | P2 7/6상태와 Skeleton 3상태 | 전체 | Status Mapping | 승인된 P2 의미 계약 | 현재 Notion Skeleton 옵션 | 실제 UI 적용 전 불일치 | P4/P5 승인 명세 후 별도 Build Work Order에서 옵션 적용 | GPT+USER | BLOCKING_FOR_BUILD | Build 전 | Yes | OPEN |
| P3-C05 | Form UI 질문·필수값 미완료 | Intake | Form Interface | P3 Interface Contract | 현재 Form UI | Pilot 사용성 | P4에서 질문·협업 Contract 확정 후 UI Workstream 적용 | GPT+USER | BLOCKING_FOR_BUILD | P4·Build 전 | Yes | OPEN |
| P3-C06 | 수탁계좌 정의·적용 기준 UNKNOWN | P07·08 | Variation Task Generation | Account Variation UNKNOWN | Pilot 계좌 요청 | 자동 분기 불가 | Human Gate와 U 등급 유지, 공식 근거 확보 시 재평가 | PROCESS_OWNER | NON_BLOCKING_BACKLOG | 해당 경로 Pilot 전 | No | OPEN |
| P3-C07 | 기관·지점별 제출 채널 선택 Rule 부재 | P03·07·08 | Exception Routing | 채널 존재 PROVISIONAL | 선택 Rule UNKNOWN/CASE_ONLY | 자동 채널 선택 불가 | P4에서 협업·확인 주체를 정하고 채널 선택은 Human-only 유지 | PROCESS_OWNER | NON_BLOCKING_BACKLOG | P4/Pilot | No | OPEN |

## N-06 범위

검증 완료:

- `TO DO LIST (FUND)` 원본 Relation 저장
- GP명·조합구분·담당자·담당자(변경후) Rollup 표시

남은 검증:

- `지원팀 Task.상위 요청 → 지원팀 업무요청.관련 조합 → 지원팀 Task.관련 조합` 실제값

AG-P3의 직접 Blocking Conflict는 P3-C01 한 건이다. P3-C03~C05는 P4 진행을 막지 않지만 실제 Build 전에 해소해야 한다. 추정으로 해소한 Conflict는 0개다.
