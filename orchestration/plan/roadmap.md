# Current Orchestration Roadmap

```text
CP-04
→ CP-05-P0/P1/S1/N1/S1-R1
→ CP-05-P2 execution complete
→ CP-00-O1 orchestration bootstrap
→ AG-P2 approved ───────────────┐
                                ├→ J-01 passed → CP-05-P3 → AG-P3 → CP-05-P4
N-04/N-05 verified ─────────────┘
                  └→ N-06 partial/required before Build → J-02 Build Readiness
```

- CP-05-P2 계획 상태: `APPROVED`
- AG-P2: `APPROVED`, Q1~Q10 승인
- N-04: DB 직접 생성 검증 완료, Form UI는 Backlog
- N-05: `VERIFIED`
- J-01: `PASSED`
- P3: 실행 완료, `AG-P3` 승인 대기
- N-06: `PARTIAL / REQUIRED_BEFORE_BUILD`, J-02 필수 입력
- P4: `AG-P3` 전 실행 금지
- Claude Review: GPT Work Order가 발행될 때만 실행

이 파일과 같은 `plan/**`은 GPT 소유다. Agent는 변경 필요 시 Proposal을 제출한다.
