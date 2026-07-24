# CI4 E2E-03 Schema Alpha 실행 결과

## 1. 판정

- TAP: `CP-05-CI4-E2E03-SCHEMA-ALPHA`
- 실행일: 2026-07-24
- 범위: E2E-03 고유번호증 신청 공통 흐름
- 결과: `COMPLETED_WITH_ONE_SCHEMA_GAP`
- 운영 Record 변경: 0
- 기존 View·Filter 변경: 0
- 신규 DB·View: 0
- TEST 생성: Request 5건, Task 30건

승인된 Request `서류 상태` Select는 적용됐다. Task `Task 상태`의 `취소`
옵션은 Notion schema connector가 Status 옵션 추가 문법을 제공하지 않고, 페이지
값으로 신규 옵션을 지정한 Probe도 Notion API가 거부했으며, 로컬 Chrome UI
자동화는 창 포커스 제약으로 실행되지 않았다. 기존 옵션 보존을 보장하지 못하는
type 재설정은 수행하지 않았다.

## 2. Schema 변경 결과

### 지원팀 업무요청

- 추가: `서류 상태` / Select
- 옵션: `미전달`, `일부 전달`, `전달 완료`, `보완 필요`
- 기존 `실물서류 전달 여부` Checkbox: 유지, CI4 TEST에서는 쓰지 않음
- 운영 Record Backfill: 0
- Rollback: `서류 상태`가 TEST Record 외에 사용되지 않았음을 확인한 뒤 별도
  승인 작업에서 Property 제거. 이번 TAP에서는 자동 Rollback·삭제하지 않음.

### 지원팀 Task

- 현재 `Task 상태`: `시작 전`, `진행 중`, `완료`
- 승인안 `취소` 추가: 미적용
- 기존 옵션·Record 값 변경: 0
- 실패 Probe: TEST Task에 `Task 상태=취소` 지정 시 API
  `Invalid status value` 반환, Record 변경 없음
- 후속 최소 조치: Notion UI에서 기존 세 옵션을 유지한 채 `취소` 하나만 추가하고
  schema 재조회

## 3. 공통 TEST 자산

