# Starwind MCP And AI Sources

The MCP package is `@starwind-ui/mcp`. This guidance needs `@starwind-ui/mcp` 0.6.0 or newer.
Older versions do not know Vue and Svelte, and they reject Pro for React.

```bash
npx -y @starwind-ui/mcp
```

The MCP gives assistants V3 docs and search, validated `init`, `add`, and `migrate` commands for
Astro, React, Vue, and Svelte, package-manager detection, and local project context. It adds to
direct project inspection. Even with `cwd`, it does not know unsaved component edits or application
conventions.

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

Restart or reload the MCP client after you add the server. Use the client-displayed live schema when
it differs from this reference.

## Source Priority

Get each kind of fact from the source that owns it:

1. Local `starwind.config.json`, installed component and Primitive source, package versions,
   framework files, and tests own the current application state.
2. Installed package docs in `node_modules/@starwind-ui/<pkg>/docs/` (1.6.0+) own the Primitive and
   Runtime API of the installed version.
3. The client-displayed MCP schema and current MCP responses own the tool contract.
4. Current Starwind Markdown docs own public component, Primitive, Runtime, and guide APIs.
5. Current CLI help and source own commands and flags. Registry metadata owns installable targets
   and dependencies.
6. `llms.txt`, `llms-full.txt`, and `ai-manifest.json` give broad fallback context.
7. Memory is last.

Installed source can be older than current docs. The bundled MCP manifest can be older than the
live manifest. Say which side differs and choose on purpose. Do not mix versions silently.

## Frameworks And Project Context

Every tool that takes a framework accepts `"astro"`, `"react"`, `"vue"`, or `"svelte"`. Primitive
search also accepts `"all"`.

With `cwd`, project context:

- detects Vue hosts (Vue, Nuxt, Quasar, Laravel with Inertia Vue) and Svelte hosts (Svelte,
  SvelteKit);
- detects Astro with Vue or Svelte islands;
- reads `framework` from `starwind.config.json` for all four frameworks; and
- returns `packageDocs` paths when `node_modules/@starwind-ui/<pkg>/docs/llms.txt` exists.

Read the `packageDocs` paths before you use a Primitive or Runtime API.

## Current Tools

The package registers five tools. Calls return readable JSON plus MCP `structuredContent`:

| Tool               | Inputs                                                                                                            | Returns                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `starwind_docs`    | optional `topic`, `surface`, `full`, `cwd`                                                                        | component, Primitive, guide, or Runtime Markdown; `installedDocs` with `cwd`; aggregate docs otherwise |
| `starwind_search`  | optional `query`, `cwd`, `surface`, `framework`, `category`, `plan`, `limit`, `offset`                            | separate styled, Primitive, and Pro groups plus discovery and upgrade guidance                         |
| `starwind_add`     | required `components`; optional `surface`, `framework`, `to`, `overwrite`, `init`, `pro`, `cwd`, `packageManager` | validated commands, skipped or invalid items, project context, and any deferred paid install           |
| `starwind_init`    | optional `cwd`, `packageManager`, `framework`, `pro`                                                              | init command, detected project context, requirements, warnings, and next steps                         |
| `starwind_migrate` | optional `cwd`, `packageManager`, `yes`                                                                           | applicability, migration command, project context, warnings, and post-migration review list            |

Older MCP installations can expose `search_starwind_pro_blocks`. Prefer `starwind_search` when the
client offers it.

## Using The Tools

### Documentation

Set `surface` when `auto` could confuse a styled component with a Primitive of the same name. Prefer
an exact `resultType: "page"`. `filtered` is a weaker aggregate excerpt.

Pass `cwd` so the tool can find the installed package docs:

```json
{ "topic": "combobox", "surface": "primitive", "cwd": "/absolute/project/path" }
```

