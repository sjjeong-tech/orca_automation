# Intake to Task Mapping

| 단계 | Record | Trigger | 필수 Input | Output | 다음 Gate |
|---|---|---|---|---|---|
| 사전예고 | FUND `결성(진행)` Record | 결성 가능성 구체화 | 임시 조합명, 담당 관리역, 구분=결성, 업무분류=조합결성 | 조합 기준 Record | 사용자 판단 |
| 실제 요청 | 지원팀 업무요청 | 확정정보·서류 준비 | 관련 조합(가능 시), 요청 유형, 요청자, 목표일, 원본 폴더, 요청 내용 | RQ-NEW | HA-01/02 |
| 검수 | Request + 검수 OT | 지원팀 접수 | Source·실물·요청 원문 | RQ-REVIEW/REWORK/READY | HA-02 |
| Task 생성 | 지원팀 Task | RQ-READY | 요청 유형, P3 Mapping | 필수·선택·조건부 OT | 담당자 확인 |
| 수행 | 지원팀 Task | TS-ACTIVE | Input·완료조건 | Evidence·다음 Action | Task Gate |
| 완료 | Request | RC-01~06 | Task·Evidence·전달 | RQ-DONE | HA-08 |

Task 자동 생성은 구현하지 않는다. P3는 생성 Contract만 제공한다.
