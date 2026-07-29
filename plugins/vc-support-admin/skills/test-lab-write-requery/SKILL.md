---
name: test-lab-write-requery
description: Requery an approved TEST LAB transaction and compare its Request and Task state without creating or modifying records. Use for TEST LAB duplicate replay, Expected–Actual validation, and human-confirmation packets; never use it for operational Notion writes.
---

# TEST LAB Write Requery

Run the registered CLI with a sanitized snapshot and `--preview`. Require `TEST_LAB`, a known transaction ID, and the six-task relation chain. Return `NO_OP_ALREADY_COMMITTED` for an existing transaction. Do not treat evidence as completion.

Use `plugins/vc-support-admin/fixtures/growthbridge-actual-snapshot.json` for the replay fixture. Its references are sanitized; inject live identifiers only through an approved runtime connector and never save them in Git.

```text
node plugins/vc-support-admin/cli/test-lab-write-requery.mjs --snapshot plugins/vc-support-admin/fixtures/growthbridge-actual-snapshot.json --transaction GB-P03-001 --preview
```

Ask the T03, T04, and T05 confirmation questions before any future TEST LAB write. T04 and T05 are P0; T03 is P1. Keep request completion false and all write counts zero in preview mode.
