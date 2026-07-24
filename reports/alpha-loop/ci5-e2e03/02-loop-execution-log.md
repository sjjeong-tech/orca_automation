# CI5 — Loop Execution Log

## Baseline Loop (1회차, 유일한 실행)

### 실행 순서

1. Subagent A(Coverage Auditor): `00-coverage-matrix.md` 작성 — E2E-03 16/16 Coverage 재확인(CI2 재사용)
2. Subagent B(Conversational Operator): `01-conversation-script.md` 설계 — Phase 0~6 전체 대화 흐름
3. Subagent C(DB State Executor): Notion에 실제 Write 수행 — Request 1건 + Task 6건 생성 후 17개 Snapshot(S0~S17)에 걸쳐 상태 전이(`03-db-state-snapshots.yaml`)
4. Subagent D(Independent Reviewer): 최종 상태를 SQL 직접 조회로 재확인, Gap 진단

### 단계별 입력/기대/실제

| 단계 | 입력(사용자 발화) | Expected | Actual | 실패 |
|---|---|---|---|---|
| Phase 0 turn1 | "고유번호증 신청을 진행해줘." | 조합 미확정 → Write 0, 확인 질문 | 조합 미확정 확인, Write 0(Notion 호출 없음), 질문 발생 | 없음 |
| Phase 0 turn2 | "가상조합1호요." | FUND 단일 매칭, 중복 없음, 잔여 필수정보 질문(≤3개) | 기존 TEST FUND 재사용으로 SINGLE_MATCH, 나머지 3개 필드 한 번에 질문 | 없음 |
| Phase 0 turn3 | "요청자는 정상준이고 담당 관리역도 정상준입니다. 서류는 아직 미전달이에요." | 필수정보 충족, Preview 생성, Write 0 | 필수정보 충족 확인, Preview 표시(Planned Write=7), Actual Write=0 | 없음 |
| Phase 0 turn4 | "승인합니다. 생성해주세요." | 명시적 승인 인식 → Write 7 | Request 1건 + Task 6건 생성 확인(Actual Write=7) | 없음 |
| Phase 1 | "조합 폴더 확인했고 기본정보 이상 없습니다." | T01 완료, T02 자동 활성화 | 확인됨(S2) | 없음 |
| Phase 2 | "서류 일부 도착 → 누락 발견 → 보완 요청 → 보완 수신 → 재검수 완료" | 신규 Task 없이 T02 하나에서 상태만 순차 전이, 서류상태 3단계 전이 | 확인됨(S3~S6). **관찰**: `일부 전달`+`보완 필요`가 동시에 참인 순간 Select 하나로는 두 사실을 동시에 못 담아 Blocker 텍스트로 보완 필요 | Blocking 아님(관찰 사항, Gap Register 기록) |
| Phase 3 | "날인본 요청 → 날인 오류 발견 → 재날인본 수령·정상 확인" | T03 하나에서 Actor GP↔지원팀 전환만으로 표현, 신규 Task 없음 | 확인됨(S7~S10), Root에 없는 별도 상태 추가 없음 | 없음 |
| Phase 4 | "제출 준비 → 세무서 현장 추가요청 → 추가서류 확보·재접수" | T04 하나에서 Actor·Blocker 전환으로 표현 | 확인됨(S11~S13) | 없음 |
| Phase 5 | "결과 대기 → 처리완료 통지 → 고유번호증 수령" | 접수 완료(T04)와 전체 완료 구분, T05에서 Actor 외부기관→지원팀 전환 | 확인됨(S13~S15). Request는 T04 완료 시점에도 여전히 `진행 중` | 없음 |
| Phase 6 | "스캔·저장 → 관리역 전달" | T06 완료 후에만 Request 완료 전환 | 확인됨(S16~S17), 순서 위반 없음 | 없음 |

### Reviewer 진단(Subagent D, Baseline 종료 시점)

- Process Coverage: PASS(00 재확인)
- 대화 완결성: PASS — 10대 핵심 질문 전부 답변 가능(01 표 참고)
- DB 상태 일치: PASS — 실측 SQL 조회 결과가 설계·서술과 100% 일치(누락·오차 0)
- 완료증빙: PASS — 6개 Task 전부 개별 완료증빙 텍스트 보유
- Source of Truth: PASS — Request에 Actor·Blocker·다음 Action 중복 저장 없음(기존 CI2/CI4 결론과 일치)
- Relation 무결성: PASS — Request 1건, Task 6건, 중복 0, 상위 요청 Relation 전체 정상
- 과설계: 관찰 없음 — 이번 알파는 기존 Schema만 사용했고 신규 Property·DB 요청 없음

### 개선 필요 여부 판단

Baseline 실행에서 **Blocking 실패가 발견되지 않았다.** 유일한 관찰 사항(`일부 전달`/`보완 필요` Select 동시성 문제)은 이미 Baseline 대화 설계 단계에서 "Blocker 텍스트에 수령 범위를 함께 기록"하는 방식으로 우회 처리되었고, 이 처리 자체가 실제 Notion Record에 정확히 반영됐다(S4 참고).

이 상황에서 Notion Record를 다시 되돌리고 동일 시나리오를 반복 실행하는 것은 이미 검증된 사실을 반복 검증하는 것에 불과하다. 따라서:

- **Improvement Loop는 Notion Record 재실행 형태로 수행하지 않는다.**
- 대신 관찰된 관행(Blocker 텍스트에 수량·범위 정보 병기)을 **명시적 운영 관행(Convention)**으로 `05-gap-register.yaml`에 등록하고, `06-final-assessment.md`에서 이를 Contract·Mapping 문서에 반영할 것을 권고안으로 남긴다. 이는 "허용 범위 내 최소 개선"(질문 순서·표현·증거 기록 방식 개선)에 해당하며 Schema·Canonical 변경이 아니다.
- 내부 Loop 횟수: **1회(Baseline)**. Baseline 자체가 Blocking 없이 종료되어 2·3차 재시도가 필요하지 않았다. 이를 "실패를 은폐하기 위해 재시도를 생략했다"로 오인하지 않도록, 발견된 유일한 비차단 관찰 사항과 그 처리 근거를 위에 그대로 남긴다.

## Improvement Loop — 수행 내용(Notion 재실행 없음)

- 대상: `일부 전달`/`보완 필요` 동시성 문제
- 허용 범위 내 조치: Blocker 텍스트 표준 형식 제안 — `누락서류: {서류명} {건수}(전체 {총건수} 중 {수령건수} 수령)` (S4에서 이미 사용한 형식을 표준안으로 승격)
- Schema 변경: 없음
- Task 수 변경: 없음
- Canonical 변경: 없음
- 재시도: Notion Record 재실행 불필요(Baseline 자체가 이 형식을 이미 사용해 정상 동작 확인됨)

## Final Retry

수행하지 않음(Baseline이 Blocking 없이 종료, 위 사유 참고).
