# CP-05-P1 — Record Unit & Notion DB Architecture

## 전체 판정

**PASS — AG-S1 승인 검토에 필요한 Fast Skeleton Architecture가 준비됐다.**

이번 설계는 실제 Notion을 변경하지 않았고 Pilot A의 P03·P04·P07·P08만 사용한다. 상태·증빙·Process Mapping·협업 자동화는 확정하지 않았다.

## 설계 요약

| 항목 | 설계 |
|---|---|
| 상위 Record | 한 조합에서 독립 시작·완료조건을 가진 하나의 행정 업무 건 |
| Pilot A Record | `[조합명] — 신규 행정` 1건 |
| DB | 지원팀 업무 DB, 지원팀 Task DB |
| Property 후보 | 업무 26개, Task 20개 |
| S1 포함 | Required 24개 + Optional 12개 = 36개 |
| Deferred | 10개 |
| Relation | 업무 1 : Task N 양방향 Relation 1개 |
| Rollup | S1 0개, 후속 후보 2개 |
| View | 업무 4개, Task 5개 |
| 테스트 데이터 | 가상 업무 1건, 가상 Task 9건 |
| Operational Task 후보 | 23개; P3 전 Template 확정 금지 |

## 확정 결정

- DEC-CP05-02: 상위 Record는 조합별 업무 건이다.
- DEC-CP05-03: 독립 완료조건을 가진 업무는 별도 Record로 분리한다.
- DEC-CP05-04: MVP는 업무 DB와 Task DB의 2개 구조다.
- Pilot A 범위는 P03·P04·P07·P08이다.
- Process Atomic Task와 Notion Operational Task는 동일하지 않다.
- 조합 Master DB는 AG-05에 따라 Pilot 이후 판단한다.

## P1 Architecture 권장안

아래 권장안은 Skeleton 입력이며 상태·증빙·Mapping 관련 값은 P2~P4 승인 전 확정 운영 Rule이 아니다.

| 결정 항목 | 선택안 | 권장안 | 이유 | S1 영향 | P2~P4 영향 | 사용자 승인 필요 |
|---|---|---|---|---|---|---|
| 업무명 생성 | 자유 입력 / 고정 형식 | `[조합명] — [업무 유형]` 수동 입력 | 화면에서 즉시 식별 | Title 입력 | Intake에서 생성 규칙 재검토 | AG-S1에서 확인 |
| 업무 ID | 없음 / 수동 / 자동 | `ADM-YYYYMM-SEQ` 수동 | Formula 없이 안정 식별 | Text 추가 | Post-Pilot 자동화 검토 | AG-S1에서 확인 |
| 조합명 Type | Text / Relation | Text | AG-05가 Pilot까지 유예 | Property 1개 | Pilot 후 Master DB 검토 | 추가 승인 불필요 |
| 담당 관리역 Type | Person / Text | Person | 책임자·Filter 활용 | 권한 확인 필요 | P4 협업 연결 | AG-S1에서 권한 확인 |
| 지원팀 담당자 Type | Person / Text | Person | 내 Task·담당자 View | 권한 확인 필요 | P4 협업 연결 | AG-S1에서 권한 확인 |
| 현재 단계·전체 상태 | 통합 / 분리 | 분리 | 위치와 진행상태는 다른 개념 | Select + Status | P2에서 값·전이 재설계 | 상태값은 AG-07 |
| 다음 Action | Text / Task Relation | Text | S1에서는 빠른 수동 가시성 우선 | Text 입력 | P3에서 생성·Relation 여부 검토 | AG-10 연계 |
| Blocker | Text / Select / Select+Text | Text | 유형 체계 전 원인 손실 방지 | Text 입력 | P2에서 Select+Text 검토 | AG-07~09 연계 |
| Drive 경로 | Text / Files / URL | URL | 실제 파일은 Drive, Notion은 위치만 보유 | 원본·결과 URL | P2/P4 증빙·권한 검토 | AG-S1에서 확인 |
| 업무에서 Task 표시 | Relation / Rollup | Relation 목록 | Rollup 없이도 이해 가능 | 양방향 Relation | P2/P3 후 Rollup 후보 검토 | AG-S1에서 확인 |
| Task ID | 없음 / 수동 / 자동 | 선택적 수동 `TSK-YYYYMM-SEQ` | Skeleton에서 자동화 회피 | Optional Text | Post-Pilot 자동화 검토 | 추가 승인 불필요 |
| Process ID | 자유 Text / 고정값 | `P03`, `P04`, `P07`, `P08`, `INTAKE` | Repo와 추적 가능 | Select | P3 Mapping 확정 | AG-10 연계 |
| Operational Task ID | 없음 / 고정 형식 | `OT-[Process]-[SEQ]` | Atomic Task와 명시적 구분 | Required Text | P3에서 집약 Mapping 검증 | AG-10 연계 |
| S1 업무 상태 | 자유 / 임시 후보 | 접수·진행 중·대기·보완·완료·중단 | 화면·Filter 시험에 필요한 최소치 | 수동 Status | P2에서 전면 재검토 | AG-07 |
| S1 Task 상태 | 자유 / 임시 후보 | 예정·진행 중·대기·완료·제외 | 조건부 Task 포함 가능 | 수동 Status | P2에서 전면 재검토 | AG-07 |
| S1 View 수 | 최소 / 후보 전체 | 업무 4, Task 5 | 가시성 시험과 과잉 생성의 균형 | 총 9개 | P4에서 Dashboard 재설계 | AG-S1에서 확인 |

