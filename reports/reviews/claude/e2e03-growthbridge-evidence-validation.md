# E2E-03 Growthbridge Evidence Source Validation (WS3)

## 0. 개요

- Base main HEAD(변경 없음): `32d017ceee551f370a7f25dcf52e6a77c7d45b38`
- Branch: `agent/claude/e2e03-natural-language-contract` (선행 `8ae12d7` WS3 Discovery)
- ACTIVE_MODEL: OPUS
- 검증(2~11절) 단계 Notion·Drive Write: **0건**. 파일 본문 미열람(개인정보·고유번호·계좌정보 미기록)
- Phase H(13절)에서 사용자 승인(`WS3 Root 물리 구현 승인`) 후 FUND 마스터에 Property 1개 생성 + 그로스브릿지 Record 1건 저장 = Notion Write 수행(아래 13절 참고). Drive Write는 계속 0건
- 실제 사례: `그로스브릿지-바이오투자조합` (FUND 마스터 정확 1건, 조합구분 민법, GP 박성철)

## 1. 사용자 확정사항

- Fund Root: `1. 그로스브릿지-바이오투자조합 (…규약변경 필요)` — folder `1oMiFrP2oOhSsDbujWt5prnxA5SKeX1Rw`
- 확정 상위 구조: `1-7. 펀드지원본부 - 민법조합` → `49. 박성철`(GP) → Root
- 보안카드 기본 취합 위치: 공통 드라이브 `1-0. 펀드지원본부 - 공통 / 97. 부가세신고(보안카드 등)` (folder `14LsyIhe-Ge34NBsFshhbiWdYAEkHYRNK`)
- 외근 산출물 폴더는 Fund Root가 아니라 업무 처리 산출물(날짜별) 폴더

## 2. Fund Root 구조 (읽기 전용 확인)

```
[공유드라이브 루트](API 표시명 "Drive") > 49. 박성철(GP) > Root
Root(1oMiFrP2…)
├ 1. 결성
│  ├ 1. 고유번호증 신청   ← E2E-03 Canonical Source Folder (1ZX0Un80ya9h223NLpMDuitw7no37SomN)
│  ├ 2. 계좌개설
│  ├ 3. 결성총회
│  ├ 4. 후속업무 안내
│  └ 5. 출자증서
├ 2. 운영 (조합원총회/관리보수/투자/거래내역/운용지시서/재무현황/증빙)
├ 미라계약
├ …_규약.pdf / …_조합원명부(260713).xlsx / …_출자자 리스트_final.xlsx
├ …_통장사본.pdf / … 인감.PNG
└ 그로스브릿지-바이오투자조합_고유번호증.pdf   ← 발급본(07-07), Root 최상위 저장
```

Root 판정 근거: 조합명 정확 일치, GP 박성철은 FUND 마스터 GP 목록과 일치, 민법 유형 정합, 하위에 결성·운영 장기 구조 + 조합 기준자료 → 날짜/외근/업무 폴더가 아닌 조합 단위 장기 기준 폴더. 후보 정확 1건.

## 3. 괄호 메모 처리

- `canonical_name_candidate`: 그로스브릿지-바이오투자조합
- `display_name`: 1. 그로스브릿지-바이오투자조합 (27.03 정기총회 때 관리보수 지급시기 변경 규약변경 필요)
- `operational_note`: 27.03 정기총회 때 관리보수 지급시기 변경 규약변경 필요
- `note_validity_status`: [확인 필요]
- 처리 원칙: 메모는 조합명 Matching에 미포함, Task 상태 자동변경·자동 Request 생성 근거로 사용하지 않음, 현재 유효성 확인 전 Canonical Rule 미반영

## 4. Evidence Source 유형 분류

| 유형 | 위치 | 이번 사례 |
|---|---|---|
| Fund Root Folder | 조합 장기 기준 폴더 | Root(1oMiFrP2…) |
| E2E-03 Canonical Source | Root/1.결성/1.고유번호증 신청 | 신청서류·접수증·양식·보완서류 |
| Shared Functional Evidence | 공통/97.부가세신고(보안카드 등) | 보안카드 실물 PDF |
| Request Source (외근) | 외근 날짜폴더(1hanNA…) | 합본·접수증·발급본 사본 |
| Task Completion Evidence | Root 최상위 등 | 발급 고유번호증.pdf(07-07) |

## 5. 보안카드 Evidence 판정

