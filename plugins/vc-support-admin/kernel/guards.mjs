// Kernel — 승인·중복·Write Guard. Process 비의존.

export const WRITE_MODE = { READ_ONLY: "read_only", PREVIEW_ONLY: "preview_only", TEST_WRITE: "test_write", OPERATING_WRITE: "operating_write" };

const ACTION_WORDS = ["완료", "진행 중", "진행중", "시작", "변경", "기록", "해제"];

export function calculateDuplicateKey({ fund_key, process_id, request_type, record_prefix }) {
  return [fund_key, process_id, request_type, record_prefix].map((v) => v ?? "").join("|");
}

/**
 * 승인은 대상 Task와 변경 행위가 함께 식별될 때만 성립한다.
 * 긍정 표현 자체는 승인이 아니다.
 */
export function parseApproval(text = "", { taskIdPattern = /P0\d-T0\d/, ambiguousPhrases = [] } = {}) {
  const trimmed = String(text ?? "").trim();
  if (!trimmed) return { approved: false, reason: "NO_APPROVAL_INPUT", write_allowed: false };

  const taskMatch = trimmed.match(taskIdPattern);
  const hasAction = ACTION_WORDS.some((w) => trimmed.includes(w));
  const bare = ambiguousPhrases.some((p) => trimmed === p || trimmed === `${p}.` || trimmed === `${p}!`);

  if (bare || !taskMatch || !hasAction) {
    return {
      approved: false,
      reason: "APPROVAL_AMBIGUOUS",
      write_allowed: false,
      missing: [taskMatch ? null : "target_task", hasAction ? null : "change_action"].filter(Boolean),
      question: "어떤 Task를 어떤 값으로 변경할지 명시해주세요. 예: `P03-T01을 완료로 변경`"
    };
  }
  return { approved: true, reason: "EXPLICIT_TARGET_AND_VALUE", write_allowed: true, target_task: taskMatch[0] };
}

/**
 * 실제 Write 직전 최종 관문. 어느 하나라도 실패하면 Write 0.
 */
export function guardWrite({ approval, writeMode, targetTitle = "", allowedPrefixes = [], operatingWriteEnabled = false, reuseExisting = false }) {
  const deny = (code, detail) => ({ allowed: false, code, detail, write_count: 0 });

  if (operatingWriteEnabled) return deny("OPERATING_WRITE_FORBIDDEN", "운영 Write는 이 Plugin에서 허용되지 않는다.");
  if (!approval?.approved) return deny("APPROVAL_REQUIRED", approval?.question ?? "명시 승인이 필요하다.");
  if (writeMode === WRITE_MODE.READ_ONLY || writeMode === WRITE_MODE.PREVIEW_ONLY) {
    return deny("WRITE_MODE_BLOCKS", `write_mode=${writeMode}`);
  }
  if (writeMode === WRITE_MODE.OPERATING_WRITE) return deny("OPERATING_WRITE_FORBIDDEN", "operating_write 모드는 강제 차단된다.");
  if (reuseExisting) return deny("REUSE_EXISTING", "동일 Instance가 존재하므로 신규 Write 없이 재개한다.");
  if (allowedPrefixes.length && !allowedPrefixes.some((p) => targetTitle.startsWith(p))) {
    return deny("PREFIX_NOT_ALLOWED", "승인된 TEST Prefix 범위가 아니다.");
  }
  return { allowed: true, code: "ALLOWED", write_count: null };
}

export function compareExpectedActual(expected = {}, actual = {}) {
  const rows = [];
  for (const [key, exp] of Object.entries(expected)) {
    const act = actual[key];
    rows.push({ item: key, expected: exp, actual: act ?? null, result: JSON.stringify(exp) === JSON.stringify(act) ? "PASS" : "MISMATCH" });
  }
  return { rows, mismatches: rows.filter((r) => r.result === "MISMATCH").length, pass: rows.every((r) => r.result === "PASS") };
}
