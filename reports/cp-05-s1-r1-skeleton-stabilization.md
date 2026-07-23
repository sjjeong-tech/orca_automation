# CP-05-S1-R1 Notion Skeleton Stabilization

## Executive Summary

판정은 `PARTIAL_WITH_UI_ACTIONS`다. 기존 FUND DB, 신규 요청·Task DB, TEST Relation과 Linked View를 재검증했다. 사용자 생성 1차 Form은 실제로 존재하며 View 이름을 `조합 결성 예정 등록`으로 변경했다. 다만 Form 제목·질문 노출·필수 여부·설명·공유 설정은 현재 Connector에서 안전하게 편집할 수 없고, View Filter도 적용 요청이 저장되지 않아 사용자 UI 조치가 필요하다.

## 1차 Form 실제 구조

- View ID: `view://3a672a41-d9d7-80d6-ad55-000cc93adb96`
- View 이름: `조합 결성 예정 등록` — S1-R1에서 변경
- Form 제목: `결성(진행)_행 추가 입력 폼` — 변경하지 못함
- 제출 Data Source: `collection://14d72a41-d9d7-8137-8992-000b39730dd0`
- 질문 수: 15
- 설명·제출 완료 안내·익명 응답·공유 범위·필수 여부: Connector 조회 범위 밖, `UI_VERIFICATION_REQUIRED`

| 순서 | 현재 질문명 | 연결 Property | 유형 | 필수 여부 | 현재 설명 | 저장 방식 |
|---:|---|---|---|---|---|---|
| 1 | 요청사항 | 요청사항 | Title | 확인 필요 | 확인 필요 | Text title |
| 2 | URL | URL | URL | 확인 필요 | 확인 필요 | URL |
| 3 | 집행일 | 집행일 | Date | 확인 필요 | 확인 필요 | Date |
| 4 | 참여자 | 참여자 | Person | 확인 필요 | 확인 필요 | Member array |
| 5 | 우선 순위 | 우선 순위 | Select | 확인 필요 | 확인 필요 | Select option |
| 6 | 마감요청일자 | 마감요청일자 | Date | 확인 필요 | 확인 필요 | Date |
| 7 | 이관 | 이관 | Text | 확인 필요 | 확인 필요 | Text |
| 8 | 작성자 | 작성자 | Person | 확인 필요 | 확인 필요 | Member array |
| 9 | 조합명 또는 제목 | 조합명 또는 제목 | Relation | 확인 필요 | 확인 필요 | Page relation |
| 10 | 웹사이트 | 웹사이트 | URL | 확인 필요 | 확인 필요 | URL |
| 11 | 세컨클로징, 양수도 관련 | 세컨클로징, 양수도 관련 | Select | 확인 필요 | 확인 필요 | Select option |
| 12 | 업무담당자 | 업무담당자 | Person | 확인 필요 | 확인 필요 | Member array |
| 13 | 업무분류 | 업무분류 | Select | 확인 필요 | 확인 필요 | Select option |
| 14 | 검토/결과 | 검토/결과 | Text | 확인 필요 | 확인 필요 | Text |
| 15 | 구분 | 구분 | Select | 확인 필요 | 확인 필요 | Select option |

목표 문항은 `요청사항`, `업무담당자`, `구분`, `업무분류`, 선택적으로 `조합명 또는 제목`, `우선 순위`, `검토/결과`다. 나머지는 UI에서 숨겨야 한다.

## Person 검증

- `업무담당자`, `작성자`, `참여자`는 모두 Person Property다.
- S1 TEST 요청과 Task에서 Workspace Member가 Person mention 형식으로 저장되는 것을 재확인했다.
- Form 내부 Member 검색, Guest 노출, 단일·복수 선택, 익명 응답, Respondent 자동 기록은 UI 확인이 필요하다.
- Person을 Text 또는 Select로 대체하지 않는다.

## Relation·Rollup 검증

- FUND의 `조합명 또는 제목`은 조합 Master Data Source를 향하는 Relation이다.
- 요청의 `관련 조합`은 FUND를 향하는 Relation이다.
- 요청–Task Relation은 양방향이며 TEST 요청에서 Task 8건 역참조를 확인했다.
- Task의 `관련 조합` Rollup Schema는 정상이다.
- TEST 요청이 FUND Record와 연결되지 않아 Rollup 실제값은 `USER_TEST_REQUIRED`다.
- 실제 FUND Record는 수정하지 않았다.

## 결성(진행) 표시 검증

- 실제 View: `결성(진행)`
- Filter: `구분=결성` AND (`상태` To-do 그룹 OR `진행중`)
- Sort: `생성일자` 내림차순
- 사용자 Form 질문에 `구분`, `업무분류`는 존재한다.
- Form의 상태 초기값, 기본값 `결성`·`조합결성`, 제출 결과의 View 표시 여부는 UI 제출 없이는 검증할 수 없다.
- TEST 제출: 0건. 기존 FUND Record·Template 보호를 위해 수행하지 않았다.

