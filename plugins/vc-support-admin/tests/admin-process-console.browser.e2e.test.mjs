import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { startConsoleServer } from "../console/admin-process-console-server.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(here, "..");
const standaloneHtml = path.join(pluginRoot, "reports", "console-pilot", "request-task-console-v0.3.1.html");
const chromeCandidates = [
  path.join(process.env.ProgramFiles ?? "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe"),
  path.join(process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)", "Microsoft", "Edge", "Application", "msedge.exe")
];

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitFor(check, label, timeoutMs = 12_000) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      const value = await check();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await delay(80);
  }
  throw new Error(`Timed out waiting for ${label}${lastError ? `: ${lastError.message}` : ""}`);
}

async function findChrome() {
  for (const candidate of chromeCandidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Continue to the next installed browser candidate.
    }
  }
  throw new Error("Chrome or Edge headless executable is required for console browser E2E.");
}

async function startChrome() {
  const executable = await findChrome();
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), "vc-console-e2e-"));
  const debugPort = 9227;
  const child = spawn(executable, [
    "--headless=new",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--hide-scrollbars",
    "--window-size=1440,1500",
    "about:blank"
  ], { stdio: "ignore", windowsHide: true });
  await waitFor(async () => {
    const response = await fetch(`http://127.0.0.1:${debugPort}/json/version`);
    return response.ok ? response.json() : null;
  }, "Chrome DevTools");
  return { child, debugPort, profile, executable };
}

async function stopChrome(browser) {
  if (browser?.child && browser.child.exitCode === null) {
    browser.child.kill();
    await Promise.race([
      new Promise((resolve) => browser.child.once("exit", resolve)),
      delay(3_000)
    ]);
  }
  if (!browser?.profile) return;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await fs.rm(browser.profile, { recursive: true, force: true, maxRetries: 2, retryDelay: 100 });
      return;
    } catch (error) {
      if (attempt === 4) throw error;
      await delay(200);
    }
  }
}

class CdpClient {
  static async connect(webSocketUrl) {
    const socket = new WebSocket(webSocketUrl);
    await new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", () => reject(new Error("CDP WebSocket connection failed.")), { once: true });
    });
    return new CdpClient(socket);
  }

  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.consoleErrors = [];
    this.unhandledRejections = [];
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
        return;
      }
      if (message.method === "Runtime.exceptionThrown") {
        const description = message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text;
        this.consoleErrors.push(description);
        if (/UnhandledPromiseRejection|Uncaught \(in promise\)/i.test(description)) this.unhandledRejections.push(description);
      }
      if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
        this.consoleErrors.push(message.params.args.map((item) => item.value ?? item.description ?? "error").join(" "));
      }
      if (message.method === "Log.entryAdded" && ["error", "fatal"].includes(message.params.entry.level)) this.consoleErrors.push(message.params.entry.text);
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  }

  async screenshot() {
    const result = await this.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
    return Buffer.from(result.data, "base64");
  }

  close() {
    this.socket.close();
  }
}

async function openPage(debugPort, url) {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  const target = await response.json();
  const cdp = await CdpClient.connect(target.webSocketDebuggerUrl);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Log.enable");
  return cdp;
}

function clientSnapshotExpression() {
  return `(() => {
    const selected = document.querySelector('#request-inbox button.selected');
    const raw = document.querySelector('#raw-json')?.textContent ?? '{}';
    let parsed = {}; try { parsed = JSON.parse(raw); } catch {}
    const preview = parsed.preview ?? parsed;
    return {
      selected_request_id: selected?.dataset.requestId ?? selected?.querySelector('.inbox-id')?.textContent?.trim(),
      request_text: document.querySelector('#request-panel')?.textContent ?? document.querySelector('#request-summary')?.textContent ?? '',
      metadata_text: document.querySelector('#metadata-panel')?.textContent || document.querySelector('#request-summary')?.textContent || '',
      current_action: document.querySelector('#current-action-panel')?.textContent ?? document.querySelector('#current-action')?.textContent ?? '',
      kanban: document.querySelector('#kanban')?.textContent ?? '',
      interaction: document.querySelector('#interaction-panel')?.textContent ?? document.querySelector('#interaction')?.textContent ?? '',
      evidence: document.querySelector('#evidence-panel')?.textContent ?? document.querySelector('#evidence')?.textContent ?? '',
      execution: document.querySelector('#execution-panel')?.textContent ?? document.querySelector('#execution')?.textContent ?? '',
      timeline: document.querySelector('#timeline')?.textContent ?? '',
      mapping_visible: !document.querySelector('#mapping-section')?.hidden,
      mapping_task_count: document.querySelectorAll('#task-record-previews article').length || Number((document.querySelector('#task-record-title')?.textContent ?? '').match(/\\d+/)?.[0] ?? 0),
      raw_request_id: preview.request_id ?? parsed.request_id,
      approval_state: document.querySelector('#approval-status')?.textContent ?? document.querySelector('#approval-state')?.textContent ?? '',
      write_text: document.body.textContent.includes('Write Count 0') || document.body.textContent.includes('Count 0')
    };
  })()`;
}

