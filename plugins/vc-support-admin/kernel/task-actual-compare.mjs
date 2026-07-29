const fields = ["task_status", "actor", "next_action", "blocker", "evidence_judgment", "evidence_source", "evidence_confirmation", "completion_evidence"];
const aliases = new Map([["접수증 본문 확인", "접수증 조합명·접수일 대조"], ["접수증 조합명·접수일 대조", "접수증 본문 확인"]]);
const kst = () => new Date().toLocaleString("sv-SE", { timeZone: "Asia/Seoul", hour12: false }).replace(" ", "T") + "+09:00";
export function mapNotionTaskToActual(row = {}) { return Object.fromEntries(fields.map((key) => [key, row[key] ?? null])); }
export async function fetchTaskByCompositeKey({ provider, task_key }) { return provider?.fetch_task_by_composite_key ? provider.fetch_task_by_composite_key(task_key) : { result: "FIXTURE_ONLY", data: null }; }
export function compareTaskActual({ expected_preview = {}, notion_task_actual = {}, target_match_status = "NOT_RESOLVED", comparison_mode = "exact_then_semantic", semantic_aliases = true, preview_only = true } = {}) {
  const started = kst();
  const actual = mapNotionTaskToActual(notion_task_actual);
  if (!preview_only || target_match_status !== "EXACT_1") return { target: notion_task_actual.task_id ?? null, expected_values: expected_preview.proposed_values ?? expected_preview, actual_values: actual, exact_matches: [], semantic_matches: [], mismatches: [], missing_properties: [], unexpected_values: [], recommended_changes: [], approval_required: false, comparison_result: "BLOCKED", actual_notion_write_count: 0, started_at_kst: started, completed_at_kst: kst(), elapsed_time_ms: 0 };
  const expected = expected_preview.proposed_values ?? expected_preview, exact_matches = [], semantic_matches = [], mismatches = [], missing_properties = [], unexpected_values = [];
  for (const key of fields) {
    if (!(key in expected)) continue;
    if (!(key in notion_task_actual) || notion_task_actual[key] === null || notion_task_actual[key] === undefined) { missing_properties.push(key); continue; }
    if (String(expected[key] ?? "") === String(actual[key] ?? "")) exact_matches.push(key);
    else if (semantic_aliases && aliases.get(String(expected[key])) === String(actual[key])) semantic_matches.push(key);
    else mismatches.push({ property: key, expected: expected[key], actual: actual[key] });
  }
  const result = mismatches.length || missing_properties.length ? "MISMATCH" : semantic_matches.length ? "SEMANTIC_MATCH" : "EXACT_MATCH";
  return { target: notion_task_actual.task_id ?? null, expected_values: expected, actual_values: actual, exact_matches, semantic_matches, mismatches, missing_properties, unexpected_values, recommended_changes: mismatches.map((m) => ({ property: m.property, proposed_value: m.expected })), approval_required: true, comparison_result: result, actual_notion_write_count: 0, started_at_kst: started, completed_at_kst: kst(), elapsed_time_ms: 0 };
}
