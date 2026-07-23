# Process Model Orchestration Plan

## 목적

공식 Notion Source를 추적 가능한 Source Extract로 변환한 뒤 QA Gate를 거쳐 Process Model, Variation, 통합 QA 순서로 진행한다.

## 실행 순서

1. Source Index와 Repo 실행환경을 확정한다.
2. N-05-03 Pilot Extract와 QA로 템플릿 적합성을 검증한다.
3. Source Wave A와 B를 추출하고 각각 QA한다.
4. Source 전체 통합 QA에서 충돌과 Gap을 분리한다.
5. Process Wave 1과 2를 생성하고 각각 QA한다.
6. Variation을 통합하고 QA한다.
7. 최종 통합 QA와 Gap 분석을 수행한다.

## Gate

- Source QA 전 Process 생성 금지
- Process QA 전 Variation 생성 금지
- 공식 Source와 CASE 자료 구분
- 미확정 내용은 `UNKNOWN`, `CONFLICT`, `[확인 필요]`로 유지
- 민감정보 실제 값 기록 금지
- QA 실패 시 후속 TAP 중단

## Checkpoint

| Checkpoint | 정지 TAP | 검토 대상 |
|---|---|---|
| CP-01 | TAP S2 | Pilot Source Extract와 QA |
| CP-02 | TAP S4-I | 전체 Source 통합 QA |
| CP-03 | TAP P1-QA | 핵심 Process Wave 1 |
| CP-04 | TAP P2-QA | 전체 Process 구조 |
| CP-05 | TAP V1-QA | Variation |
| CP-06 | TAP F1 | 최종 통합 QA와 Gap |

## 파일 소유권

- Extract TAP은 지정된 `sources/notion/*.md`만 작성한다.
- QA TAP은 지정된 `reports/`, `conflicts/`, `mappings/` 산출물을 작성한다.
- 동일 파일은 한 TAP에서만 최종 수정한다.
- Queue 상태 변경은 `tasks/tap-queue.md`에 기록한다.

## Stage 0 제한

이 단계에서는 실행계획, Source 매핑 계획, 빈 Extract 템플릿만 정의한다. 실제 Process 또는 Source Extract 데이터는 생성하지 않는다.
