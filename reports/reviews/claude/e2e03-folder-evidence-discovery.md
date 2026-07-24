# E2E-03 Folder & Evidence Discovery (WS3-01 Phase B)

## 0. 개요

- Base main HEAD(변경 없음, Fetch로 재확인): `32d017ceee551f370a7f25dcf52e6a77c7d45b38`
- 선행 Commit: `fac2297`(WS2 Logical), `dd1cd3e`(WS2 Physical Mapping), `83e3d74`(WS2 Live Validation) — 수정·재작성하지 않음
- WS2 결과: `RESULT=PASS_WS2_PHYSICALIZED_EXISTING_SCHEMA` — Phase B 착수 조건 충족
- 대상 범위: WS2 Live Validation에 사용한 TEST 조합 `가상조합1호`(FUND page `3a772a41-d9d7-8101-b548-f4e5c021ca94`, FUND 마스터 page `3a772a41-d9d7-804e-9349-e39bbdd4985e`)
- Notion write: 0 / Schema 변경: 0 / Drive 파일 변경: 0 — Registered `WS3-01.forbidden_paths`("Notion write", "Schema change", "Drive file mutation") 전부 준수
- 산출물 경로: Workmap `WS3-01.allowed_paths = ["reports/**", "orchestration/runs/claude/**", "orchestration/handoffs/**"]`에 따라 `reports/reviews/claude/` 하위에 작성(TAP 인라인 제안 경로가 있었다면 이 등록값이 우선)

## 1. 기존 Property 검토

### 1-1. 원본 폴더(Request Property, URL)

- 소속: **Request 1건당 저장**(FUND 공용 아님) — `[TEST]지원팀 업무요청` data source(`454b6ef0-a514-45f3-93bf-edaef2ecaa74`)의 URL 타입 Property
- 전체 Request DB 실측 결과: `원본 폴더`가 비어있지 않은 레코드는 **정확히 1건**뿐이며, 그 값도 `https://example.invalid/TEST_PATH_ONLY`라는 Placeholder였다(레코드명 자체가 `[TEST][FT]...`). 즉 **운영 환경에서 실제 Drive 폴더 URL이 이 Property에 기록된 사례가 현재 0건**이다.
- 이번 TAP의 TEST Request(`3a772a41-d9d7-818e-b22d-c6e8d7c6717b`)도 `원본 폴더: ""`(빈 값) — 확인됨.

### 1-2. 조합폴더 관련 Property(FUND 레벨)

FUND를 나타내는 두 데이터소스를 모두 실제 Schema 조회로 확인했다.

| 데이터소스 | 폴더/Drive 전용 Property | URL 타입 Property | 비고 |
|---|---|---|---|
| `TO DO LIST (FUND)`(`14d72a41-d9d7-8137-8992-000b39730dd0`) | 없음 | `userDefined:URL`, `웹사이트` — 둘 다 범용 URL, 폴더 전용 의미 없음 | 조합별 업무요청 트래커, FUND 마스터 아님 |
| `전체관리조합`(`95b65749-ab4c-415f-b624-9fe34e06f121`, 실제 FUND 마스터) | **없음** | `userDefined:URL`(단일) | `가상조합1호` 레코드에서 `userDefined:URL`도 빈 값(`""`)으로 확인됨 |

**판단**: "조합폴더"를 조합당 1회만 저장하는 전용 Property는 FUND 마스터·트래커 어디에도 존재하지 않는다. 현재 유일한 폴더 연결 통로는 Request별 `원본 폴더`(1-1)뿐이며, 이마저 운영 데이터에 실사용된 사례가 없다. 따라서 "Request당 저장 vs 조합당 1회 저장" 질문에 대한 답은 **"조합당 1회 저장 체계 자체가 아직 없음 — 현재는 Request당 저장 구조만 존재하고, 그마저 비어있음"**이다.

## 2. 실제 조합폴더 조회 — 중단(BLOCKED)

### 2-1. Notion 경로로 Root 특정 시도

