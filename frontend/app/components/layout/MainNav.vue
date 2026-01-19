<script setup lang="ts">
type NavLink = {
  label: string;
  to: { name: string };
};

const links: NavLink[] = [
  { label: 'Logs', to: { name: 'logs' } },
  { label: 'Metrics', to: { name: 'metrics' } }
];

const route = useRoute();

const isLinkActive = (to: { name: string }) => {
  return route.name === to.name;
};
</script>

<template>
  <nav class="flex gap-1">
    <NuxtLink
      v-for="link in links"
      :key="link.to.name"
      :to="link.to"
      class="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/20"
      :class="isLinkActive(link.to) ? 'bg-muted/30 text-primary' : ''"
    >
      {{ link.label }}
    </NuxtLink>
  </nav>
</template>