- FUND: [[TEST][CI1-PILOT] 가상조합1호](https://app.notion.com/3a772a41d9d78101b548f4e5c021ca94)
- Request DB: [지원팀 업무요청](https://app.notion.com/p/c60e9bc03a214735be082ed54905970d)
- Task DB: [지원팀 Task](https://app.notion.com/p/b7f50ee986714213befb4268fdd36920)
- 요청 업무 유형: `고유번호증 신청`
- Process ID: `P03`
- Operational Task ID: `P03-T01`~`P03-T06`
- 담당자·요청자: Workspace Person `정상준`
- 실제 개인정보·계좌정보·인증정보: 사용하지 않음

## 4. 생성 Request

| TC | Request | 최종 요청 상태 | 최종 서류 상태 | Task 수 |
|---|---|---|---|---:|
| A01 | [정상 흐름](https://app.notion.com/3a772a41d9d7815da695fe9b48fda88c) | 완료 | 전달 완료 | 6 |
| A02 | [서류 미전달](https://app.notion.com/3a772a41d9d781baa78bd24edab62be3) | 진행 중 | 미전달 | 6 |
| A03 | [일부 전달·누락](https://app.notion.com/3a772a41d9d78153b432c4245d399634) | 진행 중 | 전달 완료 | 6 |
| A04 | [날인 오류·GP 재요청](https://app.notion.com/3a772a41d9d781e8a2c9c1c3f589a0b0) | 진행 중 | 전달 완료 | 6 |
| A05 | [기관 추가요청](https://app.notion.com/3a772a41d9d78114a843f08439b8d892) | 진행 중 | 전달 완료 | 6 |

`실물서류 전달 여부` Checkbox는 모든 CI4 TEST에서 명시적으로 쓰지 않았다.
Notion 기본값 `false`가 조회되지만 CI4의 문서 상태 Source of Truth는 새
`서류 상태` Select다.

## 5. 생성 Task

각 Request에는 아래 여섯 Operational Task를 한 번씩 생성했다.

| ID | Task |
|---|---|
| P03-T01 | 요청정보·착수조건 확인 |
| P03-T02 | 제출서류 수령·누락 검수 |
| P03-T03 | 신청서류 작성·날인본 확인 |
| P03-T04 | 세무서 제출 준비·접수 |
| P03-T05 | 결과물 수령 |
| P03-T06 | 스캔·저장·관리역 전달 |

### A01 Task URL

1. [T01](https://app.notion.com/3a772a41d9d78103b725f70a3ce652c6)
2. [T02](https://app.notion.com/3a772a41d9d78152ad19dc34fd16ccdf)
3. [T03](https://app.notion.com/3a772a41d9d7812b865dcf18c514c535)
4. [T04](https://app.notion.com/3a772a41d9d781468e72fcb188f96de1)
5. [T05](https://app.notion.com/3a772a41d9d781c3b005f8e9f0b8e4b5)
6. [T06](https://app.notion.com/3a772a41d9d781a9acf2e0720d5bab71)

### A02 Task URL

1. [T01](https://app.notion.com/3a772a41d9d781bbba6dfcafbda3c110)
2. [T02](https://app.notion.com/3a772a41d9d78173a89ac9b2dbc11a52)
3. [T03](https://app.notion.com/3a772a41d9d7818b8c9cc2ab380165f5)
4. [T04](https://app.notion.com/3a772a41d9d781bebb4dda7796623cb5)
5. [T05](https://app.notion.com/3a772a41d9d781588f27fedcf5d487b2)
6. [T06](https://app.notion.com/3a772a41d9d7813b9d53e7740f87bf53)

### A03 Task URL

1. [T01](https://app.notion.com/3a772a41d9d781fe8fcacdee4120298a)
2. [T02](https://app.notion.com/3a772a41d9d7817cbfafdb6fbe8112b6)
3. [T03](https://app.notion.com/3a772a41d9d78156b4d0d537273ec7a8)
4. [T04](https://app.notion.com/3a772a41d9d781708947ff4421487b48)
5. [T05](https://app.notion.com/3a772a41d9d781c6b4f5c82b247ca797)
6. [T06](https://app.notion.com/3a772a41d9d7811ba738d1f819c8baa6)

### A04 Task URL

1. [T01](https://app.notion.com/3a772a41d9d78132b9d3e03e752828f7)
2. [T02](https://app.notion.com/3a772a41d9d78186acfbe3544916a2df)
3. [T03](https://app.notion.com/3a772a41d9d78156a4d1fed99b4dcdca)
4. [T04](https://app.notion.com/3a772a41d9d78179bfeaf7fd7a9d1954)
5. [T05](https://app.notion.com/3a772a41d9d781f7b387d8486c9c9bfc)
6. [T06](https://app.notion.com/3a772a41d9d7819d88a8d5b768e76a5f)

### A05 Task URL

1. [T01](https://app.notion.com/3a772a41d9d78106a6d7f788842bb2ef)
2. [T02](https://app.notion.com/3a772a41d9d7817cbbb9c66a39e14ae1)
3. [T03](https://app.notion.com/3a772a41d9d7814dbd1bef8ef654186d)
4. [T04](https://app.notion.com/3a772a41d9d781a1909dd9876f65a7e0)
5. [T05](https://app.notion.com/3a772a41d9d781f0ac28cfc431d3f81c)
6. [T06](https://app.notion.com/3a772a41d9d7815eae3ee0a0b751393b)

## 6. TC-A01~A07 결과

| TC | 상태 전이·Gate | Expected / Actual | 판정 |
|---|---|---|---|
| A01 | T01~T06 `시작 전/진행 중 → 완료`, Request `시작 전 → 완료` | Task 6건 완료, Blocker 없음, 완료조건·증빙 존재, Request 완료 | PASS |
| A02 | Request `진행 중`, 서류 `미전달`; T02 `진행 중`, Actor `관리역 확인`, Blocker `서류 미전달`, Next `필수서류 전달 요청` | 별도 대기 Status 없이 네 질문에 답함; 후속 Task 시작 전 | PASS |
| A03 | 서류 `일부 전달`; T02 Actor `관리역 확인`, Blocker `일부 서류 누락`, Next `누락서류 보완 요청` → 보완 후 같은 T02 Actor `지원팀`, Blocker 해소, Next `재검수` | 새 Task 없이 동일 Task로 복귀, 서류 상태 `전달 완료` | PASS |
| A04 | T03 Actor `GP`, Blocker `날인 오류`, Next `정상 날인본 재요청` → 같은 T03 Actor `지원팀`, Blocker 해소 | 중복 Task 없이 날인 검수 재개 | PASS |
| A05 | T04 Actor `관리역 확인`, Blocker `기관 추가요청`, Next `추가요청 자료 확인` → 같은 T04 Actor `지원팀`, Blocker 해소 | 즉시 정정 후 같은 접수 Task 계속 | PASS |
| A06 | 같은 FUND·업무유형의 미완료 Request 재조회 | 기존 미완료 Request 5건 감지, 추가 Request·Task Write 0 | PASS |
| A07 | FUND 0건 실제 조회 + 복수 후보 resolver regression | 0건은 `BLOCK_AND_ASK`, 복수는 사용자 선택 요구, Planned/Actual Write 0 | PASS |

### 네 가지 핵심 질문

A01~A05의 활성 Task에서 아래를 모두 Property로 답할 수 있었다.

1. 현재 상태: `Task 상태`
2. 다음 행동 주체: `현재 Actor`
3. 정지 원인: `Blocker`
4. 다음 단계 조건: `다음 Action` + `완료조건`

Request Actor·Next Action·Blocker Property는 추가하지 않았다. 연결된 활성 Task가
현재 실행 제어의 단일 Source of Truth이며, Request에 같은 값을 직접 저장하면
이중화되기 때문이다.

## 7. Relation·Rollup 검증

- FUND → Request: Request 5건 모두 동일 TEST FUND Relation 재조회 PASS
- Request → Task: Request별 역Relation이 정확히 6건임을 재조회 PASS
- Task → Request: Task 30건의 `상위 요청` 재조회 PASS
- Task `관련 조합` Rollup:
  - Schema와 Relation 경로 존재 PASS
  - page fetch API는 값을 `<omitted />`로 반환
  - N-06의 기존 Notion UI 육안검증 근거는 유지
  - 이번 신규 A01~A05의 Rollup 값은 API 자동 검증 제한으로
    `PARTIAL_UI_CONFIRMATION_REQUIRED`

## 8. 안전·회귀 검증

- 운영 Record 변경: 0
- 과거 조합 Record 변경: 0
- TEST FUND 변경: 0
- View·Filter 변경: 0
- 기존 Checkbox Write: 0
- 자동 삭제: 0
- Conversational Intake tests: PASS
- Transaction tests: PASS
- Canonical process alignment tests: PASS
- Orchestration validator: PASS
- `git diff --check`: PASS

## 9. 결론

E2E-03의 정상·대기·누락·날인 보완·기관 추가요청은 현재 Task Property 조합으로
표현 가능하다. Request `서류 상태` 추가로 미전달·일부·완료·보완을 구분할 수
있다. `대기`와 `보완` Task Status를 추가하지 않아도 Pilot의 네 질문에 답할 수
있었다.

남은 승인 범위 Gap은 `Task 상태=취소` 옵션 1건이다. 이 Gap은 현재 A01~A07의
표현과 실행을 막지 않지만, CI4 승인 Schema의 완전 적용을 위해 Notion UI 최소
조치가 필요하다.
