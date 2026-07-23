# Notion Operating Model Gap Analysis

## 판정

CP-04 As-Is Process Model은 보존한다. CP-05의 기존 Gap Resolution 계획은 삭제하지 않고 `CROSS_CUTTING_WORKSTREAM`으로 재배치한다. Control Plane 설계는 가능하지만 DB·Schema·Pilot·Automation은 Approval Gate 전 구현할 수 없다.

## 기존 CP-05와 신규 목표 상충

| 기존 방향 | 신규 방향 | 처리 |
|---|---|---|
| 모든 Gap을 먼저 해소 | MVP·Pilot Gate에 필요한 Gap 우선 | Cross-cutting으로 재배치 |
| CP-05를 Gap Resolution Checkpoint로 사용 | CP-05를 Live Operations Control Plane 설계·Build·Pilot로 사용 | AG-01 승인 필요 |
| Repo 문서 중심 | Notion Live State + Orca Rule 분리 | P1~P5에서 설계 |

## 현재 Repo에 없는 Layer

- 실제 업무·Task Record
- 업무·Task 상태와 전이
- 담당자·기한·Blocker·증빙
- Intake Form
- Mention·알림 Event·수신 상태
- Pilot 운영 기록
- Automation Interface·Workflow·Validation
- Agent Write 권한·Audit·Rollback

## 필요한 신규 구조와 해결 순서

1. `operating-model/**`: 책임·Gate·Scope
2. `notion/schema/**`: P1~P2 승인 후 명세
3. `notion/mappings/**`: P3 승인 후 Process 연결
4. `notion/pilot/**`: B2 Pilot 기록
5. `automation/**`: B3 자동화 승인 후 설계·구현
6. `decisions/**`: 미결 Gate와 변경 이력

## 운영 리스크

- 업무 건과 Task 단위가 불명확하면 중복·누락이 발생한다.
- 상태·증빙 기준이 없으면 완료 신뢰성과 병목 측정이 불가능하다.
- Notion 댓글과 Slack 알림의 우선순위가 없으면 이력이 분산된다.
- 지원팀·운영팀 소유권이 불명확하면 Record 최신성 책임이 충돌한다.
- Process 11을 완성된 종료 Process로 사용하면 후속 완수 상태가 왜곡된다.

## 자동화 리스크

- `UNKNOWN` 판단의 자동 실행
- 단일 CASE의 공통화
- Actor·채널·수탁계좌 기준의 임의 추론
- 무승인 댓글·상태 변경·외부 발송
- Audit·Rollback 없는 Agent Write
- Pilot 검증 전 전사 확대

## Known Gaps 영향

| Known Gap | Schema·운영 영향 | 처리 TAP |
|---|---|---|
| 신투 Trigger·근거자료 | Intake·Trigger 자동 생성 금지 | P3, B2, CP-06 |
| 채널 선택 기준 | 채널은 기록하되 자동 선택 금지 | P4, B2 |
| 대리·제3자 수령 | 수령자·증빙은 UNKNOWN 허용 | P2, P3, B2 |
| 계좌해지 표준 Actor | Actor 미확정 상태와 Escalation 필요 | P2, P3, B2 |
| 폐업·계좌해지 선후 | 독립 업무 건으로 추적, 자동 연결 금지 | P1, P3 |
| 수탁계좌 기준 | 계좌 유형 UNKNOWN 허용 | P1, P3, B2 |
| 지점별 서류 차이 | 기관 Variation과 Evidence 분리 | P3, B2 |
| 인터뷰 V2 미착수 | 필요한 Gate 질문에 포함 | P1~P5 |
| 독립 CASE 부족 | Pilot 성공 기준과 표본에 반영 | B2 |
| Process 11 미완성 | MVP Task Template 제외, Handoff 상태만 후보 | P3 |

## 비차단 Backlog

- Source Extract 템플릿 재작업
- 관리역 인터뷰 v1·V2 통합
- AI Cross-check
- REC_S3_01
- 재시연 파일럿 잔여 구간
- 조합 Master DB, 알림 Queue DB, Process 11 포함 여부의 Pilot 후 재평가

새로 발견된 항목은 구현하지 않고 `decisions/pending-approvals.md`와 관련 TAP에서 검토한다.
