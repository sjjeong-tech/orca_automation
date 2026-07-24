# CP-05-P3 Gap Analysis

## Resolved after P3 run

1. **N-06 Relation·Rollup 실제값**: 올바른 `전체관리조합` Record 연결 후 GP명·조합구분·담당자·담당자(변경후) Rollup 표시를 사용자 화면에서 검증했다. `N-06=VERIFIED`, Build 선행조건 충족으로 처리한다.

## Build-blocking

1. **P2 상태의 실제 Notion 옵션 적용**: 현재 Skeleton 3상태와 승인 계약 7/6상태 차이.
2. **J-02**: P3·P4 승인과 Notion Build Work Order 필요. N-05·N-06·Relation/Rollup 조건은 충족됐다.

## 경로별 조건부 차단

| Gap | 영향 |
|---|---|
| 신기술투자조합 Trigger·근거자료 | 해당 유형 자동 Task 생성 금지 |
| 수탁계좌 정의·적용 기준 | 해당 계좌 경로 자동 선택 금지 |
| 채널 선택 기준 | 방문·퀵·이메일을 자동 선택하지 않음 |
| 대리·제3자 수령 요건 | UN-14에서 Human 확인 전 진행 금지 |
| 지점별 서류 차이 | CASE_ONLY를 공통 세트로 만들지 않음 |
| 공동 GP 상세 서류 | 분기는 존재하나 정확한 목록 미확정 |

## Non-blocking

- 1차 Form UI 질문·Required·Respondent 최종 구성
- 2차 Form 질문 구성
- 기존 Form UI 검증 오류의 플랫폼 일반화 여부
- 독립 CASE 부족과 인터뷰 V2 미착수

Open Conflict는 [P3 conflict log](../conflicts/p3-open-conflicts.md)의 6개다. P3에서 추정으로 닫은 항목은 없으며, P3 이후 실측으로 P3-C03만 해소했다.
