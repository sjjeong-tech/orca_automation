# Conditional TAP Queue

Queue Controller는 아래 표를 순서대로 평가한다. 상태가 변경될 때만 이 파일을 갱신하며, 선행 Gate를 통과하지 않은 TAP은 실행하지 않는다.

**Queue 전체 상태:** `PAUSED_FOR_EXTERNAL_REVIEW`

**현재 Checkpoint:** `CP-05-P0-R — Revised Master Roadmap 완료 / Claude 독립 검토`

**최근 Revision:** `TAP P1-R2 — COMPLETED (PASS WITH NON-BLOCKING GAPS)`

**최근 Process 실행:** `TAP P2-R — COMPLETED (PASS WITH NON-BLOCKING GAPS)`

**최근 계획:** `TAP V0 — COMPLETED`

**최근 실행:** `TAP CP-05-P0-R — COMPLETED (TARGETED REVISION PASS)`

**다음 READY 후보:** `A-CP05-P0-REVIEW — READY`

## 자동 실행 Checkpoint

| Checkpoint | 정지 TAP | 다음 시작 TAP | 상태 |
|---|---|---|---|
| CP-01 | TAP S2 | TAP S2-P | REACHED |
| CP-02 | TAP S4-I | TAP S4-I-P | REACHED |
| CP-03 | TAP P1-QA | TAP P1-P | REACHED |
| CP-04 | TAP P2-QA | TAP P2-P | REACHED |
| CP-05 | TAP V1-QA | TAP V1-P | WAITING |
| CP-06 | TAP F1 | TAP F1-P | WAITING |

