# Claude Setup Check

## TAP 정보

- TAP ID: `A0-R`
- TAP 명칭: Claude Code Git 연결·Repo 인지·독립 Worktree 검증
- 업무지도상 위치: `CP-04 전체 Process 생성·QA 완료` → **Claude Reviewer 환경 준비** → Variation Model 사전설계

## Repo

- Repository: `sjjeong-tech/orca_automation`
- origin URL: `https://github.com/sjjeong-tech/orca_automation`
- Claude Worktree: `C:/Users/MIR-NOT-XXX-000/orca/workspaces/orca_automation/claude-review`
- Claude Branch: `agent/claude/setup`
- Base Commit: `74ff5f6d1412eba11cd5514b7cd4249cad4756f0` (= `origin/main`, `Create grounded process model wave 2`)

## Git Read Access

- `git fetch origin`: 성공
- `git rev-parse origin/main`: `74ff5f6d1412eba11cd5514b7cd4249cad4756f0`
- `git ls-remote origin HEAD`: `74ff5f6d1412eba11cd5514b7cd4249cad4756f0` — Read 접근 확인됨

## Repo 인지 결과

### 읽은 파일

- `README.md`, `AGENTS.md`, `tasks/tap-queue.md`
- `reports/process-wave-1-revision-qa.md`, `reports/process-wave-2-qa.md`, `reports/process-source-grounding-qa.md`, `reports/process-integration-qa.md`
- `processes/00-end-to-end.md`, `processes/03-unique-number-application.md`, `processes/07-account-opening.md`, `processes/11-result-handover.md`
- `sources/notion/n-05-00.md`, `sources/notion/n-05-01.md`, `sources/notion/n-05-07.md`, `sources/notion/n-06.md`, `sources/notion/n-08.md`

모두 지정 경로에 존재했으며 누락된 파일은 없었다.

### A. 프로젝트 목적

- 이 Repo는 미라파트너스 지원팀의 세무서·은행 행정업무를 AI Agent가 이해·지원·수행할 수 있도록 구조화하는 Process Model 저장소다.
- 단순 매뉴얼과의 차이: 사례 기록이나 절차 나열이 아니라, Atomic Task 단위로 Actor·Input·Output·완료조건·Decision·Exception·Interface를 명시하고 각 항목의 근거 상태(CONFIRMED/PROVISIONAL/UNKNOWN/CONFLICT/DRAFT)를 분리해 표준화·자동화 후보를 도출한다.
- AI Agent 설계를 위해 다음을 기록한다: Source 대비 Process 추적성(Atomic Source Coverage), RACI(Activity별 Accountable 1인), Decision 판단 주체·조건·분기, Exception 감지·복귀 Task, Process 간 Interface(확정/후보 구분), Automation Candidate와 Human-only Task.

### B. 현재 업무지도 단계별 상태

| 단계 | 상태 |
|---|---|
| Source 확보 | 완료 |
| Source Extract | 완료 |
| Source QA | 완료 — `PROCESS READY WITH GAPS` |
| Process Wave 1 | 완료 — QA `PASS 5/5` |
| Wave 1 Revision | 완료 — `PASS WITH NON-BLOCKING GAPS` |
| Process Wave 2 | 완료 — `PASS WITH NON-BLOCKING GAPS` |
| CP-04 (전체 Process 통합 QA) | 완료 — `PASS WITH NON-BLOCKING GAPS` |
| Variation Model | 예정 (TAP V1, 외부 검토 대기) |
| 최종 통합 QA | 예정 (TAP F1) |
| CASE·인터뷰 검증 | 예정 (TAP F2 범위 이후) |
| AI Agent 설계 | 예정 |

### C. 현재 Process 구조

- 전체 Process 수: **12개** (Wave 1: 00, 03, 04, 07, 08 / Wave 2: 01, 02, 05, 06, 09, 10, 11)
- Wave 1 Process: 00 전체 E2E, 03 고유번호증 신청, 04 보안카드·홈택스, 07 계좌개설, 08 계좌개설 보완
- Wave 2 Process: 01 명판·인감 제작, 02 우편·등기 발송, 05 고유번호증 정정, 06 폐업·청산, 09 계좌해지, 10 잔액증명서, 11 결과물 전달·후속 완수
- Process 11 상태: **`DRAFT`** — 독립 공식 Source 없음, 핵심 Coverage 항목 `0/7 = 0%`. Process 07/09/10의 완료·저장·전달 상태를 provenance 보존 방식으로 정규화만 하며 신규 업무·완료 판정을 만들지 않는다.
- 주요 UNKNOWN:
  - 제3자 수령요건 (Process 03)
  - 수탁계좌 판별 기준, 일반·안전계좌 판별값 (Process 07)
  - 구양식 판별 기준, 폴더 탐색 표준
  - 기관·지점별 제출 방식·서류 기준
  - Process 11 독립 Trigger·Actor, 실물 결과 전달·수신, 최종 종결 정의
  - 폐업·청산(06)과 계좌해지(09)의 선후관계
- 주요 Interface 상태 (전체 36개): CONFIRMED 3, PROVISIONAL 12, CANDIDATE(미승격) 3, UNKNOWN 18 — 확정 Interface는 07↔08 보완 Loop 등 소수에 한정되며, 07/09/10 → 11, 11 → 전체 종료는 모두 미승격 상태.

### D. 근거 상태 체계

- `CONFIRMED`: 공식 Notion Source가 직접 지원
- `PROVISIONAL`: 방향은 확인되나 세부 기준이나 복귀점이 Source에서 완전히 확정되지 않음
- `UNKNOWN`: 공식 Source에 근거 없음, 추정 금지
- `CONFLICT`: Source 간 상충 — 현재 차단 Conflict 없음
- `DRAFT`: Process 11 — 독립 Process로 완료 선언하지 않음

### E. Claude의 향후 역할

이번 TAP에서는 실제 Review를 수행하지 않았으며, 향후 역할로 다음을 확인했다: Source Reviewer, Adversarial Reviewer, Unsupported inference 탐지, Process-Source 대조, Variation 근거 검토, Interface·상태 분류 검토.

## 발견한 위험

- `reports/process-source-grounding-qa.md`에 기록된 "기존 기준선 리스크": 선행 Commit `4ffb419`의 Wave 1 문서에 Source보다 구체적인 Actor·완료 의미가 있을 가능성이 있으며, 최종 통합 QA 전 별도 재검토가 필요한 기존 리스크로 남아 있다. 이번 TAP에서 해소하지 않았다.
- Process 11은 독립 Source 없이 DRAFT 상태이므로 Variation·최종 통합 QA에서 완료 Process로 취급하면 안 된다.
- Wave 2 Interface 21개 중 확정은 없고 대부분 PROVISIONAL/UNKNOWN — Variation 설계 시 확정 Flow로 오용하지 않도록 주의가 필요하다.

## Process 파일 수정 여부

- 이번 TAP에서 `processes/`, `sources/`, `README.md`, `tasks/tap-queue.md` 등 기존 파일을 수정하지 않았다. 읽기만 수행했다.
- 신규 생성 파일은 이 보고서(`reports/claude-setup-check.md`) 하나뿐이다.
