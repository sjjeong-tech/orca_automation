# A-V1 Gap Register — Blocking / Non-blocking / CASE_ONLY / Unsupported Model

## 요약

- Blocking Findings: **0건** — Source와 정면 충돌하거나, UNKNOWN이 근거 없이 CONFIRMED로 승격되거나, 잘못된 Actor·Process 연결이 확정된 사례를 발견하지 못했다. `institution.md`·`account-type.md`·`gp-type.md`·`fund-type.md` 4개 Variation 초안은 모두 미확정 항목을 `PROVISIONAL`/`UNKNOWN`으로 성실히 유지하고 있었다.
- Non-blocking Findings: 아래 표 참고 (주로 Source Import 미반영, CASE 단독 근거의 미분류, 자동화 준비도 관련 Gap)
- Unsupported Model(TYPE-C): **0건** — 검토한 4개 Variation에서 Source 범위를 넘어선 확정 표현을 발견하지 못함
- CASE_ONLY(TYPE-D): 6건 확인 — 모두 단일 CASE(테일프론티어투자조합3호, CASE-01) 또는 그 재시연 기록에서 파생됨

## Blocking Findings

| ID | 대상 | Gap | 자동화 영향 | 근거 | 권장 조치 | 심각도 |
|---|---|---|---|---|---|---|
| _(해당 없음)_ | — | — | — | — | — | — |

## Non-blocking Findings

| ID | 유형 | 대상 | Gap | 자동화 영향 | 근거 | 권장 조치 | 심각도 |
|---|---|---|---|---|---|---|---|
| GAP-REG-01 | MODEL_GAP | `variations/account-type.md` §2, §15 | Process 10(잔액증명서)을 "계좌 유형별 적용 차이를 직접 확인할 Source가 없다"며 명시적으로 제외했으나, E2E-10 상세 페이지에는 일반/안전/수탁 유형별 요청 절차 분기가 실제로 존재한다(`a-v1-source-coverage.md` SIC-04) | 자동화 시 Process 10을 계좌유형 무관 단일 흐름으로 오판할 위험 | https://app.notion.com/p/a7e0c50ba59d4122a783f0055f0c1fd1 | `n-05-10.md`에 유형 분기를 반입한 뒤 `account-type.md` §2·§15의 Process 10 제외 근거를 재평가 | Non-blocking |
| GAP-REG-02 | MODEL_GAP | `variations/institution.md` 처리 방식 Matrix (§6) | 퀵·이메일·팩스가 E2E-07/08/10 상세 페이지에 실제 문서화된 채널임에도 전부 "공식 Source 적용 조건 없음 — UNKNOWN"으로 기록 | 자동화 후보 설계 시 이미 존재하는 채널 옵션을 아예 없는 것으로 취급해 후속 Task(전달방식 안내 등) 자동 제안이 누락될 위험 | SIC-02, SIC-03, SIC-04 (`a-v1-source-coverage.md`) | Source Import 후, "채널 자체의 존재"와 "선택 기준"을 분리해 전자는 CONFIRMED, 후자는 UNKNOWN으로 재기록 | Non-blocking |
| GAP-REG-03 | MODEL_GAP | `sources/notion/n-05-02~10.md` 전체 | Source Extract가 원문의 구체 열거값(서류명·채널명·유형명)을 담지 않고 "해당 단계 결과 확인"이라는 동일 표현만 반복해, 이후 Process/Variation 작성 시 활용 가능한 근거가 구조적으로 얕아짐 | 향후 모든 Variation 축에서 반복적으로 "근거 없음" 오판을 유발할 수 있는 상위 원인 | SIC-09 (`a-v1-source-coverage.md`) | Source Extract 재작업 또는 보강 TAP 편성 검토 (Codex 소유 파일이므로 Claude가 직접 수정하지 않음) | Non-blocking |
| GAP-REG-04 | CASE_ONLY | `variations/gp-type.md`, `variations/account-type.md` 서류 세부 목록 | CASE-01(테일프론티어투자조합3호)에서 개인 GP 17종·법인 GP 20종·안전계좌 +2종의 구체 서류 수량과 목록이 확인됐으나, 단일 CASE이므로 공통 Rule로 승격할 근거가 아니다. 이 CASE는 반포역지점(NH농협) 한정 서류 세트일 가능성이 있다 | 자동화 체크리스트를 이 CASE 수치로 고정하면 다른 은행·지점에서 오작동 | https://app.notion.com/p/970b3cd687ac4e3a8e0285cf63aa9cb9 §5·§13 | 추가 CASE(다른 은행·지점·GP유형)로 검증 전까지 CASE_ONLY로 명시하고 Variation에 반영하지 않음 | Non-blocking |
| GAP-REG-05 | CASE_ONLY | `variations/institution.md` 지점별 Matrix (§5) | 재시연 파일럿에 반포역지점 보완서류 4종(예금계약서·전자금융서비스 추가서류·위임장 지점명 변경재날인·가상자산 서류 1부 추가)의 실제 목록과 요청채널(카카오톡/전화)·소요기간(3~5일)이 있으나 단일 CASE 기반 | 이 4종을 표준 체크리스트로 확정하면 다른 지점 적용 시 오류 | https://app.notion.com/p/855152f7f04b4ea49b29358465f44bf4 (반포역지점 보완 표) | CASE_ONLY로 유지, `conflicts/unresolved.md` GAP-05에 구체 서류명을 참고 정보로만 추가 | Non-blocking |
| GAP-REG-06 | CASE_ONLY | `variations/institution.md` 조합유형별 근거서류(신규 발견 축) | CASE-01의 "조합유형별 은행 제출 근거자료" 매핑(개투=결성계획승인공문, 벤투=KVCA 벤처투자조합 결성계획 단계 폐지 안내문, 신투=신기술사업금융업 등록통보, 민법=민법상조합 법적근거)은 문서 자체가 "표준 후보로 유지, 다음 사례에서 검증"이라고 명시 | `fund-type.md`가 이를 CONFIRMED로 승격하면 검증되지 않은 단일 사례를 전사 Rule화하는 위험 | https://app.notion.com/p/970b3cd687ac4e3a8e0285cf63aa9cb9 §6 | `fund-type.md`에 CASE_ONLY 근거로만 인용하고 TYPE-E 인터뷰로 확정 여부 확인 | Non-blocking |
| GAP-REG-07 | CASE_ONLY | 대리수령 요건 (institution.md §7, IV-10/IV-11) | 재시연 파일럿 TX-07 행에서 "대리수령 요건"이 미해결 Gap으로 기록되어 있고 실제 사례는 삼성세무서 방문 건 1건뿐 | 대리수령 자동 승인/거부 로직을 만들 근거가 없음이 재확인됨(기존 UNKNOWN과 일치) | https://app.notion.com/p/855152f7f04b4ea49b29358465f44bf4 (TX-07 행) | 기존 UNKNOWN 상태 유지, TYPE-E 인터뷰로 연결 | Non-blocking |
| GAP-REG-08 | 자동화 차단 Gap | `institution.md` 처리 방식 전반 | 퀵·이메일·팩스·방문의 "선택 기준"(언제 어떤 채널을 쓰는지)이 Notion 어디에도 확정된 형태로 없다 — E2E-00 자체가 "등기·퀵 선택 기준"을 8.5절에서 미해결 To-Be 항목으로 인정하고 있음 | 자동화 준비도: `NOT_READY_MISSING_RULE` — 채널 선택을 사람이 계속 판단해야 함 | https://app.notion.com/p/1bb46e50b0944f0991a306044a0337a0 (8.5 표준화·To-Be) | Variation을 CONFIRMED로 승격하지 않고 인터뷰로 선택 기준 확인 (interview-candidates.md E-03) | Non-blocking |
| GAP-REG-09 | 자동화 차단 Gap | `account-type.md` 안전계좌 Actor | 안전계좌가 "오픈플랫폼팀"이라는 별도 내부팀과 연계된다는 사실이 E2E-07에 있으나 `account-type.md`는 안전계좌 수행 주체를 전부 UNKNOWN으로 기록 — RACI에 반영된 Actor가 없어 자동 라우팅 불가 | 자동화 준비도: `NOT_READY_MISSING_RULE` | https://app.notion.com/p/9857501ab74749289733377c4983ea30 (인감증명서·계좌유형 절) | `account-type.md` Actor 차이에 오픈플랫폼팀을 PROVISIONAL 후보로 추가 후 인터뷰로 확정 | Non-blocking |

