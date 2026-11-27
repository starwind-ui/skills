# Frameworks

Starwind ships the same styled parts and Primitives for Astro, React, Vue, and Svelte. The syntax
around them changes with the framework. Read `framework` in `starwind.config.json` and the file
extension before you write code.

## Contents

- Syntax for each framework
- Styled import paths for each host
- Primitive imports
- Controlled state: `v-model` and `bind:`
- `asChild` and the Svelte `child` snippet
- Theme init for each host

---

## Syntax for each framework

| Framework | Classes and labels     | State                                                | Events                                               |
| --------- | ---------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| Astro     | `class`, `for`         | Static initial props such as `defaultChecked`        | Browser `<script>` and Runtime events                |
| React     | `className`, `htmlFor` | Controlled props, such as `open` with `onOpenChange` | React handlers                                       |
| Vue       | `class`, `for`         | `v-model`, `v-model:open`                            | `update:*` events and normal Vue listeners           |
| Svelte 5  | `class`, `for`         | `bind:` props, such as `bind:open`                   | Callback props, such as `onOpenChange(next, detail)` |

**Incorrect:** React syntax in an Astro, Vue, or Svelte file.

```astro
<Label htmlFor="email" className="text-sm">Email</Label>
```

**Correct:**

```astro
<Label for="email" class="text-sm">Email</Label>
```

The same parts take `className` and `htmlFor` in `.tsx` files only.

---

## Styled import paths for each host

Import styled parts from the folder that `starwind.config.json` names. The local `index.ts` lists
the installed exports.

| Host                         | Import path                                                               |
| ---------------------------- | ------------------------------------------------------------------------- |
| Default (Astro, React, Vite) | `@/components/starwind/<name>`                                            |
| Nuxt                         | `~/components/starwind/<name>`                                            |
| SvelteKit 2                  | `$lib/starwind/<name>`                                                    |
| SvelteKit 3                  | `#lib/starwind/<name>/index.js`                                           |
| Astro with Vue islands       | `componentDirs.vue`, for example `@/components/starwind-vue/<name>`       |
| Astro with Svelte islands    | `componentDirs.svelte`, for example `@/components/starwind-svelte/<name>` |

**Incorrect:** the default alias in a SvelteKit 2 project.

```svelte
<script lang="ts">
  import { Button } from "@/components/starwind/button";
</script>
```

**Correct:**

```svelte
<script lang="ts">
  import { Button } from "$lib/starwind/button";
</script>
```

---

## Primitive imports

Primitives come from `@starwind-ui/<framework>/<name>`. Use the package of the file's framework.

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

**Incorrect:** a React Primitive in a Vue file.

```vue
<script setup lang="ts">
import { Button } from "@starwind-ui/react/button";
</script>
```

**Correct:** `import { Button } from "@starwind-ui/vue/button";`

The installed package docs at `node_modules/@starwind-ui/<framework>/docs/primitives/<name>.md`
show each Primitive in that framework's syntax (1.6.0+).

---

## Controlled state: `v-model` and `bind:`

Vue uses `v-model` and named models such as `v-model:open`. Svelte uses `bind:` props. Use these as
the normal way to control state. Do not copy React state code into these frameworks.

**Incorrect (Vue):** JSX props in a Vue template.

```vue
<Dialog open="{open}" onOpenChange="{setOpen}">...</Dialog>
```

**Correct (Vue):**

```vue
<script setup lang="ts">
import { ref } from "vue";

const open = ref(false);
</script>

<template>
  <Dialog v-model:open="open">...</Dialog>
</template>
```

**Incorrect (Svelte):** React state in a Svelte component.

```svelte
<script lang="ts">
  const [open, setOpen] = useState(false);
</script>

<Dialog open={open} onOpenChange={setOpen}>...</Dialog>
```

**Correct (Svelte):**

```svelte
<script lang="ts">
  let open = $state(false);
</script>

<Dialog bind:open>...</Dialog>
```

When you need the change details, Vue `@openChange` and Svelte callback props such as
`onOpenChange(next, detail)` are also available. Astro markup is static after render. Use
`defaultChecked`, `defaultValue`, and Runtime events there.

---

## `asChild` and the Svelte `child` snippet

Astro, React, and Vue use `asChild` where the component docs list it. Svelte uses the `child`
snippet. The snippet gets `props` and `children`. Spread `props` on the element you render.

**Incorrect:** a button inside a trigger button.

```svelte
<DialogTrigger>
  <Button>Edit profile</Button>
</DialogTrigger>
```

**Incorrect:** `asChild` in Svelte.

```svelte
<DialogTrigger asChild>
  <Button>Edit profile</Button>
</DialogTrigger>
```

**Correct (Svelte):**

```svelte
<DialogTrigger>
  {#snippet child({ props, children })}
    <Button {...props}>{@render children?.()}</Button>
  {/snippet}
  Edit profile
</DialogTrigger>
```

**Correct (Astro, React):**

```astro
<DialogTrigger asChild>
  <Button>Edit profile</Button>
</DialogTrigger>
```

**Correct (Vue):** the documented Vue shape is a native element with the Button variant classes.

```vue
<script setup lang="ts">
import { ButtonVariants } from "@/components/starwind/button";
</script>

<template>
  <DialogTrigger asChild>
    <button type="button" :class="ButtonVariants.button({})">Edit profile</button>
  </DialogTrigger>
</template>
```

Use `asChild` or `child` only on parts whose docs or local source accept it.

---

## Theme init for each host

The theme init script applies the saved or system theme before paint. The theme change event is
`starwind:theme-change` in every framework.

| Host                                                  | Theme init                                                                                                   |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Astro (also Astro with React, Vue, or Svelte islands) | `ThemeInitScript` from `@starwind-ui/astro/theme` in the shared layout `<head>`                              |
| Next.js, TanStack Start, React Router                 | Render `ThemeInitScript` from `@starwind-ui/react/theme` in the document head                                |
| Vite React, Vite Vue, Vite Svelte                     | `getThemeInitScript` from `@starwind-ui/<framework>/theme` in a `transformIndexHtml` plugin. `init` adds it. |
| Nuxt                                                  | Add `getThemeInitScript()` from `@starwind-ui/vue/theme` to `app.head.script` by hand                        |
| SvelteKit                                             | Add the script from `@starwind-ui/svelte/theme` to the `<head>` of `src/app.html` by hand                    |

**Incorrect:** an inline `localStorage` theme helper beside the Starwind script.

```astro
<script is:inline>
  if (localStorage.getItem("theme") === "dark") document.documentElement.classList.add("dark");
</script>
```

**Correct:**

```astro
---
import { ThemeInitScript } from "@starwind-ui/astro/theme";
---

<head>
  <ThemeInitScript />
</head>
```

See [customization.md](../customization.md#dark-mode-initialization) for the Vite plugin and the
Nuxt example.
