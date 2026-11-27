# Customization And Theming

Starwind styled components use semantic CSS variables registered with Tailwind CSS 4. Global design
changes belong in the active CSS file from `starwind.config.json`, not a second theme file.

## Contents

- token flow and semantic color variables
- chart tokens
- border radius
- dark-mode initialization for each host
- RTL stylesheet
- changing and adding semantic tokens
- applying a brand spec
- styled-component variants and wrappers
- checking styled and vendored-source updates

## Token Flow

1. `:root` defines light values and `.dark` defines dark values.
2. `@theme inline` maps them to Tailwind utilities.
3. Styled components use utilities such as `bg-primary`, `text-muted-foreground`, and
   `border-border`.
4. Changing a semantic variable updates every component that consumes it.

Preserve existing `@theme inline`, `:root`, `.dark`, sidebar, status, and chart tokens, radii,
keyframes, custom variants, and component-specific variables.

## Color Variables

Starwind uses the `name` / `name-foreground` convention. The base variable is for backgrounds,
fills, borders, or actions. The `-foreground` variable is for readable text or icons on that
background.

| Variable                                 | Purpose                                           |
| ---------------------------------------- | ------------------------------------------------- |
| `--background` / `--foreground`          | Page background and default text                  |
| `--card` / `--card-foreground`           | Card surfaces                                     |
| `--popover` / `--popover-foreground`     | Popovers, tooltips, selects, and menus            |
| `--primary` / `--primary-foreground`     | Primary buttons and actions                       |
| `--secondary` / `--secondary-foreground` | Secondary actions                                 |
| `--primary-accent`, `--secondary-accent` | Brand text colors readable on the page background |
| `--muted` / `--muted-foreground`         | Muted surfaces and quiet text                     |
| `--accent` / `--accent-foreground`       | Hover and selected states                         |
| `--info` / `--info-foreground`           | Informational states                              |
| `--success` / `--success-foreground`     | Successful states                                 |
| `--warning` / `--warning-foreground`     | Warning states                                    |
| `--error` / `--error-foreground`         | Error and destructive states                      |
| `--border`                               | Default border color                              |
| `--input`                                | Form input borders                                |
| `--outline`                              | Focus outline color                               |
| `--radius`                               | Global radius seed                                |
| `--sidebar-*`                            | Sidebar-specific colors                           |
| `--chart-1` to `--chart-5`               | Chart series colors                               |

Default themes commonly reference Tailwind CSS 4 palette variables such as
`var(--color-blue-700)`. Follow the active file when it uses OKLCH, hex, `rgb()`, or another valid
CSS color format.

## Chart Tokens

`npx starwind@latest add chart` adds `--chart-1` to `--chart-5` to the active CSS file when they are
missing, and maps them in `@theme inline` as `--color-chart-1` to `--color-chart-5`. The defaults
use the blue ramp of the Starwind theme. Change them in both modes to restyle every chart:

```css
:root {
  --chart-1: var(--color-blue-300);
  --chart-2: var(--color-blue-500);
  --chart-3: var(--color-blue-600);
  --chart-4: var(--color-blue-700);
  --chart-5: var(--color-blue-800);
}

.dark {
  --chart-1: var(--color-blue-300);
  --chart-2: var(--color-blue-500);
  --chart-3: var(--color-blue-600);
  --chart-4: var(--color-blue-700);
  --chart-5: var(--color-blue-800);
}
```

Chart configs refer to the tokens with `color: "var(--chart-1)"`. See
[rules/charts.md](./rules/charts.md).

## Border Radius

`--radius` is the global seed. Starwind registers a complete Tailwind radius scale from it:

| Token          | Value                            |
| -------------- | -------------------------------- |
| `--radius-xs`  | `calc(var(--radius) - 0.375rem)` |
| `--radius-sm`  | `calc(var(--radius) - 0.25rem)`  |
| `--radius-md`  | `calc(var(--radius) - 0.125rem)` |
| `--radius-lg`  | `var(--radius)`                  |
| `--radius-xl`  | `calc(var(--radius) + 0.25rem)`  |
| `--radius-2xl` | `calc(var(--radius) + 0.5rem)`   |
| `--radius-3xl` | `calc(var(--radius) + 1rem)`     |

Change `--radius` for a system-wide adjustment. Use a local class such as `rounded-full` only for a
deliberate exception.

