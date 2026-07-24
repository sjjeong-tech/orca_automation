# Human Approval & Decision Model

## Human Approval 지점

| Approval ID | 대상 Process | 발생 시점 | 요청 Actor | 승인 Actor | 승인 Input | 승인 기준 | 승인 결과 | 반려 시 복귀 | 증빙 | Agent 가능 범위 | Human-only |
|---|---|---|---|---|---|---|---|---|---|---|---|
| HA-01 | 전체 | 요청 검수 | 지원팀 | 담당 관리역 | 조합명·주소·GP 기본정보 | Source·요청 원문과 일치 | 기본정보 승인 | RQ-REWORK | 승인자·일시·확인값 | 누락 탐지·대조 제안 | 최종 사실 확인 |
| HA-02 | 전체 | 착수 전 | 지원팀 | 담당 관리역 또는 지원팀 승인자 | 필수 Input·원본 경로 | Task 생성에 충분 | RQ-READY 승인 | RQ-REWORK | 검수 결과 | 체크리스트 제안 | 착수 승인 |
| HA-03 | P01·P03·P07 | 제출 전 | 지원팀 | 지원팀 검수자·필요 시 관리역 | 서류·유효기간·날인·수량 | Process 완료관찰 충족 | 제출 허용 | TS-REWORK | 검수표·EV-PACKAGE | 누락·불일치 탐지 | 날인·실물 최종 검수 |
| HA-04 | P07 | 유형 결정 | 지원팀 | 담당 관리역 | 일반·안전·수탁 후보와 근거 | 확인된 Source 범위·UNKNOWN 표시 | 계좌 유형 승인 | TS-WAIT 또는 TS-REWORK | 유형 판단 기록 | 근거 검색·후보 제안 | 미확정 유형 판단 |
| HA-05 | P03·P07·P08 | 기관 추가 요청 발생 | 지원팀 | 담당 관리역 | 기관 요구사항·기존 제출본 | 대응 필요성과 범위 확인 | 대응 경로 승인 | TS-WAIT | EV-RESPONSE | 과거 사례 검색·차이 제시 | 예외 수용 결정 |
| HA-06 | P08 | 보완 경로 결정 | 지원팀 | 담당 관리역 | 보완 원인·자체수정·GP재요청 후보 | 책임 주체와 수정 범위 확인 | 보완안 승인 | TS-REWORK 유지 | 보완 판단 기록 | 분류·체크리스트 제안 | GP 재요청·예외 승인 |
| HA-07 | 전체 | 결과 전달 전 | 지원팀 | 지원팀 검수자·필요 시 관리역 | 결과물·저장 경로·전달 대상 | 열람·정합·민감정보 취급 확인 | 전달 허용 | TS-REWORK | EV-RESULT·EV-SCAN | 파일 존재·명명 검사 | 내용·수신자 최종 확인 |
| HA-08 | 전체 요청 | 요청 완료 전 | 지원팀 | 요청자 또는 담당 관리역 | 필수 Task·Evidence·전달 기록 | RC-01~06 충족 | RQ-DONE | RQ-ACTIVE 또는 RQ-REWORK | EV-COMPLETE | Gate 충족 여부 제안 | 최종 완료 승인 |

## Decision Point

| Decision ID | 질문 | Input | 선택지 | 판단 Rule | 불명확 시 확인 Actor | Output | 다음 Process·상태 | Evidence | 자동화 가능성 |
|---|---|---|---|---|---|---|---|---|---|
| DP-01 | 조합 유형은 무엇인가 | 조합 근거자료 | 개인·벤처·신기술·민법·UNKNOWN | 공식 Source에 직접 지지되는 값만 사용 | 담당 관리역 | fund_type | 유형별 준비 경로 | 판단 근거 | 후보 제안만 |
| DP-02 | 공동 GP인가 | 조합·GP 자료 | 예·아니오·UNKNOWN | 공식 자료의 공동 GP 명시 | 담당 관리역 | joint_gp | 서류 검수 | 판단 근거 | 후보 제안만 |
| DP-03 | 대표자 유형은 무엇인가 | 대표자·GP 자료 | 개인·법인·UNKNOWN | Source 확인값 | 담당 관리역 | representative_type | 서류 경로 | 판단 근거 | 후보 제안만 |
| DP-04 | 계좌 유형은 무엇인가 | 계좌 목적·기관 안내 | 일반·안전·UNKNOWN | 수탁은 별도 UNKNOWN 유지 | 담당 관리역 | account_type | P07 | HA-04 기록 | Human 필수 |
| DP-05 | 수탁 대상인가 | 수탁 관련 공식 근거 | 예·아니오·UNKNOWN | 기준 미확정이면 UNKNOWN | 담당 관리역 | custody_flag | P07 또는 Gap | 판단 근거 | 자동화 금지 |
| DP-06 | 긴급 요청인가 | 목표일·법정/기관 일정 | 일반·긴급 | 승인된 긴급 기준 필요 | 담당 관리역 | priority | 일정 조정 | 승인 기록 | 제안 가능 |
| DP-07 | 기존 조합 Record가 있는가 | FUND 검색 결과 | 있음·없음 | 정확히 식별 가능한 Relation 존재 | 운영팀 | related_fund | 연결 또는 임시명 | Relation 기록 | 검색 가능 |
| DP-08 | 서류 보완이 필요한가 | 검수 결과·기관 회신 | 필요·불필요 | 누락·불일치·기관 요구 존재 | 지원팀·관리역 | rework_required | TS-REWORK/P08 | 검수·회신 | 탐지 제안 |
| DP-09 | 기관 예외 요청인가 | 기존 Rule·기관 요구 | 표준·예외·UNKNOWN | 공통 Rule과 다른 요구가 명시됨 | 담당 관리역 | exception_type | HA-05 | EV-RESPONSE | 비교 제안 |
| DP-10 | 결과물 재발급이 필요한가 | 결과 오류·분실·기관 안내 | 필요·불필요 | 재발급 사유와 승인 존재 | 담당 관리역 | reissue_required | 새 요청 또는 Rework | 승인·사유 | 제안만 |

## 통제 원칙

- `UNKNOWN` 판단을 Agent가 임의 확정하지 않는다.
- Human Approval은 승인자, 시각, Input, 결과, 반려 사유를 남긴다.
- 외부 제출·발송, 실물 날인·수령, 민감정보 접근, 예외 승인과 최종 완료는 Human-only다.
- 승인 UI와 알림 방식은 P4/CP-07 범위이며 이번 TAP에서는 구현하지 않는다.
