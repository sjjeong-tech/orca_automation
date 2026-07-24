#!/usr/bin/env python3
"""Render non-canonical current-state and ready-work Markdown views."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORCH = ROOT / "orchestration"
GENERATED = ORCH / "generated"


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    workmap = load(ORCH / "plan/master-workmap.yaml")
    items = workmap["work_items"]
    GENERATED.mkdir(parents=True, exist_ok=True)

    rows = [
        "# Generated Current State",
        "",
        "> Non-canonical. Regenerate from `orchestration/plan/master-workmap.yaml`.",
        "",
        f"- Project: `{workmap['project']}`",
        f"- Phase: `{workmap['current_phase']}`",
        f"- Overall plan status: `{workmap['status']}`",
        f"- Next review: `{workmap['next_review']}`",
        "",
        "| Work Item | Owner | Plan Status | Blocking Reason |",
        "|---|---|---|---|",
    ]
    for item in items:
        rows.append(f"| {item['id']} | {item['owner']} | {item['status']} | {item['blocking_reason'] or '-'} |")
    (GENERATED / "current-state.md").write_text("\n".join(rows) + "\n", encoding="utf-8")

    ready = [item for item in items if item["status"] == "READY"]
    ready_rows = [
        "# Generated Ready Work",
        "",
        "> Non-canonical. Approval-required items are not executable Agent work.",
        "",
        "| Work Item | Owner | Type | Approval Required | Input Gate |",
        "|---|---|---|---:|---|",
    ]
    for item in ready:
        ready_rows.append(f"| {item['id']} | {item['owner']} | {item['type']} | {str(item['approval_required']).lower()} | {item['input_gate']} |")
    if not ready:
        ready_rows.append("| - | - | - | - | No READY work |")
    (GENERATED / "ready-work.md").write_text("\n".join(ready_rows) + "\n", encoding="utf-8")

    print(f"RENDERED_CURRENT_ITEMS={len(items)}")
    print(f"RENDERED_READY_ITEMS={len(ready)}")


if __name__ == "__main__":
    main()