| 순서 | TAP ID | TAP 이름 | 업무지도 위치 | 선행 TAP | 필수 Gate | 상태 | Commit 요구 | Push 요구 | 병목 | 다음 조치 |
|---:|---|---|---|---|---|---|---|---|---|---|
| 1 | TAP 3-B2-FIX | Notion MCP 검증 판정 정정 | Source 접근 / Notion 연결 검증 | TAP 3-B2 | 비차단 PASS WITH ISSUES | COMPLETED | 아니요 | 아니요 | 없음 | 완료 유지 |
| 2 | TAP Q-00 | Conditional TAP Queue 정책 설정 | 오케스트레이션 제어 계층 / 공통 Queue Gate 설정 | TAP 3-B2-FIX | PASS 또는 비차단 PASS WITH ISSUES | COMPLETED | 예 | 아니요 | 없음 | 완료 유지 |
| 3 | TAP Q-00-P | Conditional TAP Queue 정책 Push | 오케스트레이션 제어 계층 / 공통 Queue Gate 배포 | TAP Q-00 | 지정 Commit 및 clean | COMPLETED | 예 | 예 | 없음 | 완료 유지 |
| 4 | TAP 3-A2 | Notion Source Index 직접 반입·검증 | Source 확보 / 구조 인덱스 | TAP Q-00-P | PASS 또는 PASS WITH FORMAT NORMALIZATION | COMPLETED | 예 | 아니요 | 없음 | 완료 유지 |
| 5 | TAP 3-A2-P | Source Index Commit Push | Source 확보 / 구조 인덱스 배포 | TAP 3-A2 | 지정 Commit 존재 및 clean | COMPLETED | 예 | 예 | 없음 | 완료 유지 |
| 6 | TAP S0 | Process Model Repo Stage 0 초기화 | Source 확보 / Repo 실행환경 | TAP 3-A2-P | PASS | COMPLETED | 예 | 아니요 | 없음 | 완료 유지 |
| 7 | TAP S0-P | Stage 0 Commit Push | Source 확보 / Repo 실행환경 배포 | TAP S0 | 지정 Commit 존재 및 clean | COMPLETED | 예 | 예 | 없음 | 완료 유지 |
| 8 | TAP S1 | Pilot Source Extract N-05-03 | 세무서 업무 / 고유번호증 신청 | TAP S0-P | PASS | COMPLETED | 아니요 | 아니요 | 없음 | 완료 유지 |
| 9 | TAP S2 | Pilot Source QA | Source 검증 / 고유번호증 신청 | TAP S1 | PASS; FAIL 시 Queue BLOCKED | COMPLETED | 예 | 아니요 | 없음 | CP-01 검토 대기 |
| 10 | TAP S2-P | Pilot Source Commit Push | Source 검증 / Pilot 배포 | TAP S2 | QA PASS 및 지정 Commit 존재 | COMPLETED | 예 | 예 | 없음 | 완료 유지 |
| 11 | TAP S3-A | Source Extract Wave A | Source Extract / 핵심 공통 및 은행 흐름 | TAP S2-P | PASS | COMPLETED | 아니요 | 아니요 | 없음 | 완료 유지 |
| 12 | TAP S4-A | Source QA Wave A | Source 검증 / Wave A | TAP S3-A | PASS; FAIL 시 Queue BLOCKED | COMPLETED | 예 | 아니요 | 없음 | 완료 유지 |
| 13 | TAP S4-A-P | Wave A Commit Push | Source 검증 / Wave A 배포 | TAP S4-A | QA PASS 및 지정 Commit 존재 | COMPLETED | 예 | 예 | 없음 | 완료 유지 |
| 14 | TAP S3-B | Source Extract Wave B | Source Extract / 나머지 업무 | TAP S4-A-P | PASS | COMPLETED | 아니요 | 아니요 | 없음 | 완료 유지 |
| 15 | TAP S4-B | Source QA Wave B | Source 검증 / Wave B | TAP S3-B | PASS; FAIL 시 Queue BLOCKED | COMPLETED | 예 | 아니요 | 없음 | 완료 유지 |
| 16 | TAP S4-B-P | Wave B Commit Push | Source 검증 / Wave B 배포 | TAP S4-B | QA PASS 및 지정 Commit 존재 | COMPLETED | 예 | 예 | 없음 | 완료 유지 |
| 17 | TAP S4-I | Source Extract 통합 QA | Source 검증 / 전체 Source 정합성 | TAP S4-B-P | PROCESS READY WITH GAPS; NOT READY 시 BLOCKED | COMPLETED | 예 | 아니요 | 비차단 Gap 12개 | CP-02 검토 대기 |
| 18 | TAP S4-I-P | Source 통합 QA Commit Push | Source 검증 / 통합 결과 배포 | TAP S4-I | 허용 판정 및 지정 Commit 존재 | COMPLETED | 예 | 예 | 없음 | 완료 유지 |
| 19 | TAP P1 | Process Model Wave 1 생성 | Process Model / 핵심 E2E·세무서·은행 | TAP S4-I-P | PASS | COMPLETED | 아니요 | 아니요 | 없음 | 완료 유지 |
| 20 | TAP P1-QA | Process Wave 1 QA | Process 검증 / 핵심 Process | TAP P1 | PASS; FAIL 시 Queue BLOCKED | COMPLETED | 예 | 아니요 | 없음 | CP-03 검토 대기 |
| 21 | TAP P1-P | Process Wave 1 Commit Push | Process 검증 / 핵심 Process 배포 | TAP P1-QA | QA PASS 및 지정 Commit 존재 | COMPLETED | 예 | 예 | 없음 | 완료 유지 |
| 22 | TAP P2 | Process Model Wave 2 생성 | Process Model / 지원 Process | TAP P1-R2 | Revision QA 및 Push 성공 | COMPLETED | 아니요 | 아니요 | Process 11 DRAFT | 완료 유지 |
| 23 | TAP P2-QA | Process Wave 2 QA | Process 검증 / 지원 Process | TAP P2 | PASS; FAIL 시 Queue BLOCKED | COMPLETED | 예 | 아니요 | 비차단 Gap | 완료 유지 |
| 24 | TAP P2-P | Process Wave 2 Commit Push | Process 검증 / 지원 Process 배포 | TAP P2-QA | QA PASS 및 지정 Commit 존재 | COMPLETED | 예 | 예 | 없음 | 완료 유지 |
| 25 | TAP V1 | Variation 통합 | 업무 변형 / 조합·GP·계좌·기관 | TAP P2-P | PASS | WAITING | 아니요 | 아니요 | 분할 Queue 실행 대기 | V1-A부터 분할 실행 |
| 26 | TAP V1-QA | Variation QA | 업무 변형 / Variation 검증 | TAP V1 | PASS; FAIL 시 Queue BLOCKED | WAITING | 예 | 아니요 | 선행 TAP 대기 | Variation QA 수행 |
| 27 | TAP V1-P | Variation Commit Push | 업무 변형 / Variation 배포 | TAP V1-QA | QA PASS 및 지정 Commit 존재 | WAITING | 예 | 예 | 선행 TAP 대기 | Variation Commit 검증 후 Push |
| 28 | TAP F1 | Process Model 최종 통합 QA | 전체 E2E / Process·Variation·Evidence 정합성 | TAP V1-P | PASS | WAITING | 예 | 아니요 | 선행 TAP 대기 | 최종 QA 산출물 4종 작성 |
| 29 | TAP F1-P | 최종 QA Commit Push | 전체 E2E / 검증 결과 배포 | TAP F1 | QA PASS 및 지정 Commit 존재 | WAITING | 예 | 예 | 선행 TAP 대기 | 최종 QA Commit 검증 후 Push |
| 30 | TAP F2 | 최종 오케스트레이션 보고 | Gap 분석 / CASE·인터뷰·자동화 준비도 | TAP F1-P | PASS | WAITING | 예 | 아니요 | 선행 TAP 대기 | 최종 보고서 작성 |
| 31 | TAP F2-P | 최종 보고 Commit Push | Gap 분석 / 최종 결과 배포 | TAP F2 | 지정 Commit 존재 및 clean | WAITING | 예 | 예 | 선행 TAP 대기 | 최종 보고 Commit 검증 후 Push |

