# Starwind v3 Layers

Read this reference when a task goes below the normal styled-component surface.

## Contents

- layer decision table
- styled source
- package Primitive adapters
- vendored Primitive source
- Runtime and raw HTML
- package docs
- public and internal contract boundaries

## Decision Table

| Layer              | Use when                                                                                    | Ownership                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Styled component   | The app needs finished UI with editable variants and markup.                                | Source is copied into the app; Runtime behavior stays a package dependency.      |
| Primitive package  | The app needs unstyled framework-native anatomy and behavior.                               | App owns composition and styles; `@starwind-ui/<framework>` owns adapter source. |
| Vendored Primitive | The app must edit the framework adapter itself.                                             | Compile-ready adapter source is copied into the app and tracked by config.       |
| Runtime/raw HTML   | The app renders its own DOM contract, builds an adapter, or integrates without a framework. | App owns markup and lifecycle; `@starwind-ui/runtime` owns controllers.          |

`<framework>` is `astro`, `react`, `vue`, or `svelte`.

Styled component names and Primitive names are related but do not always match one to one. A styled
component can combine, rename, or omit a Primitive. Confirm the component page's Behavior
Foundation before you move between layers.

## Styled Source

Use the CLI for the normal path:

```bash
npx starwind@latest add dialog
```

Import through the configured application path:

| Host                         | Import                                                                    |
| ---------------------------- | ------------------------------------------------------------------------- |
| Default (Astro, React, Vite) | `@/components/starwind/dialog`                                            |
| Nuxt                         | `~/components/starwind/dialog`                                            |
| SvelteKit 2                  | `$lib/starwind/dialog`                                                    |
| SvelteKit 3                  | `#lib/starwind/dialog/index.js`                                           |
| Astro with Vue islands       | `componentDirs.vue`, for example `@/components/starwind-vue/dialog`       |
| Astro with Svelte islands    | `componentDirs.svelte`, for example `@/components/starwind-svelte/dialog` |

```astro
---
import { Dialog, DialogContent } from "@/components/starwind/dialog";
---
```

```svelte
<script lang="ts">
  import { Dialog, DialogContent } from "$lib/starwind/dialog";
</script>
```

The local `index.ts` is authoritative for installed exports. Customize variants, Tailwind classes,
wrapper markup, and composition locally while you keep the adapter contract.

## Primitive Packages

Initialized projects already have the adapter package for their primary framework. Import from the
package that matches the file.

```astro
---
import { Button } from "@starwind-ui/astro/button";
---

<Button.Root type="button">Save</Button.Root>
```

```tsx
import { Button } from "@starwind-ui/react/button";

export function SaveButton() {
  return <Button.Root type="button">Save</Button.Root>;
}
```

```vue
<script setup lang="ts">
import { Button } from "@starwind-ui/vue/button";
</script>

<template>
  <Button.Root type="button">Save</Button.Root>
</template>
```

```svelte
<script lang="ts">
  import { Dialog } from "@starwind-ui/svelte/dialog";

  let open = $state(false);
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>Open</Dialog.Trigger>
</Dialog.Root>
```

Read the Primitive API page for parts, props, events, and controlled state. In 1.6.0 and newer, the
installed page is `node_modules/@starwind-ui/<framework>/docs/primitives/<name>.md`.

## Vendored Primitive Source

Vendor only when the app must own the adapter implementation:

```bash
npx starwind@latest primitives add button --framework react
npx starwind@latest primitives update button --dry-run
```

Config tracks the framework, destination, and installed Primitive versions. `primitives update` can
replace local edits, so preview and review it. Keep vendored adapter source in `primitiveDir` or
`primitiveDirs.<framework>`, apart from the styled component folder.

## Runtime And Raw HTML

Direct controllers use component subpaths:

```ts
import { createSelect } from "@starwind-ui/runtime/select";

const instance = createSelect(root);
instance.destroy();
```

Raw HTML discovery can initialize at an application root:

```ts
import { initStarwind } from "@starwind-ui/runtime/init-starwind";

const runtime = initStarwind(document);
runtime.destroy();
```

Own lifecycle cleanup. Use the exact DOM contract, command events, detail types, and initialization
rules from the Runtime docs. `initStarwind` does not start charts. Use `createChart` from
`@starwind-ui/runtime/chart`.

## Package Docs

From 1.6.0, each package ships Markdown docs for its installed version in
`node_modules/@starwind-ui/<pkg>/docs/`, with `README.md` and `llms.txt`.

- `@starwind-ui/runtime/docs/`: `initStarwind`, raw HTML, theme, and each controller.
- `@starwind-ui/<framework>/docs/primitives/<name>.md`: one page per Primitive in that framework's
  syntax.
- There are no Styled component pages. Use the docs site or local source for styled components.

Read these first for Primitive and Runtime APIs. They match the installed version, so they win over
the docs site when the two differ. Packages before 1.6.0 have no `docs` folder.

## Contract Boundaries

- Runtime owns shared DOM behavior, state, events, focus, forms, overlays, timers, and cleanup.
- Framework adapters connect props, refs, events, lifecycle, and markup to Runtime.
- Styled components own Starwind composition, defaults, variants, icons, classes, and slots.
- `data-slot` is the public part identity and the normal visual customization hook.
- `data-sw-*` attributes are Runtime behavior and discovery hooks. Keep them, but use public slots
  and documented state attributes for app styling.
- Keep native form participation and Runtime-managed keyboard, focus, dismissal, portal, and
  cleanup behavior when you change local source.

The lower-layer task is complete when the chosen layer is intentional, imports use the matching
framework package, lifecycle cleanup is handled, and all required Runtime hooks remain intact.