1절에서 확인한 대로 `가상조합1호`와 관련된 어떤 Notion Property에도 실제 Drive 폴더 링크가 없다(Request/FUND 마스터/FUND 트래커 전부 빈 값). Notion 경로만으로는 Root 폴더를 특정할 근거가 없다.

### 2-2. Google Drive 직접 검색 시도 및 관찰 결과

Root 특정 근거가 Notion에 없으므로, 최소 범위로 `title contains '가상조합1호'` 검색을 1회 실행해 실제 Drive에 해당 조합 폴더가 존재하는지만 확인했다.

- **결과**: `가상조합1호`(TEST용 가상 조합명)와 정확히 일치하는 폴더/파일은 0건. 대신 Google Drive의 `contains` 연산자가 어절 단위 토큰 매칭이라, 검색어의 부분 문자열("가상", "1호")이 포함된 **실제 운영 중인 무관한 조합 5건의 실제 세금 납부서·완납영수증 파일**이 결과에 노출됐다(사업자등록번호·주소·납부금액 등 포함).
- **판단**: `가상조합1호`는 실제 Drive에 대응 폴더가 없다 — 이는 예상된 결과다(픽션 TEST 조합이므로 당연히 Root가 없어야 정상). 이로써 **"조합 Root를 특정할 수 없음" 중단조건이 실제로 발생**했다.
- **추가 관찰(Nonblocking이 아닌 주의 필요 항목)**: 이번 1회 검색만으로도 무관한 실제 조합의 민감 서류(세무 정보)가 검색 결과에 노출되는 것을 확인했다. **이 결과는 본 보고서를 포함해 어떤 Git 파일·Notion Property에도 옮겨 적지 않았다**(조합명·금액·사업자번호 등 구체값 전부 미기록). 이번 TAP에서 검색은 여기서 중단했고 추가 키워드 검색·폴더 탐색은 진행하지 않았다.
- **향후 권고**: WS3 실사용 단계에서 실제 조합 Root를 찾을 때는 전체 Drive `fullText`/`title contains` 방식의 광역 키워드 검색이 아니라, FUND 마스터 레코드에 저장된 확정 `parentId`(폴더 ID) 기반 조회만 사용해야 한다. 현재는 그 `parentId`를 저장할 Property 자체가 없으므로(1-2), 이 Property 신설이 실사용 Root 특정의 선결 조건이다.

### 2-3. 사용자 지정 실제 사례 대체 여부

TAP은 "WS2 TEST에 사용한 조합 또는 사용자가 지정한 실제 사례 1건"을 허용했다. 실제 사례로 전환하려면 특정 GP·조합명을 새로 지정해야 하는데, 이는 이번 TAP이 사전 승인한 범위(`가상조합1호` TEST 케이스)를 벗어나며, 2-2에서 이미 실증됐듯 광역 검색은 무관 실사용 조합의 민감정보 노출 위험이 있다. 따라서 사용자의 명시적 조합 지정과 접근 범위 승인 없이는 실제 사례로 임의 대체하지 않는다.

## 3. Task별 Evidence Mapping — Logical Mapping만 수행(Physical Discovery 없이)

2절에서 Physical Folder Discovery가 중단됐으므로, 아래는 실제 폴더·파일을 찾지 못한 상태에서 "만약 폴더가 있다면 무엇을 찾아야 하는가"를 정의하는 **Logical Evidence Mapping**이다. 실제 파일 존재 여부는 검증되지 않았다.