async function clickRequest(cdp, requestId) {
  const point = await cdp.evaluate(`(() => {
    const button = document.querySelector('#request-inbox button[data-request-id="${requestId}"]');
    if (!button) return null;
    button.scrollIntoView({ block: 'center', inline: 'center' });
    const rect = button.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  })()`);
  assert.ok(point, `Inbox button ${requestId} must exist.`);
  await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
}

async function clickSelector(cdp, selector) {
  const point = await cdp.evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) return null; element.scrollIntoView({ block: 'center' }); const rect = element.getBoundingClientRect(); return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; })()`);
  assert.ok(point, `Element ${selector} must exist.`);
  await cdp.send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
  await cdp.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
  await delay(80);
}

const expectations = Object.freeze({
  "REQ-DEMO-001": { scenario: "SINGLE-P03-02", fund: "DUMMY-FUND-B", actor: "사람 확인", taskCount: 1, currentTask: "P03", status: "확인 필요" },
  "REQ-DEMO-002": { scenario: "SINGLE-P03-01", fund: "DUMMY-FUND-A", actor: "지원팀", taskCount: 1, currentTask: "P03", status: "완료 후보" },
  "REQ-DEMO-003": { scenario: "COMPOSITE-01", fund: "DUMMY-FUND-E", actor: "지원팀", taskCount: 3, currentTask: "P07", status: "부분 중단" }
});

function assertSelection(snapshot, requestId, { requireMapping = false } = {}) {
  const expected = expectations[requestId];
  assert.equal(snapshot.selected_request_id, requestId, `${requestId}: selected inbox item`);
  assert.match(snapshot.request_text, new RegExp(expected.fund));
  assert.match(snapshot.metadata_text, new RegExp(expected.scenario));
  assert.match(snapshot.current_action, new RegExp(expected.actor));
  assert.match(snapshot.kanban, new RegExp(expected.currentTask));
  assert.match(snapshot.raw_request_id, new RegExp(requestId));
  assert.equal(snapshot.write_text, true);
  if (requireMapping) assert.equal(snapshot.mapping_task_count, expected.taskCount, `${requestId}: mapping task count`);
}

async function waitForSelection(cdp, requestId, options = {}) {
  return waitFor(async () => {
    const snapshot = await cdp.evaluate(clientSnapshotExpression());
    if (snapshot.selected_request_id !== requestId || !snapshot.request_text.includes(expectations[requestId].fund)) return null;
    if (options.requireMapping && snapshot.mapping_task_count !== expectations[requestId].taskCount) return null;
    return snapshot;
  }, `${requestId} render`);
}

async function exerciseServer(cdp, screenshotPaths) {
  await waitFor(() => cdp.evaluate("document.querySelectorAll('#request-inbox button').length === 3 && document.querySelector('#console-content')?.hidden === false"), "server initial render");
  const evidence = [];
  for (const requestId of ["REQ-DEMO-002", "REQ-DEMO-003", "REQ-DEMO-001", "REQ-DEMO-003", "REQ-DEMO-002"]) {
    await clickRequest(cdp, requestId);
    const snapshot = await waitForSelection(cdp, requestId);
    assertSelection(snapshot, requestId);
    await clickSelector(cdp, "#mapping-preview-button");
    const mapped = await waitForSelection(cdp, requestId, { requireMapping: true });
    assertSelection(mapped, requestId, { requireMapping: true });
    evidence.push({ request_id: requestId, snapshot: mapped });
  }

  await clickRequest(cdp, "REQ-DEMO-001");
  await waitForSelection(cdp, "REQ-DEMO-001");
  await clickSelector(cdp, "#mapping-preview-button");
  await waitForSelection(cdp, "REQ-DEMO-001", { requireMapping: true });
  await clickSelector(cdp, "#open-approval-drawer");
  await waitFor(() => cdp.evaluate("document.querySelector('#approval-drawer')?.open === true"), "approval drawer");
  await clickSelector(cdp, "#approval-button");
  await waitFor(() => cdp.evaluate("document.querySelector('#approval-status')?.textContent.includes('APPROVED_FOR_TEST_WRITE')"), "approval simulation");
  await clickSelector(cdp, "#close-approval-drawer");
  await waitFor(() => cdp.evaluate("document.querySelector('#approval-drawer')?.open === false"), "approval drawer close");
  await clickRequest(cdp, "REQ-DEMO-002");
  const resetSnapshot = await waitForSelection(cdp, "REQ-DEMO-002");
  assert.match(resetSnapshot.approval_state, /NOT_REVIEWED/);
  assert.equal(resetSnapshot.mapping_visible, false);

  await Promise.all([clickRequest(cdp, "REQ-DEMO-001"), clickRequest(cdp, "REQ-DEMO-003"), clickRequest(cdp, "REQ-DEMO-002")]);
  const rapidSnapshot = await waitForSelection(cdp, "REQ-DEMO-002");
  assertSelection(rapidSnapshot, "REQ-DEMO-002");

  if (screenshotPaths?.server) await fs.writeFile(screenshotPaths.server, await cdp.screenshot());
  return { sequence: evidence, approval_reset: resetSnapshot, rapid_selection: rapidSnapshot };
}

async function exerciseStandalone(cdp, screenshotPaths) {
  await waitFor(() => cdp.evaluate("window.__consoleReady === true && document.querySelectorAll('#request-inbox button').length === 3"), "standalone initial render");
  const evidence = [];
  for (const requestId of ["REQ-DEMO-002", "REQ-DEMO-003", "REQ-DEMO-001"]) {
    await clickRequest(cdp, requestId);
    const snapshot = await waitForSelection(cdp, requestId, { requireMapping: true });
    assertSelection(snapshot, requestId, { requireMapping: true });
    assert.match(snapshot.approval_state, /NOT_REVIEWED/);
    evidence.push({ request_id: requestId, snapshot });
    if (screenshotPaths?.[requestId]) await fs.writeFile(screenshotPaths[requestId], await cdp.screenshot());
  }
  await clickSelector(cdp, "#static-approval-button");
  await waitFor(() => cdp.evaluate("window.__consoleDiagnostics.approvalStatus === 'APPROVED_FOR_TEST_WRITE'"), "standalone approval simulation");
  await clickRequest(cdp, "REQ-DEMO-002");
  const resetSnapshot = await waitForSelection(cdp, "REQ-DEMO-002", { requireMapping: true });
  assert.match(resetSnapshot.approval_state, /NOT_REVIEWED/);
  return { sequence: evidence, approval_reset: resetSnapshot };
}

export async function runConsoleBrowserE2E({ screenshotPaths } = {}) {
  const server = await startConsoleServer({ port: 0 });
  let browser;
  let serverPage;
  let standalonePage;
  try {
    browser = await startChrome();
    serverPage = await openPage(browser.debugPort, server.url);
    const serverResult = await exerciseServer(serverPage, screenshotPaths);
    standalonePage = await openPage(browser.debugPort, `file:///${standaloneHtml.replace(/\\/g, "/")}`);
    const standaloneResult = await exerciseStandalone(standalonePage, screenshotPaths);
    assert.equal(serverPage.consoleErrors.length, 0, `Server browser errors: ${serverPage.consoleErrors.join(" | ")}`);
    assert.equal(standalonePage.consoleErrors.length, 0, `Standalone browser errors: ${standalonePage.consoleErrors.join(" | ")}`);
    assert.equal(serverPage.unhandledRejections.length + standalonePage.unhandledRejections.length, 0);
    return {
      browser: path.basename(browser.executable),
      server_url: server.url,
      server: serverResult,
      standalone: standaloneResult,
      console_errors: [],
      unhandled_rejections: []
    };
  } finally {
    serverPage?.close();
    standalonePage?.close();
    await stopChrome(browser);
    await new Promise((resolve, reject) => server.server.close((error) => error ? reject(error) : resolve()));
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await runConsoleBrowserE2E();
  console.log(`admin-process-console-browser-e2e: PASS (${result.browser}, server + file static, errors=0)`);
}
