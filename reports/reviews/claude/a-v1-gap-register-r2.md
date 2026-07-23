# A-V1 Gap Register R2 — Blocking / Non-blocking / CASE_ONLY / Unsupported Model

## 요약

- Blocking Findings: **0건**. `processes/04·05·06·09`와 `fund-type.md`·`gp-type.md`·`account-type.md`·`institution.md`에서 Source와 정면 충돌하거나 UNKNOWN을 근거 없이 CONFIRMED로 승격한 사례는 발견하지 못했다.
- Non-blocking Findings: 7건 (아래 표)
- Unsupported Model(TYPE-C): **0건**
- CASE_ONLY(TYPE-D): 2건 확인, 모두 1차에서 확인한 CASE-01(테일프론티어투자조합3호)과 **동일 사례**의 다른 Process 구간

## Blocking Findings

| ID | 관계 | 유형 | 대상 | Gap | 자동화 영향 | 근거 | 권장 조치 | 심각도 |
|---|---|---|---|---|---|---|---|---|
| _(해당 없음)_ | — | — | — | — | — | — | — | — |

## Non-blocking Findings

| ID | 관계 | 유형 | 대상 | Gap | 자동화 영향 | 근거 | 권장 조치 | 심각도 |
|---|---|---|---|---|---|---|---|---|
| GAP-R2-01 | REFINES(SIC-01/05) | MODEL_GAP | `variations/fund-type.md` §4·§5 (FT-01~04) | E2E-03이 개투=결성계획승인공문 / 벤투·민법=근거자료+핵심정보 / 신투=인터뷰 대기라는 3단계 구분을 이미 제공하는데도 `fund-type.md`는 4유형 전부를 동일하게 UNKNOWN 처리 | 자동화 체크리스트 설계 시 개투·벤투·민법에 이미 구분 가능한 착수서류 조건을 놓칠 위험 | `a-v1-source-coverage-r2.md` SIC-R2-01 | `fund-type.md`를 개투/벤투·민법/신투 3그룹으로 세분화하고 PROVISIONAL로 상향, 신투만 UNKNOWN 유지 | Non-blocking |
| GAP-R2-02 | NEW | MODEL_GAP | `variations/gp-type.md`(간접), `processes/05-unique-number-correction.md` R-5·UC-02 | E2E-05가 제공하는 정정 사유 5개 카테고리(조합명·소재지·대표자·GP·공동GP·등록오류)가 `n-05-05.md`·Process 05에 전혀 반영되지 않음 | 정정 사유 자동 분류·서류 요구 안내 기능 설계 시 근거 없이 처음부터 설계해야 함 | `a-v1-source-coverage-r2.md` SIC-R2-02 | `n-05-05.md` AT-55-02에 5개 카테고리를 PROVISIONAL로 추가, 빈도·우선순위는 UNKNOWN 유지 | Non-blocking |
| GAP-R2-03 | NEW | MODEL_GAP | `processes/05-unique-number-correction.md` UC-08·UC-D03 | E2E-05 Mermaid의 보완/취하 하위 분기(기존접수유지 vs 재접수, 취하 후 재접수 여부)가 Process 05에 단순 이분(UC-D03)으로만 반영됨 | 정정 예외 흐름 자동화 시 분기 단계가 실제보다 단순화되어 재접수 케이스를 놓칠 위험 | `a-v1-source-coverage-r2.md` SIC-R2-03 | UC-08 Exception 표에 하위 분기 3종을 PROVISIONAL로 추가 | Non-blocking |
| GAP-R2-04 | NEW | MODEL_GAP | `processes/09-account-closure.md` AC-01~08 Main Flow, Actors 섹션 | E2E-09가 명시하는 핵심 caveat — "지원팀 수행은 확인 사례 1건뿐이며 표준 수행 주체가 아니다(GP 직접·다른 주체 경로 별도 존재)" — 가 Process 09에 전혀 반영되지 않아, Main Flow가 마치 표준 흐름인 것처럼 읽힘 | 자동화 시 지원팀 수행을 기본 경로로 가정하면 GP 직접 처리 사례에서 오작동 | `a-v1-source-coverage-r2.md` SIC-R2-04; https://app.notion.com/p/595ce5a3194d4d3e81f30ad5ed1359ec | `processes/09-account-closure.md` 상태 섹션에 "AC-01~08은 확인 사례 1건 기반, 표준 수행주체 미확정"을 명시하고 GP 직접 수행 경로를 별도 UNKNOWN 분기로 인지 | Non-blocking (자동화 차단 Gap) |
| GAP-R2-05 | CONFIRMS | 자동화 차단 Gap | Process 06 CL-D05, Process 09 IF-06-09 | E2E-06 자체가 "잔여재산 분배 완료"를 Trigger로 볼지에 대해 서로 다른 관리역 응답이 상충한다고 명시(한 응답: 분배+계좌해지 모두 완료 언급 vs 다른 응답: 분배 완료를 중요 선행조건으로 제시, 순서 메모 상충) — Process 06이 이를 이미 REJECTED/UNKNOWN으로 정확히 보수적 처리한 것을 재확인 | 폐업·청산↔계좌해지 선후관계 자동 판단 로직을 만들 근거가 여전히 없음(기존 결론과 일치) | https://app.notion.com/p/4d36f145ed2e4b9a9587edc97776dee0 §6 | 변경 불필요 — 기존 UNKNOWN·REJECTED 유지가 Notion 근거로 재확인됨. 추가 인터뷰로만 해소 가능(INT-R2-04) | Non-blocking (확인용, 조치 없음) |
| GAP-R2-06 | REFINES | CASE_ONLY | `variations/gp-type.md`, 1차 GAP-REG-04 | CASE-02(고유번호증 구간)의 개인GP 서류 12개 항목은 1차에서 인용한 "개인 17종"(계좌개설 구간)과 **다른 Process 범위의 다른 숫자**다. 두 수치 모두 같은 사례(`사례구분: CASE-01`)에서 나왔으므로 서로 다른 업무 단계의 서류 요구량일 뿐, 통합하거나 평균낼 근거가 아니다 | Variation 설계 시 "개인GP 서류 N종"이라는 단일 수치로 뭉뚱그리면 실제로는 업무 단계마다 다른 목록이라는 사실이 사라짐 | `a-v1-source-coverage-r2.md` SIC-R2-05, SIC-R2-06 | `gp-type.md`에 "CASE-01의 개인GP 서류 수는 업무 단계별로 다르다(고유번호증 12종 vs 계좌개설 17종)"를 CASE_ONLY 주석으로 명시, 단일 수치로 합산하지 않음 | Non-blocking |
| GAP-R2-07 | NEW | 절차적 Gap | 전체 Variation의 "인터뷰로 확인 필요" 항목 전반 | 7-2 페이지 자체가 "V2 Form 구축 완료 / 대표님 사전 검토 단계"라고 명시 — 즉 체계적 관리역 1:1 인터뷰(60문항, 5.1~5.10 전체)가 **아직 시작되지 않음**. 1차·2차 보고서의 다수 TYPE-E 항목이 "인터뷰로 해소 가능"을 전제하지만 이 V2 프로그램의 실제 착수 시점은 불명 | Codex V1-R·Variation 최종 확정 일정이 이 인터뷰 완료를 전제로 하면 안 됨 | https://app.notion.com/p/39d72a41d9d7802683f2d0b2c874697a §9(대표님 검토 요청사항), §11(현재 상태) | GPT/Codex는 V1-R 설계 시 "인터뷰 대기" UNKNOWN 항목을 근시일 내 해소 가능한 것으로 가정하지 말고, V2 인터뷰 착수·완료 일정을 별도로 확인할 것을 권고. E2E 페이지들의 "인터뷰 확인"·"특정 담당자 인터뷰 확인사항" 등은 이 V2 프로그램과 무관한 기존 비공식 인터뷰 결과로 보임(용어 혼동 주의) | Non-blocking (일정 리스크) |

