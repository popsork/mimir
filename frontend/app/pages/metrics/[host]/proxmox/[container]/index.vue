<script setup lang="ts">
const route = useRoute();
const host = computed(() => route.params.host as string);
const container = computed(() => route.params.container as string);
</script>

<template>
  <ContainersContainerPanel :host="host" :container="container" type="proxmox" />
</template>
