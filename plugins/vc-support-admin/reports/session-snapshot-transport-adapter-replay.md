# Session Snapshot Transport Adapter Replay

## Scope

The registered `test-lab-write-requery` Skill accepts an approved, sanitized Session Tool read packet through `--session-snapshot`. The transport adapter has no MCP client, no Notion write path, and no operating-record path.

## Contract

`SESSION_TOOL_READ` packet → `SESSION_TOOL_BRIDGE` runtime snapshot → existing read-only runtime validation → Expected–Actual replay.

The packet retains only allowlisted TEST LAB identifiers, relation outcomes, task properties needed for comparison, inventory references, and human-confirmation text. It rejects raw payload fields, URLs, local paths, email-like values, resident-number-like values, unsupported data sources, count mismatch, relation mismatch, unknown tasks, and transaction mismatch.

## Replay Result

- Transaction: `GB-P03-001`
- Environment: `TEST_LAB`
- FUND Work / Request / Task count: `1 / 1 / 6`
- Relations: `EXACT_1`
- Duplicate replay: `NO_OP_ALREADY_COMMITTED`
- P03-T03: `NEEDS_WORDING_FIX` (preserved Actual-versus-Canonical wording difference)
- P03-T04 and P03-T05: `SEMANTIC_MATCH`
- Request completion: `false`
- Notion and operating writes: `0`

No I15 normalization handoff was available at implementation time; the adapter intentionally preserves the verified fixture values rather than inferring a text update.
