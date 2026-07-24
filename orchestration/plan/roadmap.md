# Current Orchestration Roadmap

```text
CP-04
→ CP-05-P0/P1/S1/N1/S1-R1
→ CP-05-P2 execution complete
→ CP-00-O1 orchestration bootstrap
→ AG-P2 approval ───────────────┐
                                ├→ J-01 → CP-05-P3
N-04 user UI → N-05 validation ┘
                  └→ N-06 classification (classification timing is GPT decision)
```

- CP-05-P2 계획 상태: `APPROVAL_REQUIRED`
- AG-P2: `READY`, GPT+사용자 승인 필요
- N-04: `WAITING_FOR_USER` 의미의 `BLOCKED`
- P3: AG-P2와 J-01 전 실행 금지
- Claude Review: GPT Work Order가 발행될 때만 실행

이 파일과 같은 `plan/**`은 GPT 소유다. Agent는 변경 필요 시 Proposal을 제출한다.
