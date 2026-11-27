<script setup lang="ts">
import DialogStatus from "@/components/DialogStatus.vue";
import { Button, ButtonVariants } from "@/components/starwind/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/starwind/dialog";
</script>

<template>
  <Dialog>
    <DialogTrigger asChild>
      <button type="button" :class="ButtonVariants.button({ variant: 'outline' })">
        Delete account
      </button>
    </DialogTrigger>
    <DialogStatus />
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete account</DialogTitle>
        <DialogDescription>This removes your account and its data.</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <button type="button" :class="ButtonVariants.button({ variant: 'outline' })">
            Cancel
          </button>
        </DialogClose>
        <Button variant="error">Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
