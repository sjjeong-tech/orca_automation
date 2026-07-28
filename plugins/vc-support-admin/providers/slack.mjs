// Slack Provider — Payload 생성 전용. 실제 발송 0건(강제).

import { RESULT, ok, fail, unsupported } from "./base.mjs";
import { sanitize, auditLog } from "../kernel/sanitize.mjs";

export function createSlackProvider({ config = {}, logger = () => {} } = {}) {
  const audit = [];
  const sendEnabled = false; // 구성값과 무관하게 강제 비활성
  const record = (operation, result, extra = {}) => {
    const entry = auditLog({ provider: "slack", operation, result, ...extra });
    audit.push(entry); logger(entry); return entry;
  };
  const block = (label, body) => `[${label}] ${body}`;

  return {
    name: "slack",
    send_enabled: sendEnabled,
    audit,

    async initialize() { return ok({ send_enabled: sendEnabled, mode: "PREVIEW_ONLY" }); },
    async health_check() {
      record("health_check", RESULT.OK);
      return ok({ healthy: true, send_enabled: sendEnabled, note: "connector 존재 여부와 무관하게 발송은 차단된다." });
    },
    async fetch_schema() { return unsupported("fetch_schema"); },
    async search_records() { return unsupported("search_records"); },
    async fetch_record() { return unsupported("fetch_record"); },
    async list_evidence() { return unsupported("list_evidence"); },
    async fetch_metadata() { return unsupported("fetch_metadata"); },
    async fetch_document() { return unsupported("fetch_document"); },

    build_request_payload(result) {
      return sanitize({ contract: "Input", text: block("Input", `${result.process_id ?? "-"} / ${result.resolved_fund?.name ?? "미해소"}`) });
    },
    build_missing_info_payload(missing = []) {
      return sanitize({ contract: "Input", text: block("확인 필요", missing.join(", ") || "없음") });
    },
    build_preview_payload(result) {
      const lines = [
        block("State", `활성 Task ${result.manager_share_preview?.active_tasks?.length ?? 0}건`),
        block("Evidence", `인정 ${(result.evidence_summary?.counted_types ?? []).join(", ") || "없음"} / 불인정 ${result.evidence_summary?.rejected?.length ?? 0}건`),
        block("Preview", `Write 예정 ${result.preview?.planned_write_count ?? 0}건 (운영 변경 0, Drive 변경 0)`),
        block("Approval", result.approval_required ? "명시 승인 필요 — 대상 Task와 변경값을 함께 지정" : "승인 확인됨")
      ];
      return sanitize({ contract: "Preview", text: lines.join("\n") });
    },
    build_approval_payload() {
      return sanitize({ contract: "Approval", text: block("Approval", "예: `P03-T01을 완료로 변경`") });
    },
    build_result_payload(result) {
      return sanitize({ contract: "Commit Result", text: block("Result", `실제 Write ${result.committed_changes?.write_count ?? 0}건`) });
    },
    build_blocker_payload(blockers = []) {
      return sanitize({ contract: "Error", text: block("Blocker", blockers.map((b) => `${b.task}: ${b.blocker}`).join("\n") || "없음") });
    },
    build_handoff_payload(handoff) {
      return sanitize({ contract: "Handoff", text: block("Handoff", `다음 Owner ${handoff?.next_owner ?? "-"} / 미확인 ${handoff?.open_items?.length ?? 0}건`) });
    },
    parse_approval_message(text) {
      return { raw_len: String(text ?? "").length, delegated_to: "kernel/guards.parseApproval" };
    },
    thread_key(result) { return result?.duplicate_key ?? null; },
    idempotency_key(result, intent = "") {
      return [result?.duplicate_key ?? "", intent].join("#");
    },

    async preview_write(payload) { record("preview_write", RESULT.OK); return ok({ payload, sent: false }); },
    async commit_write() { record("commit_write", RESULT.READ_ONLY, { error_code: "SEND_DISABLED" }); return fail(RESULT.READ_ONLY, "실제 Slack 발송은 승인 범위가 아니다."); },
    async requery() { return unsupported("requery"); },
    async verify() { return unsupported("verify"); },
    async close() { return ok({ audit_entries: audit.length, sends: 0 }); }
  };
}