## 임시 상태·단계

모든 값은 `PROVISIONAL_FOR_SKELETON`이다.

- 업무 상태 6개: 접수, 진행 중, 대기, 보완, 완료, 중단
- 현재 단계 6개: 업무 접수, 고유번호증, 홈택스, 계좌개설, 계좌개설 보완, 최종 확인
- Task 상태 5개: 예정, 진행 중, 대기, 완료, 제외
- Formula 기반 전이와 자동화: 금지

## AG-S1 승인 요청 요약

| 승인 판단 Input | 값 |
|---|---|
| 실제 생성 DB 수 | 2 |
| DB | 지원팀 업무 DB, 지원팀 Task DB |
| S1 Property 수 | 업무 22, Task 14, 합계 36 |
| Relation 수 | 논리 Relation 1, 양방향 표시 |
| Rollup 수 | 0 |
| View 수 | 업무 4, Task 5 |
| 테스트 업무 | 1 |
| 테스트 Task | 9 |
| 생성 위치 | **확인 필요** — 사용자가 지정한 Notion 상위 페이지 |
| 권한 | DB·Property·View·Relation·테스트 Record 생성 및 테스트 정리 권한 |
| 예상 재작업 | Property명·Type, 임시 상태값, View Filter, Task 집약 수준, 테스트 Record |
| 금지 기능 | Formula, Rollup, Automation, Slack, Mention 자동화, Agent Write, Pilot A 밖 Mapping |
| Rollback | 대상 확인 후 테스트 Task → 테스트 업무 순으로 정리; Skeleton DB 정리는 별도 명시 승인 필요 |

AG-S1은 이 TAP에서 승인하지 않는다. 실제 생성 위치와 권한을 확인하고 GPT·사용자가 승인해야 CP-05-S1을 실행할 수 있다.

## 위험

- Person Property는 실제 Notion 사용자와 권한이 없으면 테스트가 제한된다.
- 임시 상태값이 운영 표준으로 오인될 수 있으므로 모든 명세에 잠정임을 표시했다.
- Operational Task 집약 수준은 실제 UI 사용 전 과도하거나 부족할 수 있다.
- Relation 삭제·업무 분리 시 Task 연결이 유실될 수 있으므로 S1 QA가 필요하다.
- 테스트 Record 삭제는 외부 시스템 쓰기이므로 대상 확인과 승인이 필요하다.

## P2 이후 Deferred

- P2: 상태 전이, 대기 세분화, 완료 최소 증빙, Blocker 유형, 기한 기준
- P3: Atomic-to-Operational Mapping, Next Task, Input/Output, Exception, 조건부 Task 생성
- P4: Intake, Person/Mention, 알림 Event, 확인 요청
- Post-Pilot: 조합 Master DB, 자동 ID, Rollup, 자동화·Agent 상태

## S1 Build Input

- [지원팀 업무 DB 명세](../notion/schema/support-work-db.md)
- [지원팀 Task DB 명세](../notion/schema/support-task-db.md)
- [Relation 명세](../notion/schema/support-db-relations.md)
- [View 명세](../notion/schema/skeleton-views.md)
- [테스트 Record 명세](../notion/schema/skeleton-test-records.md)
- [Property 유예 Matrix](../notion/schema/property-deferment-matrix.md)
- [Operational Task 후보](../notion/schema/operational-task-candidates.md)

## Scope 확인

- Notion 변경: 0
- Process·Variation·Source 변경: 0
- Pilot A 밖 Process: 0
- Process 11: 제외
- 실제 개인정보·실제 조합정보: 0
- 자동화 구현: 0
