# Starwind MCP And AI Sources

The published MCP package is `@starwind-ui/mcp`:

```bash
npx -y @starwind-ui/mcp
```

It gives compatible assistants live Starwind docs, validated init/add commands, standard component
and Pro block search, and package-manager detection. It complements local project inspection; it
does not know unsaved component customizations or application conventions unless the client supplies
them.

## Contents

- MCP client setup
- current tools and input/output contracts
- CLI command boundaries
- public AI-readable files
- source priority
- project checks
- Pro result handling

## Setup

Codex example:

```toml
[mcp_servers.starwind_ui]
command = "npx"
args = ["-y", "@starwind-ui/mcp"]
enabled = true
```

Generic JSON client example:

```json
{
  "mcpServers": {
    "starwind-ui": {
      "command": "npx",
      "args": ["-y", "@starwind-ui/mcp"]
    }
  }
}
```

Restart or reload the MCP client after adding the server. Use the client-displayed live schema when
it differs from this reference.

## Current Tools

The current published package registers this compact surface:

| Tool              | Inputs                                                                 | Returns                                                                                          |
| ----------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `starwind_docs`   | optional `topic`, optional `full`                                      | exact page Markdown when found, otherwise filtered or aggregate docs with source/result metadata |
| `starwind_add`    | required `components`; optional `init`, `pro`, `cwd`, `packageManager` | validated init/setup/add commands, package manager, invalid names, and suggestions               |
| `starwind_search` | optional `query`, `category`, `plan`, `limit`, `offset`                | grouped standard components and Pro blocks, install commands, pagination, and Pro setup guidance |
| `starwind_init`   | optional `cwd`, `packageManager`, `pro`                                | a generated initialization command and setup notes                                               |

Older MCP installations or older public docs may expose `search_starwind_pro_blocks`. Prefer
`starwind_search` when the client offers it; the older tool searches only Pro blocks with `query`,
`category`, `plan`, and `limit`.

### `starwind_docs`

Request a focused topic before the full aggregate:

```json
{ "topic": "combobox" }
```

Use `full: true` only when broad context is necessary. Check `resultType`: `page` is an exact page,
`filtered` is a degraded excerpt from general docs, and `full` is the aggregate. Follow the returned
source URL when an API detail is missing.

### `starwind_add`

Pass component names as an array:

```json
{
  "components": ["button", "dialog", "combobox"],
  "cwd": "/absolute/project/path"
}
```

Set `init: true` only for an uninitialized project. Set `pro: true` for a Pro project; a valid
`@starwind-pro/<block>` name also enables Pro mode. `packageManager` can override detection with
`npm`, `pnpm`, or `yarn`.

This tool generates commands; it does not authorize executing them blindly. Confirm framework,
project root, requested scope, and every `--yes` flag in the result before running it. Its current
schema has no framework input, so use the CLI directly for an explicit React initialization or
framework override.

### `starwind_search`

Use `query` for standard components or Pro blocks. `category` and `plan: "free" | "pro"` filter Pro
results; `limit` defaults to 20 and caps at 50, and `offset` paginates Pro results.

```json
{ "query": "pricing", "plan": "free", "limit": 10 }
```

Read standard and Pro result groups separately. Treat returned block IDs, plan, preview URL,
dependencies, install command, and Pro setup note as metadata—not permission or proof of license
access.

### `starwind_init`

The current tool accepts `cwd`, `packageManager`, and `pro`. `pro` defaults to true and the generated
flow is Astro-oriented. For an existing initialized project, use the returned/current
`starwind setup --yes` guidance instead of reinitializing. For React, generate the explicit CLI
command from [cli.md](./cli.md), such as `starwind init --framework react`.

## Command Boundaries

MCP does not replace `migrate`, `update`, `remove`, or `primitives` workflows. Use [cli.md](./cli.md)
and current CLI help for those. Read [v3-migration.md](./v3-migration.md) before migration.

Generated commands are guidance. Run them only from the intended project root, preview destructive
updates, and inspect every written file.

## Public AI Files

When MCP is unavailable, use:

- `https://starwind.dev/llms.txt`: concise public overview.
- `https://starwind.dev/llms-full.txt`: full static AI reference.
- `https://starwind.dev/ai-manifest.json`: structured components, patterns, guides, skills, and MCP
  metadata.
- Per-page Markdown: append `.md` to a docs route, for example
  `https://starwind.dev/docs/components/combobox.md`.

CLI documentation lookup also returns page references:

```bash
npx starwind@latest docs button combobox --json
```

A URL or manifest record is a context pointer. Read its content before implementing props, events,
parts, framework behavior, or Runtime APIs.

## Source Priority

Resolve different kinds of truth from the source that owns them:

1. Local `starwind.config.json`, installed component/Primitive source, package versions, framework
   files, and tests own the current application state.
2. The client-displayed MCP schema and current MCP responses own the available tool contract.
3. Current Starwind Markdown docs own public component and guide APIs.
4. Current CLI help/source owns commands and flags; registry metadata owns installable targets and
   dependencies.
5. `llms.txt`, `llms-full.txt`, and `ai-manifest.json` provide broad/static fallback context.
6. Memory is last.

Local installed source can be older than current docs; current docs can describe a component not yet
installed. State which side differs and choose intentionally rather than silently mixing versions.

## Project Check Before Using Results

Confirm:

- the public target is Astro or React;
- Node/framework/Tailwind versions satisfy current requirements;
- config framework, component/Primitive directories, registry, and installed records;
- the active Starwind CSS file;
- local exports and icon/import conventions; and
- whether the task uses styled source, package Primitives, vendored Primitives, or Runtime.

After an MCP-generated command, read every new file and verify its framework, destination, aliases,
exports, icon imports, dependencies, and Runtime hooks. Run the project's relevant format,
typecheck, build, and tests.

## Pro Results

Use returned Pro block IDs, plan, dependencies, and install commands exactly. Free and paid
availability is metadata, not something to infer. Pro setup stores authorization configuration in
`starwind.config.json` and the key in `.env.local`; never expose the key in prompts, logs, code, or
handoff text.
