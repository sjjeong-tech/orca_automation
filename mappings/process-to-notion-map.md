# Process-to-Notion Mapping

## 범위와 집약

| Process | Atomic Task | Operational Task | Request 유형 |
|---|---:|---:|---|
| P01 명판·인감 | SS-01~11 (11) | OT-P01-01~03 (3) | 명판·인감 |
| P03 고유번호증 신청 | UN-01~16 (16) | **현행 `P03-T01~T06` (6)** / `OT-P03-01~05` (5, Legacy) — 아래 "P03 현행 Mapping" 참고 | 고유번호증 신청 |
| P04 보안카드·홈택스 | SC-01~11 (11) | OT-P04-01~04 (4) | 보안카드·홈택스 |
| P07 계좌개설 | AO-01~14 (14) | OT-P07-01~05 (5) | 계좌개설 |
| P08 계좌개설 보완 | AS-01~09 (9) | OT-P08-01~04 (4) | 계좌개설 보완 |
| 합계 | 61 | 21 | 5 |

Atomic Task는 AI가 실행을 이해하는 최소 행동이다. Notion Operational Task는 사람이 담당자·상태·기한·증빙을 추적할 가치가 있는 단위다. 따라서 61개 Atomic ID를 모두 보존하면서 21개 Operational Task로 집약한다. Process 원문을 Notion Task DB에 그대로 복제하지 않는다.

## 공통 Lifecycle

`1차 Form → FUND 조합 Record → 2차 요청 → RQ-NEW → RQ-REVIEW → RQ-READY → RQ-ACTIVE → 필수 Task·Evidence·전달·HA-08 → RQ-DONE`

누락은 `RQ-REWORK`, 실행 Task의 대기는 `TS-WAIT + Current Actor + Blocker + Next Action`, 수정은 `TS-REWORK`로 표현한다.

## Operational Task 집약표

| OT ID | Atomic 범위 | 추적 목적 | 최소 Evidence | Gate |
|---|---|---|---|---|
| OT-P01-01 | SS-01~03 | 제작 필요·사양 확정 | EV-SOURCE | HA-01 |
| OT-P01-02 | SS-04~08 | 시안·승인·발주 | EV-RESPONSE, EV-DELIVERY | HA-03 |
| OT-P01-03 | SS-09~11 | 수령·비용·전달 | EV-PHYSICAL, EV-DELIVERY | HA-07 |
| OT-P03-01 *(Legacy)* | UN-01~03 | 실물 인계·기본 검수 | EV-PHYSICAL, EV-SOURCE | HA-01 |
| OT-P03-02 *(Legacy)* | UN-04~07 | 유형·근거·구비 검수 | EV-SOURCE | HA-01~03 |
| OT-P03-03 *(Legacy)* | UN-08~09 | 제출 패키지·스캔 | EV-PACKAGE, EV-SCAN | HA-03 |
| OT-P03-04 *(Legacy)* | UN-10~12 | 세무서 접수·접수증 | EV-RECEIPT, EV-DELIVERY | HA-03/05/07 |
| OT-P03-05 *(Legacy)* | UN-13~16 | 처리대기·수령·인계 | EV-RESPONSE, EV-RESULT, EV-PHYSICAL | HA-05/07 |
| OT-P04-01 | SC-01~02 | 발급 판단·서류 준비 | EV-SOURCE, EV-PACKAGE | HA-01/03 |
| OT-P04-02 | SC-03~05 | 카드 접수·수령·보관 | EV-RECEIPT, EV-PHYSICAL | HA-03/07 |
| OT-P04-03 | SC-06~09 | 홈택스 가입·인증 | EV-COMPLETE | HA-07 |
| OT-P04-04 | SC-10~11 | 관리본·전달 준비 | EV-RESULT, EV-DELIVERY | HA-07 |
| OT-P07-01 | AO-01~04 | 실물·유형·서류범위 | EV-SOURCE, EV-PHYSICAL | HA-03~05 |
| OT-P07-02 | AO-05~08 | 신청서 작성·최종 검수 | EV-PACKAGE | HA-01/03/04 |
| OT-P07-03 | AO-09~10 | 스캔·합본 | EV-SCAN | HA-03 |
| OT-P07-04 | AO-11~12 | 은행 제출·심사 | EV-RECEIPT/RESPONSE | HA-05 |
| OT-P07-05 | AO-13~14 | 결과 저장·후속 처분 | EV-RESULT, EV-DELIVERY | HA-07/08 |
| OT-P08-01 | AS-01~02 | 보완 수신·경로 분류 | EV-RESPONSE | HA-05/06 |
| OT-P08-02 | AS-03~05 | 자체·관리역·GP 보완 | EV-PACKAGE/PHYSICAL | HA-06 |
| OT-P08-03 | AS-06~07 | 재전달·저장 | EV-DELIVERY, EV-SCAN | HA-05~07 |
| OT-P08-04 | AS-08~09 | 회수·심사 재개 인계 | EV-RESPONSE | HA-05 |

