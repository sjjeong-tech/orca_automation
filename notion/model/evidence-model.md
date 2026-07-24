# Evidence Model

## 원칙

- 실제 파일은 Google Drive 등 승인된 저장 위치에 두고 Notion과 Git에는 경로·비민감 메타데이터만 기록한다.
- Evidence는 완료조건을 관찰 가능하게 입증해야 한다.
- Pilot A에서는 별도 Evidence DB를 만들지 않는다.
- Task `완료증빙` Text에는 `Evidence ID | 유형 | 승인된 경로 | 확인자 | 확인일`을 기록한다.

## Evidence Type

| Evidence ID | 한글명 | 생성 Actor | 생성 시점 | 저장 위치 | 필수 여부 | 관련 Process·Task | 완료조건 관계 | 민감정보 가능성 | Agent 접근 | Human 확인 |
|---|---|---|---|---|---|---|---|---|---|---|
| EV-SOURCE | 원본 폴더 | 운영팀·관리역 | 요청 전·접수 | Drive 경로 | 요청 착수 시 필수 | 전체 Pilot A | Input 존재 입증 | 높음 | 승인된 메타데이터만 | 필수 |
| EV-PACKAGE | 제출본 | 지원팀 | 기관 제출 전 | Drive | 제출 Task 필수 | P03 UN-08~11, P07 AO-07~11, P08 AS-06 | 제출 세트 생성 입증 | 높음 | 제한적 | 필수 |
| EV-RECEIPT | 접수증 | 지원팀·기관 | 기관 접수 | Drive | 기관 접수 시 필수 | P03 UN-11~12, P07 AO-11 | 접수 완료 입증 | 높음 | 제한적 | 필수 |
| EV-RESPONSE | 기관 회신 | 외부기관·지원팀 | 심사·보완·완료 회신 | Drive 또는 승인된 기록 | 조건부 필수 | P03 UN-13, P07 AO-12, P08 AS-01·09 | 다음 상태 판단 근거 | 높음 | 제한적 | 필수 |
| EV-RESULT | 결과물 | 외부기관·지원팀 | 업무 결과 수령 | Drive | 결과 Task 필수 | P03 UN-15~16, P04 결과 저장, P07 AO-12~13 | 결과 생성 입증 | 높음 | 제한적 | 필수 |
| EV-SCAN | 스캔본 | 지원팀 | 제출 전·결과 수령 후 | Drive | Process별 조건부 | P03 UN-09·16, P07 AO-09~10, P08 AS-07 | 원본·제출본 보존 입증 | 높음 | 제한적 | 필수 |
| EV-DELIVERY | 전달 완료 기록 | 지원팀·수신자 | 결과 공유·인계 | Notion 메타데이터 + Drive | 전달 Task 필수 | P03 UN-12·15~16, P04 결과 저장, P07 AO-13 | 수신 확인 입증 | 중간 | 가능 | 필수 |
| EV-PHYSICAL | 실물 수령 기록 | 지원팀·관리역 | 실물 수령·전달 | Notion 메타데이터 | 실물 대상 조건부 | P01, P03 UN-01·15~16, P07 AO-01·14 | 실물 보유·인계 입증 | 중간 | 가능 | 필수 |
| EV-COMPLETE | 완료 메타데이터 | 지원팀·승인자 | Task·요청 완료 | Notion | 완료 시 필수 | 전체 | 완료일·완료자·승인자 입증 | 낮음 | 가능 | 필수 |

## 저장 방식 판정

| 선택 | Pilot A 판정 | 이유 |
|---|---|---|
| 완료증빙 Text 유지 | 채택 | 현재 Schema로 Evidence ID와 Drive 경로를 기록 가능 |
| URL Property 추가 | `ADD_PROPOSED` | 단일 대표 경로의 클릭 접근성 개선; AG-P2 후 적용 검토 |
| Files Property | 유예 | 민감 파일의 Notion 중복 저장과 권한 위험 |
| 별도 Evidence DB | `DEFER_POST_PILOT` | 다중 증빙별 상태·감사·RAG 단위 요구가 확인될 때 도입 |

## 완료조건 작성 규칙

`[Actor]가 [관찰 가능한 결과]를 확인하고 [Evidence ID·경로/기록]가 존재한다.`

- Yes/No로 판단 가능해야 한다.
- 결과물, 기관 접수, 전달, 수령 또는 다음 단계 Input을 명시한다.
- “업무 완료”와 같은 순환 정의를 금지한다.
