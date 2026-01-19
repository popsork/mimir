<template lang="pug">
NuxtLink(:to="to")
    slot
</template>
<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

defineProps<{
    to: RouteLocationRaw,
}>();

</script>
<style scoped lang="scss">
a {
    display: flex;
    align-items: center;
    padding: 0 steps(0.5);
    width: 100%;
    height: 100%;
    text-decoration: none;
    color: inherit;
}
</style>
