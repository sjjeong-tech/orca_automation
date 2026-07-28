// Kernel — Sanitizer. Provider 출력과 로그에서 민감값을 제거한다. Process 비의존.

const PATTERNS = [
  [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, "<uuid>"],
  [/\b[0-9a-f]{32}\b/gi, "<id32>"],
  [/https?:\/\/(?:www\.)?(?:drive|docs)\.google\.com\/[^\s"']*/gi, "<drive-url>"],
  [/https?:\/\/(?:www\.)?(?:app\.)?notion\.(?:so|com)\/[^\s"']*/gi, "<notion-url>"],
  [/\b1[A-Za-z0-9_-]{30,}\b/g, "<drive-id>"],
  [/\b\d{6}-[1-4]\d{6}\b/g, "<rrn>"],
  [/\b\d{3}-\d{2}-\d{5}\b/g, "<biz-no>"],
  [/\b\d{2,4}-\d{2,6}-\d{2,6}(?:-\d{1,3})?\b/g, "<account-like>"]
];

export function maskString(value) {
  if (typeof value !== "string") return value;
  return PATTERNS.reduce((acc, [re, rep]) => acc.replace(re, rep), value);
}

export function maskIdentifier(value) {
  if (typeof value !== "string" || value.length <= 8) return "<masked>";
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

export function sanitize(value, depth = 0) {
  if (depth > 8) return "<deep>";
  if (typeof value === "string") return maskString(value);
  if (Array.isArray(value)) return value.map((v) => sanitize(v, depth + 1));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = sanitize(v, depth + 1);
    return out;
  }
  return value;
}

// 허용된 로그 필드만 남긴다 (TAP §20).
export function auditLog({ provider, operation, result, count = null, identifier = null, elapsed_ms = null, error_code = null }) {
  return {
    provider,
    operation,
    result,
    count,
    masked_identifier: identifier ? maskIdentifier(identifier) : null,
    elapsed_ms,
    error_code
  };
}

export function assertNoSensitive(text, label = "output") {
  const hits = PATTERNS.filter(([re]) => new RegExp(re.source, re.flags).test(text)).map(([re]) => re.source);
  if (hits.length) throw new Error(`SENSITIVE_VALUE_IN_${label.toUpperCase()}: ${hits.length} pattern(s)`);
  return true;
}
