# Automation Expansion Roadmap

| Phase | 목표 | 진입 Gate | 허용 | 금지 | Exit |
|---|---|---|---|---|---|
| Phase 1 Manual | Notion 업무·Task·상태·증빙 수동 운영 | CP-05-P5 Build 승인 | 사람이 등록·갱신·Mention | Automation, Agent Write | MVP Build QA와 Manual Pilot |
| Phase 2 Assisted | Read-only 분석과 다음 Action·누락·Task 후보 제안 | CP-05-B3, AG-24·25 | 읽기·제안·사람 승인 초안 | 자율 Write, 외부 발송 | 제안 품질·Human Gate 검증 |
| Phase 3 Approval-based Write | 승인된 상태·Task 변경 | CP-07-P1, AG-26~31·34 | 최소 권한 Write·Audit·Rollback | 무승인 변경·법적 판단·자율 외부발송 | Write Pilot QA |
| Phase 4 Operations-team Expansion | 운영팀·GP 소통·서류 초안·날인 요청 지원 | 지원팀 MVP 안정화, AG-32~35 | 승인된 조회·초안·요청 | 지원팀 검증 전 확장, 무승인 GP 소통 | 별도 Expansion 승인 |

## 공통 안전조건

- `UNKNOWN`, `CASE_ONLY`, 미승인 `PROVISIONAL`을 자동 Rule로 사용하지 않는다.
- Human-only Task와 외부 발송은 명시적 승인을 요구한다.
- 모든 Write는 Audit Log와 실패·Rollback 경로를 가진다.
- Phase를 건너뛰지 않으며 다음 Phase를 자동 실행하지 않는다.
