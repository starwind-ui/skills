# Starwind CLI v3 Reference

This reference matches `starwind` 3.7.0. Run commands from the project root. Examples use
`npx starwind@latest`. Use the runner of the project's package manager.

| Package manager | Runner                                               |
| --------------- | ---------------------------------------------------- |
| npm             | `npx starwind@latest`                                |
| pnpm            | `pnpm dlx starwind@latest` or `pnpx starwind@latest` |
| Yarn            | `yarn dlx starwind@latest`                           |
| Bun             | `bunx starwind@latest`                               |

The framework targets are `astro`, `react`, `vue`, and `svelte`. Only `update`, `remove`,
`search --primitives`, and `primitives list` also accept `all`. `-m, --package-manager` accepts
`npm`, `pnpm`, `yarn`, and `bun` on every command that has it.

## Contents

- `init` and legacy `migrate`
- styled `add`, `update`, and `remove`
- framework targeting
- vendored `primitives add`, `update`, and `list`
- component and Pro `search`
- `docs`
- Pro `setup`
- project setup effects
- registry safety and command boundaries

## `init`

Creates `starwind.config.json`, selects the framework, installs the matching adapter package,
creates the Starwind CSS file, and configures the host and aliases.

```bash
npx starwind@latest init
npx starwind@latest init --framework astro
npx starwind@latest init --framework react
npx starwind@latest init --framework vue
npx starwind@latest init --framework svelte
npx starwind@latest init --defaults
npx starwind@latest init --pro
```

| Flag                                    | Meaning                              |
| --------------------------------------- | ------------------------------------ |
| `-d, --defaults`                        | Accept default prompts.              |
| `-p, --pro`                             | Initialize and configure Pro access. |
| `--framework astro\|react\|vue\|svelte` | Select the framework target.         |
| `--astro`                               | Astro shortcut.                      |
| `--react`                               | React shortcut.                      |

Shortcuts exist only for Astro and React. Use `--framework vue` or `--framework svelte` for the
other two. Choose one framework selector. If `init` finds a legacy config, it can offer the
migration flow. `init` has no `--package-manager` flag.

## `migrate`

Migrates a pre-Runtime Astro copied-component project. It migrates all safe registered components in
one run and does not accept component names.

```bash
npx starwind@latest migrate
npx starwind@latest migrate --yes --package-manager pnpm
```

| Flag                                         | Meaning                                                             |
| -------------------------------------------- | ------------------------------------------------------------------- |
| `-y, --yes`                                  | Skip prompts; creates a backup and overwrites registered conflicts. |
| `-m, --package-manager npm\|pnpm\|yarn\|bun` | Select the dependency runner.                                       |

Use the interactive command by default. Read [v3-migration.md](./v3-migration.md) before you run
it. Use `--yes` only on a clean, recoverable worktree.

## `add`

Adds Runtime-backed styled component source for the configured framework. With no names it opens an
interactive picker.

```bash
npx starwind@latest add button dialog combobox
npx starwind@latest add chart
npx starwind@latest add button --framework svelte
npx starwind@latest add --all
npx starwind@latest add @starwind-pro/hero-01 button
```

| Flag                                         | Meaning                                                          |
| -------------------------------------------- | ---------------------------------------------------------------- |
| `-a, --all`                                  | Add every available uninstalled styled component in scope.       |
| `-y, --yes`                                  | Skip confirmation prompts.                                       |
| `-o, --overwrite`                            | Replace files that already exist.                                |
| `--framework astro\|react\|vue\|svelte`      | Override the styled target.                                      |
| `--starwind-ui-version 2\|3`                 | Starwind UI compatibility line for Pro blocks. The default is 3. |
| `--registry <registry>`                      | Use a remote registry URL or local registry file.                |
| `-m, --package-manager npm\|pnpm\|yarn\|bun` | Select the dependency runner.                                    |

The CLI resolves component dependencies and package requirements. Use exact Pro block commands from
current search, docs, or MCP results. Read every created or overwritten file.

