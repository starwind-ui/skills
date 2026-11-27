<script setup lang="ts">
import DialogStatus from "@/components/DialogStatus.vue";
import { Button } from "@/components/starwind/button";
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
      <Button variant="outline">Delete account</Button>
    </DialogTrigger>
    <DialogStatus />
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete account</DialogTitle>
        <DialogDescription>This removes your account and its data.</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button variant="error">Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
