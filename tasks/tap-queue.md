# Conditional TAP Queue

Queue Controller는 아래 표를 순서대로 평가한다. 상태가 변경될 때만 이 파일을 갱신하며, 선행 Gate를 통과하지 않은 TAP은 실행하지 않는다.

| 순서 | TAP ID | TAP 이름 | 업무지도 위치 | 선행 TAP | 필수 Gate | 상태 | Commit 요구 | Push 요구 | 병목 | 다음 조치 |
|---:|---|---|---|---|---|---|---|---|---|---|
| 1 | TAP Q-00 | Conditional TAP Queue 정책 설정 | 오케스트레이션 제어 계층 / 공통 Queue Gate 설정 | TAP 3-B2-FIX | PASS 또는 비차단 PASS WITH ISSUES | COMPLETED | 예 | 아니요 | 없음 | 사용자 후속 TAP 입력 대기 |

## 상태 전이 기준

`QUEUED` → Gate 평가 → `READY` → `RUNNING` → `COMPLETED`

- 선행 TAP 미완료: `WAITING`
- 선행 Gate 실패 또는 필수 입력 누락: `BLOCKED`
- TAP 자체 실행 오류: `FAILED`
- 차단 해소: 사용자 `QUEUE RESUME` 후 중단 지점부터 재평가
