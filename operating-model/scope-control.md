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
