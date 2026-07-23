# A-V1 Source Coverage — Notion 원본 · Repo Source · Process/Variation Model 대조

## 검토 범위

- 대상: `variations/institution.md` → `account-type.md` → `gp-type.md` → `fund-type.md` (지정 우선순위)
- 대조 계층: (1) Notion 원본 Process Model과 하위 페이지 (2) Repo `sources/notion/**` (3) Repo `processes/**` 및 `variations/**`
- 판정 원칙: Notion에 있다는 사실만으로 즉시 `CONFIRMED` 승격하지 않음. 페이지 유형(업무기준서/E2E 상세/CASE/재시연/Roadmap)에 따라 근거 수준을 구분함.
- 범위 표시: 이번 TAP은 지정 우선순위 4개 축을 중심으로 진행했으며, 아래 "미검토 범위"에 남은 영역은 다루지 않았다.

## 검토한 Notion 페이지

| 페이지 | URL | 페이지 유형 | 비고 |
|---|---|---|---|
| 세무서·은행 업무 Process Model (Root) | https://app.notion.com/p/8e3bafb3e64f448d8e06d63127d1155e | 업무기준서 Root | 검색 결과 스니펫만 확인, 전체 재조회는 생략(146K자, A0-R에서 1회 확인 완료) |
| E2E-00 신규 조합 결성 전체 E2E | https://app.notion.com/p/1bb46e50b0944f0991a306044a0337a0 | E2E Process 상세(Roadmap DB 항목) | 검증 상태: `파일럿 검증`; 전체 fetch 완료 |
| E2E-07 계좌개설 | https://app.notion.com/p/9857501ab74749289733377c4983ea30 | E2E Process 상세 | 검증 상태: `인터뷰 확인`; 전체 fetch 완료 |
| E2E-08 계좌개설 보완 | https://app.notion.com/p/f9a4e5b6011842f6b0505aa4d7f6726d | E2E Process 상세 | 검증 상태: `인터뷰 확인`; 전체 fetch 완료 |
| E2E-10 잔액증명서 발급 | https://app.notion.com/p/a7e0c50ba59d4122a783f0055f0c1fd1 | E2E Process 상세 | 검증 상태: `추가 검증 필요`; 전체 fetch 완료 |
| 세무서은행 업무 재시연 파일럿 | https://app.notion.com/p/855152f7f04b4ea49b29358465f44bf4 | 재시연 기록 | 63,637자, 반포역지점/대리수령/위임장 구간만 슬라이스 확인 (전체 미독) |
| 테일프론티어투자조합3호 — 계좌개설 (CASE-01) | https://app.notion.com/p/970b3cd687ac4e3a8e0285cf63aa9cb9 | 실제 CASE 레코드 | 전체 fetch 완료 |
| 테일프론티어투자조합3호 — 고유번호증·보안카드·홈택스 | https://app.notion.com/p/df2e3fcf53134ebfad611e2bbc6ece88 | 실제 CASE 레코드 | 검색 스니펫만 확인, 전체 미fetch |
| 7-1 / 7-2. 관리역 인터뷰 및 검증 v1/v2 | https://app.notion.com/p/39d72a41d9d780949a72e1838b622702 / https://app.notion.com/p/39d72a41d9d7802683f2d0b2c874697a | 인터뷰 설계 문서 | 검색 스니펫만 확인, 전체 미fetch |
| [AI Cross-check] As-Is 1차 인지 및 정합성 검토 결과 | https://app.notion.com/p/39d72a41d9d78063aaccfdd709a21cff | Layer 2 검증 기록 | 검색 스니펫만 확인, 전체 미fetch |
| [REC_S3_01] 지원팀 수행업무 포트폴리오 및 재시연 후보 | https://app.notion.com/p/4f8a6f90b5c64442bef4a05d374b1794 | 재시연 후보 목록 | 검색 스니펫만 확인, 전체 미fetch |

## 검토한 Repo Source

`sources/notion/n-05-02.md`~`n-05-10.md`, `n-06.md`, `n-08.md`, `conflicts/unresolved.md` 전체와 `processes/02~10`, `variations/institution.md`·`account-type.md`·`gp-type.md`·`fund-type.md`, `plans/variation-model-plan.md`, `mappings/variation-source-index.md`.

## Variation별 Coverage 요약

