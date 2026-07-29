# Read-only Runtime Snapshot Bridge Replay

The approved TEST LAB snapshot is checked in this order: schema, environment, data-source allowlist, transaction, 1/1/6 count, relation chain, sanitization, and SHA-256 integrity. The Node runtime never calls MCP directly.

| Replay check | Expected result |
| --- | --- |
| Runtime snapshot | `RUNTIME_SNAPSHOT`, `TEST_LAB`, `NO_OP_ALREADY_COMMITTED` |
| Counts and relations | FUND 1 / Request 1 / Task 6, PASS |
| Human confirmation | T03 `NEEDS_WORDING_FIX`; T04/T05 `SEMANTIC_MATCH` |
| Completion | Request and all confirmation tasks remain not completable |
| Writes | Notion 0, operating 0 |
| Tamper | Environment, data source, transaction, count, sanitization, and hash are fail-closed |

The remaining boundary is external: an approved session must obtain and sanitize the live Notion response before supplying it to this bridge. Raw MCP responses are not stored in Git.
