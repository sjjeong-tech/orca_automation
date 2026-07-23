# Process Wave 2 QA

## 판정

`PASS WITH NON-BLOCKING GAPS`

Wave 2 Process 7개를 개별 검증했다. Process 01·02·05·06·09·10은 사용 가능한 Process Model이며, 독립 공식 Source가 없는 Process 11은 `DRAFT`로 유지한다.

## 개별 QA 결과

| Process | Atomic Task | CONFIRMED | PROVISIONAL | UNKNOWN | Decision | Exception | Interface | Atomic Source Coverage | 결과 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 01 명판·인감 제작 | 11 | 11 | 0 | 0 | 3 | 3 | 2 | 11/11 | PASS |
| 02 우편·등기 발송 | 10 | 10 | 0 | 0 | 5 | 5 | 3 | 10/10 | PASS |
| 05 고유번호증 정정 | 11 | 11 | 0 | 0 | 4 | 5 | 2 | 11/11 | PASS |
| 06 폐업·청산 | 10 | 7 | 3 | 0 | 5 | 6 | 3 | 10/10 | PASS WITH GAPS |
| 09 계좌해지 | 8 | 5 | 3 | 0 | 4 | 5 | 3 | 8/8 | PASS WITH GAPS |
| 10 잔액증명서 | 9 | 5 | 4 | 0 | 3 | 3 | 4 | 9/9 | PASS WITH GAPS |
| 11 결과물 전달·후속 완수 | 7 | 0 | 5 | 2 | 2 | 2 | 4 | 0/7 core items | DRAFT / NON-BLOCKING GAP |
| **합계** | **66** | **49** | **15** | **2** | **26** | **29** | **21** |  | **PASS WITH NON-BLOCKING GAPS** |

`Atomic Source Coverage`는 원 Source Atomic Task가 Process에 추적되는 비율이다. Process 11은 기존 Process의 상태를 정규화하는 Derived Process이므로, 공통 의미가 직접 확인된 핵심 항목 비율 `0/7`을 적용한다.

## 공통 검증

- [x] Source Coverage Summary 존재
- [x] 공식 Source ID와 Atomic Task 추적 가능
- [x] 관찰 가능한 최소 완료상태와 미확정 상세 분리
- [x] Activity 중심 5열 RACI와 Activity별 Accountable 1명
- [x] Decision 조건·판단주체 부족 시 `PROVISIONAL` 또는 `UNKNOWN`
- [x] Exception 복귀점 부족 시 `UNKNOWN`
- [x] 업무 완료와 후속 완수 분리
- [x] Candidate Interface 미승격
- [x] Automation Candidate에 Human Gate 명시
- [x] CASE 단독 Rule화 없음
- [x] 민감정보 실제 값 없음
- [x] Markdown 표와 Mermaid 기본 구조 검증

## 비차단 Gap

- Process별 Actor와 Accountable 배정의 공식 근거 부족
- 기관·지점별 기준, 첨부서류, 제출방식, 수수료와 처리기한
- Exception 감지조건과 정확한 복귀 Task
- 폐업·청산과 계좌해지의 선후관계
- Process 11의 공통 저장·전달·수신·최종 종료 정의
- Process 01·02 Mermaid의 일부 잠정 복귀 화살표

## 최종 결과

Wave 2의 신규 확정 Rule에는 Source 없는 내용을 남기지 않았다. Process 11은 완료 Process로 간주하지 않으며 Variation·최종 Gap 분석의 입력인 `DRAFT`로만 사용한다.