## Variation 분할 Queue

| 순서 | TAP ID | TAP 이름 | 선행 TAP | 상태 | 수정 범위 | 다음 조치 |
|---:|---|---|---|---|---|---|
| V0 | TAP V0 | Variation Model 사전설계·작업분할 | TAP P2-R | COMPLETED | 기획 3개·Queue 상태 | 외부 검토 |
| V1 | TAP V1-A | 조합 유형·GP 유형 | TAP V0 | COMPLETED | `variations/fund-type.md`, `variations/gp-type.md` | 초안 보존·A-V1 대기 |
| V2 | TAP V1-B | 계좌 유형 | TAP V1-A | COMPLETED | `variations/account-type.md` | 초안 보존·A-V1 대기 |
| V3 | TAP V1-C | 기관·지점·처리 방식 | TAP V1-B | COMPLETED | `variations/institution.md` | 초안 보존·A-V1 대기 |
| V4 | TAP A-V1 | Claude 독립 Source Review | TAP V1-A, V1-B, V1-C | COMPLETED_WITH_PARTIAL_COVERAGE | Claude Review Commit 2개 | 승인 Finding 반영 완료 |
| V5 | TAP V1-R1 | Claude Findings Source Enrichment | TAP A-V1 | COMPLETED | Source 7개·Disposition·Queue | Source Enrichment 보존 |
| V6 | TAP V1-R2 | Variation·Process Revision | TAP V1-R1 | COMPLETED | Variation 4개·Process 3개·Mapping·Disposition | Revision 보존 |
| V7 | TAP V1-I | 통합 Variation QA | TAP V1-R2 | COMPLETED | `reports/variation-integration-qa.md`, `reports/cp-04-completion.md` | CP-04 COMPLETE_WITH_KNOWN_GAPS |
| V8 | CP-05-PLAN | Gap Resolution & Interview Execution 계획 | TAP V1-I | CROSS_CUTTING_WORKSTREAM | 단계별 필요한 Gap만 해소 | 독립 선행 실행 금지 |

## Notion Operations Control Plane Queue

기존 `CP-05-PLAN` Gap Resolution은 독립 선행 TAP이 아니라 아래 전 단계의 `CROSS_CUTTING_WORKSTREAM`으로 재배치한다. 이 표의 후속 TAP은 자동 실행하지 않는다.

