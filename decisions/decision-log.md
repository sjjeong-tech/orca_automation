# Decision Log

승인 완료된 결정만 기록한다. 제안·미결 항목은 `pending-approvals.md`에 둔다.

| Decision ID | 제안 | 영향 | 상태 | 승인자 | 관련 TAP | 결정일 |
|---|---|---|---|---|---|---|
| DEC-CP05-01 | CP-05는 Notion Operations Control Plane 구축이며 Gap Resolution은 Cross-cutting Workstream | 전체 Roadmap·AG-01 | DECIDED | 사용자·정상준 | P0-R | 2026-07-23 |
| DEC-CP05-02 | 상위 Record는 조합별 업무 건 | 업무 DB·Relation·AG-02 | DECIDED | 사용자·정상준 | P1 | 2026-07-23 |
| DEC-CP05-03 | 독립 완료조건을 가진 업무는 동일 조합이어도 별도 Record | Record 분리·AG-03 | DECIDED | 사용자·정상준 | P1 | 2026-07-23 |
| DEC-CP05-04 | 지원팀 업무 DB와 Task DB의 2개 DB MVP | Architecture·Skeleton·AG-04 | DECIDED | 사용자·정상준 | P1,S1 | 2026-07-23 |
| DEC-CP05-05 | Pilot A는 Process 03·04·07·08 | Pilot Mapping·AG-20A | DECIDED | 사용자·정상준 | B2 | 2026-07-23 |
| DEC-CP05-06 | P1 직후 Fast Notion Skeleton Build | Roadmap 순서·AG-S1 | DECIDED | 사용자·정상준 | S1 | 2026-07-23 |
| DEC-CP05-07 | Skeleton 후 필요 시 중간보고 수행 | Communication 필요 시점; Owner는 DEC-CP05-08에서 정정 | DECIDED | 사용자·정상준 | CM-01 | 2026-07-23 |
| DEC-CP05-08 | 대표님 중간보고와 Notion AI TI는 GPT·사용자 전담이며 Codex·Claude TAP이 아니고 P2를 차단하지 않음 | MD-11을 CM-01로 분리, CP-05-R1 제거, Roadmap·Queue 단순화 | DECIDED | 사용자·정상준 | P0-R3,CM-01 | 2026-07-23 |
| DEC-CP05-09 | Pilot A 상위 Record는 기존 `TO DO LIST (FUND)`의 `조합(결성)` Record를 사용하고, 신규 DB는 지원팀 업무요청 DB와 Task DB로 구성하며 1차 Form은 기존 DB, 2차 Form은 요청 DB를 원본으로 사용 | DEC-CP05-04의 Pilot A 구현을 기존 Notion 구조에 맞게 구체화; 별도 지원팀 업무 DB는 Post-Pilot 재검토 | DECIDED | 사용자·정상준 | P1-R1,S1 | 2026-07-23 |
| DEC-CP05-S1-01 | S1에서는 기존 FUND DB를 변경하지 않고 요청 DB의 단방향 Relation을 사용하며, 상세 Status·View Filter·Form 질문과 실제 FUND 기반 Rollup 검증은 P2·P4 또는 승인된 TEST Record 검증으로 유예 | 기존 운영 자산 보호와 Fast Skeleton 검증을 동시에 충족; S1 판정은 `PARTIAL_WITH_SAFE_CONSTRAINTS`. `DEC-CP05-10` ID 충돌 해소를 위해 의미를 유지하고 재키잉 | DECIDED | 사용자 승인 제약·Codex 실행 결과 | S1,P2,P4 | 2026-07-23 |
| DEC-CP05-10 | Repository 이름을 `orca_automation`에서 `vc-support_team-process-rag`로 변경 | 지원팀 업무 범위, Process Modeling, RAG 지식검색, Notion 운영 및 Agent 확장 범위를 명확히 표시 | DECIDED | 사용자·정상준 | CP-05-N1 | 2026-07-23 |