| Task | 필요 파일(성격) | 검색 폴더(가정) | 최신본/날인본 판단기준(가정) | 완료증빙 후보 | 파일 없을 때 Blocker | Agent 자동판단 범위 | 사람 확인 범위 |
|---|---|---|---|---|---|---|---|
| P03-T01(요청정보·착수조건 확인) | 조합 결성 관련 기초서류(정관·조합원명부 등) | FUND Root/결성서류 | 파일명 날짜·버전 표기(가정, 미검증) | 서류 목록 확인 완료 메모 | "착수 서류 없음" | 목록 유무 확인만 | 서류 진위·완전성 |
| P03-T02(서류 준비·보완) | 고유번호증 신청서, 위임장, 대표자 신분증 사본 등 | FUND Root/세무서_1/고유번호증 | 날인 여부(육안), 최신 수정일 | 준비 완료 서류 목록 | "누락서류: {서류명}" 구조화 형식(WS2 실증) | 파일 존재·수량 확인 | 날인·서명 진위 |
| P03-T03(날인·제출 준비) | 대표 날인본 최종본 | FUND Root/세무서_1/고유번호증/날인본 | 날인 이미지 포함 여부 | 날인본 파일 링크 | "날인본 없음/스캔 누락" | 날인 이미지 유무 자동판단 불가 | 날인 실물 확인 필수(사람) |
| P03-T04(세무서 제출·추가요청 대응) | 세무서 접수증, 보완요청 공문(있는 경우) | FUND Root/세무서_1/고유번호증/접수 | 접수일자 기준 최신본 | 접수증 스캔본 | "접수증 없음" | 접수일자 파싱 | 추가요청 내용 해석 |
| P03-T05(고유번호증 수령) | 고유번호증 원본 스캔본 | FUND Root/세무서_1/고유번호증/수령 | 발급일자 기준 최신본 | 고유번호증 스캔본 | "수령 파일 없음" | 발급일자 파싱 | 고유번호 진위 확인 |
| P03-T06(완료 정리·공유) | 완료 보고 요약(선택) | FUND Root/세무서_1/고유번호증/완료 | 최종 정리본 여부 | 완료 정리 문서 링크 | 없음(선택 산출물) | 파일 유무만 | 배포 대상·시점 |

주의: 위 "검색 폴더" 열은 2절에서 확인된 바와 같이 **실제 존재가 검증되지 않은 가정 경로**다. FUND Root가 없으므로 하위 구조(`세무서_1/고유번호증/...`)도 추정치이며, 실제 조합 폴더 구조와 다를 수 있다.

## 4. 실제 Replay — 수행 불가(파일 증빙 기준)

파일 기반 Replay(현재 진행 가능 Task/확인된 파일/부족한 파일/완료증빙 후보)는 실제 폴더·파일이 없어 수행할 수 없다. Property 기반 상태(WS2 Live Validation에서 이미 검증한 Request/Task 상태 전이)만으로는 이 Phase가 요구하는 "실제 파일 조회 Preview"를 충족하지 못한다. 파일 증빙 없이 억지로 Replay를 구성하지 않았다.

## 5. 최종 판정

**RESULT=WS2_COMPLETED_WS3_DISCOVERY_BLOCKED**

- WS2: `PASS_WS2_PHYSICALIZED_EXISTING_SCHEMA`(선행 Commit 83e3d74, 변경 없음)
- WS3 Phase B: 중단조건 "조합 Root를 특정할 수 없음"이 `가상조합1호`에 대해 실제로 발생 — Logical Evidence Mapping(3절)까지만 완료, Physical Folder Discovery·실제 파일 조회 Preview는 근거 없이 진행하지 않음
- Notion Schema/Property 변경: 0(신규 Property 제안은 2-2 권고에 기재했을 뿐 이번 TAP에서 생성하지 않음)
- Drive 파일 변경: 0
- 부가 발견: Drive 전체 검색은 무관 실제 조합의 민감서류를 노출할 위험이 실증됨 — 향후 WS3 실사용 설계 시 `parentId` 기반 조회로 제한할 것을 권고(2-2)

## 6. 다음 Owner를 위한 남은 Gap

1. 조합당 1회 저장되는 "조합폴더 Root" Property가 FUND 마스터에 없음 — WS3 실사용 착수 전 선결 필요(Schema 변경 승인 대상, 이번 TAP 범위 아님)
2. 실제 사례 기반 검증은 사용자가 특정 GP·조합명을 지정하고 해당 조합 폴더에 대한 읽기 접근을 명시적으로 승인해야 진행 가능
3. Drive 광역 키워드 검색의 민감정보 노출 위험 — `parentId` 기반 조회로 제한하는 정책이 먼저 필요
