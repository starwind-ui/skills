---
name: starwind-ui
description: "Manages Starwind UI v3 in Astro, React, Vue, and Svelte projects: initializing, migrating, adding, updating, searching, debugging, styling, theming, and composing styled components (including Chart), Primitive adapters, or Runtime integrations. Use for Starwind components, starwind.config.json, Tailwind CSS v4 themes, RTL layouts, V2-to-V3 migration, Vue or Svelte beta upgrades, or Starwind CLI/MCP work."
allowed-tools: Bash(npx starwind@latest *), Bash(pnpx starwind@latest *), Bash(pnpm dlx starwind@latest *), Bash(yarn dlx starwind@latest *), Bash(bunx starwind@latest *)
---

# Starwind UI v3

Starwind UI is a framework-portable system for Astro, React, Vue, and Svelte. The CLI copies
editable styled component source into the application. Primitive adapters and the
framework-neutral Runtime are lower layers for projects that need more control.

Requirements: Node 22.12+, Tailwind CSS 4, and Astro 5+, React and React DOM 18+, Vue 3.5.21+, or
Svelte 5.29+ below Svelte 6. The `starwind` CLI 3.7.0 and the `@starwind-ui/runtime`, `astro`,
`react`, `vue`, and `svelte` packages 1.6.0 are one release. All of them publish on `latest`. Use
`starwind@latest` and plain package names. Do not write `@beta`.

> Run CLI commands from the project root with the project's runner: `npx starwind@latest`,
> `pnpm dlx starwind@latest`, `yarn dlx starwind@latest`, or `bunx starwind@latest`. Examples below
> use `npx starwind@latest`. Use the runner that the lockfile or the `packageManager` field shows.

## Project Context

Starwind has no `info` command and no injected project context. Read these files before you change
code:

- `package.json`, `packageManager`, and the lockfile: framework, runner, versions, scripts.
- `starwind.config.json`: `framework`, `componentDir`, `componentDirs.<framework>`, Primitive
  destinations, installed `components`, registry, CSS file, and Pro settings.
- Host config: `astro.config.*`, `vite.config.*`, `nuxt.config.ts`, `svelte.config.js`, Next.js,
  TanStack Start, or React Router files.
- The active Starwind CSS file named in config: tokens, `@theme inline`, `:root`, and `.dark`.
- The configured component folders and each local `index.ts`: installed parts and exports.
- `node_modules/@starwind-ui/<pkg>/docs/` when the package is 1.6.0 or newer.
- Nearby imports and tests: aliases, icon library, syntax, state, and events.

Config still uses `config-schema.v2.json` with `version: 2`. The product major and the config
format version are different. Do not change the config version by hand.

## Principles

1. **Use existing components first.** Run `starwind search` or MCP `starwind_search` before you
   write custom UI.
2. **Compose.** Settings page = Tabs + Card + Field controls. Dashboard = Sidebar + Card + Chart +
   Table.
3. **Use built-in variants before custom styles.** `variant="outline"`, `size="sm"`.
4. **Use semantic colors.** `bg-primary`, `text-muted-foreground`. Never raw values such as
   `bg-blue-500`.
5. **Match the file's framework.** Each framework has its own syntax for attributes, state, and
   child elements.

## Critical Rules

These rules always apply. Each group links to a file with Incorrect/Correct pairs.

### Frameworks → [frameworks.md](./rules/frameworks.md)

- **Match the syntax.** Astro `class` and `for`. React `className` and `htmlFor`. Vue `class` and
  `v-model`. Svelte `class` and `bind:`.
- **Import styled parts from the configured folder.** Default `@/components/starwind/<name>`.
  SvelteKit 2 `$lib/starwind/<name>`. Nuxt `~/components/starwind/<name>`.
- **Import Primitives from the package of the file's framework.** `@starwind-ui/<framework>/<name>`.
- **Svelte uses the `child` snippet** where Astro, React, and Vue use `asChild`.
- **Render the theme init script for the host** before paint.

### Styling and Tailwind → [styling.md](./rules/styling.md)

- **Class props are for layout.** Do not override component colors or typography at the call site.
- **No `space-x-*` or `space-y-*`.** Use `flex` with `gap-*`.
- **Use `size-*`** when width and height are equal.
- **Use `truncate`** for one line of text.
- **No manual `dark:` color pairs.** Change `:root` and `.dark` in the active CSS file.
- **Use `tailwind-variants` for conditional classes.** Starwind has no `cn()` helper.
- **No manual `z-index` on overlays.** Dialog, Sheet, Popover, and menus own their stacking.

### Direction (RTL) → [styling.md](./rules/styling.md#rtl)

- **Set `dir` on `<html>` or a container.** Components read the `dir` attribute. They do not read
  CSS `direction`.
- **Use logical utilities for the reading edge.** `ps-6`, not `pl-6`. Also `pe-*`, `ms-*`, `me-*`,
  `start-*`, `end-*`, `text-start`.
