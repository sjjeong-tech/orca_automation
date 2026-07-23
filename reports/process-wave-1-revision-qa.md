# Process Wave 1 Revision QA

## 판정

`PASS WITH NON-BLOCKING GAPS`

실행 가능성을 차단하던 완료조건, Decision, Exception 복귀, Mermaid 분기·Loop, RACI, Source 추적, Process Interface 구조를 보강했다. 미확정 운영기준은 공통 Rule로 확정하지 않고 `PROVISIONAL` 또는 `UNKNOWN`으로 유지한다.

## 검증 범위

| Process | Atomic Task | Decision | Exception 복귀경로 | Interface | 결과 |
|---|---:|---:|---:|---:|---|
| 00 전체 E2E | 9 | 4 | 6 | 5 | PASS |
| 03 고유번호증 신청·수령 | 16 | 3 | 5 | 2 | PASS |
| 04 보안카드·홈택스 | 11 | 4 | 5 | 2 | PASS |
| 07 계좌개설 | 14 | 7 | 5 | 4 | PASS |
| 08 계좌개설 보완 | 9 | 6 | 6 | 2 | PASS |
| **합계** | **59** | **24** | **27** | **15** | **PASS** |

## Findings 반영 결과

| Finding | 검증 결과 | 근거 |
|---|---|---|
| F-01 완료조건 | PASS | 59개 Task에 대상과 산출물이 명확한 관찰 가능 종료조건을 기록했다. |
| F-02 Decision | PASS | 판단 주체·시점·입력·조건·양방향 분기·추가 확인·상태·근거를 24개 Decision에 기록했다. |
| F-03 Exception·Rework | PASS | 27개 Exception에 감지·대응·수정 입력·정확한 복귀 Task·종료조건을 기록했다. |
| F-04 Mermaid | PASS | Decision diamond, 분기명, 재작업 Loop, 업무 완료와 후속 완수를 반영했다. 확인되지 않은 분기는 `확인 필요`로 표시했다. |
| F-05 RACI | PASS | Actor 중심 표를 Activity 중심 표로 바꾸고 각 Activity의 Accountable을 1명으로 제한했다. |
| F-06 압축 추적성 | PASS | 03 Process를 Source Atomic Task 16개로 복원하고 1:1 Mapping을 기록했다. |
| F-07 E2E Trigger | PASS | 공통 Trigger를 `담당 관리역이 행정업무 착수 가능 상태를 확인`으로 일반화하고 유형별 Trigger는 미확정으로 분리했다. |
| F-08 Interface | PASS | 필수 연결 5종과 E2E 참조를 명시하고 상호 상태·인계 주체·완료조건을 정렬했다. |

## Interface 통합 검증

| 연결 | 상태 | 검증 결과 |
|---|---|---|
| 03 → 04 | PROVISIONAL | 지원팀 인계, 담당 관리역 필요성 판단, 04 지원팀 수신을 분리했다. |
| 03 → 07 | PROVISIONAL | 지원팀 인계, 담당 관리역 착수·수행주체 판단, 07 지원팀 수신을 분리했다. |
| 07 → 08 | CONFIRMED | 은행 보완 요청이 `AS-01`로 인계된다. |
| 08 → 07 | PROVISIONAL | `AS-09` 결과가 `AO-12` 심사·완료 확인으로 복귀한다. |
| 07 → 11 예정 | UNKNOWN | Process 11 정의 전이므로 인계 상세를 확정하지 않았다. |

00 본문·Exception·Mermaid, 07 Mermaid, 08 Mermaid에서 `07 → 08 AS-01 → AS-09 → 07 AO-12` 왕복 경로가 일치한다.

## QA 체크

- [x] Task별 관찰 가능한 완료조건
- [x] Decision의 판단 주체·조건·분기
- [x] Exception의 감지·대응·복귀
- [x] Mermaid와 본문 일치
- [x] RACI Activity별 Accountable 1명
- [x] Source Task 추적 가능
- [x] 미확정 기준의 `UNKNOWN`·`PROVISIONAL` 유지
- [x] Process Interface 연결 정합성
- [x] 민감정보 실제 값 없음
- [x] Markdown 표·코드 Fence 및 Mermaid 기본 구조 검증

## 비차단 Gap

- 제3자 수령요건
- 개인·법인·공동GP별 확정 첨부서류
- 고유번호증 발급 후 홈택스 가입 가능 시점
- 일반·안전계좌 및 수탁계좌 판별 기준
- 기관·지점별 제출 방식
- 기존 제출서류 회수 기준
- 심사 재확인 주기와 기관 Escalation 기준
- Process 11 결과 인계 상세

이 항목들은 Source 보강 전까지 공통 Rule이나 자동화 조건으로 사용하지 않는다.

## 최종 결과

Wave 1 Process 5개는 Process Wave 2의 문서 표준으로 사용할 수 있다. 위 Gap은 비차단 상태로 Source 통합 QA와 최종 Gap 분석에서 계속 추적한다.
