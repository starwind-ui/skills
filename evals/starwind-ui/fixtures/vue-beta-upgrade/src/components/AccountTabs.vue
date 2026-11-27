<script setup lang="ts">
import { Tabs } from "@starwind-ui/vue/tabs";
</script>

<template>
  <Tabs.Root default-value="profile" v-slot="{ value }" class="flex flex-col gap-4">
    <Tabs.List class="flex gap-2 border-b border-border">
      <Tabs.Tab value="profile" v-slot="{ active }" class="px-3 py-2">
        <span :class="active ? 'font-semibold text-foreground' : 'text-muted-foreground'">Profile</span>
      </Tabs.Tab>
      <Tabs.Tab value="billing" v-slot="{ active }" class="px-3 py-2">
        <span :class="active ? 'font-semibold text-foreground' : 'text-muted-foreground'">Billing</span>
      </Tabs.Tab>
    </Tabs.List>
    <Tabs.Panel value="profile">Profile settings</Tabs.Panel>
    <Tabs.Panel value="billing">Billing settings</Tabs.Panel>
    <p class="text-sm text-muted-foreground">Current tab: {{ value }}</p>
  </Tabs.Root>
</template>
