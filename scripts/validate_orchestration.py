#!/usr/bin/env python3
"""Dependency-free validator for JSON-compatible YAML orchestration files."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORCH = ROOT / "orchestration"

PLAN_STATUSES = {"PLANNED", "READY", "BLOCKED", "APPROVAL_REQUIRED", "APPROVED", "CANCELLED", "SUPERSEDED"}
RUN_STATUSES = {
    "CREATED", "STARTED", "RUNNING", "CHECKPOINTED", "COMPLETED", "COMPLETED_WITH_GAPS",
    "FAILED", "STOPPED_FOR_APPROVAL", "STOPPED_MISSING_INPUT", "STOPPED_POLICY_VIOLATION", "TIMED_OUT",
}
WORK_ITEM_FIELDS = {
    "id", "title", "owner", "type", "phase", "status", "priority", "depends_on", "input_gate",
    "required_inputs", "allowed_paths", "forbidden_paths", "outputs", "validation",
    "approval_required", "continuation_policy", "downstream", "blocking_reason",
    "source_of_truth", "updated_by", "updated_at",
}
WORK_ORDER_FIELDS = {
    "work_order_id", "work_item_id", "issued_by", "assigned_to", "base_commit", "objective",
    "input_gate", "required_inputs", "allowed_actions", "forbidden_actions", "allowed_paths",
    "outputs", "validation", "continuation_policy", "stop_conditions", "runtime_limit",
    "checkpoint_interval", "commit_policy", "push_policy", "handoff_required",
}


def load(path: Path):
    # All .yaml files in this repository use the JSON subset of YAML 1.2.
    return json.loads(path.read_text(encoding="utf-8"))


def missing(data: dict, fields: set[str]) -> list[str]:
    return sorted(fields - set(data))


def main() -> int:
    errors: list[str] = []
    workmap = load(ORCH / "plan/master-workmap.yaml")
    items = workmap.get("work_items", [])
    item_ids = [item.get("id") for item in items]
    join_ids = {gate["id"] for gate in workmap.get("join_gates", [])}

    if len(item_ids) != len(set(item_ids)):
        errors.append("duplicate work item ID")

    by_id = {item["id"]: item for item in items}
    for item in items:
        absent = missing(item, WORK_ITEM_FIELDS)
        if absent:
            errors.append(f"{item.get('id')}: missing fields {absent}")
        if item.get("status") not in PLAN_STATUSES:
            errors.append(f"{item.get('id')}: invalid plan status {item.get('status')}")
        if not item.get("outputs"):
            errors.append(f"{item.get('id')}: missing output contract")
        if not item.get("validation"):
            errors.append(f"{item.get('id')}: missing validation contract")
        for dep in item.get("depends_on", []):
            if dep not in by_id and dep not in join_ids:
                errors.append(f"{item['id']}: unknown dependency {dep}")
        if item.get("status") == "READY":
            for required in item.get("required_inputs", []):
                if isinstance(required, str) and "/" in required and not (ROOT / required).exists():
                    errors.append(f"{item['id']}: READY but missing input {required}")

    gate_state = {gate["id"]: gate for gate in load(ORCH / "governance/approval-gates.yaml").get("gates", [])}
    for item in items:
        for dep in item.get("depends_on", []):
            if dep in gate_state and not gate_state[dep].get("approved", False):
                if item.get("status") not in {"BLOCKED", "PLANNED", "CANCELLED", "SUPERSEDED"}:
                    errors.append(f"{item['id']}: passes unapproved gate {dep}")

    # Cycle detection across work items; join gates are evaluated separately.
    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(node: str):
        if node in visiting:
            errors.append(f"dependency cycle at {node}")
            return
        if node in visited:
            return
        visiting.add(node)
        for dep in by_id[node].get("depends_on", []):
            if dep in by_id:
                visit(dep)
        visiting.remove(node)
        visited.add(node)

    for node in by_id:
        visit(node)

    work_orders: dict[str, dict] = {}
    for path in (ORCH / "work-orders").glob("*.yaml"):
        data = load(path)
        absent = missing(data, WORK_ORDER_FIELDS)
        if absent:
            errors.append(f"{path}: missing fields {absent}")
        work_orders[data.get("work_order_id")] = data
        if not data.get("base_commit"):
            errors.append(f"{path}: base commit missing")
        if not data.get("outputs"):
            errors.append(f"{path}: output contract missing")
        if data.get("runtime_limit", 999) > 90:
            errors.append(f"{path}: runtime exceeds 90 minutes")
        if not str(data.get("issued_by", "")).startswith("GPT"):
            errors.append(f"{path}: Work Order not issued by GPT")

    for path in (ORCH / "runs").glob("*/*/run.yaml"):
        data = load(path)
        if data.get("run_status") not in RUN_STATUSES:
            errors.append(f"{path}: invalid run status")
        if data.get("work_order_id") not in work_orders:
            errors.append(f"{path}: run without Work Order")
        if not data.get("base_commit"):
            errors.append(f"{path}: base commit missing")

    for path in (ORCH / "proposals").glob("P-*.yaml"):
        data = load(path)
        if data.get("status") != "SUBMITTED":
            errors.append(f"{path}: proposal is not SUBMITTED")

    for path in (ORCH / "schemas").glob("*.json"):
        load(path)

    if workmap.get("plan_owner") != "GPT":
        errors.append("master workmap owner is not GPT")
    for path in (ORCH / "governance").glob("*.yaml"):
        if load(path).get("owner") != "GPT":
            errors.append(f"{path}: governance owner is not GPT")
    for path in (ORCH / "approvals").glob("*.yaml"):
        if load(path).get("file_owner") != "GPT":
            errors.append(f"{path}: approval file owner is not GPT")

    if errors:
        print("ORCHESTRATION_VALIDATION=FAIL")
        for error in errors:
            print(f"- {error}")
        return 1

    print("ORCHESTRATION_VALIDATION=PASS")
    print(f"WORK_ITEMS={len(items)}")
    print(f"DEPENDENCIES={len(workmap.get('dependencies', []))}")
    print(f"JOIN_GATES={len(workmap.get('join_gates', []))}")
    print(f"APPROVAL_GATES={len(workmap.get('approval_gates', []))}")
    print(f"WORK_ORDERS={len(work_orders)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
