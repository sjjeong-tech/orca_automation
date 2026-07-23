# Process–Source Plan

## 매핑 원칙

- 1차 근거: N-ROOT 5.x 업무 흐름
- 2차 근거: N-ROOT 6.x 업무 정의
- 3차 근거: N-08 E2E Roadmap 항목
- 보조 근거: 인터뷰, 파일럿, Cross-check
- CASE 자료는 공식 Source를 대체하지 않으며 Variation 또는 Gap 검증에만 사용한다.

## 계획 매핑

| Process | 1차 Source | 보조 Source | 생성 Wave |
|---|---|---|---|
| 00-end-to-end | N-05-00 | N-08/E2E-00 | P1 |
| 01-stamp-seal | N-05-01, N-06/6.1 | N-08/E2E-01 | P2 |
| 02-mail-dispatch | N-05-02, N-06/6.2 | N-08/E2E-02 | P2 |
| 03-unique-number-application | N-05-03, N-06/6.3 | N-08/E2E-03 | P1 |
| 04-security-card-hometax | N-05-04, N-06/6.4 | N-08/E2E-04 | P1 |
| 05-unique-number-correction | N-05-05, N-06/6.5 | N-08/E2E-05 | P2 |
| 06-closure-liquidation | N-05-06, N-06/6.6 | N-08/E2E-06 | P2 |
| 07-account-opening | N-05-07, N-06/6.7 | N-08/E2E-07 | P1 |
| 08-account-supplement | N-05-08, N-06/6.8 | N-08/E2E-08 | P1 |
| 09-account-closure | N-05-09, N-06/6.9 | N-08/E2E-09 | P2 |
| 10-balance-certificate | N-05-10, N-06/6.10 | N-08/E2E-10 | P2 |
| 11-result-handover | N-05-03, N-05-04, N-05-07~10 | N-08 관련 항목 | P2 |

## Source Extract Wave

- Pilot: N-05-03
- Wave A: N-05-00, N-05-04, N-05-07, N-05-08, N-06, N-08
- Wave B: N-05-01, N-05-02, N-05-05, N-05-06, N-05-09, N-05-10

## 상태 처리

- 근거가 일치하면 `CONFIRMED`
- 원문에 미확정으로 기록됐으면 `UNKNOWN`
- Source 간 불일치가 있으면 `CONFLICT`
- 단일 사례에만 존재하면 `PROVISIONAL`
