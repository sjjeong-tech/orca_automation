# Scope Control

## 허용 원칙

각 TAP은 Master Roadmap에 등록된 Input, Output, 변경 예상 범위만 수행한다. 관련성이 있다는 이유만으로 범위를 확장하지 않는다.

## 금지

- 후속 단계 선행 구현
- 승인 전 Schema 확정
- Pilot 전 Automation 구현
- Write Governance 전 Write 기능 구현
- 지원팀 MVP 전 운영팀 범위 확장
- Notion DB 임의 생성
- Process·Variation Rule 임의 추가
- Scope 밖 파일 수정

## Scope 밖 발견 처리

1. 구현하지 않는다.
2. 결정이 필요하면 `decisions/pending-approvals.md`, 아이디어·작업이면 Roadmap Backlog에 기록한다.
3. 영향, 관련 Deliverable, 관련 Gate를 기록한다.
4. 적절한 후속 TAP을 지정한다.
5. GPT와 사용자 검토 전 실행하지 않는다.

## Backlog 등록 기준

- 현재 Exit Criteria에 필요하지 않음
- 선행 승인 또는 근거가 없음
- 다른 Deliverable 소유
- Pilot 데이터가 있어야 판단 가능
- 권한·보안·외부 발송 영향이 있음

Backlog 등록은 승인이나 구현을 의미하지 않는다.

## Skeleton 예외 범위

CP-05-S1은 P1과 AG-S1 승인 후에만 최소 2개 DB, Relation, 최소 Property·View, 테스트 Record를 만들 수 있다. Automation, Slack, Agent Write, 전체 Process Mapping, Process 05·06·09·10·11, 미확정 상태 전이와 미승인 Formula·Rollup은 범위 밖이다.

## Communication 책임 경계

- Codex 금지: 대표님 보고 문구, Notion AI TI, 표현 수준, 확인 요청사항 작성과 보고 응답 해석
- Claude 금지: 대표님 보고 문구·Notion AI TI 검토와 표현 수준 승인
- GPT·사용자 책임: 보고 내용 구성, TI 작성, 공유 대상·시점 판단, 대표님 피드백 정리
- 보고 결과의 운영결정만 승인 절차에 따라 Git에 반영한다.
