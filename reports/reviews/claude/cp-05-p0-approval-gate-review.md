# CP-05-P0 Approval Gate Review (AG-01~AG-35, AG-S1)

## 요약

- 총 Gate: 37 (`DECIDED` 5, `APPROVAL_REQUIRED_BEFORE_BUILD` 15, `APPROVAL_REQUIRED_BEFORE_PILOT` 3, `APPROVAL_REQUIRED_BEFORE_AUTOMATION` 11, `DEFER_UNTIL_PILOT` 3) — `operating-model/approval-gates.md`의 자체 집계와 일치함을 재계산으로 확인(0+15+3+11+3+5=37).
- 지금(P0 시점) 결정된 Gate: AG-01~04, AG-20A — 모두 P1·B2 설계에 직접 필요한 최소한의 선행 결정이며, 과도하게 앞서 결정된 항목은 없음.
- Build 전 승인 Gate 15건은 P2~P5에 걸쳐 분산되어 있으며, P5에서 "미결 Build Gate 0"으로 최종 확인되는 이중 구조(결정은 P2~P4에서, 완결 확인은 P5에서)로 설계되어 있음 — 중복이 아니라 결정-확인 분리로 판단.
- 중복·누락·시점 오류로 분류할 항목: 아래 표 참고. Blocking 수준은 없음.

## AG-01~AG-35, AG-S1 Coverage

| Gate | 판정 | 현재 시점 | 권장 시점 | 문제 | 권장 조치 |
|---|---|---|---|---|---|
| AG-01~04 | PASS | DECIDED(P0-R, 2026-07-23) | 유지 | 없음 | 없음 |
| AG-05 (조합 Master DB) | PASS | DEFER_UNTIL_PILOT | 유지 | 없음 — Skeleton에는 불필요, Pilot 데이터로 판단 필요 항목이라는 근거가 명확함 | 없음 |
| AG-06 (알림 Queue DB) | PASS | APPROVAL_REQUIRED_BEFORE_BUILD(P4 전) | 유지 | 없음 | 없음 |
| AG-07~09 (상태값·대기·증빙) | PASS(결정-확인 이중구조) | P2에서 결정, P5에서 "미결 0" 재확인 | 유지 | 중복처럼 보이나 실제로는 결정 단계와 Build 착수 전 최종 확인 단계로 명확히 분리됨 | 없음 |
| AG-10~12 (Task 집약·반복·P11 MVP) | PASS | Build 전(P3) | 유지 | 없음 | 없음 |
| AG-13~19 (Form·알림·댓글) | PASS | Build 전(P4) | 유지 | 없음 | 없음 |
| AG-20A (Pilot Process 범위) | PASS | DECIDED(2026-07-23) | 유지 | 없음 — P3 Mapping의 Input으로 즉시 필요해 조기 결정이 타당함 | 없음 |
| AG-20B~22 (Pilot 대상·기간·성공기준) | PASS | APPROVAL_REQUIRED_BEFORE_PILOT | 유지 | 없음 | 없음 |
| AG-23~24 (MVP 지속·자동화 진입) | PASS | DEFER_UNTIL_PILOT | 유지 | 없음 — Pilot 결과 없이 결정 불가능한 항목이 정확히 유보됨 | 없음 |
| AG-25~31, 34 (Read/Write/Rollback/Audit) | PASS | APPROVAL_REQUIRED_BEFORE_AUTOMATION | 유지 | 없음 — 모두 CP-06/07-P1 전으로 적절히 후행 배치됨 | 없음 |
| AG-32~35 (운영팀 확장) | PASS | APPROVAL_REQUIRED_BEFORE_AUTOMATION(CP-08-P1 전) | 유지 | 없음 — 지원팀 MVP 안정화 이후로 명확히 후행 배치됨 | 없음 |
| AG-S1 (Fast Skeleton Build) | PASS(단, 문서 상충 있음) | APPROVAL_REQUIRED_BEFORE_BUILD(P1 완료 후) | 유지 | Gate 자체는 타당하나 `roadmap-governance.md`의 일반 Build 금지 원칙이 이 예외를 명시하지 않음(→ 별도 보고서 RM-03과 동일 사안) | `roadmap-governance.md`에 AG-S1 예외 근거 각주 추가 |
| (Gate 없음) CP-05-R1 대표님 확인 | GATE_MISSING(경) | 별도 Gate 없음, 문서 완성으로 Exit | R1 Exit 또는 P2 Entry에 명시 | R1은 "TI 작성 완료"로 종료되며 대표님의 실제 응답 수신을 확인하는 Gate ID가 없음(→ 별도 보고서 RM-01과 동일 사안) | R1 전용 경량 Gate(예: `AG-R1`) 신설 또는 P2 선행조건에 응답 수신 추가 |

## 지금 승인할 Gate

AG-01~04, AG-20A — 이미 DECIDED. 추가로 지금 승인이 필요한 항목은 없음(P0 시점 기준 적절).

## Build 전 승인할 Gate

AG-06~19, AG-S1 (15건) — P2~P4에서 개별 결정되고 P5에서 "미결 0"으로 최종 확인.

## Pilot 전 승인할 Gate

AG-20B, AG-21, AG-22 (3건) — B2 착수 전 필요.

## Automation 전 승인할 Gate

AG-25~31, AG-32~35 (11건, AG-34 중복 언급 포함 실질 11개 고유 항목) — CP-06-P1/CP-07-P1/CP-08-P1 전 단계적으로 필요.

## 중복·누락·시점 오류 종합

- **누락(경미)**: CP-05-R1에 "대표님 응답 수신"을 확인하는 정식 Gate ID가 없음. 위 표 참고, `cp-05-p0-roadmap-review.md`의 RM-01과 동일 사안.
- **시점 오류**: 발견되지 않음. 모든 Gate가 실제로 그 결정이 필요해지는 시점(설계/Build/Pilot/Automation) 직전에 배치되어 있으며, 필요 이상으로 이르게(GATE_TOO_EARLY) 또는 늦게(GATE_TOO_LATE) 배치된 사례는 없음.
- **중복(문서상)**: AG-07~09 등이 P2와 P5 두 곳에 언급되지만 이는 "결정 시점"과 "Build 착수 전 완결 확인 시점"의 의도된 분리이며 진짜 중복(DUPLICATE_GATE)이 아님. 다만 `decisions/pending-approvals.md`가 `operating-model/approval-gates.md`를 사실상 재복제하는 것은 문서 차원의 중복이며 `cp-05-p0-roadmap-review.md` RM-04에서 다룸.
- **불필요(UNNECESSARY_GATE)**: 37개 Gate 중 제거를 권장할 만큼 근거 없이 과도한 Gate는 발견되지 않았다. 각 Gate는 "미결정 시 영향" 컬럼에 구체적 리스크를 명시하고 있어 형식적 절차로 보이지 않는다.