## Unsupported Model (TYPE-C)

검토한 `institution.md`, `account-type.md`, `gp-type.md`, `fund-type.md` 4개 초안에서 Source 범위를 넘어서는 확정(CONFIRMED) 표현을 발견하지 못했다. 모든 CONFIRMED 항목은 Repo Source ID(N-05-xx)와 직접 대응했으며, 미확정 항목은 일관되게 PROVISIONAL/UNKNOWN으로 표시돼 있었다. 이는 4개 Variation 문서 자체의 근거 규율이 양호하다는 뜻이며, 발견된 Gap은 대부분 "Source가 실제로는 더 있는데 Model이 아직 가져오지 못한" MODEL_GAP/SOURCE_IMPORT_CANDIDATE 쪽이다.

## CASE_ONLY 종합

| CASE 근거 | 관련 Variation | 일반화 금지 이유 |
|---|---|---|
| CASE-01 (테일프론티어투자조합3호, 민법상조합·개인GP·일반계좌·NH농협 반포역지점) | gp-type, account-type, institution, fund-type | 단일 조합·단일 지점·단일 GP유형의 기록이며, 문서 자체가 "다음 사례 비교 필드"를 별도로 두어 검증 전 단계임을 명시 |
| 세무서은행 업무 재시연 파일럿 (CASE-01의 재시연) | institution | CASE-01과 동일 사례를 다른 형식으로 재기록한 것으로, 독립적인 2번째 사례가 아니다 |

이 두 출처는 실질적으로 동일 사례(CASE-01)이므로, "복수 사례로 검증됨"이 아니라 "단일 사례가 두 문서에 나타남"으로 취급해야 한다.
