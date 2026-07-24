# Form Capability Before Snapshot

검증일: 2026-07-24

## 1차 Form

- DB: `TO DO LIST (FUND)`
- View ID: `3a672a41-d9d7-80d6-ad55-000cc93adb96`
- Form 이름·제목: `조합 결성 예정 등록`
- 설명: 조합 결성 사전예고 및 2차 Form 분리 안내
- 질문 수: 8

| 순서 | 질문 | Property | Type | Required | 질문 설명 |
|---:|---|---|---|---|---|
| 1 | 요청사항 | 요청사항 | Title | API 미노출 | API 미노출 |
| 2 | 우선 순위 | 우선 순위 | Select | API 미노출 | API 미노출 |
| 3 | 작성자 | 작성자 | Person | API 미노출 | API 미노출 |
| 4 | 조합명 또는 제목 | 조합명 또는 제목 | Relation | API 미노출 | API 미노출 |
| 5 | 업무담당자 | 업무담당자 | Person | API 미노출 | API 미노출 |
| 6 | 업무분류 | 업무분류 | Select | API 미노출 | API 미노출 |
| 7 | 검토/결과 | 검토/결과 | Text | API 미노출 | API 미노출 |
| 8 | 구분 | 구분 | Select | API 미노출 | API 미노출 |

공유·Respondent 설정은 Fetch 결과에 노출되지 않는다.

## 2차 Form

- DB: `지원팀 업무요청`
- DB URL: https://app.notion.com/p/c60e9bc03a214735be082ed54905970d
- View ID: `3a672a41-d9d7-81ac-8f3c-000caa324b7a`
- Form 이름: `지원팀 행정업무 요청`
- 설명: 없음
- 질문 수: 1

| 순서 | 질문 | Property | Type | Required | 질문 설명 |
|---:|---|---|---|---|---|
| 1 | Title | 요청명 | Title | API 미노출 | API 미노출 |

공유·응답 설정은 Fetch 결과에 노출되지 않는다.
