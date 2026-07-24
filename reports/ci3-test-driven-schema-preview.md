# CI3 Test-driven Schema Preview

## 1. 판정 요약

E2E-03 고유번호증 신청·수령의 여섯 테스트케이스를 현재 `지원팀 업무요청`·`지원팀 Task` Schema에 대입했다.

- 지원팀 업무요청: **PARTIAL** — Request Lifecycle의 세부 상태와 Current Actor·Next Action·Blocker를 구조적으로 표현할 수 없다.
- 지원팀 Task: **PARTIAL** — Actor·Next Action·Blocker·완료조건 Property는 충분하지만 `대기`, `보완`, `취소` 상태 옵션이 없다.
- TC-06: **PASS_AT_PRE_WRITE_GATE** — 중복 요청과 FUND 미확정은 DB Record 상태가 아니라 Conversational Intake의 PREPARE/PREVIEW Gate에서 차단한다.
- 제안 범위: Request 기존 Property 변경 2건 + 신규 Property 3건, Task 기존 Status 옵션 변경 1건.
- 상태: `PREVIEW_ONLY`. Notion Schema·Record·View·Filter는 변경하지 않았다.

## 2. 확인한 Canonical Source

- [세무서·은행 업무 Process Model Root](https://app.notion.com/p/8e3bafb3e64f448d8e06d63127d1155e)
- [E2E-03 고유번호증 신청·수령](https://app.notion.com/p/0a1d535868134040b878724136735211)
- [업무 실행 기본 템플릿](https://app.notion.com/p/cfd9f799c809438e8cd48b90b3b68ab3)
- [지원팀 업무요청 DB](https://app.notion.com/p/c60e9bc03a214735be082ed54905970d)
- [지원팀 Task DB](https://app.notion.com/p/b7f50ee986714213befb4268fdd36920)
- Repository Canonical: `notion/model/request-status-model.md`, `notion/model/task-status-model.md`, `contracts/conversational-intake-contract.yaml`

조회 기준일은 2026-07-24다.

## 3. 현재 Schema와 Option

### 지원팀 업무요청

현재 13개 Property:

| Property | Type | 현재 Option·대상 |
|---|---|---|
| 요청명 | Title | - |
| 관련 조합 | Relation | `TO DO LIST (FUND)` |
| 요청 업무 유형 | Select | 고유번호증 신청, 명판·인감, 보안카드·홈택스, 계좌개설, 계좌개설 보완 |
| 요청자 | Person | Workspace Person |
| 담당 관리역 | Person | Workspace Person |
| 요청일 | Date | - |
| 목표일 | Date | - |
| 요청 상태 | Status | 시작 전, 진행 중, 완료 |
| 원본 폴더 | URL | - |
| 실물서류 전달 여부 | Checkbox | Yes/No |
| 요청 내용 | Text | - |
| 특이사항 | Text | - |
| 관련 Task | Relation | 지원팀 Task |

### 지원팀 Task

현재 14개 Property:

| Property | Type | 현재 Option·대상 |
|---|---|---|
| Task명 | Title | - |
| 상위 요청 | Relation | 지원팀 업무요청 |
| 관련 조합 | Rollup | 상위 요청 → 관련 조합 |
| Process ID | Select | INTAKE, P03, P04, P07, P08 |
| Operational Task ID | Text | - |
| Task 상태 | Status | 시작 전, 진행 중, 완료 |
| 담당자 | Person | Workspace Person |
| 현재 Actor | Select | 운영팀, 지원팀, 관리역 확인, 외부기관, GP |
| 목표일 | Date | - |
| 다음 Action | Text | - |
| Blocker | Text | - |
| 완료조건 | Text | - |
| 완료증빙 | Text | - |
| 비고 | Text | - |

## 4. 테스트케이스별 예상값과 표현 가능성

판정 기준:

- `YES`: 현재 전용 Property와 Option으로 구조화 가능
- `PARTIAL`: Text 우회 또는 과도하게 거친 상태값으로만 가능
- `NO`: 필요한 값 또는 Option이 없음
- `N/A`: Record를 생성하지 않는 Pre-write Gate

### TC-01 정상 요청·서류 전달 완료

Snapshot: 착수조건 검수 통과 직후.

| Layer | 예상값 |
|---|---|
| Request | 상태=`착수 가능`; Current Actor=`지원팀`; Next Action=`P03-T01 요청정보·착수조건 확인`; Blocker=`없음`; 서류 상태=`전달 완료` |
| Task | `P03-T01`; 상태=`시작 전`; 현재 Actor=`지원팀`; 다음 Action=`필수정보·착수조건 검수`; Blocker=`없음`; 완료조건=`필수 요청정보와 착수 가능 여부 확인` |

| 질문 | Request | Task | 근거 |
|---|---|---|---|
| 현재 상태 표현 | PARTIAL | YES | Request에 `착수 가능` 없음. Task `시작 전` 존재 |
| 다음 행동 주체 | PARTIAL | YES | Request 전용 Actor 없음. Task Actor 존재 |
| Blocker | PARTIAL | YES | Request는 특이사항 Text 우회. Task Blocker 존재 |
| 다음·복귀 단계 | PARTIAL | YES | Request는 요청 내용 Text 우회. Task 다음 Action 존재 |

### TC-02 서류 미전달 대기

Snapshot: Request 생성 후 실물서류 인계 대기.

| Layer | 예상값 |
|---|---|
| Request | 상태=`보완 요청`; Current Actor=`관리역 확인`; Next Action=`신청 필요서류 전달`; Blocker=`서류 미전달`; 서류 상태=`미전달` |
| Task | `P03-T02`; 상태=`대기`; 현재 Actor=`관리역 확인`; 다음 Action=`실물서류 전달 후 누락 검수 재개`; Blocker=`서류 미전달`; 복귀=`P03-T02 진행 중` |

| 질문 | Request | Task | 근거 |
|---|---|---|---|
| 현재 상태 표현 | NO | NO | Request `보완 요청`, Task `대기` Option 없음 |
| 다음 행동 주체 | PARTIAL | YES | Request 전용 Actor 없음 |
| Blocker | PARTIAL | YES | Request는 특이사항 Text 우회 |
| 다음·복귀 단계 | PARTIAL | YES | Task 다음 Action에 복귀 단계를 기록 가능 |

### TC-03 일부 전달·서류 누락

Snapshot: 일부 서류 수령 후 누락 목록 확인.

| Layer | 예상값 |
|---|---|
| Request | 상태=`보완 요청`; Current Actor=`관리역 확인`; Next Action=`누락서류 전달`; Blocker=`누락서류 목록`; 서류 상태=`일부 전달` |
| Task | `P03-T02`; 상태=`보완`; 현재 Actor=`관리역 확인`; 다음 Action=`누락서류 수령 후 검수`; Blocker=`누락 항목·요청일·해결조건`; 복귀=`P03-T02 진행 중` |

| 질문 | Request | Task | 근거 |
|---|---|---|---|
| 현재 상태 표현 | NO | NO | 두 DB 모두 보완 상태 Option 부족 |
| 다음 행동 주체 | PARTIAL | YES | Request 전용 Actor 없음 |
| Blocker | PARTIAL | YES | Request는 특이사항 Text 우회 |
| 다음·복귀 단계 | PARTIAL | YES | Task 다음 Action으로 복귀 표현 가능 |

추가로 Request Checkbox는 `미전달`과 `일부 전달`을 구분하지 못한다.

### TC-04 날인 오류·GP 재요청

Snapshot: 날인·기재 검수에서 오류 발견 후 재날인 요청.

| Layer | 예상값 |
|---|---|
| Request | 상태=`진행 중`; Current Actor=`GP`; Next Action=`재날인본 전달`; Blocker=`날인 오류`; 서류 상태=`보완 필요` |
| Task | `P03-T03`; 상태=`보완`; 현재 Actor=`GP`; 다음 Action=`재날인본 수령 후 날인 검수`; Blocker=`오류 위치·재요청일·해결조건`; 복귀=`P03-T03 진행 중` |

| 질문 | Request | Task | 근거 |
|---|---|---|---|
| 현재 상태 표현 | YES | NO | Request는 진행 중 유지 가능. Task 보완 Option 없음 |
| 다음 행동 주체 | PARTIAL | YES | Request 전용 Actor 없음. Task GP Option 존재 |
| Blocker | PARTIAL | YES | Request는 특이사항 Text 우회 |
| 다음·복귀 단계 | PARTIAL | YES | Task 다음 Action으로 재검수 복귀 표현 가능 |

### TC-05 세무서 현장 추가요청

Snapshot: P03-T04 접수 중 추가서류 또는 관리역 확인 요청 발생.

| Layer | 예상값 |
|---|---|
| Request | 상태=`진행 중`; Current Actor=`관리역 확인`; Next Action=`추가서류 확인·전달`; Blocker=`세무서 현장 추가요청` |
| Task | `P03-T04`; 상태=`대기`; 현재 Actor=`관리역 확인`; 다음 Action=`추가서류 확보 후 세무서 접수 재개`; Blocker=`추가요청 내용·요청기관·해결조건`; 복귀=`P03-T04 진행 중` |

| 질문 | Request | Task | 근거 |
|---|---|---|---|
| 현재 상태 표현 | YES | NO | Request는 진행 중 유지. Task 대기 Option 없음 |
| 다음 행동 주체 | PARTIAL | YES | Task 관리역 확인 Option 존재 |
| Blocker | PARTIAL | YES | Request는 특이사항 Text 우회 |
| 다음·복귀 단계 | PARTIAL | YES | Task 다음 Action으로 현장 접수 복귀 표현 가능 |

현장 요청이 GP 재날인을 요구하면 Task Current Actor를 `GP`로 바꾼다. 임의로 한 Actor를 고정하지 않는다.

### TC-06 중복 요청 및 FUND 미확정

| 조건 | 예상 결과 | 현 구현 판정 |
|---|---|---|
| 동일 FUND·고유번호증 신청·미완료 Request 존재 | 기존 URL과 중복 경고, 신규 Write 차단 | PASS |
| FUND 0건 | `NO_MATCH`, `BLOCK_AND_ASK`, Planned Write 0 | PASS |
| FUND 복수건 | 후보 제시, 사용자 선택 전 Write 차단 | PASS |

Request·Task 예상값은 `N/A`다. 이 케이스를 표현하기 위한 신규 Notion Column은 필요하지 않다.

## 5. 최소 Schema 변경 Preview

### 지원팀 업무요청

#### 유지

| Property | 판정 | 연결 Test Case | 변경하지 않는 이유 |
|---|---|---|---|
| 요청명 | KEEP | TC-01~05 | 업무와 조합을 식별하는 Title로 충분 |
| 관련 조합 | KEEP | TC-01~06 | 중복 탐지와 Request→Task Rollup의 기준 |
| 요청 업무 유형 | KEEP | TC-01~06 | `고유번호증 신청` Option이 이미 존재 |
| 요청자 | KEEP | TC-01~05 | 요청 책임 추적에 필요 |
| 담당 관리역 | KEEP | TC-01~05 | Human 확인·보완 요청 대상 식별 |
| 요청일 | KEEP | TC-01~06 | 접수 시점과 중복 검토 근거 |
| 목표일 | KEEP | TC-01~05 | 대기·보완 중에도 유지해야 함 |
| 원본 폴더 | KEEP | TC-01~05 | 실제 파일 대신 Drive 경로를 기록 |
| 요청 내용 | KEEP | TC-01~05 | 원문과 보충 설명 보존 |
| 특이사항 | KEEP | TC-02~05 | 예외 상세와 비정형 메모 보존 |
| 관련 Task | KEEP | TC-01~05 | Request 전체 Lifecycle과 Task 상태 연결 |

#### 타입·옵션 변경 후보

**요청 상태**

- 현재: Status — `시작 전 / 진행 중 / 완료`
- 후보: Status 유지, Option을 `신규 접수 / 정보 확인 중 / 보완 요청 / 착수 가능 / 진행 중 / 완료 / 취소`로 정렬
- 근거: TC-01, TC-02, TC-03, TC-04, TC-05
- 이유: P2 Canonical Request Lifecycle을 현재 3개 Option으로 구분할 수 없음
- 외부기관·GP 대기: Request 상태를 늘리지 않고 `진행 중` + 연결 Task `대기`로 표현
- 상태: `PREVIEW_ONLY`

**실물서류 전달 여부**

- 현재: Checkbox
- 후보명: `서류 상태`
- 후보 Type: Select
- 옵션 후보: `미전달 / 일부 전달 / 전달 완료 / 보완 필요`
- 근거: TC-01, TC-02, TC-03, TC-04
- 이유: Checkbox는 미전달과 일부 전달을 구분하지 못하며 날인 오류 후 보완 상태도 표현하지 못함
- 상태: `PREVIEW_ONLY`

#### 신규 추가 후보

**현재 Actor**

- Type: Select
- 옵션 후보: `운영팀 / 지원팀 / 관리역 확인 / 외부기관 / GP`
- 근거: TC-01, TC-02, TC-03, TC-04, TC-05
- 이유: 현재는 `요청 내용` Text에 우회 저장되어 Filter·검증이 불가능
- 상태: `PREVIEW_ONLY`

**다음 Action**

- Type: Text
- 근거: TC-01, TC-02, TC-03, TC-04, TC-05
- 이유: Request 화면에서 다음 행동을 직접 확인하고 연결 Task의 진행을 요약하기 위함
- 상태: `PREVIEW_ONLY`

**Blocker**

- Type: Text
- 근거: TC-02, TC-03, TC-04, TC-05
- 운영 형식: `[유형] 원인 / 발생주체 / 해결책임자 / 발생일 / 목표해결일 / 해결조건 / 현재결과`
- 이유: `특이사항`은 일반 메모로 유지하고, 상태 전이를 막는 원인을 구조적으로 분리해야 함
- 상태: `PREVIEW_ONLY`

#### 통합·삭제 후보

- 없음.
- `요청 내용`과 `특이사항`을 신규 `다음 Action`·`Blocker`에 통합하지 않는다. 원문·일반 메모와 실행 제어값의 역할이 다르다.
- 기존 Checkbox는 별도 신규 Column과 병존시키지 않고 Type·명칭 변경 후보로만 둔다.

#### 변경하지 않는 이유

- Transaction ID, E2E Process ID, Process Model ID는 이번 여섯 테스트의 상태·Actor·Blocker·복귀 표현을 위해 필수 Column이 아니다.
- 코드의 실행 로그와 Request 본문 템플릿으로 추적할 수 있으므로 이번 Alpha Preview에서 추가하지 않는다.
- TC-06은 Notion Schema가 아니라 PREPARE/PREVIEW Gate 책임이다.

### 지원팀 Task

#### 유지

| Property | 판정 | 연결 Test Case | 변경하지 않는 이유 |
|---|---|---|---|
| Task명 | KEEP | TC-01~05 | 실행 단위 식별에 충분 |
| 상위 요청 | KEEP | TC-01~05 | Request→Task Relation 기준 |
| 관련 조합 | KEEP | TC-01~05 | N-06 Rollup 검증 완료 |
| Process ID | KEEP | TC-01~05 | P03 Option 존재 |
| Operational Task ID | KEEP | TC-01~05 | P03-T01~T06 저장 가능 |
| 담당자 | KEEP | TC-01~05 | 실행 추적 담당자 |
| 현재 Actor | KEEP | TC-01~05 | 필요한 5개 Actor Option이 모두 존재 |
| 목표일 | KEEP | TC-01~05 | 대기·보완 중에도 유지 |
| 다음 Action | KEEP | TC-01~05 | 다음 단계·재확인·복귀 단계 표현 가능 |
| Blocker | KEEP | TC-02~05 | P2 Text 운영 형식 적용 가능 |
| 완료조건 | KEEP | TC-01~05 | Yes/No 완료 판정 문장 저장 가능 |
| 완료증빙 | KEEP | TC-01, TC-04, TC-05 | 결과·보완 검수 근거 경로 저장 가능 |
| 비고 | KEEP | TC-01~05 | 비정형 메모 용도 유지 |

#### 타입·옵션 변경 후보

**Task 상태**

- 현재: Status — `시작 전 / 진행 중 / 완료`
- 후보: Status 유지, Option을 `시작 전 / 진행 중 / 대기 / 보완 / 완료 / 취소`로 정렬
- 근거: TC-02, TC-03, TC-04, TC-05
- 이유: 대기 원인은 `대기 + 현재 Actor + Blocker + 다음 Action`, 수정 필요는 `보완`으로 표현한다는 P2 Canonical 원칙을 현재 Option이 지원하지 못함
- 별도 대기 상태 추가 금지: `관리역 대기`, `GP 대기`, `외부기관 대기`를 각각 만들지 않음
- 상태: `PREVIEW_ONLY`

#### 신규 추가 후보

- 없음.
- 현재 14개 Property로 Task의 상태, 다음 Actor, Blocker, 완료조건, 복귀 단계를 표현할 수 있다. 부족한 것은 Status Option뿐이다.

#### 통합·삭제 후보

- 없음.
- `다음 Action`, `Blocker`, `완료조건`, `완료증빙`은 서로 다른 Control 의미가 있으므로 합치지 않는다.

#### 변경하지 않는 이유

- 복귀 단계 전용 Column은 추가하지 않는다. `다음 Action`에 `보완본 수령 후 P03-T03 진행 중으로 복귀`처럼 기록할 수 있다.
- Blocker Type DB나 Evidence DB는 여섯 테스트를 표현하는 데 필요하지 않다.
- Current Actor Option은 E2E-03의 지원팀·관리역·GP·세무서 대기를 모두 표현한다.

## 6. 코드·Contract 컬럼명 정합성

| 항목 | 현재 상태 | 판정 | 후속 적용 시 조치 |
|---|---|---|---|
| Request `status` → `요청 상태` | 일치 | PASS | Option만 7개로 정렬 |
| Request `document_status` → `실물서류 전달 여부` Checkbox | Parser는 3값, DB는 Boolean | MISMATCH | `서류 상태` Select로 변경 후 Mapping 갱신 |
| Request `current_actor` | `요청 내용` 구조화 Text로 우회 | PARTIAL | 신규 `현재 Actor` Select로 Mapping |
| Request `next_action` | `요청 내용` 구조화 Text로 우회 | PARTIAL | 신규 `다음 Action` Text로 Mapping |
| Request `blocker` | `특이사항` 구조화 Text로 우회 | PARTIAL | 신규 `Blocker` Text로 Mapping |
| Preview Current Actor=`담당 관리역` | 후보 Option=`관리역 확인` | VALUE_MISMATCH | Schema 적용 TAP에서 Canonical Option으로 정규화 |
| Task 상태 | Property명 일치, Option 3개 | PARTIAL | Canonical 6개 Option으로 정렬 |
| Task Actor·Next Action·Blocker·완료조건 | Contract와 실제 Property 일치 | PASS | 변경 없음 |

이번 TAP에서는 코드·Contract를 수정하지 않는다. 실제 Schema 적용과 동시에 Mapping·값 정규화를 하나의 별도 Build TAP에서 처리해야 중간 불일치를 피할 수 있다.

## 7. 최소 변경 집계

| DB | 기존 Property 타입·옵션 변경 | 신규 Property | 통합·삭제 |
|---|---:|---:|---:|
| 지원팀 업무요청 | 2 | 3 | 0 |
| 지원팀 Task | 1 | 0 | 0 |
| 합계 | 3 | 3 | 0 |

근거 없는 신규 Column: **0개**.

## 8. 결론

Alpha 최소안은 다음 여섯 변경 후보로 충분하다.

1. Request Status를 Canonical 7개 Option으로 정렬
2. Request Checkbox를 `서류 상태` Select로 변경
3. Request `현재 Actor` 추가
4. Request `다음 Action` 추가
5. Request `Blocker` 추가
6. Task Status를 Canonical 6개 Option으로 정렬

Schema 적용 전 GPT와 사용자가 위 후보를 승인해야 한다. 적용 시에는 Schema와 Contract·코드 Mapping을 같은 Build TAP에서 변경하고, TC-01~06을 다시 실행해야 한다.

## 9. 변경 통제

- Notion Write: 0
- Notion Schema 변경: 0
- Record 생성·수정: 0
- View·Filter 변경: 0
- 신규 DB: 0
- E2E-04 이후 검토: 0
- 코드·Contract 변경: 0
