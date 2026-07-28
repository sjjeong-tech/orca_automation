# Plugin — VC 지원팀 행정업무 (Prototype)

검증된 E2E-03 고유번호증 신청 업무를 **다른 조합·다른 세션·다른 Interface에서 재사용**할 수 있게 만든 Repository 내부 Prototype이다. 외부 배포·설치 대상이 아니다.

## 실행

```
node plugins/vc-support-admin/tests/harness.test.mjs
```

기존 저장소 Runtime(zero-dependency Node ESM)만 사용한다. 신규 Framework·Package Manager를 도입하지 않는다.

## 구조

| 경로 | 역할 |
|---|---|
| `plugin.yaml` | Manifest — 권한·승인 대상·정책 |
| `skills.yaml` | Skill Registry (현재 E2E-03 1개) |
| `index.mjs` | Entry Point `processRequest()` + 순수 판정 로직 |
| `adapters/notion.yaml` | Logical Field ↔ Property Mapping·권한·검증 |
| `adapters/drive.yaml` | Evidence Source 계층·분류·유효성 규칙 |
| `adapters/slack.yaml` | 메시지 Contract·승인 발화 판정 (발송 비활성) |
| `prompts/` | intake · preview · result |
| `config.example.yaml` | 주입 Config 예시 (실제 ID 없음) |
| `tests/harness.test.mjs` | Unit·Approval·Case·Invariant·Interface·ID Scan·Registry |

Skill 본체는 `skills/e2e03-tax-id-application/`에 있다.

## 재사용 설계

- 실제 Database·Page·Drive ID는 **소스에 없다.** `runtime_config`와 `providers`로 주입한다(테스트가 ID Scan으로 강제).
- 데이터 접근은 전부 `providers.notion` / `providers.drive` 인터페이스를 통한다. 테스트는 fixture, 실제 실행은 MCP 연결 구현을 주입한다.
- Task 상태 계산은 순수 함수라 Interface(CLI·Slack·Agent 세션)와 무관하게 동일하다. 표현만 Adapter가 다르게 만든다.

## 안전 기본값

| 항목 | 기본값 |
|---|---|
| `write_mode` | `preview_only` |
| 운영 Record Write | 불가 |
| Schema·DB·View 생성 | 불가 |
| Drive Write | 불가 |
| Slack 발송 | 불가(Preview만) |
| Evidence 기반 자동 완료 | **불가 (6/6 사람 확인 필요)** |
| 모호한 승인 | Write 0 + 확인 질문 |
| 중복 Instance | 재사용·재개, 신규 생성 0 |

## 알려진 제약

- Task `관련 조합` Rollup은 API에서 관측되지 않는다 → Relation 체인으로 대체 확인
- Notion View DSL 필터가 `status` 타입에서 무시된다 → Agent는 View 필터에 의존하지 않고 직접 조회
- 기존 Request의 `관련 조합` 값에 대상 불일치 사례가 혼재 → 자동 정리하지 않음

## Canonical 참조

`skills/e2e03-tax-id-application/SKILL.md`, `reports/reviews/claude/e2e03-operational-standard-draft.md`