## Dark Mode Initialization

Starwind uses the `.dark` class and the shared Runtime theme controller. The theme init script
applies the saved or system theme before paint. Each host adds it in a different place:

| Host                                  | Theme init                                                                                   |
| ------------------------------------- | -------------------------------------------------------------------------------------------- |
| Astro, including Astro with islands   | `ThemeInitScript` from `@starwind-ui/astro/theme` in the shared layout `<head>`              |
| Next.js, TanStack Start, React Router | `ThemeInitScript` from `@starwind-ui/react/theme` in the document head                       |
| Vite React, Vite Vue, Vite Svelte     | `getThemeInitScript` from `@starwind-ui/<framework>/theme` in a Vite plugin. `init` adds it. |
| Nuxt                                  | `getThemeInitScript` from `@starwind-ui/vue/theme` in `nuxt.config.ts`, by hand              |
| Laravel with Inertia Vue, Quasar      | A generated `public/starwind-theme.js` loaded in the document head, by hand                  |
| SvelteKit                             | The script from `@starwind-ui/svelte/theme` in the `<head>` of `src/app.html`, by hand       |

Astro:

```astro
---
import { ThemeInitScript } from "@starwind-ui/astro/theme";
---

<head>
  <ThemeInitScript />
</head>
```

React framework document/root:

```tsx
import { ThemeInitScript } from "@starwind-ui/react/theme";

export function DocumentHead() {
  return (
    <head>
      <ThemeInitScript />
    </head>
  );
}
```

Vite React, Vite Vue, and Vite Svelte (`init` adds this plugin; change the import to the project's
framework):

```ts
import { getThemeInitScript } from "@starwind-ui/vue/theme";
import { defineConfig, type Plugin } from "vite";

function starwindThemeInitPlugin(): Plugin {
  return {
    name: "starwind-theme-init",
    transformIndexHtml() {
      return [
        {
          tag: "script",
          attrs: { "data-starwind-theme-init": "" },
          children: getThemeInitScript(),
          injectTo: "head-prepend",
        },
      ];
    },
  };
}

export default defineConfig({
  plugins: [
    // Keep the existing framework and Tailwind plugins.
    starwindThemeInitPlugin(),
  ],
});
```

Nuxt:

```ts
import { getThemeInitScript } from "@starwind-ui/vue/theme";

export default defineNuxtConfig({
  app: {
    head: {
      script: [{ innerHTML: getThemeInitScript() }],
    },
  },
});
```

Laravel with Inertia Vue and Quasar: generate the script as a public asset, and run the script
before development and production builds:

```js
// scripts/write-starwind-theme.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { getThemeInitScript } from "@starwind-ui/vue/theme";

await mkdir("public", { recursive: true });
await writeFile("public/starwind-theme.js", getThemeInitScript());
```

- Laravel: load `<script src="{{ asset('starwind-theme.js') }}"></script>` before the application
  scripts in the `<head>` of `resources/views/app.blade.php`. The Laravel starter already has an
  appearance preference and a head script. If you use the Starwind controller, replace that head
  script and connect all theme controls to the same storage key.
- Quasar: load `<script src="/starwind-theme.js"></script>` in the `<head>` of the root
  `index.html`, before the application entry. Under a subdirectory, prefix the URL with the
  configured public path.

Regenerate the file after you change theme options or update the adapter. Details:
`https://starwind.dev/docs/getting-started/dark-mode.md`.

For programmatic changes, import `initThemeController` from the matching adapter package and listen
for `starwind:theme-change`. Use the `theme-toggle` component for a ready-made control.

Remove a legacy inline localStorage/theme helper during V3 migration so two controllers do not race.
The legacy `theme:change` event may exist for compatibility, but new integrations use the Runtime
event.

## RTL Stylesheet

`starwind init` adds these two lines to new Tailwind stylesheets:

```css
@custom-variant rtl (&:where([dir="rtl"], [dir="rtl"] *:not([dir="rtl"] [dir="ltr"], [dir="rtl"] [dir="ltr"] *)));
@custom-variant ltr (&:where(:not([dir="rtl"], [dir="rtl"] *:not([dir="rtl"] [dir="ltr"], [dir="rtl"] [dir="ltr"] *))));
```

They replace the Tailwind `rtl` and `ltr` variants. They also change your own `rtl:` and `ltr:`
classes. Review any existing `rtl` or `ltr` definitions before you replace them.

