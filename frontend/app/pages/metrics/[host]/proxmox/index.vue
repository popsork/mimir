<script setup lang="ts">
const route = useRoute();
const host = computed(() => route.params.host as string);
</script>

<template>
  <ContainersOverviewPanel :host="host" type="proxmox" />
</template>
