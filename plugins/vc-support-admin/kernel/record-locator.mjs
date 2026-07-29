function layerOf(record = {}) {
  if (record.layer) return String(record.layer).toUpperCase();
  const text = `${record.title ?? record.name ?? ""} ${record.source ?? ""}`;
  if (/SHADOW/i.test(text)) return "SHADOW";
  if (/LAB/i.test(text)) return "LAB";
  if (/TEST/i.test(text)) return "TEST";
  return "OPERATING";
}
function eligible(rows, include, excluded) {
  const out = [];
  for (const row of rows ?? []) {
    const layer = layerOf(row);
    const allowed = layer === "OPERATING" || (layer === "TEST" && include.include_test) || (layer === "SHADOW" && include.include_shadow) || (layer === "LAB" && include.include_lab);
    if (allowed) out.push({ ...row, layer }); else excluded[layer.toLowerCase()]?.push(row.title ?? row.name ?? "(untitled)");
  }
  return out;
}
const status = (rows) => rows.length === 1 ? "EXACT_1" : rows.length > 1 ? "MULTIPLE" : "NOT_FOUND";
export function locateOperationalRecords({ fund_name, include_test = false, include_shadow = false, include_lab = false, master_matches = [], fund_work_matches = [], request_matches = [], task_matches = [] } = {}) {
  const excluded = { test: [], shadow: [], lab: [] }, include = { include_test, include_shadow, include_lab };
  const master = eligible(master_matches, include, excluded), work = eligible(fund_work_matches, include, excluded), requests = eligible(request_matches, include, excluded), tasks = eligible(task_matches, include, excluded);
  const layer_results = { master: status(master), fund_work: status(work), request: status(requests), task: status(tasks) }, ambiguous = Object.values(layer_results).some((v) => v === "MULTIPLE");
  const recommended_action = ambiguous ? "BLOCK_AND_ASK" : layer_results.master === "EXACT_1" && (work.length || requests.length) ? "RESUME_EXISTING" : layer_results.master === "EXACT_1" ? "CREATE_PREVIEW" : "BLOCK_AND_ASK";
  return { master_matches: master, fund_work_matches: work, request_matches: requests, task_matches: tasks, layer_results, operational_match_status: layer_results.master, duplicate_risk: requests.length > 1 ? "MULTIPLE_REQUESTS" : requests.length === 1 ? "EXISTING_REQUEST" : "NONE", excluded_test_records: excluded.test, excluded_shadow_records: excluded.shadow, excluded_lab_records: excluded.lab, recommended_action, ambiguity: ambiguous ? "MULTIPLE_CANDIDATES" : null, missing_information: fund_name ? [] : ["fund_name"], actual_write_count: 0 };
}
export async function locateOperationalRecord({ notion, ...input } = {}) {
  if (!notion || !input.fund_name) return locateOperationalRecords(input);
  const [master, work, requests, tasks] = await Promise.all([notion.resolve_fund_master(input.fund_name), notion.resolve_fund_work_record(input.fund_name), notion.find_requests({ titleContains: input.fund_name }), notion.find_tasks({ titleContains: input.fund_name })]);
  return locateOperationalRecords({ ...input, master_matches: master.data ?? [], fund_work_matches: work.data ?? [], request_matches: requests.data ?? [], task_matches: tasks.data ?? [] });
}
