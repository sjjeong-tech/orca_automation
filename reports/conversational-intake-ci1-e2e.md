# CP-05-CI1-LR Conversational Intake E2E

## Executive Summary

- Result: `PASS_WITH_N06_UI_GAP`
- Supported request type: `고유번호증 신청`
- Natural-language parse, missing-field questions, Preview gate, approved TEST write, Request→Task relation, status, Person, Actor, Next Action and duplicate detection passed.
- N-06 remains `PARTIAL_UI_CONFIRMATION_REQUIRED`: Task schema contains the Rollup, but the page API returned its actual value as `<omitted />`.
- Operational records, views, filters and schema were not changed.

## Inputs and Sources

- Base commit: `80cb01d8d15bef325f1f9979a31a35e14fbce5be`
- Claude lean review read from `origin/agent/claude/setup` commit `6c1f8fd`; no merge or cherry-pick.
- Contract: `contracts/conversational-intake-contract.yaml` v0.2.0
- FUND data source: `collection://14d72a41-d9d7-8137-8992-000b39730dd0`
- Request data source: `collection://454b6ef0-a514-45f3-93bf-edaef2ecaa74`
- Task data source: `collection://382ba3b6-8062-4ef1-a0ed-fc51adadff6b`

## CI-A — 입력규격·DB Mapping

필수정보는 관련 조합, 요청 업무, 요청자, 담당 관리역, 서류 전달 상태다. 목표일·긴급·원본 폴더·특이사항은 선택이다.

실제 Schema 확인:

- Request DB: 기존 Property 13개
- Task DB: 기존 Property 14개
- 신규 Property: 0개
- Request의 긴급·Current Actor·Next Action은 기존 `요청 내용`에 구조화 Text로 기록
- Request Blocker·Prototype 표시는 기존 `특이사항`에 기록

정확한 식별 결과:

- 조합: `디토 케이스테이 투자조합` 1건
- 요청자: `정상준` Workspace Person 1명
- 담당 관리역: `박세림` Workspace Person 1명

## CI-B — Parser와 승인 Gate

구현: `scripts/conversational-intake.mjs`

### TEST A — 필수정보 누락

입력: `디토 케이스테이 투자조합 고유번호증 신청 부탁드립니다.`

결과:

- 누락: requester, fund_manager, document_status
- 확인 질문: 3개
- Notion Write: 0

### TEST B — 정상 Preview

입력의 `다음 주 수요일`은 실행 기준일 2026-07-24에서 `2026-07-29`로 변환됐다.

- 필수정보 누락: 0
- 생성 예정 Task: 6
- 원본 폴더: 미입력 경고
- 승인 전 Notion Write: 0

### TEST C — 승인 후 생성

TAP에서 허용한 TEST 범위와 명시적 `--approve` Flag를 사용했다.

Request:

- 제목: `[TEST][CI1] 디토 케이스테이 투자조합 — 고유번호증 신청`
- URL: https://app.notion.com/p/3a772a41d9d781b698c3ffcabd8876f9
- 상태: `시작 전`
- 관련 조합, 요청자, 담당 관리역, 목표일, 서류 전달 여부 저장 확인
- 관련 Task 역참조: 6건 확인

Tasks:

1. https://app.notion.com/p/3a772a41d9d781d0b23aed739886ca40
2. https://app.notion.com/p/3a772a41d9d781c89128febb35f2781a
3. https://app.notion.com/p/3a772a41d9d78189a25bf383326156a9
4. https://app.notion.com/p/3a772a41d9d78116aededd08ab62a9f7
5. https://app.notion.com/p/3a772a41d9d7811a91d4cc0496140875
6. https://app.notion.com/p/3a772a41d9d781d686d7e24b30ec1a41

각 Task에서 상위 요청 Relation, 상태 `시작 전`, 담당자, 현재 Actor, 다음 Action, 완료조건을 재조회했다.

### TEST D — 중복 탐지

동일 `[TEST][CI1]` Request 1건을 재조회했다. 동일 조합·업무의 미완료 Request 후보로 판정했으며 추가 Write는 0건이다.

## N-06

검증 경로:

`Task.상위 요청 → Request.관련 조합 → Task.관련 조합 Rollup`

- 상위 요청 Relation: PASS
- Request 관련 조합: PASS
- Task Rollup Property 존재: PASS
- API 실제 Rollup 값: `<omitted />`
- UI 확인: 브라우저 연결이 제공되지 않아 미실행
- 판정: `PARTIAL_UI_CONFIRMATION_REQUIRED`

직접 FUND Relation을 Task에 추가하는 우회는 사용하지 않았다.

## Safety and Change Counts

- TEST Request 생성: 1
- TEST Task 생성: 6
- 신규 Property: 0
- 운영 Record 변경: 0
- 기존 View·Filter 변경: 0
- Form·Slack·Notion AI 작업: 0
- Process·Variation·Source 원본 변경: 0

## Validation

- Contract JSON-compatible YAML parse: PASS
- Node syntax: PASS
- Unit tests: PASS, 4 scenarios
- Missing field test: PASS
- Preview before write: PASS
- Approval gate: PASS
- Duplicate detection: PASS
- Request and Task re-read: PASS

## Next Review

GPT와 사용자는 생성된 TEST Request·Task의 사용성을 확인하고 첫 Task의 `관련 조합` Rollup이 `디토 케이스테이 투자조합`으로 표시되는지 UI에서 확인한다. 운영 Pilot과 다른 업무유형 확장은 별도 승인 대상이다.