## Unsupported Model (TYPE-C)

R2에서 검토한 `processes/04·05·06·09`와 `fund-type.md`·`gp-type.md`·`account-type.md`·`institution.md`에서 Source 범위를 넘어서는 확정(CONFIRMED) 표현은 발견하지 못했다. Process 09가 "지원팀 담당자 또는 원문 지정 Actor"를 Main Flow 전체에 CONFIRMED로 쓰는 것(GAP-R2-04)은 Source Extract(`n-05-09.md`) 자체의 표준 표현을 그대로 따른 것이라 "Source 없는 확정"은 아니지만, Notion 원본의 중요한 한정어("확인 사례 1건")가 누락된 것이므로 TYPE-C가 아니라 TYPE-B(MODEL_GAP)로 분류했다.

## CASE_ONLY 종합 (R2 반영)

| CASE 근거 | 관련 Variation | 일반화 금지 이유 |
|---|---|---|
| CASE-02 (테일프론티어투자조합3호 — 고유번호증·보안카드·홈택스, `사례구분: CASE-01`) | gp-type, fund-type | 1차에서 확인한 계좌개설 CASE와 **Notion 속성상 동일 사례번호**. 서류 12종(고유번호증 구간)은 계좌개설 구간의 17종과 별개 수치이며 혼합·평균 금지 |

1차 보고서의 결론("실질적으로 동일 사례가 두 문서에 나타남")이 R2에서 세 번째 문서(CASE-02)로도 재확인됐다. **미라파트너스의 Variation 근거로 실제 독립 검증된 사례는 현재까지 테일프론티어투자조합3호 1건뿐**이라는 점을 Codex V1-R 단계에서 명확히 인지할 필요가 있다.
