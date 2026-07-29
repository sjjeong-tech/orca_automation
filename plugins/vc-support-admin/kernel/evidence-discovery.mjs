const patterns = [
  { type: "SUBMISSION_PACKAGE", task: "P03-T02", words: ["신청서류", "신청 서류", "제출서류", "규약", "명부"] },
  { type: "RECEIPT", task: "P03-T04", words: ["접수증", "접수"] },
  { type: "STAMPED_DOCUMENT", task: "P03-T03", words: ["날인", "인감"] },
  { type: "RESULT_DOCUMENT", task: "P03-T05", words: ["고유번호증", "결과물", "발급"] },
  { type: "SUPPLEMENT", task: "P03-T04", words: ["보완", "추가서류"] },
  { type: "STORAGE_COPY", task: "P03-T06", words: ["저장", "스캔"] },
  { type: "DELIVERY_EVIDENCE", task: "P03-T06", words: ["전달", "관리역"] },
  { type: "SECURITY_CARD", task: null, words: ["보안카드", "OTP"] },
  { type: "BANK_DOCUMENT", task: null, words: ["거래신청서", "계좌개설", "금융거래"] },
  { type: "BANK_SUPPLEMENT", task: null, words: ["은행 보완", "계좌개설 보완"] },
  { type: "ACCOUNT_RESULT", task: null, words: ["통장", "계좌개설 완료"] },
];
function classify(file) { return patterns.find((p) => p.words.some((w) => String(file.name ?? "").includes(w))) ?? null; }
function fundMismatch(file, fund) { return fund && file.fund_name && file.fund_name !== fund; }
export function discoverEvidence({ files = [], fund_name = null, process_id = "P03", include_shortcuts = false, include_zero_byte = false, max_candidates = 100 } = {}) {
  const candidates = [], invalid_candidates = [], unresolved_candidates = [], duplicate_candidates = [];
  for (const file of files) {
    const invalid = file.size === 0 || file.is_shortcut || (!file.path && file.source_type !== "metadata") || fundMismatch(file, fund_name);
    if ((file.is_shortcut && !include_shortcuts) || (file.size === 0 && !include_zero_byte) || invalid) { invalid_candidates.push({ name: file.name, reason: file.size === 0 ? "ZERO_BYTE" : file.is_shortcut ? "INVALID_SHORTCUT" : fundMismatch(file, fund_name) ? "FUND_MISMATCH" : "SOURCE_PATH_MISSING" }); continue; }
    const match = classify(file);
    if (!match) { unresolved_candidates.push({ name: file.name, reason: "UNCLASSIFIED_FILENAME" }); continue; }
    candidates.push({ inventory_id: file.inventory_id ?? file.record_id ?? null, name: file.name, path: file.path ?? null, evidence_type: match.type, task_candidate: match.task, validity: "CANDIDATE", human_confirmation_required: true, confirmation_questions: ["파일 본문·최신본·실물 또는 전달 여부를 확인하세요."], completion_usable: false, modified_at: file.modified_at ?? null });
  }
  const groups = new Map();
  for (const c of candidates) { const key = `${c.evidence_type}:${c.task_candidate ?? ""}`; (groups.get(key) ?? groups.set(key, []).get(key)).push(c); }
  for (const group of groups.values()) if (group.length > 1) { group.sort((a, b) => String(b.modified_at).localeCompare(String(a.modified_at))); duplicate_candidates.push({ evidence_type: group[0].evidence_type, latest_candidate: group[0].name, candidates: group.map((x) => x.name), human_confirmation_required: true }); }
  const limited = candidates.slice(0, max_candidates);
  return { scanned_file_count: files.length, evidence_candidates: limited, invalid_candidates, duplicate_candidates, unresolved_candidates, fund_candidates: fund_name ? [fund_name] : [], process_candidates: process_id ? [process_id] : [], task_candidates: [...new Set(limited.map((x) => x.task_candidate).filter(Boolean))], actual_file_write_count: 0, actual_notion_write_count: 0, recommended_next_action: limited.length ? "Evidence 확인 후 Task Preview" : "파일명·조합·경로를 확인", completion_usable: false };
}
