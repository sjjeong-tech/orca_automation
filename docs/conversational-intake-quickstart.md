# 대화형 Intake Quick Start

현재 Prototype은 `고유번호증 신청` 한 유형만 지원한다.

## 실행 전 준비

- 관련 조합, 요청자, 담당 관리역이 Workspace에서 정확히 식별돼야 한다.
- 서류 전달 상태는 `미전달`, `일부 전달`, `전달 완료` 중 하나로 말한다.
- 실제 파일은 Drive에 두고 링크만 입력한다.

## Preview 생성

```powershell
node scripts/conversational-intake.mjs create "디토 케이스테이 투자조합 고유번호증 신청 요청합니다. 요청자는 정상준이고 담당 관리역은 박세림입니다. 서류는 전달 완료했고 다음 주 수요일까지 필요합니다."
```

기본 실행은 Preview만 출력하며 Notion Write는 0건이다.

## 누락정보 응답

필수정보가 빠지면 최대 3개 질문이 반환된다. 모든 필수정보가 채워질 때까지 Request를 생성하지 않는다.

## 승인 방법

사람이 Preview와 중복 후보를 확인한 뒤에만 승인한다. 자동 TEST에서는 `--approve` 플래그가 명시적 승인값이다.

```powershell
node scripts/conversational-intake.mjs create "<확정 요청>" --approve
```

CLI의 승인 출력은 Write Plan이다. 실제 Notion 쓰기는 승인된 실행 Agent가 이 Plan을 사용한다.

## 생성 결과 확인

- 요청 제목은 `[TEST][CI1]`로 시작한다.
- Task 제목은 `[TEST][CI1][01]` 형식이다.
- Request의 관련 조합, 요청자, 담당 관리역과 Task의 상위 요청을 확인한다.
- Task의 `관련 조합` Rollup 값을 확인한다.

## 중복 경고

동일 조합·업무의 `시작 전` 또는 `진행 중` Request가 있으면 추가 생성하지 않는다. 중복 자동 병합도 하지 않는다.

## 알려진 제한

- 실제 Slack 연동과 Form은 범위 밖이다.
- 자유로운 한국어 전체를 이해하는 범용 LLM Parser가 아니라 Pilot 규칙 기반 Parser다.
- 조합·Person 후보가 0건 또는 복수이면 사람이 선택해야 한다.
- 운영 Record는 수정하지 않는다.
