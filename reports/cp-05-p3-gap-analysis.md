# CP-05-P3 Gap Analysis

## Gap Register

| gap_id | description | affected_work_item | required_input | owner | blocking_stage | recommended_action | target_work_item | status |
|---|---|---|---|---|---|---|---|---|
| P3-G01 | N-06 Task 관련 조합 Rollup 실제값 | J-02 | TEST FUND·Request·Task 연결 | USER+NOTION_AI | REQUIRED_BEFORE_BUILD | Task Rollup 실제값 확인 | N-06/J-02 | OPEN |
| P3-G02 | P2 7/6상태의 실제 Notion 옵션 적용 | J-02 | 승인된 Build 명세 | CODEX+USER | REQUIRED_BEFORE_BUILD | 별도 Build Work Order에서 적용 | CP-05-B1 | OPEN |
| P3-G03 | P4/P5 승인과 Notion Build Work Order | J-02 | 후속 설계 승인·Work Order | GPT+USER | REQUIRED_BEFORE_BUILD | Gate 통과 후 Build 활성화 | J-02 | OPEN |
| P3-G04 | 신기술투자조합 Trigger·근거자료 | P03 | 공식 근거 또는 인터뷰 | PROCESS_OWNER | DATA_QUALITY_BACKLOG | UNKNOWN 유지 | Gap Workstream | OPEN |
| P3-G05 | 수탁계좌 정의·적용 기준 | P07·08 | 공식 근거 | PROCESS_OWNER | PILOT_VALIDATION | Human Gate 유지 | Pilot/Gap Workstream | OPEN |
| P3-G06 | 방문·퀵·이메일 채널 선택 기준 | P03·07·08 | 기관별 기준·승인 주체 | PROCESS_OWNER | REQUIRED_DURING_P4 | 협업·확인 Contract 정의 | CP-05-P4 | OPEN |
| P3-G07 | 대리·제3자 수령 요건 | P03 UN-14 | 기관 요건 | PROCESS_OWNER | PILOT_VALIDATION | U·Human-only 유지 | Pilot/Gap Workstream | OPEN |
| P3-G08 | 지점별 서류 차이 | P07 | 독립 CASE | PROCESS_OWNER | DATA_QUALITY_BACKLOG | CASE_ONLY 유지 | Gap Workstream | OPEN |
| P3-G09 | 공동 GP 상세 서류 | P03·04 | 유형별 공식 서류표 | PROCESS_OWNER | DATA_QUALITY_BACKLOG | PROVISIONAL 유지 | Gap Workstream | OPEN |
| P3-G10 | 1차 Form 질문·Required·Respondent | Intake | UI 검증 | USER+NOTION_AI | FORM_UI_BACKLOG | 사용자 UI Workstream | N-04 Backlog | OPEN |
| P3-G11 | 2차 Form 질문 구성 | Intake | P4 승인 Contract | USER+NOTION_AI | REQUIRED_DURING_P4 | P4 결과로 UI 초안 | CP-05-P4 | OPEN |
| P3-G12 | 기존 DB Form/View 검증 오류 일반화 여부 | UI | 추가 안전한 TEST | USER+NOTION_AI | FORM_UI_BACKLOG | 플랫폼 제약으로 기록 | UI Workstream | OPEN |
| P3-G13 | 독립 CASE 부족·Interview V2 미착수 | 전체 | 추가 사례·인터뷰 | PROCESS_OWNER | DATA_QUALITY_BACKLOG | 필요한 Gate 항목만 우선 해소 | Cross-cutting Gap | OPEN |

## N-06 검증 범위

FUND 원본 Relation과 GP명·조합구분·담당자·담당자(변경후) Rollup은 확인됐다. 이 결과는 Task DB의 `관련 조합` Rollup 계약을 충족하지 않는다. P3-G01은 J-02 전까지 Open이다.

## 재집계

- P3 Gap: 13
- Resolved: 0
- 현재 Open: 13
- REQUIRED_BEFORE_P4: 0
- REQUIRED_DURING_P4: 2
- REQUIRED_BEFORE_BUILD: 3
- PILOT_VALIDATION: 2
- FORM_UI_BACKLOG: 2
- DATA_QUALITY_BACKLOG: 4

Open Conflict는 [P3 conflict register](../conflicts/p3-open-conflicts.md)의 7개다.
