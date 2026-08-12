#!/usr/bin/env node

import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";

const usage = () => {
  console.error("Usage: pnpm mcp -- list | call <tool> '<json-input>'");
  process.exit(1);
};

const argv = process.argv.slice(2);
if (argv[0] === "--") argv.shift();
const [command, tool, rawInput] = argv;
if (command !== "list" && command !== "call") usage();
if (command === "call" && (!tool || !rawInput)) usage();

let input = {};
if (rawInput) {
  try {
    input = JSON.parse(rawInput);
  } catch {
    console.error("Tool input must be valid JSON.");
    process.exit(1);
  }
}

const packageInfo = JSON.parse(await readFile(".mcp-package.json", "utf8"));
const packageSpec = `${packageInfo.name}@${packageInfo.version}`;
const child = spawn(
  "pnpm",
  ["--config.minimum-release-age=0", "dlx", packageSpec],
  { cwd: process.cwd(), stdio: ["pipe", "pipe", "pipe"] }
);

child.stderr.on("data", (chunk) => process.stderr.write(chunk));

let buffer = "";
let nextId = 1;
const pending = new Map();
const timeout = setTimeout(() => {
  child.kill("SIGTERM");
  console.error("Timed out waiting for the Starwind MCP server.");
  process.exitCode = 1;
}, 45_000);

function send(message) {
  child.stdin.write(JSON.stringify(message) + "\n");
}

function request(method, params = {}) {
  const id = nextId++;
  send({ jsonrpc: "2.0", id, method, params });
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

child.stdout.on("data", (chunk) => {
  buffer += chunk.toString("utf8");
  while (buffer.includes("\n")) {
    const index = buffer.indexOf("\n");
    const line = buffer.slice(0, index).replace(/\r$/, "");
    buffer = buffer.slice(index + 1);
    if (!line) continue;
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      continue;
    }
    const waiting = pending.get(message.id);
    if (!waiting) continue;
    pending.delete(message.id);
    if (message.error) waiting.reject(new Error(message.error.message));
    else waiting.resolve(message.result);
  }
});

child.on("error", (error) => {
  clearTimeout(timeout);
  console.error(error.message);
  process.exitCode = 1;
});

try {
  const initialized = await request("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "starwind-skill-eval", version: "1.0.0" },
  });
  send({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });

  if (command === "list") {
    const result = await request("tools/list");
    console.log(JSON.stringify({ serverInfo: initialized.serverInfo, ...result }, null, 2));
  } else {
    const result = await request("tools/call", { name: tool, arguments: input });
    const callsFile = packageInfo.auditFile;
    let calls = [];
    try {
      calls = JSON.parse(await readFile(callsFile, "utf8"));
    } catch {}
    calls.push({ serverInfo: initialized.serverInfo, packageSpec, tool, input, result });
    await writeFile(callsFile, JSON.stringify(calls, null, 2) + "\n");
    console.log(JSON.stringify(result, null, 2));
    if (result.isError) process.exitCode = 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  clearTimeout(timeout);
  child.stdin.end();
  setTimeout(() => child.kill("SIGTERM"), 1_000).unref();
}
