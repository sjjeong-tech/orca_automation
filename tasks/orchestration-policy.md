# Process Model 오케스트레이션 Gate 정책

## 적용 범위

이 정책은 Notion Source 기반 Process Model 오케스트레이션의 모든 TAP과 Stage에 적용한다.

## Stage 실행 Gate

1. 각 TAP에서는 해당 TAP에 지정된 Stage만 수행한다.
2. 선행 Stage의 필수 산출물이 없으면 후속 Stage를 실행하지 않는다.
3. 후속 TAP은 Queue에 미리 등록할 수 있으나, 선행 Gate 확인 없이 실행하거나 다음 Stage를 자동 실행하지 않는다.
4. 각 TAP 완료 후 다음 TAP을 실행하지 않고 중단한다.
5. Source Extract의 QA가 완료되기 전에는 Process 문서를 생성하지 않는다.

## Conditional TAP Queue

### Queue 상태

각 TAP은 다음 상태 중 하나를 가진다.

- `QUEUED`: 명령이 등록됐으나 선행조건을 아직 평가하지 않음
- `READY`: 선행 TAP이 허용된 Gate를 통과해 실행 가능
- `RUNNING`: 현재 실행 중
- `WAITING`: 선행 TAP이 아직 완료되지 않아 Queue에서 대기
- `BLOCKED`: 선행 TAP 실패, 사용자 조치 필요 또는 필수 입력 누락으로 실행 중지
- `COMPLETED`: TAP 작업과 검증 완료
- `FAILED`: TAP 자체 실행 중 오류 발생

### 평가 및 실행 규칙

1. Queue Controller는 `tasks/tap-queue.md`의 순서대로 TAP을 평가한다.
2. 다음 TAP은 직전 TAP의 완료 블록을 확인한 후에만 `READY`로 전환한다.
3. 선행 Gate로 허용되는 판정은 `PASS`와 사전에 비차단으로 정의된 `PASS WITH ISSUES`이다.
4. 선행 판정이 `FAIL`, `USER ACTION REQUIRED`, `BLOCKED`, `PARTIAL`이거나 완료 블록이 없으면 후속 TAP을 실행하지 않는다.
5. 선행 TAP이 실행 중이면 후속 TAP은 `WAITING`으로 유지한다.
6. 동시에 실행 가능하다고 명시된 서브에이전트 작업만 병렬 실행한다.
7. 한 TAP이 `BLOCKED`되면 이후 TAP을 자동 실행하지 않는다.
8. 차단 해소 후 사용자가 `QUEUE RESUME`을 지시하면 중단 지점부터 Gate를 재평가한다.
9. 이미 `COMPLETED`된 TAP은 다시 실행하지 않는다.
10. 각 TAP은 후속 TAP을 직접 실행하지 않고 Queue Controller에 완료 결과만 반환한다.
11. Notion·Git 쓰기는 해당 TAP에 명시된 경우에만 수행한다.
12. 실패한 TAP을 우회해 후속 Stage로 넘어가지 않는다.
13. Queue 상태가 변경될 때만 `tasks/tap-queue.md`를 갱신한다.

### Commit 및 Push 의존성

1. Commit이 필요한 TAP은 Commit 존재, 메시지 일치, 변경 파일 범위 일치, clean 상태를 모두 확인해야 완료 Gate를 통과한다.
2. 선행 Commit이 없으면 Push TAP은 `WAITING` 또는 `BLOCKED`로 두고 실행하지 않는다.
3. Commit 생성 후 Push가 실패하면 Push TAP과 후속 Stage를 `BLOCKED`로 둔다.
4. Push 성공이 확인된 경우에만 의존하는 다음 TAP을 `READY`로 전환할 수 있다.

## Agent 파일 소유권

1. 서브에이전트 하나는 지정된 최종 Markdown 파일 하나만 소유한다.
2. 동일 파일을 복수 Agent가 동시에 수정하지 않는다.
3. Agent는 지정된 파일 외 다른 파일을 수정하지 않는다.

## Source 및 보안

1. Notion MCP는 읽기 전용으로 사용하며 Notion의 페이지, 데이터베이스, 항목 또는 댓글을 생성·수정·삭제하지 않는다.
2. 원문에 없는 내용은 추정하거나 확정 표현으로 작성하지 않는다.
3. 미확정 내용은 `[확인 필요]`, `PROVISIONAL`, `CONFLICT`, `UNKNOWN` 등 정의된 상태로 유지한다.
4. 인증정보, 계좌번호, 개인 식별정보 등 민감정보의 실제 값은 Repo에 기록하지 않는다.

## QA 및 Commit Gate

1. QA 결과가 `PASS`일 때만 Commit한다.
2. `PASS WITH ISSUES`는 자동 수정 가능한 문제를 수정한 뒤 재검증하며, 최종 `PASS` 전에는 Commit하지 않는다.
3. `FAIL`이면 Commit하지 않고 문제와 필요한 수정 사항을 보고한다.
4. Commit 직전에 다음 항목을 모두 검사한다.
   - `git diff --check` 통과 여부
   - 변경 파일이 지정된 범위와 일치하는지 여부
   - 민감정보 실제 값 포함 여부
   - 출처 없는 확정 표현 포함 여부
   - Markdown 제목·목록·표·코드 블록 구조의 정상 여부
5. Commit에는 해당 TAP에서 지정한 파일만 포함한다.

## Push 및 보고

1. Push는 별도 TAP에서 명시적으로 지시된 경우에만 수행한다.
2. 강제 Push는 명시적 승인 없이 수행하지 않는다.
3. 화면 보고는 10줄 이내로 제한한다.

## TAP Completion Reporting Standard

모든 TAP 결과의 마지막에는 다음 항목을 포함한 `TAP COMPLETION` 블록을 출력한다.

- TAP ID
- TAP 이름
- Queue 상태
- 실행 상태
- Gate 판정
- 선행 Gate 결과
- 수행한 작업
- 생성·수정 파일
- Commit 여부·hash·message
- Push 여부·결과
- 현재 병목
- Queue 일시정지 여부
- 다음 READY TAP
- WAITING TAP
- BLOCKED TAP
- git status

완료 블록 앞에는 다음 업무지도 위치를 함께 기록한다.

- 전체 단계
- Layer
- Stage
- 관련 Process
- 현재 TAP 역할
- 선행 TAP
- 후속 TAP

실행 상태에는 다음 값만 사용한다.

- `COMPLETED`
- `BLOCKED`
- `FAILED`
- `PARTIAL`

Gate 판정에는 다음 값만 사용한다.

- `PASS`
- `PASS WITH ISSUES`
- `FAIL`
- `NOT APPLICABLE`

완료 블록의 마지막 줄은 다음 형식을 사용한다.

```text
[TAP END] <TAP ID> | <판정> | QUEUE=<상태>
```

추가 보고 규칙은 다음과 같다.

1. TAP이 중단되더라도 완료 블록을 출력한다.
2. 다음 TAP을 자동 실행하지 않는다.
3. 병목은 직접 원인과 선행 원인을 구분해 기록한다.
4. 생성·수정한 파일이 없으면 `없음`으로 명시한다.
