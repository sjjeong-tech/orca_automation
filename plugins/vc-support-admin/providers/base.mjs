// Provider 공통 계약.
//
// 이 Runtime(Node)은 MCP 서버를 직접 호출할 수 없다. 따라서 Provider는
//   - 어떤 MCP 도구를 어떤 payload로 부를지 결정하고
//   - 응답을 정규화·검증·마스킹하는
// 책임만 지며, 실제 호출은 주입된 invoke(toolName, params)에 위임한다.
// 테스트는 fixture invoke를, 실사용 세션은 실제 MCP invoke를 주입한다.

export const RESULT = {
  OK: "OK",
  UNSUPPORTED: "UNSUPPORTED",
  READ_ONLY: "READ_ONLY",
  APPROVAL_REQUIRED: "APPROVAL_REQUIRED",
  TOOL_LIMITATION: "TOOL_LIMITATION",
  ACCESS_DENIED: "ACCESS_DENIED",
  NOT_FOUND: "NOT_FOUND"
};

export const PROVIDER_OPERATIONS = [
  "initialize", "health_check", "fetch_schema", "search_records", "fetch_record",
  "list_evidence", "fetch_metadata", "fetch_document", "preview_write",
  "commit_write", "requery", "verify", "close"
];

export function ok(data, meta = {}) { return { result: RESULT.OK, data, ...meta }; }
export function fail(result, detail, meta = {}) { return { result, data: null, detail, ...meta }; }

export function unsupported(operation) {
  return fail(RESULT.UNSUPPORTED, `${operation} is not supported by this provider`);
}

/** 모든 Provider가 13개 표준 동작을 노출하는지 확인한다(미지원은 UNSUPPORTED 반환으로 충족). */
export function assertProviderShape(provider, name = "provider") {
  const missing = PROVIDER_OPERATIONS.filter((op) => typeof provider[op] !== "function");
  if (missing.length) throw new Error(`${name} missing operations: ${missing.join(", ")}`);
  return true;
}

/** invoke 주입이 없으면 읽기조차 시도하지 않는다(무단 호출 방지). */
export function requireInvoke(invoke, operation) {
  if (typeof invoke !== "function") return fail(RESULT.ACCESS_DENIED, `invoke not injected for ${operation}`);
  return null;
}