- 공통 취합 폴더에 `그로스브릿지-바이오투자조합_보안카드.pdf` 실물 존재 → `PRIMARY_SHARED_EVIDENCE`
- 외근 `.lnk`(0708) → `UNVERIFIED_SHORTCUT`(실물의 바로가기로 판단, 증빙으로 미인정)
- Root 내 보안카드 복사본: 없음(→ 공통 취합 방식과 정합)
- 결론: 실물 확보됨. `.lnk`는 보조 흔적으로만 기록. (보안카드 파일 본문은 미열람)

## 6. P03-T01~T06 Replay (읽기 전용)

| Task | Expected | Actual(Evidence) | Evidence 위치 | Result | Blocker | 자동판단 | 사람확인 |
|---|---|---|---|---|---|---|---|
| T01 요청정보·착수조건 | FUND·조합명·유형·GP·근거 | FUND 1건, 규약(안)·사업계획서(안)·조합원명부·출자자리스트 | Root, FUND 마스터 | 완료 | 없음 | 조합명·유형·GP 식별 | 주소·신청필요성 |
| T02 제출서류 수령·누락 | 규약·근거·명세·주소·GP서류 | 규약(안)·사용인감계·임대인동의서 등; 인감증명서/임대차계약서는 0byte placeholder(.txt) | Canonical Source | 완료(보완 포함) | 초기 누락→보완 | 파일 존재·수량 | 인감증명서 실물 수령 [확인 필요] |
| T03 신청서류 작성·날인본 | 신청서·날인본·인감자료 | 고유번호증 신청서.hwp·사용인감계·합본 신청서류 PDF | Canonical Source | 완료 추정 | 없음 | 파일 존재 | **날인 여부(본문 미열람) [사람 확인]** |
| T04 세무서 제출·접수 | 합본·접수증·접수일 | 합본 신청서류 PDF + 접수증 PDF(07-02); **세무서 보완 제출용 규약·조합원 선임 동의서(07-03)** | Canonical Source | 완료(접수+보완대응, 동일 Task 내) | 보완요청→해소 | 접수증 존재·접수일 파싱 | 보완요청 내용 해석 |
| T05 결과물 수령 | 발급 고유번호증·최신본 | 발급본 Root 최상위(07-07) + 외근 사본(07-07) | Root 최상위, 외근 | 완료 | 없음 | 발급본 존재 | 두 파일 동일성 최종확인 |
| T06 스캔·저장·관리역 전달 | Root 저장·전달·보안카드 후속 | 발급본 Root 저장 완료; 보안카드 실물=공통폴더 | Root, 공통폴더 | 완료(저장 확인) | 없음 | 저장 위치 확인 | 관리역 전달 증빙 [확인 필요] |

- 접수일 후보: 2026-07-02 (접수증 파일 기준, 본문 미열람 — 파일 메타/명칭 기반)
- 파일이 외근·Root·공통에 중복 존재해도 운영상 복사본 허용 케이스로 기록(중복 오류 아님)

## 7. Notion 고유번호 Gap 판정

- FUND `그로스브릿지` 고유번호 = null이나 Drive에는 발급 고유번호증 존재
- 그러나 FUND 마스터 전체에서 고유번호 값 보유 81 / null·빈값 1150 (약 93% null)
- 판정: **`NOT_A_GAP_BY_PROPERTY_SCOPE`** — 고유번호 Property는 체계적으로 유지되는 Canonical 저장소가 아니며 null이 정상 다수. 발급 사실의 진짜 저장소는 Drive 결과물 파일
- 단, 조직이 향후 이 Property를 권위값으로 사용하기로 하면 backfill 후보가 될 수 있음 → 운영 정책 결정 대상([확인 필요]). 이번 TAP에서 값 입력·운영 Record 수정은 하지 않음

## 8. Physical Mapping Preview — Fund Root 저장

| 후보 | 평가 | 판정 |
|---|---|---|
| A. FUND 마스터(`전체관리조합`)에 `조합 Root 폴더` URL Property 추가 | 조합당 1 record=1회 저장, 장기 Source of Truth, 여러 Request 재사용, Agent 공통 접근, 추가형(원복=Property 삭제) | **권장** |
| B. FUND 트래커(`TO DO LIST (FUND)`)에 추가 | 트래커는 요청·업무 단위(조합당 1회 아님), 중복·불일치 위험 | 부적합 |
| C. Request `원본 폴더` 재사용 | Request별 업무 Source, Fund Root와 역할 혼합 | 부적합 |
| D. Schema 무변경 외부 Mapping | DB 명료성 저하, Slack·Codex 공통 접근·유지 부담 | Fallback |