If `init` kept an existing stylesheet, add the lines only when:

- the app puts LTR content inside an RTL page, such as a URL input with `dir="ltr"`; or
- the app uses its own `ltr:` classes inside RTL content.

A page with one direction needs no change. An RTL section inside an LTR page also works without
them. The lines need no Vite config change, and a production build gives the same result as dev.
One level of mixed direction works. See [rules/styling.md](./rules/styling.md#rtl).

## Change Existing Tokens

Follow the active file's value style:

```css
:root {
  --primary: var(--color-emerald-700);
  --primary-foreground: var(--color-white);
  --primary-accent: var(--color-emerald-800);
}

.dark {
  --primary: var(--color-emerald-500);
  --primary-foreground: var(--color-neutral-950);
  --primary-accent: var(--color-emerald-300);
}
```

Keep component usage semantic:

```astro
<Button variant="primary">Save changes</Button>
```

## Add A Semantic Color

Register the utility and define both modes in the same active CSS file:

```css
@theme inline {
  --color-brand: var(--brand);
  --color-brand-foreground: var(--brand-foreground);
}

:root {
  --brand: var(--color-blue-700);
  --brand-foreground: var(--color-white);
}

.dark {
  --brand: var(--color-blue-500);
  --brand-foreground: var(--color-neutral-950);
}
```

Use the registered utilities with the current framework's attribute syntax. Astro, Vue, and Svelte
use `class`. React uses `className`:

```astro
<div class="bg-brand text-brand-foreground">Brand surface</div>
```

```tsx
<div className="bg-brand text-brand-foreground">Brand surface</div>
```

Starwind uses Tailwind CSS 4. Add Tailwind v3 config only when the host project intentionally carries
a separate legacy setup.

## Apply A Brand Spec

When the user gives a brand spec or a `DESIGN.md`:

1. Read the spec's colors, radius, fonts, and control sizes before you edit.
2. Map each brand color onto the existing variables in the active CSS file: `--primary`,
   `--primary-foreground`, `--primary-accent`, `--secondary`, `--accent`, `--border`, `--input`,
   `--outline`, the status tokens, `--sidebar-*`, and `--chart-1` to `--chart-5`. Set `:root` and
   `.dark`. Do not create a second theme file.
3. Set `--radius` from the spec. The radius scale follows it.
4. To change control heights, edit the `size` variants of all installed controls together in their
   `variants.ts` files. Controls of the same size then keep the same height.
5. Check contrast for each `name` / `name-foreground` pair, in light and dark mode.
6. Check the result in a browser in both modes.

## Customize A Styled Component

See [rules/styling.md](./rules/styling.md) for semantic-token, state-selector, spacing, and component
override rules.

Use this order:

1. Existing variant or prop.
2. Semantic token.
3. Layout/scoped class at the call site.
4. New local variant following the installed `tailwind-variants` pattern.
5. Wrapper composition.
6. Direct local styled-source edit.

To add a reusable variant, edit the installed component's `variants.ts` and follow its existing
`tailwind-variants` shape:

```ts
variant: {
  brand: "bg-brand text-brand-foreground hover:bg-brand/90 focus-visible:ring-brand/50",
}
```

For repeated composition, make a framework-native wrapper instead of duplicating markup. Astro
example:

```astro
---
import { Alert, AlertDescription, AlertTitle } from "@/components/starwind/alert";

interface Props {
  title: string;
}

const { title } = Astro.props;
---

<Alert>
  <AlertTitle>{title}</AlertTitle>
  <AlertDescription><slot /></AlertDescription>
</Alert>
```

Use the same composition with typed props and `children` in React, props and a default slot in
Vue, and props and a `children` snippet in Svelte.

For source edits, preserve framework adapter imports, `data-slot`, required `data-sw-*` hooks,
public exports, native semantics, and documented Runtime state attributes.

## Checking For Updates

Styled source belongs to the application, but an update can replace it. Preview before accepting
upstream changes:

```bash
npx starwind@latest update button --dry-run
npx starwind@latest update button --diff
npx starwind@latest update button --view
```

Vendored Primitive source has the same ownership risk. Preview it through its own namespace:

```bash
npx starwind@latest primitives update button --dry-run
npx starwind@latest primitives update button --diff
```