- **`side="left"` and `side="right"` stay physical.**
- **Put `dir="ltr"` on URL and code inputs** inside RTL content.
- **After a runtime `dir` change,** dispatch `starwind:direction-change` on `document`.
- **Remove your own RTL workarounds** that the components now handle.

### Forms and Inputs → [forms.md](./rules/forms.md)

- **Forms use `Field` anatomy.** `name` on `Field`, native constraints on `FieldControl`.
- **Group related controls with `FieldSet` and `FieldLegend`.** They are parts of `field`. There is
  no styled `fieldset` component.
- **`InputGroup` uses `InputGroupInput` or `InputGroupTextarea`.** Never a raw `Input` inside it.
- **Keep native form behavior.** `name`, `required`, `disabled`, submit, and reset.
- **Pair invalid state with error text.** `FieldError match="valueMissing"`.

### Component Structure → [composition.md](./rules/composition.md)

- **Items stay inside their group.** `SelectItem` in `SelectGroup`, `ComboboxItem` in
  `ComboboxGroup`.
- **Dialog, Sheet, and Alert Dialog need a title.** Use `sr-only` to hide it.
- **Use the full Card composition.**
- **Button has no `isLoading` or `isPending`.** Compose `Spinner`, `disabled`, and `aria-busy`.
- **`TabsTrigger` goes inside `TabsList`.** `AvatarImage` goes with `AvatarFallback`.
- **Searchable choice uses the standalone `combobox`.** V3 has no `SelectSearch`.
- **Render one `Toaster`** in a shared layout.

### Charts → [charts.md](./rules/charts.md)

- **Put chart parts inside `ChartContainer`** with `data` and `config`. There is no Recharts.
- **In `.astro` files, formatters take `ChartFormat` objects only.** No functions.
- **Series colors use `var(--chart-N)`** in a config that `satisfies ChartConfig`.
- **Set `aria-label` on `ChartContainer`.**
- **Next.js chart files start with `"use client"`.**

### Icons → [icons.md](./rules/icons.md)

- **Use the project's icon library.** Never assume one.
- **Name every icon-only control** with `aria-label`.
- **No `data-icon` and no size classes on icons inside components.** Component variants size them.

### CLI and Sources → [cli.md](./cli.md)

- **Use only the commands and flags in cli.md.** Starwind has no `info`, `apply`, `build`, `create`,
  or preset commands.
- **Never fetch raw component files from GitHub.** Use `add` and `update` with preview flags.
- **Read installed package docs for Primitive and Runtime APIs.**
  `node_modules/@starwind-ui/<pkg>/docs/` (1.6.0+) matches the installed version.

## Key Patterns

```astro
---
// Astro form: Field anatomy, native constraints, Spinner for loading.
import { Button } from "@/components/starwind/button";
import { Field, FieldControl, FieldError, FieldLabel } from "@/components/starwind/field";
import { Spinner } from "@/components/starwind/spinner";
---

<Field name="email">
  <FieldLabel>Email</FieldLabel>
  <FieldControl type="email" required />
  <FieldError match="valueMissing">Enter an email address.</FieldError>
</Field>
<Button disabled aria-busy="true"><Spinner /> Saving...</Button>
```

```svelte
<!-- Svelte: bind: for state, child snippet in place of asChild. -->
<Dialog bind:open>
  <DialogTrigger>
    {#snippet child({ props, children })}
      <Button {...props}>{@render children?.()}</Button>
    {/snippet}
    Edit profile
  </DialogTrigger>
</Dialog>
```

```vue
<!-- Vue: v-model for state, asChild where documented. -->
<Dialog v-model:open="open">
  <DialogTrigger asChild><Button>Edit profile</Button></DialogTrigger>
</Dialog>
```

```astro
<!-- Chart: parts inside ChartContainer, format objects in Astro. -->
<ChartContainer config={revenueConfig} data={revenueData} aria-label="Revenue by month">
  <ChartXAxis dataKey="month" tickFormatter={{ maxLength: 3 }} />
  <ChartBar dataKey="revenue" radius={4} />
</ChartContainer>

<!-- RTL: logical spacing. -->
<div class="ps-6">...</div>  <!-- correct -->
<div class="pl-6">...</div>  <!-- wrong -->
```

## Component Selection

| Need                  | Start with                                                                                                       |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Action                | `button`; `button-group` for related actions                                                                     |
| Form structure        | `form`, `field` (includes `FieldSet` and `FieldLegend`), `label`                                                 |
| Text and choice input | `input`, `textarea`, `input-group`, `checkbox`, `checkbox-group`, `radio-group`, `switch`, `slider`, `input-otp` |
| Fixed choice list     | `select` or `native-select`                                                                                      |
| Searchable choice     | standalone `combobox`; V3 has no `SelectSearch`                                                                  |
| Toggles               | `toggle`, `toggle-group`                                                                                         |
| Navigation            | `navigation-menu`, `sidebar`, `breadcrumb`, `tabs`, `pagination`                                                 |
| Overlays              | `dialog`, `sheet`, `alert-dialog`, `popover`, `dropdown`, `context-menu`, `hover-card`, `tooltip`                |
| Feedback              | `toast`, `alert`, `progress`, `skeleton`, `spinner`                                                              |
| Data and content      | `table`, `card`, `badge`, `avatar`, `item`, `kbd`, `prose`                                                       |
| Data visualization    | `chart` (TanStack Charts)                                                                                        |
| Layout                | `separator`, `aspect-ratio`, `scroll-area`                                                                       |
| Disclosure            | `accordion`, `collapsible`                                                                                       |
| Rich input and media  | `color-picker`, `dropzone`, `image`, `video`, `carousel`                                                         |
| Theme switching       | `theme-toggle`                                                                                                   |

