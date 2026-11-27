# Upgrading From The Vue And Svelte Beta

Use this runbook for a project on a beta version of `@starwind-ui/vue` or `@starwind-ui/svelte`.
Both packages are stable from 1.6.0. They publish on `latest` and share one version with
`@starwind-ui/runtime`, `@starwind-ui/astro`, and `@starwind-ui/react`. The `beta` tag now points to
the stable version.

Primary sources:

- https://starwind.dev/blog/starwind-ui-3-7/
- https://starwind.dev/blog/starwind-ui-3-6/#removed-beta-only-apis

## Contents

- before you start
- upgrade steps
- removed Vue APIs
- removed Svelte APIs
- checks

## Before You Start

1. Check Git status and account for every existing change. `update` can overwrite local component
   edits, so commit them first.
2. Find every `@beta` reference: `package.json` scripts, install commands, CI files, README setup
   steps, and docs.
3. Run the build, typecheck, and tests. Record each failure that exists before the upgrade.

## Upgrade Steps

1. Replace `@starwind-ui/vue@beta` and `@starwind-ui/svelte@beta` with the plain package name in
   install commands and scripts. Do not write `@beta` again.
2. In Vue, upgrade Vue in the same step. `@starwind-ui/vue` needs Vue 3.5.21 or newer:

   ```bash
   npm install @starwind-ui/vue vue@^3.5.21
   ```

   Svelte needs Svelte 5.29 or newer in the Svelte 5 line:

   ```bash
   npm install @starwind-ui/svelte
   ```

   Use the project's package manager for these commands.

3. Update copied styled components. Preview first, then run the update with the user's approval:

   ```bash
   npx starwind@latest update --all --dry-run
   npx starwind@latest update --all
   ```

4. Update vendored Primitive files, if the project has any:

   ```bash
   npx starwind@latest primitives update --all
   ```

5. Change application code that uses an API from the lists below. Also check the 3.6 list of
   removed beta-only APIs.

**Incorrect:** a beta install command left in a script.

```json
{ "scripts": { "setup:ui": "pnpm add @starwind-ui/vue@beta" } }
```

**Correct:**

```json
{ "scripts": { "setup:ui": "pnpm add @starwind-ui/vue vue@^3.5.21" } }
```

## Removed Vue APIs

- `DialogContext`, `AlertDialogContext`, and `DrawerContext` are removed. Delete the import. Use
  `v-model:open` on the root to read or set the open state.
- `SelectContextValue` no longer has `element`, `mounted`, `requestRefresh()`, or
  `registerPortal()`. `ComboboxContextValue` no longer has `element`, `mounted`, or
  `registerPortal()`. `TabsContextValue` no longer has `refresh()`. The parts get these values from
  their Root.
- The default slots of the Tabs root, the Accordion root, `Tabs.Tab`, `Tabs.Panel`, `Select.Value`,
  and the styled `SelectValue` no longer receive props. Use `v-model` on the root. Style the active
  tab with `data-state="active"`. Leave `Select.Value` empty to show the selected label. Run
  `starwind update select` to update a copied `SelectValue.vue`.
- `useSidebarContext()` returns `null` outside a `SidebarProvider`. Check for `null` before you read
  its fields.

**Incorrect:** slot props on Tabs.

```vue
<Tabs.Root default-value="account" v-slot="{ value }">
  <Tabs.List>
    <Tabs.Tab value="account" v-slot="{ active }">
      <span :class="active ? 'font-semibold' : ''">Account</span>
    </Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="account">Account settings</Tabs.Panel>
  <p>Current: {{ value }}</p>
</Tabs.Root>
```

**Correct:**

```vue
<script setup lang="ts">
import { ref } from "vue";
import { Tabs } from "@starwind-ui/vue/tabs";

const tab = ref("account");
</script>

<template>
  <Tabs.Root v-model="tab">
    <Tabs.List>
      <Tabs.Tab value="account" class="data-[state=active]:font-semibold">Account</Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="account">Account settings</Tabs.Panel>
    <p>Current: {{ tab }}</p>
  </Tabs.Root>
</template>
```

## Removed Svelte APIs

- `CheckboxGroupContext` and `CheckboxGroupContextValue` are removed. Use the checkbox group
  components to group checkboxes.
- `SelectContextValue` no longer has `mounted`, `registerTrigger()`, or `registerPortal()`.
- The `children` snippets of the Navigation Menu, Slider, Tabs, and Accordion roots, `Tabs.Tab`,
  `Tabs.Panel`, `Select.Value`, and the styled `NavigationMenu` and `SelectValue` no longer receive
  arguments. Use `bind:value` on the root. Style the active tab with `data-state="active"`. Run
  `starwind update navigation-menu select` to update the copied styled files.
- `SidebarContextValue` no longer has `isMobile` or `setMobileOpen()`. Use `bind:mobileOpen` on
  `SidebarProvider`.
- `useSidebarContext()` returns `null` outside a `SidebarProvider`.
- `getAlertDialogControlRefresh` is replaced by `__useAlertDialogControl()`. Run
  `starwind update alert-dialog`. If you keep your own copies of `AlertDialogAction.svelte` and
  `AlertDialogCancel.svelte`, import the helper from `@starwind-ui/svelte/alert-dialog` and delete
  the old `createAttachmentKey` block. Call the helper once and spread the result on the button.
  Keep `data-sw-alert-dialog-close`, because the dialog uses it to find the closing button:

```svelte
<script lang="ts">
  import { __useAlertDialogControl } from "@starwind-ui/svelte/alert-dialog";

  const controlAttachment = __useAlertDialogControl();
</script>

<Button data-sw-alert-dialog-close {...controlAttachment}>Continue</Button>
```

**Incorrect:** snippet arguments on a Tabs root.

```svelte
<Tabs.Root>
  {#snippet children({ value })}
    <p>Current: {value}</p>
  {/snippet}
</Tabs.Root>
```

**Correct:**

```svelte
<script lang="ts">
  let tab = $state("account");
</script>

<Tabs.Root bind:value={tab}>
  <p>Current: {tab}</p>
</Tabs.Root>
```

## Checks

- No `@beta` remains in `package.json`, scripts, CI, or docs.
- `package.json` has `vue` 3.5.21 or newer, or Svelte 5.29 or newer below 6.
- `starwind.config.json` still has `version: 2`. The upgrade does not change the config format.
- Build, typecheck, and tests pass, or each failure existed before the upgrade.
- Tabs, Select, Dialog, Sidebar, and Alert Dialog work in a browser.