| 순서 | TAP ID | 역할 | 선행 Gate | 상태 | Master Deliverable | 다음 조치 |
|---:|---|---|---|---|---|---|
| C0 | CP-04 | As-Is Process Model v1 | V1-I | COMPLETE_WITH_KNOWN_GAPS | 선행 기반 | 결과 보존 |
| C1 | CP-05-P0 | Master Roadmap·Operating Model | CP-04 | COMPLETED | MD-01~10 | Revision 보존 |
| C2 | CP-05-P0-R | Skeleton·Pilot A·TI Targeted Revision | P0 | COMPLETED | MD-01~11 | Claude 검토 |
| C3 | A-CP05-P0-REVIEW | Revised Roadmap 독립 검토 | P0-R | READY | MD-01~11 | Claude 실행 |
| C4 | GPT·User Revised Roadmap Review | Finding 통합·승인 | Claude Review | WAITING | MD-01~11 | Review 결과 대기 |
| C5 | CP-05-P1 | Record Unit·DB Architecture | Revised Roadmap 승인 | BLOCKED_UNTIL_REVISED_ROADMAP_APPROVAL | MD-01,02 | 승인 전 실행 금지 |
| C6 | CP-05-S1 | Fast Notion Skeleton Build | P1·AG-S1 승인 | BLOCKED_UNTIL_P1_AND_BUILD_APPROVAL | MD-01,02,06 | 실제 DB 생성 금지 |
| C7 | CP-05-R1 | Notion AI Intermediate Reporting TI | S1 완료 | BLOCKED_UNTIL_SKELETON_COMPLETE | MD-11 | TI 작성 금지 |
| C8 | CP-05-P2 | Status & Evidence Model | S1·R1 Review | BLOCKED_UNTIL_SKELETON_REVIEW | MD-04 | Skeleton 관찰 대기 |
| C9 | CP-05-P3 | Process-to-Notion Mapping | P2 승인 | BLOCKED_BY_PREVIOUS_APPROVAL | MD-02,05 | P2 승인 대기 |
| C10 | CP-05-P4 | Intake·Collaboration Model | P3 승인 | BLOCKED_BY_PREVIOUS_APPROVAL | MD-03,06 | P3 승인 대기 |
| C11 | CP-05-P5 | Pilot-ready MVP Build Spec | P4 승인 | BLOCKED_BY_PREVIOUS_APPROVAL | MD-01~07 | Build 승인 명세 대기 |
| C12 | CP-05-B1 | Pilot-ready Notion MVP Revision | P5 Build 승인 | BLOCKED_UNTIL_BUILD_APPROVAL | MD-01~07 | Build 승인 대기 |
| C13 | CP-05-B2 | Manual Pilot A | B1 QA·실제 조합 승인 | PILOT_A_SCOPE_DECIDED_BUT_TARGET_PENDING | MD-07 | AG-20B~22 대기 |
| C14 | CP-05-B3 | Pilot Review·Schema Revision | B2 완료 | BLOCKED_BY_PREVIOUS_APPROVAL | MD-01~08 | Pilot 완료 대기 |
| C15 | CP-06-P1~B2 | Assisted Automation | Pilot A 승인 | BLOCKED_UNTIL_PILOT_A | MD-08 | AG-24·25 대기 |
| C16 | CP-07-P1~B1 | Agent Write Governance·Execution | Write Governance 승인 | BLOCKED_UNTIL_WRITE_GOVERNANCE | MD-09 | AG-26~31·34 대기 |
| C17 | CP-08-P1 | Operations-team Expansion | 지원팀 MVP 안정화 | FUTURE | MD-10 | AG-32~35 대기 |
| X1 | Gap Resolution | 단계별 필요한 Known Gap 해소 | 각 TAP Gate | CROSS_CUTTING_WORKSTREAM | MD-01~11 | 독립 선행 실행 금지 |

## Stage별 범위 및 산출물

- `TAP S0`: `tasks/orchestration-plan.md`, `mappings/process-source-plan.md`, `sources/notion/source-extract-template.md`만 초기화하며 Process 및 Source Extract 실데이터는 생성하지 않는다.
- `TAP S1`: 5.3, 6.3, E2E-03을 근거로 `sources/notion/n-05-03.md`를 생성한다.
- `TAP S2`: `reports/pilot-source-qa.md`를 생성한다.
- `TAP S4-I`: `reports/source-extract-qa.md`, `conflicts/unresolved.md`, `mappings/source-relationship-map.md`를 생성한다.
- `TAP P1`: `00-end-to-end`, `03-unique-number-application`, `04-security-card-hometax`, `07-account-opening`, `08-account-supplement`을 생성한다.
- `TAP P2`: `01-stamp-seal`, `02-mail-dispatch`, `05-unique-number-correction`, `06-closure-liquidation`, `09-account-closure`, `10-balance-certificate`, `11-result-handover`를 생성한다.
- `TAP V1`: `fund-type`, `gp-type`, `account-type`, `institution` Variation을 통합한다.
- `TAP F1`: `reports/process-model-qa.md`, `reports/gap-analysis.md`, `mappings/process-evidence-map.md`, `mappings/e2e-interface-map.md`를 생성한다.
- `TAP F2`: `reports/orchestration-final-report.md`를 생성한다.

## 상태 전이 기준

`QUEUED` → Gate 평가 → `READY` → `RUNNING` → `COMPLETED`

- 선행 TAP 미완료: `WAITING`
- 선행 Gate 실패 또는 필수 입력 누락: `BLOCKED`
- TAP 자체 실행 오류: `FAILED`
- 차단 해소: 사용자 `QUEUE RESUME` 후 중단 지점부터 재평가
- 등록 직후에는 첫 실행 가능 항목 하나만 `READY`로 두고 Queue를 일시정지한다.
