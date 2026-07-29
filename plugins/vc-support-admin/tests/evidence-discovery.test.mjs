import assert from "node:assert/strict";
import { discoverEvidence } from "../kernel/evidence-discovery.mjs";
const files = [
  { name: "신청서 합본.pdf", path: "p/a", size: 10, modified_at: "2026-07-01" }, { name: "날인본.pdf", path: "p/b", size: 10, modified_at: "2026-07-02" },
  { name: "접수증.pdf", path: "p/c", size: 10, modified_at: "2026-07-03" }, { name: "고유번호증 발급.pdf", path: "p/d", size: 10, modified_at: "2026-07-04" },
  { name: "최종 저장.pdf", path: "p/e", size: 10, modified_at: "2026-07-05" }, { name: "관리역 전달 메모.txt", path: "p/f", size: 10, modified_at: "2026-07-06" },
  { name: "empty.pdf", path: "p/g", size: 0 }, { name: "shortcut.lnk", path: "p/h", size: 10, is_shortcut: true },
  { name: "접수증-v2.pdf", path: "p/i", size: 10, modified_at: "2026-07-07" }, { name: "다른조합 신청서.pdf", path: "p/j", size: 10, fund_name: "Other" },
  { name: "계좌개설 보완.txt", path: "p/k", size: 10 }, { name: "통장 사본.pdf", path: "p/l", size: 10 },
];
const out = discoverEvidence({ files, fund_name: "Alpha", process_id: "P03" });
assert.equal(out.scanned_file_count, 12); assert.ok(out.evidence_candidates.length >= 6); assert.ok(out.invalid_candidates.some((x) => x.reason === "ZERO_BYTE")); assert.ok(out.invalid_candidates.some((x) => x.reason === "INVALID_SHORTCUT")); assert.ok(out.invalid_candidates.some((x) => x.reason === "FUND_MISMATCH")); assert.ok(out.duplicate_candidates.length >= 1); assert.equal(out.completion_usable, false); assert.equal(out.actual_notion_write_count, 0);
console.log("evidence-discovery tests: PASS (12 inventory items, invalid, duplicate, mismatch, human confirmation)");
