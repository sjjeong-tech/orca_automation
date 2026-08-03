import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { startConsoleServer } from "../console/admin-process-console-server.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(here, "..");
const standaloneHtml = path.join(pluginRoot, "reports", "console-pilot", "request-task-console-v0.4.1.html");
const defaultScreenshot = path.join(pluginRoot, "reports", "console-pilot", "request-task-console-v0.4.1.png");
const chromeCandidates = [
  path.join(process.env.ProgramFiles ?? "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe"),
  path.join(process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)", "Microsoft", "Edge", "Application", "msedge.exe")
];
const expectations = Object.freeze({
  "REQ-DEMO-001": { scenario: "SINGLE-P03-02", fund: "DUMMY-FUND-B", actor: "사람 확인", taskCount: 1, task: "P03", blockers: 2 },
  "REQ-DEMO-002": { scenario: "SINGLE-P03-01", fund: "DUMMY-FUND-A", actor: "지원팀", taskCount: 1, task: "P03", blockers: 2 },
  "REQ-DEMO-003": { scenario: "COMPOSITE-01", fund: "DUMMY-FUND-E", actor: "지원팀", taskCount: 3, task: "P07", blockers: 3 }
});
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(check, label, timeout = 12_000) {
  const started = Date.now(); let last;
  while (Date.now() - started < timeout) { try { const value = await check(); if (value) return value; } catch (error) { last = error; } await delay(80); }
  throw new Error(`Timed out waiting for ${label}${last ? `: ${last.message}` : ""}`);
}

async function findChrome() {
  for (const candidate of chromeCandidates) { try { await fs.access(candidate); return candidate; } catch { /* try next */ } }
  throw new Error("Chrome or Edge headless executable is required for browser E2E.");
}

class Cdp {
  static async connect(url) {
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", () => reject(new Error("CDP connection failed")), { once: true }); });
    return new Cdp(socket);
  }
  constructor(socket) {
    this.socket = socket; this.id = 1; this.pending = new Map(); this.errors = []; this.rejections = [];
    socket.addEventListener("message", (event) => { const message = JSON.parse(event.data); if (message.id) { const pending = this.pending.get(message.id); if (!pending) return; this.pending.delete(message.id); return message.error ? pending.reject(new Error(message.error.message)) : pending.resolve(message.result); } if (message.method === "Runtime.exceptionThrown") { const text = message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text; this.errors.push(text); if (/UnhandledPromiseRejection|Uncaught \(in promise\)/i.test(text)) this.rejections.push(text); } if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") this.errors.push(message.params.args.map((item) => item.value ?? item.description ?? "error").join(" ")); });
  }
  send(method, params = {}) { const id = this.id++; return new Promise((resolve, reject) => { this.pending.set(id, { resolve, reject }); this.socket.send(JSON.stringify({ id, method, params })); }); }
  async eval(expression) { const result = await this.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.text); return result.result.value; }
  async screenshot() { const result = await this.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }); return Buffer.from(result.data, "base64"); }
  close() { this.socket.close(); }
}

async function startBrowser() {
  const executable = await findChrome(); const profile = await fs.mkdtemp(path.join(os.tmpdir(), "vc-console-e2e-")); const port = 9227;
  const child = spawn(executable, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check", "--disable-gpu", "--hide-scrollbars", "--window-size=1440,1500", "about:blank"], { stdio: "ignore", windowsHide: true });
  await waitFor(async () => { const response = await fetch(`http://127.0.0.1:${port}/json/version`); return response.ok; }, "Chrome DevTools");
  return { executable, child, profile, port };
}

async function stopBrowser(browser) {
  if (browser?.child?.exitCode === null) { browser.child.kill(); await Promise.race([new Promise((resolve) => browser.child.once("exit", resolve)), delay(3_000)]); }
  if (browser?.profile) await fs.rm(browser.profile, { recursive: true, force: true, maxRetries: 2, retryDelay: 100 });
}

async function openPage(port, url) {
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: "PUT" })).json();
  const cdp = await Cdp.connect(target.webSocketDebuggerUrl); await cdp.send("Page.enable"); await cdp.send("Runtime.enable"); return cdp;
}

const snapshot = () => `(() => {const selected=document.querySelector('#request-inbox button.selected');const raw=document.querySelector('#raw-json')?.textContent??'{}';let parsed={};try{parsed=JSON.parse(raw)}catch{};const preview=parsed.preview??parsed;return{selected:selected?.dataset.requestId,summary:document.querySelector('#request-panel')?.textContent??'',metadata:document.querySelector('#metadata-panel')?.textContent??'',action:document.querySelector('#current-action-panel')?.textContent??'',kanban:document.querySelector('#kanban')?.textContent??'',hero:document.querySelector('#readiness-hero')?.textContent??'',blockers:document.querySelectorAll('#blocking-reasons .blocking-card').length,planned:document.querySelectorAll('#task-record-previews .planned-task-card').length,approvalDisabled:document.querySelector('#approval-button')?.disabled===true,approvalText:document.querySelector('#approval-status')?.textContent??'',technicalOpen:document.querySelector('#technical-details')?.open===true,rawRequestId:preview.request_id,primaryText:(document.querySelector('#readiness-hero')?.textContent??'')+(document.querySelector('#blocking-reasons')?.textContent??'')}})()`;

