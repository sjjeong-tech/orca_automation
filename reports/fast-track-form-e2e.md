# CP-05-FT1-LR Form Fast Build and E2E Test

## Executive Summary

Fast Track 결과는 `READY_WITH_USER_UI_FIX`다. API 기반 Request→Task E2E는 완료했지만 2차 Form 질문 구성과 Task Rollup UI 확인이 남았다.

## FT 상태

| 단계 | 상태 | 결과 |
|---|---|---|
| FT-01 (1차 조합 예정 등록 Form 정리) | MINIMUM_USABLE_WITH_USER_UI_BACKLOG | 기존 8문항, 목표 7문항. 작성자 숨김·Required 설정은 UI 작업 |
| FT-02 (2차 지원팀 업무요청 Form 완성) | PARTIAL_WITH_UI_ACTION | 현재 1문항. API View 설정은 질문 목록을 변경하지 못함 |
| FT-03 (조합 Record와 업무요청 연결) | VERIFIED | TEST FUND Relation 저장 및 Request에서 재조회 |
| FT-04 (업무요청·Task E2E 테스트) | VERIFIED_EXCEPT_ROLLUP_UI | Request 1건, Task 6건, 양방향 Relation·상태 전이 완료 |
| FT-05 (Pilot 사용 가능 여부 판정) | READY_WITH_USER_UI_FIX | 2차 Form과 Rollup UI 확인 후 수동 Pilot 가능 |

## Form 현황

- 1차 Form `조합 결성 예정 등록`: 현재 8문항, 목표 7문항
- 현재 문항: 요청사항, 우선 순위, 작성자, 조합명 또는 제목, 업무담당자, 업무분류, 검토/결과, 구분
- 2차 Form `지원팀 행정업무 요청`: 현재 1문항(요청명)
- 목표 문항: 요청명, 관련 조합, 요청 업무 유형, 요청자, 담당 관리역, 목표일, 원본 폴더, 실물서류 전달 여부, 요청 내용, 특이사항

## TEST E2E

- Request: `[TEST][FT] 지원팀 행정업무 요청`
- Request URL: https://app.notion.com/p/3a772a41d9d781209bc2fc30557d4824
- 관련 TEST FUND: https://app.notion.com/p/3a772a41d9d781d89bc8c79b7718f277
- Task 수: 6
- Request 상태: 시작 전 → 진행 중 → 완료
- Task 상태: 시작 전 → 진행 중 → 완료
- 담당자: Person 형식 저장 확인
- Current Actor, Next Action, Blocker, 완료조건, 완료증빙: 저장 확인
- Request→Task Relation 및 Request의 관련 Task 역참조: PASS
- Task 관련 조합 Rollup: Schema 연결은 확인, API 값은 `<omitted />`; UI 확인 필요

## 변경 수

- 신규 Property: 0
- TEST Request: 1
- TEST Task: 6
- 운영 Record 변경: 0
- 운영 View·Filter 변경: 0
- 기존 Property·Template 변경: 0

## 남은 조치

1. Notion UI에서 2차 Form 10개 질문 구성 및 Required 설정
2. 1차 Form에서 `작성자` 질문 숨김과 핵심 4문항 Required 확인
3. TEST Task 화면에서 `관련 조합` Rollup 값이 TEST FUND를 표시하는지 확인
4. 위 확인 후 GPT·정상준 Prototype 사용성 검토