## `update`

Refreshes installed styled source and can overwrite local changes. With no names it opens an
installed-component picker for the selected framework.

```bash
npx starwind@latest update button --dry-run
npx starwind@latest update button --diff
npx starwind@latest update button --view
npx starwind@latest update button --diff src/components/starwind/button/variants.ts
npx starwind@latest update button --view src/components/starwind/button/Button.astro
npx starwind@latest update --all --framework all
```

| Flag                                         | Meaning                                           |
| -------------------------------------------- | ------------------------------------------------- |
| `-a, --all`                                  | Update every installed component in scope.        |
| `-y, --yes`                                  | Skip confirmation prompts.                        |
| `--dry-run`                                  | Plan changes without writing files.               |
| `--diff [path]`                              | Show all planned diffs or one planned path.       |
| `--view [path]`                              | Show all new file contents or one planned path.   |
| `--framework astro\|react\|vue\|svelte\|all` | Select one or every configured styled target.     |
| `--registry <registry>`                      | Use a remote registry URL or local registry file. |
| `-m, --package-manager npm\|pnpm\|yarn\|bun` | Select the package runner for updates.            |

Preview customized components first. Use `--all` only with the user's explicit approval for every
installed component in the chosen scope. `update` offers to update `@starwind-ui/runtime` and the
other Starwind packages when they are out of date.

## Framework Targeting

The framework chosen by `init` is primary and writes to `componentDir`. A project that owns styled
source for more than one framework, such as Astro with Vue or Svelte islands, records the other
destinations under `componentDirs.<framework>`.

```bash
npx starwind@latest add button --framework vue
npx starwind@latest update button --framework vue
npx starwind@latest remove button --framework vue
```

A framework flag selects generated source and destination. It does not convert application code
between frameworks.

## `primitives`

Use this namespace only when the project must own compile-ready Primitive adapter source. Normal
Primitives come from `@starwind-ui/<framework>` and need no vendoring.

### Add

```bash
npx starwind@latest primitives add button checkbox
npx starwind@latest primitives add button --framework react --to src/react-primitives
npx starwind@latest primitives add dialog --framework svelte
npx starwind@latest primitives add --all
```

| Flag                                         | Meaning                           |
| -------------------------------------------- | --------------------------------- |
| `-a, --all`                                  | Add all available Primitives.     |
| `-y, --yes`                                  | Skip confirmation prompts.        |
| `-o, --overwrite`                            | Replace existing Primitive files. |
| `--framework astro\|react\|vue\|svelte`      | Select the adapter source target. |
| `--to <dir>`                                 | Set the destination.              |
| `-p, --path <dir>`                           | Alias for `--to`.                 |
| `-m, --package-manager npm\|pnpm\|yarn\|bun` | Select the dependency runner.     |

### Update

```bash
npx starwind@latest primitives update button --dry-run
npx starwind@latest primitives update button --diff
npx starwind@latest primitives update --all --framework vue
```

`primitives update` supports `--all`, `--yes`, `--dry-run`, `--diff [path]`, `--view [path]`,
`--framework astro|react|vue|svelte`, and `-m, --package-manager npm|pnpm|yarn|bun`. It can
overwrite customized vendored source. Preview and review it like styled source.

### List

```bash
npx starwind@latest primitives list
npx starwind@latest primitives list --framework all --json
```

`primitives list` supports `--framework astro|react|vue|svelte|all` and `--json`.

There is no Primitive remove or export command, no Runtime source eject command, no
`starwind add --primitives`, and no `starwind update --primitives`.

## `search`

Searches styled components and Pro blocks. `--primitives` switches to Primitive source discovery.

```bash
npx starwind@latest search combobox --json
npx starwind@latest search hero --plan free --limit 5
npx starwind@latest search button --primitives --framework svelte
```

