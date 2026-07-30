---
name: admin-process-prototype-replay
description: Preview-only replay of three synthetic fund-administration scenarios. It never calls a connector, writes a record, approves a transaction, or completes a Request.
---

# Admin Process Prototype Replay

Use this prototype to inspect a synthetic P03 flow, a missing-stamped-document human-confirmation flow, or a P03 → P04 → P07 sequence. It reports process lanes, projected task state, human confirmation, recovery scope, an ordered snapshot timeline, and exact fixture assertions.

Run only in preview mode:

```powershell
node plugins/vc-support-admin/cli/admin-process-prototype-replay.mjs --scenario plugins/vc-support-admin/fixtures/prototype-composite-p03-p04-p07.json --scenario-id COMPOSITE-01 --preview --emit-snapshots
```

Safety boundaries:

- The fixture data is synthetic and is not a Notion, Drive, Slack, MCP, or runtime snapshot transport.
- `completion_candidate` never authorizes Task or Request completion.
- P04 and P07 are candidate mappings requiring later canonical confirmation.
- Output is always JSON on stdout; this prototype has no result-file option.

Known scope gap: this implements three synthetic scenarios, not the broader TEST LAB Prototype Scenario Contract. Snapshot stage-count differences in external documents are intentionally not normalized here.
