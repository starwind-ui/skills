#!/usr/bin/env node

import { cp, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const repo = path.resolve(import.meta.dirname, "..");
const runsRoot = path.join(repo, ".eval-runs");
const workspacesRoot = path.join("/tmp", "starwind-skill-evals");
const suites = ["starwind-ui", "starwind-pro", "starwind-mcp"];
const excludedEvidenceRoots = new Set([".astro", ".skills", "dist", "node_modules"]);

function usage(message) {
  if (message) console.error(message);
  console.error(
    "Usage:\n" +
    "  node evals/run.mjs list\n" +
    "  node evals/run.mjs prepare --case <id|all> --model <label> [--suite <name>] [--batch <name>] [--surface <name>] [--tier <static|integration>]\n" +
    "  node evals/run.mjs score --run <workspace>\n" +
    "  node evals/run.mjs report --batch <name>"
  );
  process.exit(1);
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = {};
  for (let i = 0; i < rest.length; i += 2) {
    if (!rest[i]?.startsWith("--") || rest[i + 1] === undefined) {
      usage("Invalid argument: " + (rest[i] ?? ""));
    }
    options[rest[i].slice(2)] = rest[i + 1];
  }
  return { command, options };
}

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

async function getCases() {
  const result = [];
  for (const suite of suites) {
    const data = await readJson(path.join(repo, "evals", suite, "cases.json"));
    for (const entry of data.cases) {
      result.push({
        ...entry,
        suite,
        skill: entry.skill ?? data.skill,
        skillName: entry.skill_name ?? data.skill_name ?? suite,
      });
    }
  }
  return result;
}

function safeSegment(value, label) {
  if (!/^[a-zA-Z0-9._-]+$/.test(value)) usage("Unsafe " + label + ": " + value);
  return value;
}

function git(...args) {
  try {
    return execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

async function filesBelow(root, prefix = "") {
  const found = [];
  const entries = (await readdir(root, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of entries) {
    const relative = path.join(prefix, entry.name);
    const rootSegment = relative.split(path.sep)[0];
    if (excludedEvidenceRoots.has(rootSegment)) continue;
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) found.push(...await filesBelow(absolute, relative));
    else found.push(relative);
  }
  return found;
}

function runFixtureCommand(command, cwd, stdio = "pipe") {
  try {
    const output = execFileSync(command[0], command.slice(1), {
      cwd,
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
      stdio
    });
    return { command, passed: true, output: output ?? "" };
  } catch (error) {
    return { command, passed: false, output: String(error.stdout ?? "") + String(error.stderr ?? error.message) };
  }
}

async function prepare(caseId, modelLabel, batch, surface, tier, suiteFilter) {
  const models = (await readJson(path.join(repo, "evals", "models.json"))).models;
  const model = models[modelLabel];
  if (!model) usage("Unknown model label: " + modelLabel);
  if (!new Set(["static", "integration"]).has(tier)) usage("Unknown validation tier: " + tier);
  const cases = await getCases();
  const selected = (caseId === "all" ? cases : cases.filter((entry) => entry.id === caseId))
    .filter((entry) => !suiteFilter || entry.suite === suiteFilter);
  if (!selected.length) usage("Unknown case: " + caseId);

  for (const entry of selected) {
    if (tier === "integration" && !entry.integration?.commands?.length) {
      usage("Integration tier is not configured for case: " + entry.id);
    }
    const evidenceDir = path.join(
      runsRoot,
      safeSegment(batch, "batch"),
      safeSegment(entry.id, "case"),
      safeSegment(modelLabel, "model")
    );
    const workspace = path.join(
      workspacesRoot,
      safeSegment(batch, "batch"),
      safeSegment(entry.id, "case"),
      safeSegment(modelLabel, "model")
    );
    try {
      await stat(evidenceDir);
      usage("Run already exists: " + path.relative(repo, evidenceDir));
    } catch {}

    const fixture = path.join(repo, "evals", entry.suite, "fixtures", entry.fixture);
    await mkdir(evidenceDir, { recursive: true });
    await mkdir(path.dirname(workspace), { recursive: true });
    await cp(fixture, workspace, { recursive: true, errorOnExist: true, force: false });
    if (tier === "integration" && entry.integration?.install) {
      const install = runFixtureCommand(
        ["pnpm", "install", "--frozen-lockfile", "--ignore-scripts"],
        workspace,
        "inherit"
      );
      if (!install.passed) throw new Error("Dependency bootstrap failed for " + entry.id);
      if (entry.integration.browser) {
        const browser = runFixtureCommand(
          ["pnpm", "exec", "playwright", "install", "chromium"],
          workspace,
          "inherit"
        );
        if (!browser.passed) throw new Error("Browser bootstrap failed for " + entry.id);
      }
    }
    const validationContext = tier === "integration"
      ? " Fixture dependencies are already installed; run the available validation without changing them."
      : " Run any validation already available without downloading anything.";

    let mcpPackage;
    if (entry.mcp) {
      const version = execFileSync("npm", ["view", "@starwind-ui/mcp@latest", "version"], {
        cwd: workspace,
        encoding: "utf8",
      }).trim();
      mcpPackage = { name: "@starwind-ui/mcp", version };
      await mkdir(path.join(workspace, "scripts"), { recursive: true });
      await cp(
        path.join(repo, "evals", "starwind-mcp", "mcp-call.mjs"),
        path.join(workspace, "scripts", "mcp-call.mjs")
      );
      await writeFile(
        path.join(workspace, ".mcp-package.json"),
        JSON.stringify({
          ...mcpPackage,
          auditFile: path.join(evidenceDir, "mcp-calls.json"),
        }, null, 2) + "\n"
      );
      const warm = runFixtureCommand(
        ["pnpm", "--config.minimum-release-age=0", "dlx", `@starwind-ui/mcp@${version}`],
        workspace
      );
      if (!warm.passed) throw new Error("Unable to cache @starwind-ui/mcp@" + version);
    }

    const skillPath = path.join(workspace, ".skills", entry.skillName);
    await mkdir(path.dirname(skillPath), { recursive: true });
    await cp(path.join(repo, entry.skill), skillPath, {
      recursive: true,
      errorOnExist: true,
      force: false
    });
    const prompt =
      "Use $" + entry.skillName + " at " + skillPath + " to complete this request in " + workspace + ".\n\n" +
      entry.prompt +
      "\n\nWork only in the project directory and the named skill directory. Do not install dependencies. " +
      (entry.mcp
        ? "Use external network access only through the provided MCP command; request it if the sandbox requires approval. "
        : "Do not use the network. ") +
      "Complete the requested work." + validationContext + " " +
      "When finished, write the same concise handoff you would give the user to RESULT.md in the project root.";

    const baseline = {};
    for (const file of await filesBelow(workspace)) {
      if (!file.startsWith(".skills/")) {
        baseline[file] = sha256(await readFile(path.join(workspace, file)));
      }
    }
    const metadata = {
      schema_version: 2,
      validation_tier: tier,
      batch,
      case_id: entry.id,
      case_hash: sha256(JSON.stringify(entry)),
      suite: entry.suite,
      scenario_type: entry.scenario_type,
      model_label: modelLabel,
      ...model,
      execution_surface: surface,
      ...(mcpPackage ? { mcp_package: mcpPackage } : {}),
      skill_path: entry.skill,
      skill_commit: git("rev-parse", "HEAD"),
      skill_tree: git("rev-parse", "HEAD:" + entry.skill),
      prepared_at: new Date().toISOString(),
      prompt,
      workspace,
      baseline
    };
    await writeFile(
      path.join(evidenceDir, "metadata.json"),
      JSON.stringify(metadata, null, 2) + "\n"
    );

    console.log("\n=== " + entry.id + " / " + modelLabel + " ===");
    console.log("Evidence: " + path.relative(repo, evidenceDir));
    console.log("Workspace: " + workspace);
    console.log(prompt);
  }
}

function nestedValue(value, dottedPath) {
  return dottedPath.split(".").reduce((current, key) => current?.[key], value);
}

function assertionRegExp(pattern, flags = "m") {
  if (pattern.startsWith("(?i)")) {
    pattern = pattern.slice(4);
    if (!flags.includes("i")) flags += "i";
  }
  return new RegExp(pattern, flags);
}

function cssVariableCounts(value, except = []) {
  const ignored = new Set(except);
  const counts = new Map();
  for (const match of value.matchAll(/^\s*(--[A-Za-z0-9_-]+)\s*:\s*([^;]+);/gm)) {
    const [, name, rawValue] = match;
    if (ignored.has(name)) continue;
    const declaration = name + ":" + rawValue.replace(/\s+/g, "");
    counts.set(declaration, (counts.get(declaration) ?? 0) + 1);
  }
  return counts;
}

function cssVariableNameCounts(value, only = []) {
  const included = new Set(only);
  const counts = new Map();
  for (const match of value.matchAll(/^\s*(--[A-Za-z0-9_-]+)\s*:/gm)) {
    const name = match[1];
    if (!included.has(name)) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return counts;
}

function containsCounts(actual, expected) {
  return [...expected].every(([declaration, count]) => (actual.get(declaration) ?? 0) >= count);
}

function templateMarkup(value) {
  return value
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, "");
}

function hasNestedTag(value, tag) {
  let depth = 0;
  const pattern = new RegExp("<\\/?" + tag + "\\b[^>]*>", "g");
  for (const match of templateMarkup(value).matchAll(pattern)) {
    const token = match[0];
    if (token.startsWith("</")) {
      depth = Math.max(0, depth - 1);
    } else if (!token.endsWith("/>")) {
      if (depth > 0) return true;
      depth += 1;
    }
  }
  return false;
}

function hasControlName(content, component, name) {
  const literal = new RegExp(
    `<${component}\\b[^>]*\\bname=["'][^"']*${name}[^"']*["']`,
    "ims"
  );
  if (literal.test(content)) return true;

  const dataDrivenControl = new RegExp(
    "<" + component + "\\b[^>]*\\bname=\\{[^}]*\\.name\\}",
    "ms"
  );
  const declaredName = new RegExp(`\\bname\\s*:\\s*["'][^"']*${name}[^"']*["']`, "i");
  return dataDrivenControl.test(content) && declaredName.test(content) && /\.map\s*\(/.test(content);
}

async function sameTree(workspaceRoot, fixtureRoot, relativeRoot) {
  const workspaceTree = path.join(workspaceRoot, relativeRoot);
  const fixtureTree = path.join(fixtureRoot, relativeRoot);
  try {
    const [workspaceFiles, fixtureFiles] = await Promise.all([
      filesBelow(workspaceTree),
      filesBelow(fixtureTree)
    ]);
    if (JSON.stringify(workspaceFiles) !== JSON.stringify(fixtureFiles)) return false;
    for (const file of fixtureFiles) {
      const [actual, baseline] = await Promise.all([
        readFile(path.join(workspaceTree, file)),
        readFile(path.join(fixtureTree, file))
      ]);
      if (!actual.equals(baseline)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function evaluate(assertion, workspace, fixtureRoot, evidenceDir) {
  let content = "";
  let exists = false;
  if (assertion.file) {
    try {
      content = await readFile(path.join(assertion.evidence ? evidenceDir : workspace, assertion.file), "utf8");
      exists = true;
    } catch {}
  }

  let passed = false;
  if (assertion.type === "file_exists") {
    passed = exists;
  } else if (assertion.type === "non_empty_file") {
    passed = exists && content.trim().length > 0;
  } else if (assertion.type === "file_not_exists") {
    passed = !exists;
  } else if (assertion.type === "contains") {
    passed = exists && assertionRegExp(assertion.pattern, assertion.flags).test(content);
  } else if (assertion.type === "not_contains") {
    passed = !exists || !assertionRegExp(assertion.pattern, assertion.flags).test(content);
  } else if (assertion.type === "json_equals") {
    try {
      passed = nestedValue(JSON.parse(content), assertion.path) === assertion.value;
    } catch {}
  } else if (assertion.type === "json_array_some") {
    try {
      const values = JSON.parse(content);
      passed = Array.isArray(values) && values.some((value) =>
        Object.entries(assertion.matches).every(([key, expected]) =>
          JSON.stringify(nestedValue(value, key)) === JSON.stringify(expected)
        )
      );
    } catch {}
  } else if (assertion.type === "mcp_server_version") {
    try {
      const calls = JSON.parse(content);
      const pinned = JSON.parse(await readFile(path.join(workspace, assertion.package_file), "utf8"));
      passed = Array.isArray(calls) && calls.length > 0 && calls.every((call) =>
        call.packageSpec === `${pinned.name}@${pinned.version}` &&
        call.serverInfo?.name === pinned.name &&
        call.serverInfo?.version === pinned.version
      );
    } catch {}
  } else if (assertion.type === "css_variables_preserved") {
    try {
      const baseline = await readFile(path.join(fixtureRoot, assertion.file), "utf8");
      const mutable = assertion.mutable ?? [];
      passed = exists &&
        containsCounts(cssVariableCounts(content, mutable), cssVariableCounts(baseline, mutable)) &&
        containsCounts(cssVariableNameCounts(content, mutable), cssVariableNameCounts(baseline, mutable));
    } catch {}
  } else if (assertion.type === "preserves") {
    try {
      const baseline = await readFile(path.join(fixtureRoot, assertion.file), "utf8");
      passed = assertion.patterns.every((pattern) => {
        const match = baseline.match(new RegExp(pattern, "m"));
        return match && content.includes(match[0]);
      });
    } catch {}
  } else if (assertion.type === "no_nested_tag") {
    passed = exists && !hasNestedTag(content, assertion.tag);
  } else if (assertion.type === "control_names") {
    passed = exists && assertion.names.every((name) => hasControlName(content, assertion.component, name));
  } else if (assertion.type === "file_unchanged") {
    try {
      const baseline = await readFile(path.join(fixtureRoot, assertion.file), "utf8");
      passed = exists && content === baseline;
    } catch {}
  } else if (assertion.type === "contains_any") {
    if (!Array.isArray(assertion.files)) {
      throw new Error("contains_any assertion needs a files array: " + assertion.description);
    }
    for (const file of assertion.files) {
      try {
        const text = await readFile(path.join(assertion.evidence ? evidenceDir : workspace, file), "utf8");
        if (assertionRegExp(assertion.pattern, assertion.flags).test(text)) {
          passed = true;
          break;
        }
      } catch {}
    }
  } else if (assertion.type === "tree_unchanged") {
    passed = await sameTree(workspace, fixtureRoot, assertion.path);
  } else {
    throw new Error("Unknown assertion type: " + assertion.type);
  }

  return {
    description: assertion.description,
    passed,
    hard: Boolean(assertion.hard),
    weight: assertion.weight ?? 1
  };
}

async function score(runArg) {
  const evidenceDir = path.resolve(repo, runArg);
  const metadata = await readJson(path.join(evidenceDir, "metadata.json"));
  const workspace = metadata.workspace;
  const entry = (await getCases()).find((candidate) => candidate.id === metadata.case_id);
  if (!entry) usage("Case no longer exists: " + metadata.case_id);
  if (metadata.case_hash !== sha256(JSON.stringify(entry))) {
    throw new Error("Case changed after this run was prepared: " + metadata.case_id);
  }

  const fixtureRoot = path.join(repo, "evals", entry.suite, "fixtures", entry.fixture);
  const results = [];
  for (const assertion of entry.assertions) {
    results.push(await evaluate(assertion, workspace, fixtureRoot, evidenceDir));
  }
  results.push(await evaluate({
    type: "non_empty_file",
    file: "RESULT.md",
    description: "Writes a non-empty user handoff",
    weight: 1,
    hard: true
  }, workspace, fixtureRoot, evidenceDir));
  const integration = [];
  if (metadata.validation_tier === "integration") {
    for (const command of entry.integration?.commands ?? []) {
      const result = runFixtureCommand(command, workspace);
      integration.push(result);
      results.push({
        description: "Integration: " + command.join(" "),
        passed: result.passed,
        hard: true,
        weight: 3
      });
    }
  }
  const earned = results.filter((result) => result.passed).reduce((sum, result) => sum + result.weight, 0);
  const possible = results.reduce((sum, result) => sum + result.weight, 0);
  const percentage = Math.round((earned / possible) * 1000) / 10;
  const hardFailures = results.filter((result) => result.hard && !result.passed);
  const status = hardFailures.length || percentage < 70 ? "fail" : percentage < 85 ? "partial" : "pass";
  const evidence = {
    ...metadata,
    scored_at: new Date().toISOString(),
    status,
    score: percentage,
    hard_failures: hardFailures.map((result) => result.description),
    assertions: results,
    integration,
    files: (await filesBelow(workspace)).filter((file) => !file.startsWith(".skills/"))
  };
  const artifactsDir = path.join(evidenceDir, "artifacts");
  try {
    await stat(artifactsDir);
  } catch {
    await cp(workspace, artifactsDir, {
      recursive: true,
      errorOnExist: true,
      force: false,
      filter: (source) => {
        const relative = path.relative(workspace, source);
        return !relative || !excludedEvidenceRoots.has(relative.split(path.sep)[0]);
      }
    });
  }
  await writeFile(path.join(evidenceDir, "score.json"), JSON.stringify(evidence, null, 2) + "\n");
  console.log(metadata.case_id + " / " + metadata.model_label + ": " + status.toUpperCase() + " " + percentage + "%");
  for (const result of results) {
    console.log((result.passed ? "PASS" : "FAIL") + (result.hard ? " [hard]" : "") + " " + result.description);
  }
}

async function report(batch) {
  const batchRoot = path.join(runsRoot, safeSegment(batch, "batch"));
  const scores = [];
  for (const caseName of await readdir(batchRoot)) {
    const caseRoot = path.join(batchRoot, caseName);
    if (!(await stat(caseRoot)).isDirectory()) continue;
    for (const modelName of await readdir(caseRoot)) {
      try {
        scores.push(await readJson(path.join(caseRoot, modelName, "score.json")));
      } catch {}
    }
  }
  if (!scores.length) usage("No scored runs found for batch: " + batch);

  const grouped = new Map();
  for (const item of scores) {
    grouped.set(item.model_label, [...(grouped.get(item.model_label) ?? []), item]);
  }
  const lines = [
    "# Evaluation report: " + batch,
    "",
    "Skill commit: " + scores[0].skill_commit,
    "",
    "| Label | Model / effort | Surface | Tier | Cases | Pass | Partial | Fail | Average |",
    "| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: |"
  ];
  for (const [model, items] of [...grouped.entries()].sort()) {
    const count = (status) => items.filter((item) => item.status === status).length;
    const average = Math.round((items.reduce((sum, item) => sum + item.score, 0) / items.length) * 10) / 10;
    const first = items[0];
    const tiers = [...new Set(items.map((item) => item.validation_tier ?? "static"))].join(", ");
    lines.push("| " + model + " | " + first.model + " / " + first.reasoning_effort + " | " + first.execution_surface + " | " + tiers + " | " + items.length + " | " + count("pass") + " | " + count("partial") + " | " + count("fail") + " | " + average + "% |");
  }
  const amendments = [...new Set(scores.map((item) => item.rubric_amendment).filter(Boolean))];
  if (amendments.length) {
    lines.push("", "## Rubric amendments", "");
    for (const amendment of amendments) {
      lines.push("- " + amendment);
    }
  }
  lines.push("", "## Cases", "");
  scores.sort((a, b) => (a.case_id + "/" + a.model_label).localeCompare(b.case_id + "/" + b.model_label));
  for (const item of scores) {
    lines.push("- **" + item.case_id + " / " + item.model_label + ": " + item.status.toUpperCase() + " " + item.score + "%**");
    for (const failure of item.assertions.filter((assertion) => !assertion.passed)) {
      lines.push("  - " + (failure.hard ? "Hard: " : "") + failure.description);
    }
  }
  lines.push("");
  const markdown = lines.join("\n") + "\n";
  await writeFile(path.join(batchRoot, "REPORT.md"), markdown);
  console.log(markdown);
}

const { command, options } = parseArgs(process.argv.slice(2));
if (command === "list") {
  const models = (await readJson(path.join(repo, "evals", "models.json"))).models;
  console.log("Models:");
  for (const [label, config] of Object.entries(models)) {
    console.log("  " + label + ": " + config.model + " / " + config.reasoning_effort + " / " + config.preferred_surface);
  }
  console.log("Cases:");
  for (const entry of await getCases()) {
    console.log("  " + entry.id + ": " + entry.title + " (" + entry.suite + ", " + entry.scenario_type + ")");
  }
} else if (command === "prepare") {
  if (!options.case || !options.model) usage("prepare requires --case and --model");
  await prepare(
    options.case,
    options.model,
    options.batch ?? new Date().toISOString().replace(/[:.]/g, "-"),
    options.surface ?? "unrecorded",
    options.tier ?? "static",
    options.suite
  );
} else if (command === "score") {
  if (!options.run) usage("score requires --run");
  await score(options.run);
} else if (command === "report") {
  if (!options.batch) usage("report requires --batch");
  await report(options.batch);
} else {
  usage();
}
