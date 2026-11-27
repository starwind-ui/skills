# Starwind skill evaluations

These are repository-level forward tests for the skills published through `skills.sh`. Nothing in
this directory is installed as part of either skill.

## What is measured

Each case gives a fresh coding agent three things only:

1. a clean project fixture;
2. a normal user request; and
3. the path to the skill it should use.

The agent does not receive the rubric, assertions, another model's work, or earlier conclusions.
Agents work in isolated copies under `/tmp/starwind-skill-evals/`, where the tested skill is copied
beside the fixture. Rubrics and run metadata remain outside that workspace. After scoring, artifacts
and evidence are collected under `.eval-runs/`, which is ignored by Git.

This suite measures explicit skill use. Trigger testing—where the skill is installed but not named
in the prompt—should be run as a separate batch so discovery and task quality are not conflated.

## Scenario fidelity

- Implementation fixtures contain the actual local V3 component source an installed project would
  expose, not export-only stubs that hide supported props or anatomy.
- CLI workflow fixtures provide an interface-compatible, offline command through the fixture's
  `pnpm starwind` script. The double reproduces the relevant file mutations and records invocation;
  it exists only because repeatable model comparisons cannot depend on live registry access.
- MCP workflow fixtures call the actual newest published `@starwind-ui/mcp` server through
  `pnpm mcp`. Preparation resolves and pins the current `latest` version, warms pnpm's cache, and
  records real structured requests/responses in the ignored evidence directory, outside the agent
  workspace. The package alone bypasses `minimumReleaseAge` for that invocation; the user's global
  supply-chain policy is not changed.
- Post-CLI fixtures begin with the CLI-owned configuration and generated source already in place.
  They ask agents only for application integration that the command intentionally leaves manual.
- A case should model one recognizable user stage. Do not combine setup, installation, and content
  adaptation unless a real user would reasonably request and permit that whole workflow.

## Layout

```text
evals/
├── README.md
├── fixtures.json
├── models.json
├── run.mjs
├── starwind-ui/
│   ├── cases.json
│   └── fixtures/<case>/
├── starwind-pro/
│   ├── cases.json
│   └── fixtures/<case>/
└── starwind-mcp/
    ├── cases.json
    ├── mcp-call.mjs
    └── fixtures/<case>/
```

MCP fixtures set `minimumReleaseAge: 2880` locally to reproduce a two-day policy. Only the pinned
`@starwind-ui/mcp` `dlx` subprocess receives `minimum-release-age=0`; application dependencies stay
uninstalled and the user's global pnpm configuration is untouched.

`fixtures.json` pins the upstream revision for each copy of installed-component source. The first
source is the public `starwind-ui` repository. `additional_sources` lists copies from the private
`starwind-ui-runtime` main branch, taken before the public 3.7 sync.

## Cases

`starwind-ui`:

- `astro-settings-form`: accessible Astro settings form with Field, Switch, and a busy Save state.
- `react-profile-combobox`: React profile Dialog with a standalone Combobox.
- `theme-customization`: semantic token rebrand that keeps every unrelated token.
- `astro-v3-post-migration`: application integration after the V3 migration command.
- `astro-v3-migration-cli`: run and review the offline V3 migration command.
- `astro-chart-dashboard`: Astro revenue dashboard with Chart parts, format objects, chart tokens,
  and an accessible name.
- `svelte-profile-dialog`: SvelteKit profile Dialog with `bind:open`, the `child` snippet, and
  `$lib/starwind` imports.
- `rtl-settings`: Astro settings page in RTL with a URL input in LTR, a runtime language switch,
  logical spacing, and the scoped stylesheet variants.
- `vue-beta-upgrade`: finish a Vue beta upgrade after the CLI update: Vue range, `@beta` removal,
  removed Tabs slot props, and removed `DialogContext`.

`starwind-pro`: `pro-block-adaptation`, `pro-setup-workflow`.

`starwind-mcp`: `mcp-migration-preview`, `mcp-react-primitive`, `mcp-pro-result-routing`.

## Repeatable workflow

```bash
node evals/run.mjs list

node evals/run.mjs prepare \
  --case astro-settings-form \
  --model terra-high \
  --batch pilot-001 \
  --tier static

node evals/run.mjs prepare \
  --case all \
  --suite starwind-mcp \
  --model terra-high \
  --batch mcp-live-001
```

The prepare command prints the exact context-free prompt and creates an evidence folder plus an
isolated temporary workspace. Start the requested model with a fresh thread or a subagent with no
inherited turns, then give it that prompt unchanged. The agent writes its normal handoff to
`RESULT.md`.

```bash
node evals/run.mjs score \
  --run .eval-runs/pilot-001/astro-settings-form/terra-high

node evals/run.mjs report --batch pilot-001
```

Use `prepare --case all --model <label>` to prepare the full suite for one model. A run passes only
when every hard assertion passes and its weighted score is at least 85%. Scores from 70–84% are
partial; anything below 70%, or any hard failure, fails.

### Validation tiers

`static` is the default. It keeps agent runs offline and grades source structure, preserved files,
CLI evidence, and the required non-empty `RESULT.md`. The grader understands both literal and
data-driven component names and checks invalid structures such as nested native forms.

Use `--tier integration` when you need release-level confidence. Preparation installs the pinned
lockfile before the fresh agent starts; browser cases also provision Chromium. The agent still may
not install or update dependencies. Scoring then runs each case's checked-in validation command:

- Astro and React fixtures compile or type-check;
- account settings exercises native validation, form ownership, distinct preference names, and the
  valid-submit busy state in a browser;
- post-migration preferences exercises current Combobox, Switch, and Dialog behavior in a browser;
- offline CLI doubles receive a syntax check.

Run the same case and model in separate batches when comparing `static` and `integration`; the tier
is recorded in metadata and the report table.

`astro-chart-dashboard`, `svelte-profile-dialog`, `rtl-settings`, and `vue-beta-upgrade` are static
only. They need the 1.6.0 Starwind packages, which were not on npm when the cases were written, so
they have no lockfile. `prepare --case all --tier integration` stops at the first of these cases.
Prepare integration runs by case ID until these fixtures get lockfiles.

## Fair comparisons

- Keep the case revision, skill commit, tools, and execution surface fixed.
- Use a fresh context for every case. Never run multiple cases in one conversation.
- Compare the requested model and reasoning effort exactly; do not silently substitute models.
- Run three repetitions before treating small score differences as model differences.
- Keep deterministic checks primary. Review diffs and `RESULT.md` for quality the checks cannot see.
- Occasionally run a no-skill baseline to measure whether the skill helps.
- Record failures as regression cases only after confirming the expected behavior is correct.
- Re-audit assertions against current installed source before treating a model's API choice as an
  error; supported local contracts outrank an evaluator assumption.

The initial suite is intentionally small and concrete. It tests user-visible promises rather than
trying to grade every sentence in the skills.
