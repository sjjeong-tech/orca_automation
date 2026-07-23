# A-V1 Source Coverage R2 — 미검토 Notion Source 보완 Audit

## 관계 표기 정의

`NEW`(신규) · `CONFIRMS`(1차 Finding 보강) · `REFINES`(1차 Finding 정밀화) · `DUPLICATE`(1차와 동일) · `CONFLICTS`(1차와 충돌)

## 검토 범위

- Priority 1 (E2E-03·04·05·06·09): **전부 full fetch 완료**
- Priority 2: CASE-02(고유번호증·보안카드·홈택스) full fetch 완료. 재시연 파일럿의 나머지 구간(1차에서 이미 읽은 반포역지점/대리수령/위임장 구간 제외)은 **미검토**
- Priority 3: 7-2(관리역 인터뷰 및 검증 v2) full fetch 완료. 7-1, [AI Cross-check], [REC_S3_01]은 **미검토**
- 1차 보고서(`a-v1-source-coverage.md`, `a-v1-gap-register.md`, `a-v1-interview-candidates.md`)는 read-only 참조만 했으며 수정하지 않았다.

## 검토한 Notion 페이지 (R2 신규)

| 페이지 | URL | 페이지 유형 | 비고 |
|---|---|---|---|
| E2E-03 고유번호증 신청·수령 | https://app.notion.com/p/0a1d535868134040b878724136735211 | E2E 상세 (본선 업무) | 검증 상태: `인터뷰 확인`; 전체 fetch |
| E2E-04 보안카드 발급·홈택스 가입 | https://app.notion.com/p/e4b049d8fadc4535ab9475f787cb68cb | E2E 상세 (본선 업무) | 검증 상태: `인터뷰 확인`; 전체 fetch |
| E2E-05 고유번호증 정정 | https://app.notion.com/p/860d9c49fb304db6923f2b934c6a5aa4 | E2E 상세 (사후 업무) | 검증 상태: `인터뷰 확인`; 전체 fetch |
| E2E-06 고유번호증 폐업·청산 | https://app.notion.com/p/4d36f145ed2e4b9a9587edc97776dee0 | E2E 상세 (사후 업무) | 검증 상태: `추가 검증 필요`; 전체 fetch |
| E2E-09 계좌해지 | https://app.notion.com/p/595ce5a3194d4d3e81f30ad5ed1359ec | E2E 상세 (사후 업무) | 검증 상태: `추가 검증 필요`; 전체 fetch |
| 테일프론티어투자조합3호 — 고유번호증·보안카드·홈택스 (CASE-02) | https://app.notion.com/p/df2e3fcf53134ebfad611e2bbc6ece88 | 실제 CASE 레코드 | 전체 fetch. 속성 `사례구분`이 `CASE-01`로 태깅되어 있어, 1차에서 읽은 계좌개설 CASE와 **동일 사례번호**임이 확인됨 |
| 7-2. 관리역 인터뷰 및 검증 v2 | https://app.notion.com/p/39d72a41d9d7802683f2d0b2c874697a | 인터뷰 설계 문서 | 전체 fetch. **문서 자체가 "V2 Form 구축 완료 / 대표님 사전 검토 단계"라고 명시 — 실제 1:1 인터뷰는 아직 시작되지 않음** |

## 검토한 Repo (R2 신규)

`processes/04-security-card-hometax.md`(전체), `05-unique-number-correction.md`, `06-closure-liquidation.md`, `09-account-closure.md`; `sources/notion/n-05-04.md`~`n-05-06.md`, `n-05-09.md`; `variations/fund-type.md`, `gp-type.md`, `account-type.md`, `institution.md`. (`processes/03-unique-number-application.md`, `n-05-03.md`, `n-06.md`, `n-08.md`은 1차·A0-R에서 이미 전체를 읽어 재조회하지 않음.)

## Coverage 표

