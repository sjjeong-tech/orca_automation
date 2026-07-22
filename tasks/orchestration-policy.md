# Process Model 오케스트레이션 Gate 정책

## 적용 범위

이 정책은 Notion Source 기반 Process Model 오케스트레이션의 모든 TAP과 Stage에 적용한다.

## Stage 실행 Gate

1. 각 TAP에서는 해당 TAP에 지정된 Stage만 수행한다.
2. 선행 Stage의 필수 산출물이 없으면 후속 Stage를 실행하지 않는다.
3. TAP을 연속 예약하거나 다음 Stage를 자동 실행하지 않는다.
4. 각 TAP 완료 후 다음 TAP을 실행하지 않고 중단한다.
5. Source Extract의 QA가 완료되기 전에는 Process 문서를 생성하지 않는다.

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
- 실행 상태
- Gate 판정
- 수행한 작업
- 생성·수정 파일
- Commit 여부·hash·message
- Push 여부·결과
- 현재 병목
- 다음 실행 가능 TAP
- 다음 실행 금지 TAP
- git status

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
[TAP END] <TAP ID> | <PASS/FAIL/BLOCKED>
```

추가 보고 규칙은 다음과 같다.

1. TAP이 중단되더라도 완료 블록을 출력한다.
2. 다음 TAP을 자동 실행하지 않는다.
3. 병목은 직접 원인과 선행 원인을 구분해 기록한다.
4. 생성·수정한 파일이 없으면 `없음`으로 명시한다.
