<script setup lang="ts">
import AccountTabs from "@/components/AccountTabs.vue";
import DeleteDialog from "@/components/DeleteDialog.vue";
</script>

<template>
  <main class="mx-auto flex max-w-2xl flex-col gap-6 p-6">
    <h1 class="text-2xl font-semibold">Account</h1>
    <AccountTabs />
    <DeleteDialog />
  </main>
</template>