- **institution.md**: Notion의 E2E-07/E2E-08/E2E-10 상세 페이지에 `퀵`·`팩스`·`이메일` 채널이 명시적으로 문서화돼 있으나 Repo Source(`n-05-07/08/10.md`)와 `variation-source-index.md`는 이를 전부 `UNKNOWN — 근거 없음`으로 기록하고 있다. Source Import 후보 다수, CASE_ONLY 근거 다수(반포역지점 보완서류 4종, 대리수령 미해결 Gap).
- **account-type.md**: Process 10(잔액증명서)에 계좌 유형별(일반/안전/수탁) 요청 절차 분기가 E2E-10 상세 페이지에 존재하는데도, `account-type.md`는 "Process 08·09·10에는 계좌 유형별 적용 차이를 직접 확인할 Source가 없다"고 명시해 제외했다. 안전계좌의 실제 협업 부서(오픈플랫폼팀)도 Model에 없다.
- **gp-type.md**: 유형별 첨부서류 전체 세트가 CASE-01(테일프론티어투자조합3호)에 개인 17종/법인 20종/안전계좌 +2종으로 구체적으로 존재하나, 단일 CASE이므로 공통 Rule로 승격할 근거는 아니며 `CASE_ONLY`로 분류한다.
- **fund-type.md**: 가장 큰 개선 여지 확인. Repo `sources/notion/n-05-07.md`의 `AT-07-09`(투자 유형 확인)는 완료조건을 "해당 단계 결과 확인"으로만 기록했으나, Notion Root 문서는 이 Task(`은행_계좌개설_09`)에서 `개인투자조합/벤처투자조합/신기술투자조합/민법상조합`이라는 4개 유형명을 직접 열거한다. `fund-type.md`는 이 네 유형 모두를 "공식 Source 직접 명칭 없음 — UNKNOWN"으로 기록하고 있어 재검증이 필요하다.

## Source Import Candidate