With `cwd`, a Primitive or Runtime topic, or a styled component that shares a Primitive's name,
also returns `installedDocs`. Read the file at `installedDocs.path`. It is the version-matched page
from the installed `@starwind-ui` package. When the website is not available, the tool returns the
installed page.

### Search

Set `surface` and `framework` when they matter. Read `styledComponents`, `primitives`, and
`proBlocks` separately.

```json
{ "query": "combobox", "surface": "primitive", "framework": "svelte" }
```

```json
{ "query": "pricing", "framework": "astro", "plan": "free", "limit": 10 }
```

### Add

`surface` defaults to `styled`. Primitive requests generate `primitives add`, and only they accept a
safe relative `to` path. `overwrite` is opt-in, and `all` must stand alone.

```json
{ "components": ["button", "chart"], "framework": "vue", "cwd": "/absolute/project/path" }
```

```json
{ "components": ["combobox"], "surface": "primitive", "framework": "react", "to": "src/primitives" }
```

Check success, warnings, invalid items, commands, and any deferred command before you run anything.

### Init

The tool detects framework and package manager from `cwd`. `framework` overrides detection. For Vue
and Svelte it generates `starwind init --framework vue|svelte` and reports the Vue 3.5.21+ or
Svelte 5.29+ (below 6) requirement. It also reports Node 22.12+ and sends a detected legacy config
to migration.

```json
{ "cwd": "/absolute/project/path", "framework": "svelte" }
```

### Migrate

The tool returns a command only for an applicable legacy Astro project. It is interactive by
default. `yes: true` permits backup-and-overwrite behavior.

```json
{ "cwd": "/absolute/project/path" }
```

Read its warnings and review list, then follow [v3-migration.md](./v3-migration.md).

## Pro Results

No tool rejects or hides Pro by framework. Pro search, `pro: true` on `init` and `add`, and setup
guidance work for every framework. Outside Astro, the result carries a warning: Pro blocks are
Astro components, so use an Astro host or port the block. Pass that warning to the user.

Free results use `installCommand` after normal initialization. Paid results use
`deferredInstallCommand` plus `proUpgrade`. Run the returned setup before a deferred install, and
only when paid access is intended. Keep `STARWIND_LICENSE_KEY` in ignored `.env.local` and out of
prompts, logs, code, and handoff text.

## Manifest

The MCP validates the live `https://starwind.dev/ai-manifest.json`, caches valid metadata, and falls
back to a bundled manifest when the live file is not available. Returned metadata names its source.

- The live manifest lists `vue`, `svelte`, and `legacy-astro` targets and the `Vue` and `Svelte`
  framework names.
- The MCP ignores unknown future targets. It does not fail on them.
- The bundled fallback includes `chart`, four-framework targets, `image` as Astro only, and the Vue
  and Svelte host guides.

## Command Boundaries

MCP generates guidance. It does not run commands or authorize destructive changes. Use
[cli.md](./cli.md) and current CLI help for styled `update` and `remove`, Primitive `update` and
`list`, and other work that has no MCP tool.

Run generated commands only from the intended project root, preview destructive updates, and read
every written file.

## Public AI Files

When MCP is not available, use:

- `https://starwind.dev/llms.txt`: short public overview.
- `https://starwind.dev/llms-full.txt`: full static AI reference.
- `https://starwind.dev/ai-manifest.json`: versioned components, guides, layers, framework targets,
  and MCP metadata.
- Per-page Markdown: add `.md` to a docs route, for example
  `https://starwind.dev/docs/components/chart.md` or
  `https://starwind.dev/docs/primitives/combobox.md`.

CLI documentation lookup also returns page references:

```bash
npx starwind@latest docs button combobox --json
```

A URL or manifest record is a pointer. Read its content before you use props, events, parts,
framework behavior, or Runtime APIs.

## Before Using Results

Pass `cwd` where the tool accepts it, but confirm framework, layer, config, destinations, local
exports, and installed source yourself. After you run a generated command, read every written file
and run the relevant format, typecheck, build, test, and browser checks.
