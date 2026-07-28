// Kernel — TEST-only Runtime Guard. Provider Write 호출 전 최종 관문.

import { validateApproval } from "./preview.mjs";
import { WRITE_MODE } from "./guards.mjs";

export const GUARD_CODE = {
  ALLOWED: "ALLOWED",
  BLOCKED_PREVIEW_ONLY: "BLOCKED_PREVIEW_ONLY",
  BLOCKED_OPERATING_WRITE: "BLOCKED_OPERATING_WRITE",
  BLOCKED_DATA_SOURCE: "BLOCKED_DATA_SOURCE",
  BLOCKED_RECORD_SCOPE: "BLOCKED_RECORD_SCOPE",
  BLOCKED_PROCESS: "BLOCKED_PROCESS",
  BLOCKED_ACTION: "BLOCKED_ACTION",
  BLOCKED_APPROVAL: "BLOCKED_APPROVAL",
  BLOCKED_CONFIG: "BLOCKED_CONFIG"
};

/** Runtime Config가 완전한지 — 불완전하면 Write 의도 구성 전에 fail-closed. */
export function validateRuntimeConfig(cfg = {}) {
  const missing = [];
  if (!cfg.write_mode) missing.push("write_mode");
  if (cfg.operating_write_enabled === undefined) missing.push("operating_write_enabled");
  if (!Array.isArray(cfg.test_data_sources) || cfg.test_data_sources.length === 0) missing.push("test_data_sources");
  if (!Array.isArray(cfg.allowed_prefixes) || cfg.allowed_prefixes.length === 0) missing.push("allowed_prefixes");
  if (!Array.isArray(cfg.allowed_processes) || cfg.allowed_processes.length === 0) missing.push("allowed_processes");
  if (!Array.isArray(cfg.allowed_actions) || cfg.allowed_actions.length === 0) missing.push("allowed_actions");
  return { complete: missing.length === 0, missing };
}

/**
 * TEST 판정은 두 조건을 모두 요구한다.
 *  - target_data_source가 TEST Allowlist에 포함
 *  - target_record가 TEST Prefix 또는 명시적 test_record 메타데이터를 가짐
 * 운영 Data Source에 [TEST] 제목만 붙어도 차단되고, TEST Data Source라도 Prefix·메타데이터가 없으면 차단된다.
 */
export function guardTestWrite({ preview, approval, runtimeConfig = {}, currentValueNow = undefined, targetRecordTitle = "", targetRecordIsTestMetadata = false, now = Date.now() }) {
  const deny = (code, detail) => ({ allowed: false, code, detail, provider_call_allowed: false });

  const cfg = validateRuntimeConfig(runtimeConfig);
  if (!cfg.complete) return deny(GUARD_CODE.BLOCKED_CONFIG, `runtime config 불완전: ${cfg.missing.join(", ")}`);

  if (runtimeConfig.operating_write_enabled === true) return deny(GUARD_CODE.BLOCKED_OPERATING_WRITE, "operating_write는 이 Plugin에서 영구 금지다.");
  if (runtimeConfig.write_mode === WRITE_MODE.OPERATING_WRITE) return deny(GUARD_CODE.BLOCKED_OPERATING_WRITE, "operating_write 모드는 강제 차단된다.");
  if (runtimeConfig.write_mode !== WRITE_MODE.TEST_WRITE) return deny(GUARD_CODE.BLOCKED_PREVIEW_ONLY, `write_mode=${runtimeConfig.write_mode}`);

  if (!preview) return deny(GUARD_CODE.BLOCKED_APPROVAL, "Preview 없음");
  if (!runtimeConfig.test_data_sources.includes(preview.target_data_source)) {
    return deny(GUARD_CODE.BLOCKED_DATA_SOURCE, "대상 Data Source가 TEST Allowlist에 없다.");
  }
  const prefixOk = runtimeConfig.allowed_prefixes.some((p) => String(targetRecordTitle ?? "").startsWith(p));
  if (!prefixOk && !targetRecordIsTestMetadata) {
    return deny(GUARD_CODE.BLOCKED_RECORD_SCOPE, "대상 Record가 TEST Prefix·메타데이터 조건을 충족하지 않는다.");
  }
  if (!runtimeConfig.allowed_processes.includes(preview.process_id)) return deny(GUARD_CODE.BLOCKED_PROCESS, "process_id가 Allowlist 밖이다.");
  if (!runtimeConfig.allowed_actions.includes(preview.action)) return deny(GUARD_CODE.BLOCKED_ACTION, "action이 허용 목록 밖이다.");

  const av = validateApproval({ preview, approval, currentValueNow, now });
  if (!av.valid) return deny(GUARD_CODE.BLOCKED_APPROVAL, `${av.error_code}: ${av.detail}`);

  return { allowed: true, code: GUARD_CODE.ALLOWED, provider_call_allowed: true, transaction_id: preview.transaction_id, preview_id: preview.preview_id };
}