## 요청 DB View·Form 상태

- Property: 13개 유지
- 표 View: 4개
- Form: `지원팀 행정업무 요청`, 질문 1개(`요청명`)
- `신규 접수`, `정보보완 필요`, `진행 중 요청`의 Filter는 비어 있다.
- `신규 접수=시작 전` Filter 적용을 시도했으나 저장 결과가 빈 Filter여서 적용 수는 0이다.
- 현재 Status는 `시작 전`, `진행 중`, `완료`뿐이다. `정보보완 필요`는 현 상태로 표현할 수 없다.

## Task DB View 상태

- Property: 14개 유지
- 표 View: 5개
- 모든 명명 View의 Filter가 비어 있다.
- `내 Task`, `진행 중`, `대기·보완`, `완료 전`은 이름만 존재하는 Skeleton이다.
- `대기·보완`은 현재 Status 옵션으로 표현할 수 없으며 P2 입력이다.

## Linked View 검증

| 항목 | 판정 |
|---|---|
| 요청 Linked View 존재 | VERIFIED |
| Task Linked View 존재 | VERIFIED |
| Data Source 연결 | VERIFIED |
| 특정 조합 Filter | MANUAL_FILTER_REQUIRED |
| 현재 Page 자동 Filter | TEMPLATE_TEST_REQUIRED |
| 실제 조합 Page 적용 | DEFERRED |

실제 조합 Page와 Template은 수정하지 않았다.

## 실제 변경 내역

- 기존 Form View 이름 1건: `Form builder` → `조합 결성 예정 등록`
- 신규 DB View Filter 적용: 0건
- 신규 DB/Form/Record 생성: 0건
- 기존 FUND Property·View Filter·Sort·Template·Record 변경: 0건

## 사용자 UI 조치

1. Form 제목을 `조합 결성 예정 등록`으로 변경한다.
2. 설명에 사전예고 Form이며 실제 지원팀 요청은 2차 Form이라고 명시한다.
3. 1차 Form에는 목표 7개 문항만 남기고 시스템·Rollup·운영 Property를 숨긴다.
4. `요청사항`, `업무담당자`, `구분`, `업무분류`를 필수로 설정한다.
5. `구분=결성`, `업무분류=조합결성`, `상태=확인전` 기본값 또는 제출 후 설정 방식을 확인한다.
6. 2차 Form에 즉시 필수 7개, 선택 3개 질문을 UI에서 구성한다.
7. 요청·Task View의 적용 가능한 Status Filter를 UI에서 설정한다.

## 수동 운영 시나리오

| Actor | Trigger | Input | Output | 다음 Action | Blocker·사람 판단 |
|---|---|---|---|---|---|
| 관리역 | 결성 가능성 구체화 | 임시 조합명·담당자·분류 | FUND 예정 Record | `결성(진행)` 확인 | Form 기본값·질문 정리 필요 |
| 관리역 | 착수 정보·서류 준비 | 조합 Relation·요청 유형·기한·원문 | 지원팀 요청 Record | 지원팀 검수 | 2차 Form 질문 보완 필요 |
| 지원팀 | 요청 접수 | 요청 Record | 검수 결과·수동 Task | 담당자·다음 Action 설정 | 정보보완 상태 미정 |
| 지원팀 | 업무 수행 | Task·서류·완료조건 | 증빙·완료 기록 | 다음 Task 또는 종료 | 대기·증빙 모델 P2 필요 |

자동 Task 생성, 상태 자동화, Agent Write는 없다.

## P2 Input

### 상태 후보

- 요청 8개: 신규 접수, 정보 확인 중, 보완 요청, 착수 가능, 진행 중, 외부 대기, 완료, 취소
- Task 8개: 시작 전, 진행 중, 내부 확인 대기, 외부기관 대기, GP 회신 대기, 보완, 완료, 취소

### 증빙 후보

원본 폴더, 제출본, 접수증, 기관 회신, 결과물, 스캔본, 전달 완료 기록, 실물 수령 기록, 완료일, 완료자 — 10개.

### 판단 필요

- 상태와 현재 Actor 관계
- Blocker와 대기 상태 관계
- 완료조건과 증빙의 필수성
- 요청 완료와 Task 완료 연동
- 보완 Task 조건부 생성
- 관리역 확인 상태

## Known Gaps

- Form 필수·설명·공유·Respondent 설정 미검증
- Form 기본값과 제출 후 `결성(진행)` 표시 미검증
- FUND Relation 선택 후 Rollup 실제값 미검증
- 요청·Task View Filter 미적용
- 2차 Form 질문 1개만 존재

## GPT UI Review 판단사항

1. 사용자 UI 조치를 CP-05-P2 전에 완료할지
2. 승인된 TEST 제출 1건으로 Form→View→Relation→Rollup을 검증할지
3. P2에서 Status 옵션·Evidence Model을 확정한 후 View Filter를 적용할지
4. 현재 Skeleton을 수동 Pilot 준비 입력으로 인정할지
