# Process Model과 실행 인스턴스 계층

## 목적

고유번호증 신청의 규칙, 사람이 추적할 업무 단위, 실제 Notion Record를 서로 다른 계층으로 관리한다. 한 계층의 ID를 다른 계층의 의미로 사용하지 않는다.

| 계층 | 역할 | Canonical ID | Source of Truth |
|---|---|---|---|
| Canonical Process Model | 업무 규칙과 Atomic Step 정의 | `E2E-03`, `세무서_1`, Atomic `01`~`16` | Notion Process Model Root와 E2E-03 |
| Operational Task Definition | 사람이 추적할 6개 업무 단위 | `P03`, `P03-T01`~`P03-T06` | `contracts/process-execution-mapping.yaml` |
| Request·Task Execution Instance | 승인된 요청의 실제 실행 상태 | `transaction_id`, `{transaction_id}-P03-T01`~`T06` | Notion 지원팀 업무요청·지원팀 Task |

## Canonical Process Model

- E2E Process: `E2E-03 고유번호증 신청·수령`
- Process Model: `세무서_1 고유번호증 신청`
- Atomic Step: `01`~`16`
- 원문에서 확인되지 않은 규칙은 실행 계약에 추정하여 추가하지 않는다.
- Atomic Step은 Process 지식 단위이며 Notion Task로 그대로 복제하지 않는다.

## Operational Task Definition

| Task ID | Task | Atomic Step |
|---|---|---|
| P03-T01 | 요청정보·착수조건 확인 | 01, 03, 04 |
| P03-T02 | 제출서류 수령·누락 검수 | 02, 05, 06, 07 |
| P03-T03 | 신청서류 작성·날인본 확인 | 02, 08 |
| P03-T04 | 세무서 제출 준비·접수 | 09, 10, 11, 12 |
| P03-T05 | 결과물 수령 | 13, 14, 15 |
| P03-T06 | 스캔·저장·관리역 전달 | 16 |

Atomic Step `02`는 유일한 허용 중복이다. 날인·기재 검수는 수령 서류의 완전성 검수이면서 신청서류 구성의 착수 입력이므로 두 Operational Task가 같은 사실을 참조한다. 실행 Task를 중복 생성한다는 의미는 아니다.

## Request·Task Execution Instance

- Request는 업무 전체 Lifecycle을 나타낸다.
- Task는 `P03-T01`~`P03-T06` 정의의 실행 인스턴스다.
- Task Instance ID는 `{transaction_id}-{operational_task_id}`다.
- 기존 `CI1-P03-01` 형식의 TEST Record는 감사 이력으로 유지한다.
- 새 ID는 신규 Pilot·운영 생성에만 적용한다.
- 동일 `transaction_id` 재실행은 실행 로그의 Page ID를 재사용하고 이미 생성된 Task를 다시 만들지 않는다.

## Write Gate

`PREPARE → PREVIEW → COMMIT` 순서를 유지한다.

1. PREPARE에서 입력, 사람, 조합, 중복, Process Mapping을 확인한다.
2. PREVIEW에서 E2E·Process·Task·Atomic Reference와 Planned Write를 표시한다. 실제 Write는 0이다.
3. 명시적 승인과 지원 request type의 Canonical Mapping이 모두 있어야 COMMIT할 수 있다.
4. 미지원 request type은 Process Mapping 없이 생성하지 않는다.

## Request 본문 템플릿

[`templates/request-execution-template.md`](../templates/request-execution-template.md)는 Notion의 업무 실행 기본 템플릿 9개 섹션을 Markdown으로 옮긴 초안이다.

- 신규 Property를 요구하지 않는다.
- 기본값은 미적용이다.
- 승인된 TEST 생성 시에만 선택 적용할 수 있다.
- 실제 업무 적용은 별도 승인 대상이다.

## Canonical 근거

- [세무서·은행 업무 Process Model](https://app.notion.com/p/8e3bafb3e64f448d8e06d63127d1155e)
- [E2E-03 고유번호증 신청·수령](https://app.notion.com/p/0a1d535868134040b878724136735211)
- [업무 실행 기본 템플릿](https://app.notion.com/p/cfd9f799c809438e8cd48b90b3b68ab3)
- [Process Model Source Structure Index](https://app.notion.com/p/7b1dafb5212d4de2995d5b8219399698)

