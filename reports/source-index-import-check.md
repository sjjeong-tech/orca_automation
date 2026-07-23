# Source Index Import Check

## 검증 대상

- TAP: `TAP 3-A2`
- 공식 INDEX: https://app.notion.com/p/7b1dafb5212d4de2995d5b8219399698
- N-ROOT: https://app.notion.com/p/8e3bafb3e64f448d8e06d63127d1155e
- 검증일: 2026-07-23

## 결과

| 검증 항목 | 기대값 | 결과 | 근거 |
|---|---:|---|---|
| 공식 INDEX 직접 fetch | 성공 | PASS | INDEX 제목과 Root ancestor 확인 |
| 공식 Source | 13개 | PASS | N-05-00~N-05-10, N-06, N-08 |
| 외부 후보 | 3개 분리 | PASS | Draft, v0.2 Draft, v1.6 draft sharing |
| N-ROOT 직접 fetch | 성공 | PASS | 제목 `세무서·은행 업무 Process Model` 확인 |
| 5.0 구조 | Root 내부 섹션 | PASS | `5. 업무 흐름 > 5.0` 확인 |
| 6 구조 | Root 내부 섹션 | PASS | INDEX와 Root 구조에서 업무 정의 섹션 확인 |
| 5.1~5.10 | synced block 10개 | PASS | INDEX가 각 항목을 Root 직접 삽입 동기화 블록으로 명시 |
| N-08 래퍼 | 접근 가능 | PASS | 래퍼가 N-ROOT의 직접 하위임을 fetch로 확인 |
| N-08 DB | 접근 가능 | PASS | DB 제목, parent wrapper, schema 확인 |
| N-08 데이터 소스 | 식별 가능 | PASS | `collection://911becf0-ecda-4bb9-b62b-7b71d7992e73` 확인 |
| N-08 항목 | 직접 읽기 가능 | PASS | E2E-03 fetch 및 DB ancestor chain 확인 |
| 민감정보 | 실제 값 없음 | PASS | 구조·식별자·공개 Notion URL만 기록 |

## 형식 및 정합성

- 13개 Source ID에 누락·중복이 없다.
- 5.0과 6을 독립 페이지로 잘못 분류하지 않았다.
- 5.1~5.10의 synced block 특성을 명시했다.
- N-08의 래퍼, DB, 데이터 소스, 항목 계층을 분리했다.
- 외부 후보 3개를 공식 Source와 분리했다.
- 원문 업무 내용은 Source Extract로 복제하지 않았다.

## 판정

`PASS`

TAP 3-A2-P는 본 Commit이 생성되고 작업트리가 clean인 경우에만 실행할 수 있다.
