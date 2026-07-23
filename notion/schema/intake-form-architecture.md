# Intake Form Architecture

## 1차 Form — 조합 결성 예정 등록

| 항목 | 설계 |
|---|---|
| 원본 DB | 기존 `TO DO LIST (FUND)` |
| 적용 범위 | 실제 `결성(진행)` View용 Record |
| 작성자 | 원칙: 운영팀 관리역 / 예외: 지원팀 대리등록 |
| 목적 | 예정 건·조합 Record·내부 Page 생성, 2차 요청의 기준 Record 확보 |
| 필수 입력 목표 | 기존 Property 중심 5~8개 |
| 작성시간 목표 | 1분 이내 |
| 신규 Property | 0~3개 후보, 확정 금지 |
| 제외 | 상세 행정정보 |

### S1 결과

`DEFERRED_TECHNICAL_CONSTRAINT`. 실제 View와 Person·Relation Property 형식은 확인했으나, 기존 DB·Record 무변경 조건에서 Form 제출 Record가 `결성(진행)` Filter를 충족하는지 검증할 안전한 TEST FUND Record가 없었다. 기존 Form View도 존재하므로 신규 Form은 만들지 않았다.

## 2차 Form — 지원팀 행정업무 요청

| 항목 | 설계 |
|---|---|
| 원본 DB | 신규 `지원팀 업무요청 DB` |
| Trigger | 지원팀 착수에 필요한 확정정보와 서류가 준비된 시점 |
| 목적 | 요청 원문·확정정보·서류 위치를 저장하고 Task 생성 Input 제공 |
| 업무 유형 | 고유번호증 신청, 명판·인감, 보안카드·홈택스, 계좌개설, 계좌개설 보완 |
| 재사용 | 관련 조합 Relation과 기존 공통정보 |
| 유예 | 업무별 Toggle·조건부 입력은 P4에서 확정 |

### S1 결과

`지원팀 행정업무 요청` Form View를 생성했다. 다만 API를 통한 질문 노출 설정은 Title인 `요청명`만 유지되어 최소 입력 10개 Form으로는 완성되지 않았다. DB Record 직접 입력은 가능하며, Form 질문 구성은 Notion UI에서 확인하거나 CP-05-P4에서 확정한다.

## 경계

- 1차 Form은 조기 가시화와 기준 Record 생성용이다.
- 2차 Form은 실제 지원팀 착수 요청용이다.
- 1차 정보를 2차에서 재입력하지 않는다.
- S1에서는 최소 Form 또는 최소 Record 생성 구조만 검증하며 자동 Task 생성은 금지한다.
