// Kernel — 순차 Transaction, Partial Write, Idempotency. Process 비의존.

import { DOMAIN_ERROR, normalizeTransportError, normalizeResponseShape, failure } from "./errors.mjs";

export const TX_STATUS = { CREATED: "CREATED", RUNNING: "RUNNING", COMPLETED: "COMPLETED", PARTIAL_WRITE: "PARTIAL_WRITE", FAILED: "FAILED", NO_OP: "NO_OP" };

export function createTransaction({ transaction_id, transaction_type, process_id, request_ref = null, expected_task_ids = [], preview_hash = null, approval_id = null }) {
  return {
    transaction_id, transaction_type, process_id, request_ref,
    expected_task_ids: [...expected_task_ids], preview_hash, approval_id,
    current_step: null, completed_steps: [], created_records: [],
    failed_step: null, status: TX_STATUS.CREATED, error_code: null
  };
}

/** 완료 Transaction 재실행은 NO_OP, Partial은 자동 이어쓰기 금지. */
export function createTransactionStore(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    get: (key) => store.get(key) ?? null,
    put: (key, tx) => { store.set(key, tx); return tx; },
    has: (key) => store.has(key),
    size: () => store.size,
    checkReplay(key) {
      const prior = store.get(key);
      if (!prior) return { replay: false };
      if (prior.status === TX_STATUS.COMPLETED) return { replay: true, decision: TX_STATUS.NO_OP, detail: "동일 Transaction이 이미 완료됐다.", write_allowed: false, prior };
      if (prior.status === TX_STATUS.PARTIAL_WRITE) return { replay: true, decision: "HUMAN_RECOVERY_REQUIRED", detail: "Partial Transaction은 자동 이어쓰기하지 않는다.", write_allowed: false, prior };
      return { replay: true, decision: "IN_FLIGHT", detail: "진행 중 Transaction이 있다.", write_allowed: false, prior };
    }
  };
}

const handoff = (tx, reason) => ({
  next_owner: "USER", reason,
  transaction_id: tx.transaction_id, status: tx.status, error_code: tx.error_code,
  created_records: tx.created_records, failed_step: tx.failed_step,
  recovery: "자동 복구·재시도하지 않는다. 사람이 생성분을 확인한 뒤 다음 조치를 지시한다.",
  rollback_supported: false
});

/**
 * 순차 실행기. 각 단계가 PASS해야 다음이 실행된다.
 * step: { name, run: async () => ({ ok, created?, error_code?, detail? }) }
 */
export async function runTransaction(tx, steps, { spy = null } = {}) {
  tx.status = TX_STATUS.RUNNING;
  for (const step of steps) {
    tx.current_step = step.name;
    let outcome;
    try {
      outcome = await step.run(tx);
      const shape = normalizeResponseShape(outcome);
      if (!shape.ok) outcome = { ok: false, error_code: shape.error_code };
    } catch (error) {
      const n = normalizeTransportError(error);
      outcome = { ok: false, error_code: n.error_code, detail: "transport exception normalized" };
    }
    if (spy) spy.push({ step: step.name, ok: Boolean(outcome?.ok), error_code: outcome?.error_code ?? null });

    if (outcome?.created?.length) tx.created_records.push(...outcome.created);

    if (!outcome?.ok) {
      tx.failed_step = step.name;
      tx.error_code = outcome?.error_code ?? DOMAIN_ERROR.PROVIDER_ERROR;
      // 이미 만들어진 Record가 있으면 Partial Write로 승격한다.
      tx.status = tx.created_records.length > 0 ? TX_STATUS.PARTIAL_WRITE : TX_STATUS.FAILED;
      if (tx.status === TX_STATUS.PARTIAL_WRITE) tx.error_code = DOMAIN_ERROR.PARTIAL_WRITE;
      return { ...failure(tx.error_code, outcome?.detail ?? null), transaction: tx, handoff: handoff(tx, tx.status) };
    }
    tx.completed_steps.push(step.name);
  }
  tx.current_step = null;
  tx.status = TX_STATUS.COMPLETED;
  return { ok: true, error_code: null, transaction: tx, write_count: tx.created_records.length, handoff: null };
}

/** Expected–Actual 하나라도 다르면 전체 성공으로 처리하지 않는다. */
export function verifyExpectedActual(expected = {}, actual = {}) {
  const rows = Object.entries(expected).map(([k, v]) => ({
    item: k, expected: v, actual: actual?.[k] ?? null,
    result: JSON.stringify(v) === JSON.stringify(actual?.[k]) ? "PASS" : "MISMATCH"
  }));
  const mismatches = rows.filter((r) => r.result === "MISMATCH");
  return mismatches.length === 0
    ? { ok: true, rows, mismatches: 0 }
    : { ...failure(DOMAIN_ERROR.EXPECTED_ACTUAL_MISMATCH, `${mismatches.length}건 불일치`), rows, mismatches: mismatches.length };
}
