# Realigned Skeleton 테스트 방식

## 선택안

| 선택안 | 설명 | 위험 |
|---|---|---|
| A | 기존 TEST 결성 Template 또는 TEST Record 활용 | TEST 자산 존재·격리 여부 확인 필요 |
| B | 별도 `[TEST] 조합 결성 예정` Record 생성 | 기존 DB에 쓰기와 정리 필요 |
| C | 실제 Record를 Read-only 참조하고 요청·Task만 TEST 생성 | 실제 조합 문맥 노출과 오연결 위험 |

## 권장안

**A를 우선 권장**한다. 기존에 명시적으로 격리된 TEST Record가 있고 사용 승인을 받으면 기존 운영 Record를 오염시키지 않으면서 Relation과 Linked View를 검증할 수 있다.

A가 없거나 안전성이 확인되지 않으면 **B를 별도 승인 후 사용**한다. C는 실제 정보 사용 금지 원칙 때문에 권장하지 않는다.

## S1 적용

안전한 기존 TEST FUND Record를 확인하지 못해 기존 FUND DB에는 Record를 만들지 않았다. 요청–Task Relation만 실제 TEST 데이터로 검증하고 FUND Relation은 비워 두는 안전 대안을 적용했다.

- TEST 요청: [[TEST] 신규 행정업무 요청](https://app.notion.com/p/3a672a41d9d7816cb2bad4649f0b9538)
- TEST 요청 수: 1건
- TEST Task 수: 8건
- 요청자·담당 관리역·Task 담당자: Workspace Member 형식 저장 확인
- 실제 조합명·개인정보·계좌정보: 사용하지 않음
- `원본 폴더`: `TEST_PATH_ONLY`가 URL 형식이 아니므로 비워 두고 테스트 경로는 본문·비고에만 기록
- S1-R1 TEST 제출·신규 Record: 0건
- 기존 TEST 요청–Task 8건 Relation과 Person 저장 형식은 재검증했다.
- FUND Relation·Rollup 실제값은 `USER_TEST_REQUIRED`다.

## TEST 요청

| Property | 값 |
|---|---|
| 요청명 | `[TEST] 신규 행정업무 요청` |
| 관련 조합 | 비워 둠 — 실제 FUND Record 연결 금지 |
| 요청 업무 유형 | 고유번호증 신청 |
| 요청자·담당 관리역 | Workspace Member |
| 요청 상태 | 시작 전 |
| 원본 폴더 | 비워 둠 — URL Type 제약 |
| 실물서류 전달 여부 | False |
| 요청 내용 | Pilot A Relation·View 검증 |

## TEST Task 8건

| Task | Process | Operational Task ID | 초기 상태 |
|---|---|---|---|
| 지원팀 요청 접수 | INTAKE | OT-REQ-01 | 진행 중 |
| 필수정보 검수 | INTAKE | OT-REQ-02 | 예정 |
| 고유번호증 신청서류 준비 | P03 | OT-P03-01 | 예정 |
| 서류 검수·날인 확인 | P03 | OT-P03-02 | 시작 전 |
| 세무서 접수 | P03 | OT-P03-03 | 시작 전 |
| 고유번호증·보안카드 수령 | P03 | OT-P03-05 | 시작 전 |
| 홈택스 보안카드 생성 | P04 | OT-P04-02 | 시작 전 |
| 계좌개설 서류 준비 | P07 | OT-P07-02 | 시작 전 |

실제 조합명, 개인정보, 계좌정보와 인증정보를 사용하지 않는다.