All 56 styled components exist in all four frameworks. The exception is `image`, which is Astro
only.

## Workflow

1. **Get project context.** Read the files in [Project Context](#project-context).
2. **Check installed components.** Read `components` in `starwind.config.json` and list the
   component folder. Do not import a component that is not installed. Do not add one again.
3. **Find components.** `npx starwind@latest search <query> --json`, or MCP `starwind_search`.
4. **Get docs.** `npx starwind@latest docs <name> --json` returns page URLs. Read the page or its
   `.md` version. For Primitive and Runtime APIs, read the installed package docs first.
5. **Install.** `npx starwind@latest add <names>`. The CLI uses the framework in config. Pass
   `--framework` only for a second framework target.
6. **Review added files.** Read every added or replaced file. Check imports, part nesting, and the
   Critical Rules. Replace icon imports with the project's icon library.
7. **Compose and check.** Use local exports and the file's framework syntax. Run the narrowest
   format, typecheck, build, test, and browser checks.

The task is complete when every import resolves from the intended folder, the code matches current
documented contracts, and the checks pass or each failure is reported.

## Updating Components

`update` can replace local edits in styled source or vendored Primitive source. Never fetch raw
component files from GitHub. Use the CLI.

1. Run `npx starwind@latest update <name> --dry-run` to list the files that change.
2. Run `npx starwind@latest update <name> --diff [path]` to see the upstream change for each file.
3. Run `npx starwind@latest update <name> --view [path]` to see a new file in full.
4. Decide for each file:
   - No local changes: accept the update.
   - Local changes: read the local file, apply the upstream change, and keep the local change.
5. Use `--all` or `--overwrite` only with the user's explicit approval.

Vendored Primitives use the same flags under `starwind primitives update`.

For a pre-Runtime Astro project, read [v3-migration.md](./v3-migration.md) before you run
`starwind migrate`. For a project on the Vue or Svelte beta, follow
[beta-upgrade.md](./beta-upgrade.md).

## Quick Reference

```bash
# Initialize a project.
npx starwind@latest init
npx starwind@latest init --framework astro
npx starwind@latest init --framework react
npx starwind@latest init --framework vue
npx starwind@latest init --framework svelte

# Add components.
npx starwind@latest add button dialog combobox
npx starwind@latest add chart
npx starwind@latest add button --framework vue

# Preview updates.
npx starwind@latest update button --dry-run
npx starwind@latest update button --diff
npx starwind@latest update button --view src/components/starwind/button/Button.astro

# Search and docs.
npx starwind@latest search combobox --json
npx starwind@latest docs button dialog --json

# Primitives.
npx starwind@latest primitives add button --framework svelte
npx starwind@latest primitives list --framework all

# Legacy Astro migration.
npx starwind@latest migrate
```

**Framework targets:** `astro`, `react`, `vue`, `svelte`. Only `update`, `remove`,
`search --primitives`, and `primitives list` also accept `all`.
**Package managers:** `npm`, `pnpm`, `yarn`, `bun`.

## Detailed References

- [rules/frameworks.md](./rules/frameworks.md): syntax, import paths, Primitive imports,
  controlled state, `asChild` and the Svelte `child` snippet, theme init per host
- [rules/forms.md](./rules/forms.md): Field, FieldSet, labels, native submission, Input Group,
  validation
- [rules/composition.md](./rules/composition.md): groups, overlays, Card, Tabs, Avatar, Toast,
  Combobox, loading
- [rules/styling.md](./rules/styling.md): semantic tokens, variants, spacing, dark mode,
  `tailwind-variants`, z-index, RTL
- [rules/charts.md](./rules/charts.md): Chart parts, config, formatting, colors, shadcn mapping
- [rules/icons.md](./rules/icons.md): icon imports, sizing, accessible icon buttons
- [cli.md](./cli.md): commands, flags, framework targets, project setup effects, Pro
- [layers.md](./layers.md): styled, Primitive, vendored source, and Runtime boundaries
- [customization.md](./customization.md): tokens, chart tokens, dark mode, RTL stylesheet, brand
  specs
- [mcp.md](./mcp.md): Starwind MCP tools, AI files, source priority
- [v3-migration.md](./v3-migration.md): V2 Astro to V3 Runtime migration
- [beta-upgrade.md](./beta-upgrade.md): Vue and Svelte beta to stable upgrade
- [shadcn-migration.md](./shadcn-migration.md): shadcn theme token mapping
