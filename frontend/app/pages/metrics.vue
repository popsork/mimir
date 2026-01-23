<template>
  <UPage>
    <template #left>
      <UPageAside>
        <UCard>
          <MetricsSidebarTree />
        </UCard>
      </UPageAside>
    </template>

    <UPageBody>
      <NuxtPage />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import {useMetricsTreeStore} from "~/stores/metrics/tree";

const treeStore = useMetricsTreeStore();
const { loaded: treeLoaded } = storeToRefs(treeStore);

const route = useRoute();
</script>

<style scoped lang="scss">

</style>
