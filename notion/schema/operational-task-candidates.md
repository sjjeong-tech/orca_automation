# Pilot A Operational Task 후보

## 사용 원칙

아래 후보는 Fast Skeleton에서 구조와 사용성을 확인하기 위한 항목이며 P3의 확정 Task Template가 아니다. Process Atomic Task를 사람이 추적할 가치가 있는 단위로 집약했고, 신규 Process Rule을 만들지 않았다.

| Operational Task ID | Process | Operational Task 후보 | 관련 Atomic Task | 생성 조건 | 상태 |
|---|---|---|---|---|---|
| OT-INT-01 | INTAKE | 신규 행정업무 등록 | 해당 없음 | 업무 요청 유입 | CANDIDATE_FOR_SKELETON |
| OT-INT-02 | INTAKE | 기본정보·경로 확인 | 해당 없음 | 업무 Record 생성 | CANDIDATE_FOR_SKELETON |
| OT-INT-03 | INTAKE | 실물서류 수령 확인 | UN-01 | 실물 인계 대상 | CANDIDATE_FOR_SKELETON |
| OT-P03-01 | P03 | 고유번호증 신청서류 준비 | UN-02~08 | P03 착수 | CANDIDATE_FOR_SKELETON |
| OT-P03-02 | P03 | 서류 검수·날인 확인 | UN-02, UN-06~08 | 제출 전 | CANDIDATE_FOR_SKELETON |
| OT-P03-03 | P03 | 세무서 접수 | UN-09~11 | 제출 세트 준비 | CANDIDATE_FOR_SKELETON |
| OT-P03-04 | P03 | 세무서 보완 대응 | UN-10, UN-EX04 | 보완 발생 시 | CANDIDATE_FOR_SKELETON |
| OT-P03-05 | P03 | 고유번호증·보안카드 수령 | UN-13~15 | 처리완료 확인 후 | CANDIDATE_FOR_SKELETON |
| OT-P03-06 | P03 | 결과물 저장 | UN-12, UN-16 | 접수증·결과 수령 후 | CANDIDATE_FOR_SKELETON |
| OT-P04-01 | P04 | 홈택스 회원가입 | SC-05~08 | 가입 가능 상태 확인 후 | CANDIDATE_FOR_SKELETON |
| OT-P04-02 | P04 | 보안카드 생성 | SC-01~04 | 발급 필요 시 | CANDIDATE_FOR_SKELETON |
| OT-P04-03 | P04 | 결과 저장 | SC-09~11 | 가입·카드 처리 후 | CANDIDATE_FOR_SKELETON |
| OT-P07-01 | P07 | 계좌 유형·은행·지점 확인 | AO-03~04 | P07 착수 | CANDIDATE_FOR_SKELETON |
| OT-P07-02 | P07 | 계좌개설 서류 준비 | AO-01~07 | 유형 확인 후 | CANDIDATE_FOR_SKELETON |
| OT-P07-03 | P07 | 서류 검수·날인 확인 | AO-01, AO-07~08 | 은행 제출 전 | CANDIDATE_FOR_SKELETON |
| OT-P07-04 | P07 | 은행 전달 | AO-09~11 | 제출본 준비 후 | CANDIDATE_FOR_SKELETON |
| OT-P07-05 | P07 | 개설 결과 대기 | AO-12 | 은행 수신 후 | CANDIDATE_FOR_SKELETON |
| OT-P07-06 | P07 | 계좌개설 결과 수령 | AO-12~14 | 완료 회신 후 | CANDIDATE_FOR_SKELETON |
| OT-P08-01 | P08 | 은행 보완 요청 등록 | AS-01 | 보완 발생 시만 | CONDITIONAL_CANDIDATE |
| OT-P08-02 | P08 | 보완 원인 확인 | AS-02 | 보완 요청 등록 후 | CONDITIONAL_CANDIDATE |
| OT-P08-03 | P08 | 보완서류 준비 | AS-03~05 | 보완 경로 결정 후 | CONDITIONAL_CANDIDATE |
| OT-P08-04 | P08 | 보완서류 재전달 | AS-06~08 | 보완본 준비 후 | CONDITIONAL_CANDIDATE |
| OT-P08-05 | P08 | 보완 완료 확인 | AS-09 | 재전달 후 | CONDITIONAL_CANDIDATE |

## 지원팀 업무요청 검수 후보

| Operational Task ID | Process | Operational Task 후보 | 관련 Atomic Task | 생성 조건 | 상태 |
|---|---|---|---|---|---|
| OT-REQ-01 | INTAKE | 지원팀 요청 접수 | 해당 없음 | 2차 Form 제출 | REQUEST_REVIEW_CANDIDATE |
| OT-REQ-02 | INTAKE | 필수정보 검수 | 해당 없음 | 요청 접수 후 | REQUEST_REVIEW_CANDIDATE |
| OT-REQ-03 | INTAKE | 누락정보 보완 요청 | 해당 없음 | 누락 발견 시 | CONDITIONAL_REWORK_CANDIDATE |
| OT-REQ-04 | INTAKE | 요청 승인·착수 | 해당 없음 | 착수 가능 확인 후 | REQUEST_REVIEW_CANDIDATE |

## 후보 구분

- Intake Task: `OT-INT-*`
- 지원팀 업무요청 검수: `OT-REQ-*`
- Pilot A Process Task: `OT-P03-*`, `OT-P04-*`, `OT-P07-*`
- Conditional Rework Task: `OT-P08-*`, `OT-REQ-03`

총 후보는 27개다. S1에서는 6~9개만 TEST로 생성하며 전체 후보를 일괄 생성하지 않는다.

## 집약 원칙

- Actor, 완료조건, 예외 복귀점이 운영상 별도 추적돼야 하면 Task를 분리한다.
- 미세 작업은 `완료조건` 또는 체크리스트 후보로만 남긴다.
- P08 후보는 보완 요청이 실제 발생한 경우에만 생성한다.
- Process 11과 Pilot A 밖의 Process는 포함하지 않는다.
- P3에서 Atomic Task ID, 집약 근거, 사용자 추적 필요성, Agent 내부 재분해 여부와 증빙을 재검증한다.
