# Request Property Mapping

| 의미 | Request Property | 현재 Type | 생성/수정 주체 | 필수 | P3 사용 |
|---|---|---|---|---|---|
| 요청 식별 | 요청명 | Title | 요청자/지원팀 | Yes | Request 전체 표시 |
| FUND 연결 | 관련 조합 | Relation | 요청자/지원팀 | 조건부 | 기존 Record가 없으면 비움; J-01 검증 완료 |
| Process 분기 | 요청 업무 유형 | Select | 요청자 | Yes | P01/P03/P04/P07/P08 요청 Contract |
| 책임 | 요청자 | Person | 요청자 | Yes | HA-08 확인 후보 |
| 판단 주체 | 담당 관리역 | Person | 요청자 | Yes | HA-01/04/05/06/08 |
| 접수 시점 | 요청일 | Date | 시스템/요청자 | Yes | RQ-NEW 진입 |
| 기한 | 목표일 | Date | 요청자/지원팀 | Yes | 우선순위·대기 재확인 |
| Lifecycle | 요청 상태 | Status | 지원팀 | Yes | RQ-* 7상태 의미 Mapping |
| Source 위치 | 원본 폴더 | URL | 요청자 | Yes | EV-SOURCE; 실제 파일은 Drive |
| 실물 Input | 실물서류 전달 여부 | Checkbox | 요청자/지원팀 | 조건부 | EV-PHYSICAL 존재 후보 |
| 원문 | 요청 내용 | Text | 요청자 | Yes | Trigger·Input |
| 예외 | 특이사항 | Text | 요청자/지원팀 | No | Exception 후보, Rule 아님 |
| 실행 연결 | 관련 Task | Relation | 지원팀/시스템 | Yes | RC-01~03 집계 기반 |

요청 상태 자동 전이는 P3 범위가 아니다. `RQ-DONE`은 RC-01~06과 HA-08을 모두 충족한 후 사람이 기록한다.
