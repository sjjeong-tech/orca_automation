# 세무서·은행 행정업무 표준화·자동화

## 1. 프로젝트 목적

미라파트너스 지원팀의 세무서·은행 행정업무를 AI Agent가 이해·지원·수행할 수 있는 Process Model로 구조화하는 프로젝트입니다.

단순 사례 기록이나 매뉴얼 작성이 목적이 아닙니다. 현행 업무 이해를 시작으로 표준화, Gap 검증, 자동화 후보 도출, Tracker와 AI Agent 설계까지 이어지는 기반을 만듭니다.

## 2. 전체 업무지도

| 순서 | 단계 | 현재 상태 |
|---:|---|---|
| 1 | Notion Source 확보 | 완료 |
| 2 | Source Extract | 완료 |
| 3 | Source QA | 완료 — `PROCESS READY WITH GAPS` |
| 4 | Process Model | 진행 중 — Wave 1 완료 |
| 5 | Process QA | 진행 중 — Wave 1 QA 완료 |
| 6 | Variation Model | 예정 |
| 7 | E2E 통합 QA | 예정 |
| 8 | Gap 기반 CASE 검증 | 예정 |
| 9 | Tracker 설계 | 예정 |
| 10 | AI Agent 설계 | 예정 |
| 11 | 구현·테스트·배포 | 예정 |

## 3. 현재 진행상황

현재 위치는 **CP-03 Process Wave 1 QA 및 원격 배포 완료**입니다.

완료된 작업:

- Notion MCP 읽기 연결 검증
- [Source Structure Index](sources/notion/index.md) 확보
- 공식 Source 13개 Extract
- [Source 통합 QA](reports/source-extract-qa.md)
- Process Wave 1 생성 및 [QA 5/5 통과](reports/process-wave-1-qa.md)

Process Wave 1:

- [00 전체 E2E](processes/00-end-to-end.md)
- [03 고유번호증 신청](processes/03-unique-number-application.md)
- [04 보안카드·홈택스](processes/04-security-card-hometax.md)
- [07 계좌개설](processes/07-account-opening.md)
- [08 계좌개설 보완](processes/08-account-supplement.md)

다음 작업:

1. Process Wave 2 생성·QA
2. Variation Model
3. 최종 통합 QA
4. Gap 기반 CASE·인터뷰 검증

## 4. 현재 품질 상태

| 항목 | 판정 |
|---|---|
| Source | `PROCESS READY WITH GAPS` |
| Process Wave 1 | QA `PASS 5/5` |
| 차단 Conflict | 없음 |

주요 미확정 항목:

- 제3자 수령요건
- 수탁계좌 기준
- 구양식 판별
- 폴더 표준
- 기관·지점별 제출 방식
- 저장·실물 후속관리

확정되지 않은 사항은 `PROVISIONAL`, `UNKNOWN`, `CONFLICT` 상태로 유지하며 자동화 Rule로 사용하지 않습니다. 전체 목록은 [unresolved.md](conflicts/unresolved.md)에서 관리합니다.

## 5. 저장소 구조

| 경로 | 역할 | 현재 상태 |
|---|---|---|
| `sources/notion/` | 공식 Notion Source Index와 Source Extract | 생성됨 |
| `processes/` | Process Model | Wave 1 생성됨 |
| `variations/` | 조합·GP·계좌·기관 Variation | 예정 — 디렉터리 미생성 |
| `reports/` | Source·Process QA 보고서 | 생성됨 |
| `mappings/` | Source·Process 관계와 인터페이스 | 일부 생성됨 |
| `conflicts/` | 미해결 Gap·Conflict | 생성됨 |
| `cases/` | 비식별 CASE Evidence | 기존 사례 존재 |
| `tasks/` | Queue·오케스트레이션 정책·실행계획 | 생성됨 |
| `schemas/` | Tracker 등 관리 스키마 | 기존 초안 존재 |

`rules/`와 `docs/`는 기존 보조 자료 영역이며, 현재 Process Wave 완료 범위로 간주하지 않습니다.

## 6. 근거 사용 원칙

- Notion 공식 Source를 Process 구조의 기준으로 사용합니다.
- CASE는 Evidence로만 사용하며 공식 Source를 대체하지 않습니다.
- 단일 CASE만으로 공통 Rule을 확정하지 않습니다.
- 민감정보 실제 값, 원본 증빙, 인증정보를 Git에 저장하지 않습니다.
- 확인되지 않은 내용은 확정 표현으로 작성하지 않습니다.

## 7. 운영 방식

- Orca/Codex가 선행 Gate와 Checkpoint가 있는 TAP Queue를 실행합니다.
- Source Agent와 Process Agent는 지정된 파일을 단일 소유합니다.
- 각 Wave는 QA 통과 후 Commit·Push합니다.
- Checkpoint에서 외부 검토 후 다음 구간을 재개합니다.
- GitHub 원격 산출물과 Orca 실행 결과를 교차검증합니다.

## 8. 주요 산출물

현재 생성됨:

- [Notion Source Extract](sources/notion/)
- [Source QA](reports/source-extract-qa.md)
- [Process Wave 1](processes/)
- [Process Wave 1 QA](reports/process-wave-1-qa.md)
- [Source 관계맵](mappings/source-relationship-map.md)
- [미해결 Gap](conflicts/unresolved.md)

예정:

- Process Wave 2
- Variation Model
- E2E Interface Map
- Gap Analysis
- Tracker Schema 현행화
- Agent Architecture
