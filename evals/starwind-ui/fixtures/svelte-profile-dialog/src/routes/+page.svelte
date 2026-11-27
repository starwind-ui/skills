<script lang="ts">
  import ProfileDialog from "$lib/ProfileDialog.svelte";

  let open = $state(false);
</script>

<main class="flex flex-col gap-4 p-6">
  <h1 class="text-2xl font-semibold">Account</h1>
  <p>Profile dialog is {open ? "open" : "closed"}.</p>
  <ProfileDialog bind:open />
</main>
