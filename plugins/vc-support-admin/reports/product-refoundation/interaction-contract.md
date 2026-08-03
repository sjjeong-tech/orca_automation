# Interaction Contract

기존 Contract를 폐기하지 않는다. 화면 분리에 맞춰 **어느 단계가 어느 화면에서 일어나는지**를 고정한다.

## 기본 흐름과 화면 귀속

| 단계 | 화면 | Write |
|---|---|---|
| 자연어 요청 | A | 0 |
| 정보 추출 | A | 0 |
| 누락·모호성 확인 | A (확인 질문) | 0 |
| 대상·중복 확인 | B | 0 |
| Preview | B | 0 |
| 명시적 승인 | B | 0 |
| Commit | C | 승인 후에만 |
| 재조회 | C | 0 |
| Expected–Actual | C | 0 |
| 상태 안내 | A로 복귀 | 0 |

**Preview 전 Write는 0건이다.** 화면 A·B에서는 어떤 경로로도 Write에 도달할 수 없다.

## Canonical Stage와 화면 표시의 분리

Canonical Stage 9개는 내부 값이다. 사용자 표면에는 한국어 Label을 쓴다.

| Canonical | 사용자 표시 | 노출 화면 |
|---|---|---|
| RECEIVED | 요청 접수 | A Timeline |
| INFORMATION_CHECK | 정보 확인 | A Timeline |
| EVIDENCE_REVIEW | 자료 검토 | A Timeline |
| HUMAN_CONFIRMATION | 사람 확인 | A 상단 + Timeline |
| EXTERNAL_WAIT | 외부 대기 | A 상단 + Timeline |
| RESULT_REVIEW | 결과 검토 | A Timeline |
| NEXT_PROCESS | 다음 업무 | A Timeline |
| COMPLETION_CANDIDATE | **완료 후보** | A 상단 |
| BLOCKED | 중단 | A 상단 + Timeline |

원칙:

- Canonical 값을 **삭제하지 않는다.** 화면 D에서 항상 확인 가능
- Notion `진행 중`은 Canonical Stage가 아니다. UI 보조 상태로만 표기
- **완료 후보 ≠ 완료.** 화면 A는 "완료"라는 단어를 완료 후보 상태에 쓰지 않는다

## 상태 전이 시 UI 계약

| 이벤트 | 필수 동작 | 회귀 이력 |
|---|---|---|
| Request 선택 변경 | `selectedRequestId` 단일 갱신 | v0.3 결함 |
| Request 선택 변경 | **승인 상태 초기화** | v0.3 결함 |
| 빠른 연속 선택 | sequence guard로 마지막 선택 유지 | v0.3 결함 |
| Inbox 클릭 | Event Delegation (독립 HTML 포함) | v0.3 결함 |
| 화면 A↔B↔C 이동 | 선택된 Request 유지 | 신규 |
| 기술 상세 Drawer | 기본 접힘, 열림 상태는 화면 이동 시 초기화 | 신규 |

**위 4개 회귀는 `494e9e08`에서 수정됐다. 새 구현에서 재발시키지 않는다.**

## 비활성 요소 계약

버튼·링크가 비활성일 때 **이유를 즉시 인접 표시한다.**

```
[반영 검토로 →]   ← 비활성
 ↳ 확인 필요 2건: 조합 연결 대상 없음 / 중복 방지 기준 미확정
```

색상만으로 상태를 전달하지 않는다. 텍스트 Label을 함께 둔다.

## Evidence 표시 계약 (신규)

질문 6("어떤 Evidence가 부족한가")은 지금까지 검증되지 않았다. 계약을 명시한다.

| Evidence 판정 | 표시 | 부족 시 추가 표시 |
|---|---|---|
| VALID | 확인됨 | — |
| MISSING | 없음 | **무엇이 / 누가 가져와야 하는지** |
| NEEDS_HUMAN | 사람 확인 필요 | 확인 질문 원문 |
| 불인정 | 인정 안 됨 | 사유 |

Legacy 값(`STAMPED_DOCUMENT` 등)은 Compatibility Metadata에서만 유지하고 화면에 쓰지 않는다.

## 중복 Replay 계약 (신규)

질문 10도 미검증이다. 화면 C에서 다음을 표시한다.

- 같은 Transaction ID로 재실행했을 때 신규 생성 건수
- 기대값: **0**
- 0이 아니면 화면 C 상단에 경고

전용 `Transaction ID` Property가 양쪽 DB에 생겼으므로 이제 프록시 없이 직접 조회 가능하다.
