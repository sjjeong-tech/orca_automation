// Session Tool Bridge — 논리 Provider 동작을 실제 Connector 호출로 넘기는 경계.
//
//   Domain Runtime → Provider Payload → Session Tool Bridge → 실제 Tool Call
//   → Raw Response → Provider Normalizer → Domain Result
//
// Node는 MCP를 직접 호출하지 않는다. Bridge는 '무엇을 어떤 payload로 부를지'를 정의하고,
// 실제 호출은 세션이 수행한다. Raw Response는 Git에 저장하지 않는다.

import crypto from "node:crypto";
import { DOMAIN_ERROR, normalizeTransportError, normalizeResponseShape } from "../kernel/errors.mjs";
import { sanitize } from "../kernel/sanitize.mjs";

export const BRIDGE_STATUS = { OK: "OK", ERROR: "ERROR", BLOCKED: "BLOCKED", UNSUPPORTED: "UNSUPPORTED" };

// 논리 동작 → 설치된 Connector 도구명. 실제 도구명은 세션마다 다를 수 있어 config로 덮어쓴다.
export const DEFAULT_TOOL_MAP = {
  "notion.query": "notion-query-data-sources",
  "notion.fetch": "notion-fetch",
  "notion.create": "notion-create-pages",
  "notion.update": "notion-update-page",
  "drive.search": "search_files",
  "drive.metadata": "get_file_metadata"
};

export function buildBridgeRequest({ provider, operation, payload, write_intent = false, approval_ref = null, transaction_id = null, timeout_policy = { ms: 30000 }, retry_policy = { auto_write_retry: false, max_read_retry: 0 } }) {
  return {
    bridge_request_id: `br_${crypto.randomBytes(8).toString("hex")}`,
    provider, operation, payload,
    write_intent, approval_ref, transaction_id,
    timeout_policy,
    retry_policy: { ...retry_policy, auto_write_retry: false } // 쓰기 자동 재시도는 항상 금지
  };
}

export function buildBridgeResponse({ request, status, result = null, error = null, raw = null }) {
  const base = {
    bridge_request_id: request?.bridge_request_id ?? null,
    provider: request?.provider ?? null,
    operation: request?.operation ?? null,
    status,
    normalized_status: null,
    result: null,
    error_code: null,
    retryable: false,
    raw_response_stored: false, // Raw Response는 Git·로그에 남기지 않는다
    sanitized: true
  };
  if (status === BRIDGE_STATUS.OK) {
    const shape = normalizeResponseShape(raw ?? result);
    if (!shape.ok) return { ...base, status: BRIDGE_STATUS.ERROR, normalized_status: "FAILED", error_code: shape.error_code, retryable: false };
    return { ...base, normalized_status: "SUCCEEDED", result: sanitize(result) };
  }
  if (status === BRIDGE_STATUS.UNSUPPORTED) return { ...base, normalized_status: "UNSUPPORTED", error_code: "UNSUPPORTED" };
  if (status === BRIDGE_STATUS.BLOCKED) return { ...base, normalized_status: "BLOCKED", error_code: error?.error_code ?? "BLOCKED", retryable: false };
  const n = error?.error_code ? { error_code: error.error_code, retryable: Boolean(error.retryable) } : normalizeTransportError(error);
  return { ...base, status: BRIDGE_STATUS.ERROR, normalized_status: "FAILED", error_code: n.error_code, retryable: n.retryable };
}

/**
 * Bridge 생성.
 * writeEnabled 기본 false — 실제 Write Bridge는 비활성이며 Mock Bridge로만 검증한다.
 */
export function createSessionToolBridge({ invoke, toolMap = DEFAULT_TOOL_MAP, writeEnabled = false, logger = () => {} } = {}) {
  const calls = [];
  return {
    calls,
    write_enabled: writeEnabled,
    resolveTool: (op) => toolMap[op] ?? null,
    async send(request) {
      calls.push({ operation: request.operation, write_intent: request.write_intent });
      logger({ bridge_request_id: request.bridge_request_id, operation: request.operation, write_intent: request.write_intent });

      if (request.write_intent && !writeEnabled) {
        return buildBridgeResponse({ request, status: BRIDGE_STATUS.BLOCKED, error: { error_code: "WRITE_BRIDGE_DISABLED" } });
      }
      const tool = toolMap[request.operation];
      if (!tool) return buildBridgeResponse({ request, status: BRIDGE_STATUS.UNSUPPORTED });
      if (typeof invoke !== "function") {
        return buildBridgeResponse({ request, status: BRIDGE_STATUS.ERROR, error: { error_code: DOMAIN_ERROR.ACCESS_DENIED, retryable: false } });
      }
      try {
        const raw = await invoke(tool, request.payload);
        return buildBridgeResponse({ request, status: BRIDGE_STATUS.OK, result: raw, raw });
      } catch (error) {
        return buildBridgeResponse({ request, status: BRIDGE_STATUS.ERROR, error });
      }
    }
  };
}
