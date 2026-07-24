# Current Orchestration Roadmap

```text
CP-04
→ CP-05-P0/P1/S1/N1/S1-R1
→ CP-05-P2 execution complete
→ CP-00-O1 orchestration bootstrap
→ AG-P2 approved ───────────────┐
                                ├→ J-01 → CP-05-P3
N-04 user UI → N-05 validation ┘
                  └→ N-06 validation → J-02 Build Readiness
```

- CP-05-P2 계획 상태: `APPROVED`
- AG-P2: `APPROVED`, Q1~Q10 승인
- N-04: `READY`, 사용자·Notion AI UI 실행 필요
- P3: J-01 전 실행 금지
- N-06: `REQUIRED_BEFORE_BUILD`, J-02 필수 입력
- Claude Review: GPT Work Order가 발행될 때만 실행

이 파일과 같은 `plan/**`은 GPT 소유다. Agent는 변경 필요 시 Proposal을 제출한다.
