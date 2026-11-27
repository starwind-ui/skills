<script setup lang="ts">
import { inject } from "vue";
import { DialogContext } from "@starwind-ui/vue/dialog";

const dialog = inject(DialogContext);
</script>

<template>
  <p class="text-sm text-muted-foreground">{{ dialog?.open ? "Dialog is open" : "Dialog is closed" }}</p>
</template>
