// Kernel — Evidence 분류. Process 비의존: 분류 규칙은 Adapter/Profile에서 주입한다.

export const VERDICT = {
  VERIFIED: "VERIFIED",
  CANDIDATE: "CANDIDATE",
  UNVERIFIED_SHORTCUT: "UNVERIFIED_SHORTCUT",
  ZERO_BYTE: "ZERO_BYTE",
  STALE_OR_DUPLICATE: "STALE_OR_DUPLICATE",
  MISSING: "MISSING",
  ACCESS_BLOCKED: "ACCESS_BLOCKED"
};

const COUNTS = new Set([VERDICT.VERIFIED]);

export function classifyEvidence(files = [], rules = []) {
  const seen = new Map();
  const classified = files.map((file) => {
    const name = file.name ?? "";
    const ext = (file.extension ?? name.split(".").pop() ?? "").toLowerCase();
    const size = Number(file.size ?? 0);

    let type = null;
    for (const rule of rules) {
      const matched = (rule.signals ?? []).some((s) => name.includes(s));
      const excluded = (rule.exclude_signals ?? []).some((s) => name.includes(s));
      if (matched && !excluded) { type = rule.type; break; }
    }

    let verdict;
    if (file.access_blocked) verdict = VERDICT.ACCESS_BLOCKED;
    else if (ext === "lnk") verdict = VERDICT.UNVERIFIED_SHORTCUT;
    else if (size === 0) verdict = VERDICT.ZERO_BYTE;
    else if (!type) verdict = VERDICT.CANDIDATE;
    else verdict = VERDICT.VERIFIED;

    return {
      name,
      type,
      verdict,
      counts_as_evidence: COUNTS.has(verdict),
      source_layer: file.source_layer ?? null,
      modified: file.modified ?? null
    };
  });

  // 동일 type이 복수 위치에 있으면 오류가 아니라 최신본 판단 대상으로 표시한다.
  for (const item of classified) {
    if (!item.type || !item.counts_as_evidence) continue;
    const prior = seen.get(item.type);
    if (prior) { prior.duplicate_group = item.type; item.duplicate_group = item.type; }
    else seen.set(item.type, item);
  }
  return classified;
}

export function summarizeEvidence(classified = []) {
  const byType = {};
  for (const e of classified) {
    if (!e.counts_as_evidence || !e.type) continue;
    (byType[e.type] ??= []).push(e.name);
  }
  return {
    counted_types: Object.keys(byType).sort(),
    by_type: byType,
    duplicate_types: [...new Set(classified.filter((e) => e.duplicate_group).map((e) => e.duplicate_group))],
    rejected: classified.filter((e) => !e.counts_as_evidence).map((e) => ({ name: e.name, verdict: e.verdict }))
  };
}

// Document Profile 기반 유형 식별. Profile이 없으면 null 반환(추정하지 않는다).
export function identifyDocument(file, profiles = []) {
  const name = file.name ?? "";
  const ext = (file.extension ?? name.split(".").pop() ?? "").toLowerCase();
  for (const p of profiles) {
    const extOk = !p.file_extensions?.length || p.file_extensions.includes(ext);
    const markerHit = (p.text_markers ?? []).filter((m) => name.includes(m)).length;
    const excluded = (p.exclude_markers ?? []).some((m) => name.includes(m));
    if (extOk && markerHit > 0 && !excluded) {
      return { profile_id: p.profile_id, evidence_type: p.evidence_type, matched_markers: markerHit, confidence: markerHit > 1 ? "HIGH" : "MEDIUM" };
    }
  }
  return null;
}