| ID | Notion 원문 | Repo Source 반입 | Model 반영 | Finding 유형 | 상태 | 권장 조치 |
|---|---|---|---|---|---|---|
| SIC-01 | Root 문서 `은행_계좌개설_09`: "투자 유형 확인 … 개인투자조합 / 벤처투자조합 / 신기술투자조합 / 민법상조합" (Root: https://app.notion.com/p/8e3bafb3e64f448d8e06d63127d1155e) | 아니오 — `sources/notion/n-05-07.md` `AT-07-09`는 "해당 단계 결과 확인"만 기록 | 아니오 — `fund-type.md` 4/4 유형이 UNKNOWN | TYPE-A | PROVISIONAL(Root 업무기준서 직접 근거이나 상세 적용조건은 별도 확인 필요) | `n-05-07.md` AT-07-09에 4개 유형명을 반영하고 `fund-type.md`의 UNKNOWN 상태를 재평가 |
| SIC-02 | E2E-07 상세: "은행 제출·심사 … 방문 또는 퀵으로 제출" (https://app.notion.com/p/9857501ab74749289733377c4983ea30) | 아니오 — `n-05-07.md` AT-07-35~36은 "은행 제출 방식 판단"만 기록, 퀵 미언급 | 아니오 — `institution.md` IV-06 "퀵 제출 후보 … UNKNOWN" | TYPE-A | PROVISIONAL(E2E 상세 페이지, 검증 상태 `인터뷰 확인`) | `institution.md` 처리방식 Matrix에 퀵을 07 AO-11의 문서화된 옵션으로 반영, 선택기준은 계속 UNKNOWN 유지 |
| SIC-03 | E2E-08 상세 Mermaid: 은행 전달 방식 분기 "이메일·스캔본 전달" vs "퀵·원본 전달" (https://app.notion.com/p/f9a4e5b6011842f6b0505aa4d7f6726d) | 아니오 — `n-05-08.md` AT-08-08은 "보완본 은행 전달"만 기록 | 아니오 — `institution.md` IV-06(퀵)·IV-07(메일) 모두 UNKNOWN | TYPE-A | PROVISIONAL | `institution.md`에 08 AS-06의 두 채널(이메일/퀵)이 E2E 상세 페이지에 실제 분기로 존재함을 반영 |
| SIC-04 | E2E-10 상세: "스캔본·팩스본 수령" + "계좌 유형별 요청 절차"(일반/안전/수탁·기타) 분기 (https://app.notion.com/p/a7e0c50ba59d4122a783f0055f0c1fd1) | 아니오 — `n-05-10.md` AT-510-07은 "잔액증명서 수령"만 기록, 팩스·유형분기 미언급 | 아니오 — `institution.md` 팩스 UNKNOWN; `account-type.md`는 Process 10을 계좌유형 차이 제외 대상으로 명시 | TYPE-A | PROVISIONAL(페이지 자체 검증 상태 `추가 검증 필요`) | `n-05-10.md`에 팩스 채널과 계좌유형 분기 반영; `account-type.md` "Process 08·09·10 Source 없음" 서술을 Process 10에 한해 재검토 |
| SIC-05 | E2E-00 상세 "4.2 업무 착수 기준" 표: 개인투자조합=결성계획 승인공문 일치, 벤처투자조합=핵심정보·공통 근거문서, 민법상조합=핵심정보·공통 법적근거문서, 신기술투자조합=Trigger·근거자료(확정 금지, 추가 인터뷰 대기) (https://app.notion.com/p/1bb46e50b0944f0991a306044a0337a0) | 아니오 | 아니오 — `fund-type.md` 4유형 전부 UNKNOWN, "확인 필요" 수준의 세분화 없음 | TYPE-A | PROVISIONAL(검증 상태 `파일럿 검증`, Notion 문서 자체가 "미충족 시 확인 대기"로 이미 유보) | `fund-type.md`에 유형별 확인 항목·근거서류 카테고리를 PROVISIONAL로 반영하고 신투는 별도 확인 대기 상태 유지 |
| SIC-06 | E2E-00 상세 "8.5 표준화·To-Be": "농협 일반계좌: 1차 표준화 우선 대상 / 농협 외 은행: 은행·지점별 서류·제출 방식 별도 확인" | 아니오 | 아니오 — `institution.md`/`variation-source-index.md`는 "은행"만 통칭, 농협/농협 외 구분 없음 | TYPE-A | PROVISIONAL | `institution.md` 기관 유형 Matrix에 "농협 vs 농협 외" 구분을 후보로 추가 |
| SIC-07 | E2E-07 상세 "안전계좌의 오픈플랫폼팀 연계와 지원팀 업무 포함 여부"(확정 금지) | 아니오 | 아니오 — `account-type.md` 안전계좌 Actor는 전부 UNKNOWN, 오픈플랫폼팀 언급 없음 | TYPE-A | PROVISIONAL | `account-type.md` Actor 차이 섹션에 오픈플랫폼팀을 관련 후보 Actor로 반영 |
| SIC-08 | E2E-07 상세 "인감증명서·계좌유형: 개투 1개월 이내, 기타 2개월 이내 발급본 권장 의견은 내부 요청 기준 후보" | 아니오 | 아니오 — `fund-type.md`에 인감증명서 유효기간 관련 언급 전혀 없음 | TYPE-A | PROVISIONAL("의견"·"후보"로 이미 유보된 표현) | `fund-type.md` 문서 차이 섹션에 개투 vs 기타 유효기간 후보값을 PROVISIONAL로 추가 |
| SIC-09(=MODEL_GAP) | Repo `sources/notion/n-05-02~10.md` 전체가 Notion 원문의 완료조건을 "해당 단계 결과 확인"이라는 동일 표현으로만 기록(예: AT-52-07 "우체국 방문 및 접수", AT-07-16 "반포역지점 추가 요청 서류 확인" 등 모두 원문 세부값 없이 동일 패턴) | 예(Notion 원문 존재) | 아니오 — Process/Variation이 참조할 세부 근거가 Source Extract 단계에서 이미 소실됨 | TYPE-B | 시스템적 GAP | Source Extract 재작업 시 Root 문서의 실제 열거값(서류명·채널명·유형명)을 완료조건 필드에 포함하도록 템플릿 보강 검토 |
| SIC-10(=MODEL_GAP) | `sources/notion/n-08.md`는 `E2E Process Roadmap DB`의 요약 행(Process ID/Title/Related Source/Role/Status)만 캡처했고, 각 E2E-XX 개별 페이지의 실무기준·예외·인터뷰 근거·TI_07 신규기준 섹션은 미반입 | 부분(요약만 반입) | 아니오 | TYPE-B | 시스템적 GAP | `n-08.md`에 E2E-XX 상세 페이지 존재를 명시하고, 이후 TAP에서 개별 페이지 반입 여부를 계획에 반영 |

## 미검토 범위 (이번 TAP에서 다루지 않음)

- E2E-01·02·03·04·05·06·09 상세 페이지 (URL만 검색 스니펫으로 확인, 전체 fetch 없음)
- `세무서은행 업무 재시연 파일럿` 전체 63,637자 중 반포역지점/대리수령/위임장 구간 외 나머지
- `테일프론티어투자조합3호 — 고유번호증·보안카드·홈택스` CASE 페이지 전체
- `7-1/7-2. 관리역 인터뷰 및 검증`, `[AI Cross-check] As-Is 1차 인지 및 정합성 검토 결과`, `[REC_S3_01] 지원팀 수행업무 포트폴리오 및 재시연 후보` 전체 내용
- 위 페이지들을 이 TAP의 결론에 반영하지 않았으며, 다음 TAP에서 필요 시 추가 검토 대상으로 남긴다.
