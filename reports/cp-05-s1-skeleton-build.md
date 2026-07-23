# CP-05-S1 Notion Fast Skeleton Build

## 판정

`PARTIAL_WITH_SAFE_CONSTRAINTS`

핵심 DB·Relation·TEST Record·Linked View 블록은 구축했다. 기존 `TO DO LIST (FUND)` 무변경 원칙을 지키기 위해 1차 Form 제출, 실제 FUND Relation 값, Rollup 값, 현재 조합 자동 필터는 유예했다.

## 구축 범위

| 항목 | 결과 |
|---|---|
| 실제 대상 View | `결성(진행)` 확인 |
| 신규 DB | [지원팀 업무요청](https://app.notion.com/p/c60e9bc03a214735be082ed54905970d), [지원팀 Task](https://app.notion.com/p/b7f50ee986714213befb4268fdd36920) |
| 신규 상위 업무 DB | 0개 |
| 재사용 DB | `TO DO LIST (FUND)` |
| 업무요청 Property | 13개 |
| Task Property | 14개 |
| Relation | 2개 |
| 업무요청 표 View | 4개 |
| Task 표 View | 5개 |
| TEST 요청 | 1건 |
| TEST Task | 8건 |
| Linked View | 안전한 TEST Page에 2개 |
| Automation | 0개 |
| Agent Write | 0개 |

## Property 검증

- Person: 요청자·담당 관리역·담당자에 Workspace Member 형식으로 저장됨.
- Relation: 요청–Task 양방향 연결과 요청에서 Task 8건 역참조를 확인함.
- FUND Relation: 요청 DB에서 기존 FUND DB로 향하는 단방향 Relation을 생성함. 기존 FUND DB Property는 추가하지 않음.
- Rollup: Task `관련 조합` Rollup Schema는 생성됨. TEST 요청을 실제 FUND Record에 연결하지 않아 값 계산은 미검증.
- Status: API가 기본 `시작 전`, `진행 중`, `완료`만 생성함. 세부 상태와 전이는 CP-05-P2로 유예.

## Form 검증

### 1차 Form

- 현재 상태: `USER_CREATED_IN_NOTION_UI / STRUCTURE_REVIEW_PENDING`
- 실제 `결성(진행)` View 확인 완료
- Person·Relation Property 존재 확인
- 기존 DB에 이미 Form View가 존재
- CP-05-S1 실행 당시 Codex는 안전한 TEST FUND Record 없이 제출 결과의 View Filter 충족을 검증할 수 없어 신규 Form을 생성하지 않았다.
- 이후 사용자가 Notion UI에서 1차 Form을 생성했다. 구조 검토·운영 검증은 CP-05-S1-R1 범위다.

### 2차 Form

- `지원팀 행정업무 요청` Form View 생성
- API로 지정한 전체 질문 중 `요청명`만 Form 질문으로 유지됨
- View 골조 생성 완료, 질문 구성 보완 필요

## View·Linked View

- 요청·Task의 명명된 Skeleton View를 생성했다.
- API Filter 설정이 유지되지 않아 현재 View는 표시·정렬 구조이며 상태 Filter는 P2에서 재검증한다.
- 실제 조합 Page는 수정하지 않고 [안전한 TEST Page](https://app.notion.com/p/3a672a41d9d78100a122f78c9c49ef59)에 Linked View 블록 2개를 생성했다.
- 현재 조합 자동 필터는 미검증이다.

## 기존 자산 보호 결과

| 대상 | 변경 수 |
|---|---:|
| 기존 DB Property | 0 |
| 기존 View | 0 |
| 기존 Filter | 0 |
| 기존 Template | 0 |
| 기존 Record·조합 Page | 0 |
| Process·Variation·Source | 0 |

## 다음 검토

GPT Skeleton Review에서 다음을 판정한다.

1. 상세 Status 옵션을 P2에서 UI로 설정할지
2. 2차 Form 질문 구성을 UI에서 보완할지 P4까지 유예할지
3. 사용자 UI 생성 1차 Form의 구조와 제출 결과, Rollup·현재 Page Filter를 CP-05-S1-R1에서 검증할지
4. SAFE_FALLBACK 단방향 FUND Relation을 Pilot까지 유지할지

CP-05-P2는 S1 안정화와 GPT 검토 전 실행하지 않는다.
