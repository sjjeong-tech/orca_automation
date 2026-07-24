# Task Property Mapping

| Mapping 의미 | Task Property | Type | 쓰기 주체 | 규칙 |
|---|---|---|---|---|
| 운영 Task 표시 | Task명 | Title | 지원팀 | 사람이 이해할 수 있는 집약 단위 |
| Request 연결 | 상위 요청 | Relation | 지원팀/향후 시스템 | 필수 |
| FUND 문맥 | 관련 조합 | Rollup 후보 | 시스템 | N-06 실제값 미검증, J-02 전 필수 |
| Process 추적 | Process ID | Select | 지원팀/향후 시스템 | P01/P03/P04/P07/P08 |
| 집약 추적 | Operational Task ID | Text | 지원팀/향후 시스템 | OT-P*-* |
| 실행 상태 | Task 상태 | Status | 담당자 | TS-* 6상태 의미 |
| 수행자 | 담당자 | Person | 지원팀 | 실제 실행 책임 |
| 다음 반응 주체 | 현재 Actor | Select | 담당자 | ACT-* 5종 |
| 기한 | 목표일 | Date | 지원팀/담당자 | 대기 중에도 유지 |
| 다음 행동 | 다음 Action | Text | 담당자 | TS-WAIT에서 필수 |
| 전이 차단 원인 | Blocker | Text | 담당자 | 원인·책임자·일자·해소조건 구조화 |
| 완료 판정 | 완료조건 | Text | P3 Contract/지원팀 | Yes/No 관찰 가능 문장 |
| 근거 | 완료증빙 | Text | 담당자/검수자 | `Evidence ID | 경로 | 확인자 | 확인일` |
| 보조 설명 | 비고 | Text | 담당자 | Rule이나 Evidence 대체 금지 |

Atomic Task ID는 machine-readable Mapping에 보존되며, 현재 Skeleton에 전용 Property가 없으므로 Operational Task의 완료조건·비고 또는 향후 P3 승인 Build 명세로 연결한다. 실제 Property 추가는 별도 Work Order 없이는 금지한다.