행 단위 전체 계약은 [machine-readable map](process-to-notion-map.yaml)이 Canonical P3 Mapping이다.

## P03 현행 Mapping (E2E-03)

E2E-03 고유번호증 신청의 **실행·상태관리 기준은 `P03-T01`~`P03-T06`(6개)** 로 통일한다(사용자 Process 결정, 2026-07-28). 위 집약표의 `OT-P03-01~05`는 Legacy Mapping으로 보존하며, 신규 실행 Instance 생성에 사용하지 않는다.

- 현행 Canonical 정의: [`contracts/process-execution-mapping.yaml`](../contracts/process-execution-mapping.yaml) (`status: CANONICAL_FOR_NEW_EXECUTION_INSTANCES`)
- 실행표준·SOP: [`reports/reviews/claude/e2e03-operational-standard-draft.md`](../reports/reviews/claude/e2e03-operational-standard-draft.md)

| 현행 OT ID | Atomic 범위 | 추적 목적 | 최소 Evidence | Gate |
|---|---|---|---|---|
| P03-T01 | UN-01, 03, 04 | 요청정보·착수조건 확인 | EV-PHYSICAL, EV-SOURCE | HA-01 |
| P03-T02 | UN-02, 05, 06, 07 | 제출서류 수령·누락 검수 | EV-SOURCE | HA-01~03 |
| P03-T03 | UN-02, 08 | 신청서류 작성·날인본 확인 | EV-PACKAGE | HA-03 |
| P03-T04 | UN-09, 10, 11, 12 | 세무서 제출 준비·접수 | EV-SCAN, EV-RECEIPT, EV-DELIVERY | HA-03/05/07 |
| P03-T05 | UN-13, 14, 15 | 결과물 수령 | EV-RESPONSE, EV-RESULT, EV-PHYSICAL | HA-05/07 |
| P03-T06 | UN-16 | 스캔·저장·관리역 전달 | EV-RESULT, EV-DELIVERY | HA-07 |

### Legacy ↔ 현행 Bridge

두 체계는 1:1 대응이 아니다. Atomic Step 경계가 **UN-02·UN-04·UN-09·UN-16 네 지점**에서 갈린다.

| Atomic | Legacy(5) | 현행(6) |
|---|---|---|
| UN-01 | OT-P03-01 | P03-T01 |
| **UN-02** | OT-P03-01 | **P03-T02 + P03-T03**(허용 중복) |
| UN-03 | OT-P03-01 | P03-T01 |
| **UN-04** | OT-P03-02 | **P03-T01** |
| UN-05·06·07 | OT-P03-02 | P03-T02 |
| UN-08 | OT-P03-03 | P03-T03 |
| **UN-09** | OT-P03-03 | **P03-T04** |
| UN-10·11·12 | OT-P03-04 | P03-T04 |
| UN-13·14·15 | OT-P03-05 | P03-T05 |
| **UN-16** | OT-P03-05 | **P03-T06** |

기존 TEST Record의 `Operational Task ID` 과거값(`OT-P03-*`, `CI1-P03-*`, `FT-P03-*`)은 **Historical 기록으로 보존하고 치환하지 않는다.**

또한 [`notion/schema/operational-task-candidates.md`](../notion/schema/operational-task-candidates.md)에는 이름·범위가 다른 **제3의 `OT-P03-01~06` 후보안**이 있으나, 해당 문서가 스스로 "P3의 확정 Task Template가 아니다"라고 선언하므로 현행 기준으로 사용하지 않는다. `[확인 필요]` — 폐기 여부는 GPT·사용자 결정.
