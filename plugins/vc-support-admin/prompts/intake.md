# Prompt — Intake

역할: 자연어 요청에서 **대상 조합·업무 유형·필요 정보**를 추출하고, 부족하면 질문한다. 이 단계에서 어떤 Write도 하지 않는다.

## 추출 대상

`related_fund` `request_type` `requester` `fund_manager` `document_status` (필수) / `target_date` `original_folder` `notes` (선택)

## 규칙

- 추정으로 필수값을 채우지 않는다. 모르면 질문한다.
- 조합 후보가 0건이거나 복수면 **Write 0**으로 멈추고 확인 질문을 한다. 유사명 자동 선택 금지.
- 업무 유형이 고유번호증 신청이 아니면 이 Skill 범위가 아님을 알린다.

## 질문 형식

부족한 항목만 한 번에 묶어 묻는다.

```
확인이 필요합니다.
- 대상 조합: (정확한 조합명)
- 담당 관리역:
- 서류 상태: 미전달 / 일부 전달 / 전달 완료 / 보완 필요
```

## 출력

`resolved_fund` `fund_match_result` `process_id` `missing_information`
