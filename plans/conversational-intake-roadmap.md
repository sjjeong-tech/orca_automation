# Conversational Intake Roadmap

## 1. 목표

자연어 요청을 검증 가능한 Intake Contract로 변환하고, 사용자 확인 후 Notion `지원팀 업무요청`과 `지원팀 Task`에 직접 기록하는 Pilot 경로를 구축한다.

## 2. 경로 전환

```text
기존: 1차 Form → 조합 Record → 2차 Form → Request → Task
변경: 대화 → 정보 추출·누락질문 → Preview·승인 → Request → Task
```

Form은 필수 선행단계가 아닌 Optional Fallback이다.

## 3. DB 운영구조

- Canonical Operation Record: `지원팀 업무요청`, `지원팀 Task`
- 기준 조합 Record: 기존 `TO DO LIST (FUND)`
- 실행 규칙: Orca Repository의 Process·Status·Evidence·P3 Mapping
- 실제 파일: Google Drive, Git에는 비민감 경로와 Metadata만 저장

## 4. Interface 우선순위

1. Claude Code Skill 또는 Codex 명령
2. GPT 직접 실행
3. Slack 연계
4. Notion Form Optional Fallback

## 5. Work Items

| ID | 한글명 | 목적 | 상태/선행 |
|---|---|---|---|
| CI-01 | 대화형 요청 입력규격 확정 | 필수·조건부 필드, 누락질문, 중복·생성 Gate 확정 | READY |
| CI-02 | Notion 업무요청·Task 운영구조 정리 | Agent Write 관점의 Property·Relation·상태·검증 View 계약 | READY; CI-01과 부분 병렬 |
| CI-03 | 자연어 요청 해석 및 누락정보 확인 | Interface 독립 Parser와 확인 질문 로직 | CI-01 |
| CI-04 | Notion 업무요청·표준 Task 자동 기록 | 승인된 Preview를 Request와 Task로 기록 | CI-01~03 |
| CI-05 | Claude Code Skill 기반 대화형 E2E 테스트 | 자연어부터 완료까지 TEST Pilot | CI-04 |
| CI-06 | Slack 요청 접수 연계 Pilot | Slack 메시지를 동일 Contract로 연결 | CI-05 및 권한 확인 |
| CI-07 | 대화형 Intake 운영 적용 및 개선 | 실제 1~3건 Pilot 후 규격·Task·알림 개선 | CI-06 또는 승인된 대체 Interface |

## 6. E2E Pilot

지원 업무는 고유번호증 신청, 보안카드·홈택스, 계좌개설, 계좌개설 보완으로 제한한다. Preview와 Human Approval 전에는 Notion Write를 수행하지 않는다.

## 7. Slack 연계

Slack은 목표 Interface지만 CI-06 전 필수 Dependency가 아니다. 권한, 메시지 보존, 사용자 식별과 실패 알림 방식을 확인한 뒤 별도 승인으로 실행한다.

## 8. Human Approval

- Record 생성 전 구조화 Preview 확인
- UNKNOWN·CASE_ONLY·상충 Rule 자동 실행 금지
- 민감정보 탐지 시 기록 중단
- 중복 후보, 예외, 취소와 외부 발송은 사람 판단

## 9. 실패와 Fallback

- 필수정보 누락: 질문 후 `WAITING_FOR_INPUT`
- 중복 가능성: 생성하지 않고 후보 제시
- Notion Write 실패: 재시도 전 오류 기록과 사용자 확인
- Interface 장애: Codex 명령 또는 수동 DB 등록
- Form: 사용자가 필요하다고 판단할 때만 Optional Fallback

## 10. 본선 Process Model 재사용

P2 Status·Evidence·Human Control Model과 P3 Process→Notion Mapping을 변경하지 않고 Contract의 Rule Source로 사용한다. 추정 정보는 `확인 필요`로 유지한다.

## 11. 운영 적용 Gate

CI-05 E2E PASS, 민감정보 차단, 중복 방지, Rollback, 감사로그, 사용자 승인 조건을 충족해야 실제 Pilot로 이동한다.