| Flag                                         | Meaning                                              |
| -------------------------------------------- | ---------------------------------------------------- |
| `-p, --plan free\|pro`                       | Filter Pro results.                                  |
| `-c, --category <category>`                  | Filter Pro category.                                 |
| `-l, --limit <number>`                       | Limit results; defaults to 20 and caps at 50.        |
| `-o, --offset <number>`                      | Offset paginated results.                            |
| `--json`                                     | Print structured output.                             |
| `--registry <registry>`                      | Search a remote registry URL or local registry file. |
| `--primitives`                               | Search Primitive source.                             |
| `--framework astro\|react\|vue\|svelte\|all` | Scope Primitive search.                              |

## `docs`

Opens or returns references for one or more styled components.

```bash
npx starwind@latest docs button dialog
npx starwind@latest docs combobox --json
```

`docs` supports `--json` and `--registry <registry>`. A URL result is a pointer. Read the page or
its Markdown version before you use an API.

## `remove`

Deletes installed styled source and updates config. Search application imports before removal.

```bash
npx starwind@latest remove button
npx starwind@latest remove button --framework react
npx starwind@latest remove --all --framework all
```

`remove` supports `--all`, `--yes`, and `--framework astro|react|vue|svelte|all`. Use `--all` only
when the user wants the whole scope removed.

## `setup`

Configures Starwind Pro for an initialized project.

```bash
npx starwind@latest setup
npx starwind@latest setup --pro
npx starwind@latest setup --yes --package-manager pnpm
```

`setup` supports `--pro` (the default task), `--yes`, and `-m, --package-manager
npm|pnpm|yarn|bun`. It writes the authorization reference to `starwind.config.json`, creates or
updates `.env.local`, and makes sure Git ignores that file. Never expose the license value.

Starwind Pro blocks are Astro components. `init --pro`, `setup`, and Pro block installs run in
every framework. In a React, Vue, or Svelte project, tell the user that the block is an Astro
component. Use an Astro host, or port the block to the project's framework.

## Project Setup Effects

These CLI 3.7 effects change project files beyond the component folder:

- `add chart` and `add sidebar` add missing chart tokens (`--chart-1` to `--chart-5`) or sidebar
  tokens to the CSS file. If the CLI cannot write the file, it prints the missing tokens to add by
  hand.
- In the root of a pnpm workspace, installs go to the root `package.json` with `-w`.
- `init` in a Vue project below 3.5.21 offers to upgrade Vue.
- `init` in SvelteKit puts `tailwindcss`, `@tailwindcss/vite`, `tw-animate-css`, and
  `@tailwindcss/forms` in `devDependencies`.
- `init` and `setup` install `tailwind-merge` ^3.7.0. `add` and `update` raise it when they install
  a component that changed for RTL.
- `init` adds the scoped `rtl` and `ltr` custom variants to new stylesheets. See
  [customization.md](./customization.md#rtl-stylesheet).
- On Vite React, Vite Vue, and Vite Svelte, `init` adds the theme init plugin to `vite.config.*`.

Read the changed `package.json`, CSS file, and host config after each of these commands.

## Registry Safety And Provenance

`--registry` can point to a local registry file or remote registry URL. Treat a non-bundled
registry as executable source input. Check its origin and the generated files before you accept
them.

- Do not send Pro authorization headers or `STARWIND_LICENSE_KEY` to an untrusted origin.
- Keep local registry paths inside the intended project or repository.
- Keep the registry recorded for installed components in `starwind.config.json`. It identifies the
  source an update compares against.
- Preview an update from the same registry before you overwrite local source.
- Do not copy shadcn registry addresses, schemas, or package conventions into Starwind.

## Command Boundaries

Do not copy shadcn commands into Starwind. Starwind has no top-level `info`, `apply`, `build`, or
`create` command, and no presets. Preview uses `update --dry-run|--diff|--view`. Vendored Primitive
management stays under `starwind primitives`. Never fetch raw component files from GitHub.

When local CLI output and this reference differ, prefer the installed CLI for flags and current
Starwind docs for public behavior.