| ID | 관계 | Notion 원문 | Repo Source 반입 | Model 반영 | 유형 | 상태 | 권장 조치 |
|---|---|---|---|---|---|---|---|
| SIC-R2-01 | REFINES(SIC-01, SIC-05) | E2E-03 §6: "공통(조합유형·GP·공동GP·조합명·소재지·규약 최소자료) / 개투=결성계획 승인공문 확보 후 접수 가능 / 벤투·민법=승인공문 대신 유형별 근거자료+핵심정보로 준비 가능 / 신기투=Trigger·근거자료는 특정 관리역 인터뷰 확인 전 확정하지 않음" | 아니오 — `n-05-03.md`는 "해당 단계 결과 확인"만 기록 | 아니오 — `fund-type.md` FT-01~04 전부 UNKNOWN | TYPE-A | PROVISIONAL (E2E 상세, 검증 상태 `인터뷰 확인` — Root보다 근거 수준 높음. 단 신기투는 문서 자체가 여전히 확정 대기 중) | `n-05-03.md` AT-03-04~06과 `fund-type.md` FT-01(개투)·FT-02/04(벤투·민법)에 이 3분류를 PROVISIONAL로 반영. 신기투(FT-03)는 UNKNOWN 유지 |
| SIC-R2-02 | NEW | E2E-05 "주요 정정 사유": 조합명·소재지·대표자 변경, GP 변경, 공동GP 추가·제외, GP 법인 사명·주소 변경, 기존 등록정보 오류. 특정 담당자 인터뷰에서 언급됐으나 "공통 빈도 순위로 확정하지 않는다"고 문서가 스스로 명시 | 아니오 — `n-05-05.md`는 "정정 사유 및 서류 확인"만 기록, 사유 목록 없음 | 아니오 — Process 05 R-5는 "Source에 열거된 정정 사유가 없다"고 UNKNOWN 유지(정확했음, 당시 근거 부재) | TYPE-A | PROVISIONAL (사유 카테고리는 인터뷰 확인 페이지 근거이나 빈도·우선순위는 문서 자체가 미확정) | `n-05-05.md`에 사유 카테고리 5종을 근거로 추가하고 Process 05 R-5/UC-02를 "사유 카테고리 존재(PROVISIONAL), 우선순위·완전성 UNKNOWN"으로 하향 조정하여 반영 |
| SIC-R2-03 | NEW | E2E-05 Mermaid: 접수 후 처리를 `보완`(기존접수유지 vs 재접수 판단)과 `취하`(날인본 반환 가능 여부 → 신규 재접수 여부 판단 → 종료)로 분리한 상세 분기 구조 | 아니오 | 부분 — Process 05 `UC-D03`(보완/취하 판단, Actor UNKNOWN)로 이미 이분되어 있으나 "기존접수유지 vs 재접수", "취하 후 재접수 여부"라는 하위 분기는 미반영 | TYPE-A | PROVISIONAL | Process 05 UC-08/UC-D03에 하위 분기 3종(기존접수유지/재접수/취하종료)을 PROVISIONAL로 추가 |
| SIC-R2-04 | NEW / TYPE-B | E2E-09: "지원팀 수행은 현재 확인 사례 1건이며 표준 수행 주체는 `[확인 필요]`다", GP 직접 또는 다른 주체 수행 경로와 안전·수탁계좌 별도 절차가 Mermaid에 명시적 대안 분기로 존재 | 아니오 — `n-05-09.md`는 모든 Task Actor를 "지원팀 담당자 또는 원문 지정 Actor"로만 기록, "1건 확인 사례"라는 한정 자체가 없음 | 아니오 — `processes/09-account-closure.md`의 AC-01~08 Main Flow가 이 Actor를 CONFIRMED로 사용하면서, "이 흐름 자체가 1개 사례에서만 확인됐고 표준 수행주체가 아니다"라는 E2E-09의 핵심 caveat이 어디에도 없음 | TYPE-B | 시스템적 GAP (자동화 영향 큼) | `n-05-09.md`와 `processes/09-account-closure.md` 상태 섹션에 "AC-01~08 Main Flow는 확인 사례 1건 기반이며 GP 직접·기타 주체 수행 경로가 별도 존재함(표준 수행주체 미확정)"을 명시 필요. 자동화 설계 시 이 흐름을 기본값으로 오인하지 않도록 경고 |
| SIC-R2-05 | REFINES(GAP-REG-04) | CASE-02 서류 체크리스트: 개인GP·민법상조합 12개 항목(신청서·무상사용승낙서·조합대표증빙·인감증명서 등, 각 적용조건·확보형태·검수항목 포함) | 아니오 | 아니오 — `gp-type.md` GP-04(개인GP 첨부서류)는 PROVISIONAL, 세부 목록 없음 | TYPE-D(CASE_ONLY) | 단일 사례 — Repo·Model 반영 금지 | `gp-type.md`에 CASE_ONLY 참고자료로만 인용. **주의: 1차 보고서의 "개인 17종"은 계좌개설 CASE(다른 Process 구간)의 수치이며, 이 12개 항목(고유번호증 구간)과 혼동하지 않아야 함 — 아래 CASE_ONLY 종합 참고** |
| SIC-R2-06 | CONFIRMS(1차 CASE_ONLY 종합) | CASE-02 페이지 속성 `사례구분: "CASE-01"` — 1차에서 읽은 계좌개설 케이스와 **Notion 자체 속성값이 동일** | 해당 없음 | 해당 없음 | TYPE-D(CASE_ONLY) | 근거 강화 | 1차 "CASE_ONLY 종합" 표의 "두 출처가 실질적으로 동일 사례"라는 판단이 재시연 파일럿뿐 아니라 CASE-02에도 그대로 적용됨을 확정. 조합유형·GP유형·계좌유형·기관 4개 Variation 전체에 걸쳐 **실제 독립 검증 사례는 여전히 1건(테일프론티어투자조합3호)뿐**임을 각 Variation 문서에 명시 권장 |
| SIC-R2-07 | NEW | 7-2 페이지: "현재 상태: V2 Form 구축 완료 / 대표님 사전 검토 단계", 1차 대상 관리역 2~3명 인터뷰도 아직 미확정 | 해당 없음(설계 문서) | 해당 없음 | TYPE-A/절차적 | 확인 필요 | 아래 인터뷰 후보 문서(`a-v1-interview-candidates-r2.md`) INT-R2-01 참고 — GPT/Codex는 "관리역 인터뷰로 해소 예정"인 UNKNOWN 항목의 해소 시점을 앞당길 수 없음을 V1-R 설계에 반영 |

## 미검토 범위 (R2에서도 다루지 않음)

- 7-1 관리역 인터뷰 및 검증 v1
- [AI Cross-check] As-Is 1차 인지 및 정합성 검토 결과
- [REC_S3_01] 지원팀 수행업무 포트폴리오 및 재시연 후보
- 세무서은행 업무 재시연 파일럿의 반포역지점/대리수령/위임장 구간 외 나머지 (63,637자 중 일부만 1차에서 확인)
- 위 항목은 이번 TAP 결론에 반영하지 않았으며 다음 TAP의 후보로 남긴다.
