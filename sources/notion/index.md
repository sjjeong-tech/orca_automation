# Notion Source Structure Index

## 기준 원문

- Source ID: `N-ROOT`
- 제목: 세무서·은행 업무 Process Model
- Root URL: https://app.notion.com/p/8e3bafb3e64f448d8e06d63127d1155e
- 공식 INDEX: https://app.notion.com/p/7b1dafb5212d4de2995d5b8219399698
- 확인 기준일: 2026-07-23
- 원문 우선순위: `N-ROOT 5.x → N-ROOT 6.x → N-08 Roadmap → 인터뷰·파일럿·Cross-check → Layer 2 대화 기록`

이 문서는 공식 Notion INDEX를 Repo 탐색용으로 반입한 구조 지도다. Process 내용 자체를 확정하거나 Notion 원문을 대체하지 않는다.

## 공식 Source 13개

| Source ID | 번호 | 정확한 제목 | Notion 위치 | 유형 | Root 연결 | 상태 |
|---|---:|---|---|---|---|---|
| N-05-00 | 5.0 | 업무지도 — 결성계획 승인에서 계좌번호 전달까지 | N-ROOT > 5. 업무 흐름 > 5.0 | Root 내부 섹션 | Root 본문 직접 포함 | 확인 완료 |
| N-05-01 | 5.1 | [문구점] 명판 제작·인감 제작 | N-ROOT > 5. 업무 흐름 > 5.1 | 동기화 블록·업무 모델 | Root 본문 직접 삽입 | 확인 완료 |
| N-05-02 | 5.2 | [우체국] 등기·내용증명 발송 | N-ROOT > 5. 업무 흐름 > 5.2 | 동기화 블록·업무 모델 | Root 본문 직접 삽입 | 확인 완료 |
| N-05-03 | 5.3 | [세무서] 고유번호증 신청 | N-ROOT > 5. 업무 흐름 > 5.3 | 동기화 블록·업무 모델 | Root 본문 직접 삽입 | 확인 완료 |
| N-05-04 | 5.4 | [세무서] 보안카드 발급 및 홈택스 가입 | N-ROOT > 5. 업무 흐름 > 5.4 | 동기화 블록·업무 모델 | Root 본문 직접 삽입 | 확인 완료 |
| N-05-05 | 5.5 | [세무서] 고유번호증 정정 | N-ROOT > 5. 업무 흐름 > 5.5 | 동기화 블록·업무 모델 | Root 본문 직접 삽입 | 확인 완료 |
| N-05-06 | 5.6 | [세무서] 고유번호증 폐업·청산 | N-ROOT > 5. 업무 흐름 > 5.6 | 동기화 블록·업무 모델 | Root 본문 직접 삽입 | 확인 완료 |
| N-05-07 | 5.7 | [은행] 계좌개설 | N-ROOT > 5. 업무 흐름 > 5.7 | 동기화 블록·업무 모델 | Root 본문 직접 삽입 | 확인 완료 |
| N-05-08 | 5.8 | [은행] 계좌개설 보완 | N-ROOT > 5. 업무 흐름 > 5.8 | 동기화 블록·업무 모델 | Root 본문 직접 삽입 | 확인 완료 |
| N-05-09 | 5.9 | [은행] 계좌해지 | N-ROOT > 5. 업무 흐름 > 5.9 | 동기화 블록·업무 모델 | Root 본문 직접 삽입 | 확인 완료 |
| N-05-10 | 5.10 | [은행] 잔액증명서 발급 | N-ROOT > 5. 업무 흐름 > 5.10 | 동기화 블록·업무 모델 | Root 본문 직접 삽입 | 확인 완료 |
| N-06 | 6 | 업무 정의 | N-ROOT > Layer 1 > 6. 업무 정의 | Root 내부 섹션 | Root 본문 직접 포함 | 확인 완료 |
| N-08 | 8 | E2E Process Roadmap DB | N-ROOT > 8장 래퍼 > DB | 데이터베이스 | Root 8장에 inline 삽입 | 확인 완료 |

## 구조 확인

- `N-05-00`과 `N-06`은 독립 페이지가 아니라 N-ROOT 내부 섹션이다.
- `N-05-01`~`N-05-10`은 N-ROOT 본문에 삽입된 synced block이다. 일반 페이지로 열면 Root 전체가 반환될 수 있으므로 Source ID와 Root 내부 heading을 함께 사용한다.
- `N-06`은 6.1~6.10 최소 업무 정의를 포함하며 같은 번호의 5.x 흐름을 보조한다.
- `N-08`은 아래 네 계층을 구분한다.

| 계층 | 식별자 | 확인 결과 |
|---|---|---|
| 래퍼 페이지 | https://app.notion.com/p/3a472a41d9d7808a81b2f0378495e092 | N-ROOT의 직접 하위 페이지 |
| 데이터베이스 | https://app.notion.com/p/78d46bce7bb44289955181d2a06f2cbe | 래퍼 내부 inline DB |
| 데이터 소스 | `collection://911becf0-ecda-4bb9-b62b-7b71d7992e73` | DB schema 및 전체 Roadmap view 보유 |
| 데이터베이스 항목 | E2E-00~E2E-10, 총 11개 | 각 항목 URL로 직접 읽음 |

E2E-03 검증 항목: https://app.notion.com/p/0a1d535868134040b878724136735211

## 외부 후보 3개

아래 페이지는 N-ROOT와 같은 상위 `[자동화]` 아래에서 발견됐지만 Root 본문 직접 연결이 확인되지 않아 공식 Source로 사용하지 않는다.

| 제목 | URL | 판정 |
|---|---|---|
| 세무서·은행 업무 Process Model (Draft) | https://app.notion.com/p/d2b89101caf247c382b7e054862709d4 | 외부 후보 |
| 세무서·은행 업무 Process Model v0.2 (Link Architecture Draft) | https://app.notion.com/p/ae8365ad54c2482cb944d830654d0089 | 외부 후보 |
| 세무서·은행 업무 Process Model v1.6 _ draft sharing | https://app.notion.com/p/39172a41d9d780919edfc4ad01c2ac5c | 외부 후보 |

## 탐색 및 보안 원칙

1. N-ROOT를 먼저 열고 제목과 URL을 확인한다.
2. 5.0과 6은 N-ROOT 내부 heading으로 접근한다.
3. 5.1~5.10은 Source ID, N-ROOT URL, 내부 heading을 함께 기록한다.
4. N-08은 래퍼·DB·데이터 소스·항목 URL을 혼동하지 않는다.
5. 외부 후보는 직접 연결이 확인되기 전까지 공식 Source로 승격하지 않는다.
6. 미확정 상태는 `[확인 필요]`, `보류`, `추가 검증 필요`로 유지한다.
7. 인증정보, 비밀번호, 보안카드 값, 계좌번호, 개인 식별정보 등 실제 민감정보를 Repo로 복사하지 않는다.

## 검증 요약

- 공식 Source: 13
- 확인 완료: 13
- 부분 확인: 0
- 미발견: 0
- 외부 후보: 3
- 접근 불가: 0
- Pilot 추천: `N-05-03`
