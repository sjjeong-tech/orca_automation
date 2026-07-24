# Form Structure Diff

| 대상 | Before | Probe | After | 판정 |
|---|---|---|---|---|
| 2차 Form 설명 | 없음 | 설명 저장 API 성공 | 없음 | NO_EFFECT |
| 2차 Form 이름 | 지원팀 행정업무 요청 | `[PROBE]` 접미사 표시 | 원래 이름 복구 | WRITE_PERSISTENCE_PASS |
| 2차 질문 수 | 1 | 변경 없음 | 1 | QUESTION_WRITE_NO_EFFECT |
| 1차 질문 수 | 8 | 미변경 | 8 | USER_UI_REQUIRED |
| Required | API 미노출 | 미변경 | API 미노출 | USER_UI_REQUIRED |
| 질문 순서·표시명·설명 | 읽기 일부/세부 미노출 | 미변경 | 동일 | USER_UI_REQUIRED |

Codex는 Form View 이름을 저장할 수 있지만 질문 추가·제거·순서·Required·설명 편집은 현재 API로 검증되지 않았다.
