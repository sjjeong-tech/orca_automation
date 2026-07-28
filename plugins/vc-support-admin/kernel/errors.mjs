// Kernel — 정규화 오류 코드와 Fail-closed 분류. Process 비의존.

export const DOMAIN_ERROR = {
  PROVIDER_ERROR: "PROVIDER_ERROR",
  CONNECTION_CLOSED: "CONNECTION_CLOSED",
  RATE_LIMIT: "RATE_LIMIT",
  ACCESS_DENIED: "ACCESS_DENIED",
  TIMEOUT: "TIMEOUT",
  UNKNOWN_RESPONSE: "UNKNOWN_RESPONSE",
  REQUERY_FAILED: "REQUERY_FAILED",
  EXPECTED_ACTUAL_MISMATCH: "EXPECTED_ACTUAL_MISMATCH",
  PARTIAL_WRITE: "PARTIAL_WRITE",
  NORMALIZATION_FAILED: "NORMALIZATION_FAILED"
};

// 전부 fail-closed: 후속 Write 0, 자동 재시도 0.
const FAIL_CLOSED = new Set(Object.values(DOMAIN_ERROR));

export function isFailClosed(code) { return FAIL_CLOSED.has(code); }

/** 어떤 오류도 자동 Write 재시도를 유발하지 않는다. retryable은 '사람이 재시도해도 되는가'만 뜻한다. */
export function isAutoWriteRetryAllowed() { return false; }

/** transport 예외·응답을 안정적인 도메인 코드로 정규화한다. 알 수 없으면 UNKNOWN_RESPONSE. */
export function normalizeTransportError(error) {
  const raw = `${error?.code ?? ""} ${error?.name ?? ""} ${error?.message ?? ""}`.toLowerCase();
  if (!raw.trim()) return { error_code: DOMAIN_ERROR.UNKNOWN_RESPONSE, retryable: false };
  if (/econnreset|socket hang up|connection closed|epipe|network/.test(raw)) return { error_code: DOMAIN_ERROR.CONNECTION_CLOSED, retryable: true };
  if (/rate.?limit|429|too many requests/.test(raw)) return { error_code: DOMAIN_ERROR.RATE_LIMIT, retryable: true };
  if (/timeout|etimedout|deadline/.test(raw)) return { error_code: DOMAIN_ERROR.TIMEOUT, retryable: true };
  if (/unauthor|forbidden|permission|denied|401|403/.test(raw)) return { error_code: DOMAIN_ERROR.ACCESS_DENIED, retryable: false };
  return { error_code: DOMAIN_ERROR.PROVIDER_ERROR, retryable: false };
}

/** 응답 형태가 계약과 다르면 성공으로 보지 않는다. */
export function normalizeResponseShape(response, { expectArray = null } = {}) {
  if (response === null || response === undefined) return { ok: false, error_code: DOMAIN_ERROR.UNKNOWN_RESPONSE };
  if (expectArray && !Array.isArray(response?.[expectArray])) return { ok: false, error_code: DOMAIN_ERROR.NORMALIZATION_FAILED };
  return { ok: true };
}

export function failure(error_code, detail, extra = {}) {
  return {
    ok: false, error_code, detail: detail ?? null,
    fail_closed: isFailClosed(error_code),
    auto_write_retry: false,
    next_write_allowed: false,
    ...extra
  };
}
