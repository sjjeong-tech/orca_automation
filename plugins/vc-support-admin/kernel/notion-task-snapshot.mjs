import { mapNotionTaskToActual } from "./task-actual-compare.mjs";
const aliases = { task_status: ["task_status", "Task 상태"], actor: ["actor", "현재 Actor"], next_action: ["next_action", "다음 Action"], blocker: ["blocker", "Blocker"], evidence_judgment: ["evidence_judgment", "Evidence 판정"], evidence_source: ["evidence_source", "Evidence Source"], evidence_confirmation: ["evidence_confirmation", "Evidence 확인사항"], completion_evidence: ["completion_evidence", "완료증빙"], operational_task_id: ["operational_task_id", "Operational Task ID"], test_case_id: ["test_case_id", "테스트 케이스 ID"] };
const required = ["task_status", "actor", "next_action", "blocker", "evidence_judgment", "evidence_source", "evidence_confirmation", "completion_evidence"];
const now = () => new Date().toLocaleString("sv-SE", { timeZone: "Asia/Seoul", hour12: false }).replace(" ", "T") + "+09:00";
function env(s) { if (s.environment) return String(s.environment).toUpperCase(); if (s.test_lab === true) return "TEST_LAB"; if (s.shadow === true) return "SHADOW"; if (s.test === true) return "TEST"; if (s.database_id && s.data_source_id) return "OPERATIONAL"; return "UNKNOWN"; }
export function mapNotionTaskSnapshot(snapshot = {}) {
  const started = now(), props = snapshot.properties ?? {}, actual = {};
  for (const [canonical, keys] of Object.entries(aliases)) { const key = keys.find((k) => Object.prototype.hasOwnProperty.call(props, k) || Object.prototype.hasOwnProperty.call(snapshot, k)); const value = key ? (props[key] ?? snapshot[key]) : null; actual[canonical] = value ?? null; }
  const warnings = [], process = snapshot.process_id ?? snapshot.processId ?? null, normalizedProcess = process === "E2E-03" ? "P03" : process;
  if (process === "E2E-03") warnings.push("LEGACY_PROCESS_ID_E2E03_NORMALIZED_CANDIDATE");
  const environment_classification = env(snapshot), target = snapshot.target_match_status ?? "NOT_RESOLVED";
  if (!snapshot.data_source_id) warnings.push("DATA_SOURCE_UNCONFIRMED");
  if (!actual.operational_task_id) warnings.push("OPERATIONAL_TASK_ID_MISSING");
  if (environment_classification === "UNKNOWN") warnings.push("ENVIRONMENT_UNKNOWN");
  if (target !== "EXACT_1") warnings.push("TARGET_NOT_EXACT_1");
  const missing_required_properties = required.filter((k) => actual[k] === null || actual[k] === undefined);
  const safety_blocks = [...warnings, ...missing_required_properties.map((k) => `PROPERTY_MISSING:${k}`)];
  return { target_identity: { record_id: snapshot.record_id ?? null, title: snapshot.title ?? null, composite_key: `${normalizedProcess ?? "?"}:${actual.operational_task_id ?? "?"}` }, source_database: snapshot.database_id ?? null, source_data_source: snapshot.data_source_id ?? null, environment_classification, composite_key: `${normalizedProcess ?? "?"}:${actual.operational_task_id ?? "?"}`, mapped_actual_values: mapNotionTaskToActual(actual), unmapped_properties: Object.keys(props).filter((k) => !Object.values(aliases).flat().includes(k)), missing_required_properties, relation_summary: snapshot.relation ?? snapshot.relation_metadata ?? null, target_match_status: target, comparison_ready: safety_blocks.length === 0, safety_blocks, identifier_warning: warnings.filter((w) => w.startsWith("LEGACY_")), normalized_candidate: normalizedProcess ? { process_id: normalizedProcess, e2e_id: "E2E-03", operational_task_id: actual.operational_task_id } : null, actual_notion_write_count: 0, started_at_kst: started, completed_at_kst: now(), elapsed_time_ms: 0 };
}
