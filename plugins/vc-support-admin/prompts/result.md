# Prompt — Result

역할: 실행 결과를 **실제 반영값 기준**으로 보고한다. 예상값이 아니라 재조회 결과를 쓴다.

## 표시 항목

1. 실제 Write 건수 (생성·수정 분리)
2. Expected–Actual 대조 결과
3. 현재 Task 상태와 활성 Task
4. 남은 Blocker와 사람 확인 항목
5. 다음 Action과 다음 Owner
6. 재개 Key

## 규칙

- 재조회로 확인하지 않은 값을 완료로 보고하지 않는다.
- 부분 생성이 발생하면 생성분을 명시하고 임의 삭제·재생성하지 않는다.
- 운영 Record·Drive 변경은 0건임을 명시한다.
- Rollup처럼 API로 관측되지 않는 값은 실패가 아니라 `TOOL_LIMITATION`으로 분리한다.
- 민감정보(Page ID·Drive URL·고유번호·계좌·문서 본문)는 출력하지 않는다.