async function click(cdp, selector) {
  const point = await cdp.eval(`(() => {const e=document.querySelector(${JSON.stringify(selector)});if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}})()`);
  assert.ok(point, `Element ${selector} must exist.`); await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 }); await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
}

function assertSelection(actual, requestId) {
  const expected = expectations[requestId];
  assert.equal(actual.selected, requestId); assert.match(actual.summary, new RegExp(expected.fund)); assert.match(actual.metadata, new RegExp(expected.scenario)); assert.match(actual.action, new RegExp(expected.actor)); assert.match(actual.kanban, new RegExp(expected.task)); assert.match(actual.hero, /반영 전 확인 필요/); assert.equal(actual.blockers, expected.blockers); assert.equal(actual.planned, expected.taskCount); assert.equal(actual.approvalDisabled, true); assert.match(actual.approvalText, /실제 Notion 반영: 0건/); assert.equal(actual.technicalOpen, false); assert.doesNotMatch(actual.primaryText, /APPROVAL_BLOCKED|NO_MATCH|NOT_WRITTEN/); assert.match(actual.rawRequestId, new RegExp(requestId));
}

async function choose(cdp, requestId) {
  await click(cdp, `#request-inbox button[data-request-id="${requestId}"]`);
  return waitFor(async () => { const current = await cdp.eval(snapshot()); return current.selected === requestId && current.summary.includes(expectations[requestId].fund) && current.planned === expectations[requestId].taskCount ? current : null; }, `${requestId} selection`);
}

async function exercise(cdp, screenshotPath) {
  await waitFor(() => cdp.eval("document.querySelectorAll('#request-inbox button').length === 3 && document.querySelector('#readiness-hero') !== null"), "initial render");
  const sequence = [];
  for (const requestId of ["REQ-DEMO-002", "REQ-DEMO-003", "REQ-DEMO-001", "REQ-DEMO-003", "REQ-DEMO-002"]) { const actual = await choose(cdp, requestId); assertSelection(actual, requestId); sequence.push(requestId); }
  await Promise.all([click(cdp, '#request-inbox button[data-request-id="REQ-DEMO-001"]'), click(cdp, '#request-inbox button[data-request-id="REQ-DEMO-003"]'), click(cdp, '#request-inbox button[data-request-id="REQ-DEMO-002"]')]);
  const rapid = await waitFor(async () => { const current = await cdp.eval(snapshot()); return current.selected === "REQ-DEMO-002" && current.summary.includes("DUMMY-FUND-A") ? current : null; }, "rapid final selection"); assertSelection(rapid, "REQ-DEMO-002");
  const final = await choose(cdp, "REQ-DEMO-001"); assertSelection(final, "REQ-DEMO-001");
  if (screenshotPath) await fs.writeFile(screenshotPath, await cdp.screenshot());
  await click(cdp, "#technical-details > summary"); await waitFor(() => cdp.eval("document.querySelector('#technical-details')?.open === true && document.querySelector('#technical-details')?.textContent.includes('APPROVAL_BLOCKED')"), "technical canonical values");
  return { sequence, rapid_selection: rapid, final };
}

export async function runConsoleBrowserE2E({ screenshotPath = defaultScreenshot } = {}) {
  const server = await startConsoleServer({ port: 0 }); let browser; let serverPage; let staticPage;
  try {
    browser = await startBrowser(); serverPage = await openPage(browser.port, server.url); const serverResult = await exercise(serverPage, screenshotPath); staticPage = await openPage(browser.port, `file:///${standaloneHtml.replace(/\\/g, "/")}`); const staticResult = await exercise(staticPage); assert.equal(serverPage.errors.length, 0, serverPage.errors.join(" | ")); assert.equal(staticPage.errors.length, 0, staticPage.errors.join(" | ")); assert.equal(serverPage.rejections.length + staticPage.rejections.length, 0); return { browser: path.basename(browser.executable), server_url: server.url, server: serverResult, standalone: staticResult, console_errors: [], unhandled_rejections: [] };
  } finally { serverPage?.close(); staticPage?.close(); await stopBrowser(browser); await new Promise((resolve, reject) => server.server.close((error) => error ? reject(error) : resolve())); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) { const result = await runConsoleBrowserE2E(); console.log(`admin-process-console-browser-e2e-v0.4.1: PASS (${result.browser}, server + file static, errors=0)`); }
