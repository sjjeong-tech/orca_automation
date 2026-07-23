# Automation Expansion Roadmap

| Phase | 목표 | 진입 Gate | 허용 | 금지 | Exit |
|---|---|---|---|---|---|
| Phase 1 Manual | Skeleton 조기 검증 후 Pilot A 업무·Task·상태·증빙 수동 운영 | P1·AG-S1 승인 후 Skeleton, P5 승인 후 Pilot-ready Build | 최소 Skeleton, 사람이 등록·갱신·Mention | Skeleton에서 Automation·Slack·Agent Write·전체 Process Mapping 금지 | P03·04·07·08 Manual Pilot A와 Schema Revision |
| Phase 2 Assisted | Read-only 분석과 다음 Action·누락·Task 후보 제안 | CP-05-B3, AG-24·25 | 읽기·제안·사람 승인 초안 | 자율 Write, 외부 발송 | 제안 품질·Human Gate 검증 |
| Phase 3 Approval-based Write | 승인된 상태·Task 변경 | CP-07-P1, AG-26~31·34 | 최소 권한 Write·Audit·Rollback | 무승인 변경·법적 판단·자율 외부발송 | Write Pilot QA |
| Phase 4 Operations-team Expansion | 운영팀·GP 소통·서류 초안·날인 요청 지원 | 지원팀 MVP 안정화, AG-32~35 | 승인된 조회·초안·요청 | 지원팀 검증 전 확장, 무승인 GP 소통 | 별도 Expansion 승인 |

## 공통 안전조건

- `UNKNOWN`, `CASE_ONLY`, 미승인 `PROVISIONAL`을 자동 Rule로 사용하지 않는다.
- Human-only Task와 외부 발송은 명시적 승인을 요구한다.
- 모든 Write는 Audit Log와 실패·Rollback 경로를 가진다.
- Phase를 건너뛰지 않으며 다음 Phase를 자동 실행하지 않는다.

## Pilot A 경계

- 포함: Process 03, 04, 07, 08
- 제외: Process 05, 06, 09, 10, 11과 그 외 비대상 Process
- 실제 조합·기간·성공 Threshold는 Pilot 전 승인한다.
- 구조 완전성, 상태 최신성, 사용 부담, 협업 가시성, 운영 지속 가능성을 측정한다.