- 권장 DB: `전체관리조합`(FUND 마스터) / Property명(제안): `조합 Root 폴더` / 유형: URL
- 의미: 조합 장기 기준 Drive 폴더(Request Source·외근 폴더와 구분)
- 입력·갱신 주체: 지원팀/관리역
- 그로스브릿지 저장 예정값: Root 폴더 URL(`1oMiFrP2…`)
- 기존 Property로 대체 불가 이유: `userDefined:URL`·`웹사이트`는 범용·미사용/의미 불명, Request `원본 폴더`는 요청 단위 Source
- 위험·원복: 1231행 마스터에 추가형 Property(기본 빈값, 기존값 영향 없음), 원복=Property 삭제

## 9. 공통 보안카드 Source Mapping 검토

- 보안카드 공통 폴더는 여러 조합 공통이므로 조합별 Root Property에 저장하지 않음
- 권장: Process/Evidence Contract(Agent 지침·Canonical 문서)에서 고정 Source 경로로 관리(별도 Notion Property 신설하지 않음)
- 최신본 판단: 공통 폴더 실물 우선, Root 복사본은 보조. 접근 실패 시 Blocker="보안카드 공통 폴더 접근 불가"
- 이번 단계에서 공통용 신규 Property 자동 제안하지 않음(기존 구조로 해결)

## 10. V-Model 결과

- Unit: 공유드라이브·GP·조합 Root Mapping OK / 괄호 메모 분리 OK / Root·Request Source·공통 Source 구분 OK / `.lnk` 제외 OK / 파일유형 판정 OK — PASS
- Integration: FUND→Root→고유번호 Evidence OK / 공통폴더→조합 보안카드 OK / 외근↔Root↔공통 정합 OK / Evidence→P03-T01~T06 매핑 OK / 복사본 충돌 없음 — PASS
- System: 그로스브릿지 P03-T01~T06 읽기 전용 Replay 완료(6절), 전 구간 Evidence 확인(날인 여부·전달 증빙 등 일부 사람 확인 항목 잔존) — PASS_WITH_OPEN_FILE_RULES
- Acceptance: **사용자 확인 대기** (Root 구조/메모 해석/보안카드 공통 Source/최신본/Task 판정/고유번호 null 판정)

## 11. Open Gap

1. 날인본 여부·관리역 전달 증빙은 파일 본문 미열람으로 자동 확정 불가 → 사람 확인
2. 인감증명서·임대차계약서가 0byte `.txt` placeholder → 실물 수령 여부 [확인 필요]
3. 공유드라이브 표시명 API 반환값이 "Drive"라 "민법조합" 직접 확정 불가(구조·GP·유형상 정합)
4. 고유번호 Property 권위성은 운영 정책 결정 대상
5. Fund Root Property 신설은 사용자 `WS3 Root 물리 구현 승인` 후에만 구현

## 13. Phase H 구현 결과 (사용자 승인 후)

사용자 승인 표현: `WS3 Root 물리 구현 승인`

| 단계 | 실행 | Expected | Actual | 결과 |
|---|---|---|---|---|
| Property 생성 | FUND 마스터(`전체관리조합`)에 `조합 Root 폴더`(URL) 1개 ADD COLUMN | Property 1개 추가, 기존값 무영향 | 스키마에 `조합 Root 폴더`(type url) 확인 | PASS |
| Record 저장 | 그로스브릿지 FUND Record(`39872a41…`) 1건에 Root URL 저장 | 해당 Record만 값 존재 | 값=Root URL 저장 확인 | PASS |
| 무영향 검증 | 신규 Property 비-null 레코드 수 재조회 | 정확히 1건 | 1건(그로스브릿지)만 | PASS |
| 금지사항 검증 | 고유번호·조합구분 등 미변경 재조회 | 고유번호=null, 조합구분=민법 유지 | 동일(미변경) | PASS |

- 저장값: `https://drive.google.com/drive/folders/1oMiFrP2oOhSsDbujWt5prnxA5SKeX1Rw`
- Notion Write 합계: Schema 1(Property 생성) + Record 1(값 저장) = 2
- Drive Write: 0 / 다른 FUND Record 변경: 0 / 고유번호 입력: 0 / Request·Task 변경: 0 / 공통 보안카드 Property 생성: 0
- 원복 방법: FUND 마스터에서 `조합 Root 폴더` Property 삭제(DROP COLUMN) 시 값도 함께 제거
- Acceptance(Root/메모/보안카드/최신본/T04/고유번호 판정 6개 문항): 사용자 확인 완료로 진행(본 구현은 그 확인 후 수행)

## 12. 조회 범위

인덱스 1회(그로스브릿지 0건, 스냅샷 이후 생성) + 폴더타입 검색 + parentId 기반 단계 조회(Root/1.결성/1.고유번호증 신청/2.운영/공통 보안카드 폴더). 광역·재귀검색 없음. 파일 본문 열람 0건.
