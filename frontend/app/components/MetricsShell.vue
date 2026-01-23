<script setup lang="ts">
import { useMetricsStore } from '../../app-back/metrics';
import { useMetricsOverviewStore } from '../../app-back/metricsOverview';
import { useMetricsRefreshStore } from '../../app-back/metricsRefresh';
import { useMetricsSummaryStore } from '../../app-back/metricsSummary';
import { useMetricsTreeStore } from '../../app-back/metricsTree';
import { useMetricsWindowStore } from '../../app-back/metricsWindow';
import type { MetricsTreeNode } from '../../app-back/metricsTree';
import { routeFromTreeValue, treeValueFromRoute } from '../utils/metricsRouting';

const metricsStore = useMetricsStore();
const treeStore = useMetricsTreeStore();
const overviewStore = useMetricsOverviewStore();
const windowStore = useMetricsWindowStore();
const refreshStore = useMetricsRefreshStore();
const summaryStore = useMetricsSummaryStore();

const { windowMinutes } = storeToRefs(windowStore);
const { overview, items: treeItems } = storeToRefs(treeStore);
const { hostCount, totalMetricCount, lastUpdated } = storeToRefs(summaryStore);

const route = useRoute();
const router = useRouter();

const autoRefresh = ref(true);
const refreshMs = 5000;
let refreshTimer: ReturnType<typeof setInterval> | null = null;
const isRefreshing = ref(false);
const selected = ref<MetricsTreeNode | undefined>(undefined);
const windowDraft = ref(String(windowMinutes.value));

const refreshBase = async (includeTree: boolean) => {
  const baseCalls = [metricsStore.fetchMetrics(), overviewStore.fetchOverview()];
  if (includeTree) {
    baseCalls.push(treeStore.fetchTree());
  }
  await Promise.all(baseCalls);
};

const refreshAll = async (includeTree = false) => {
  if (isRefreshing.value) {
    return;
  }
  isRefreshing.value = true;
  try {
    await refreshBase(includeTree);
    await refreshStore.refreshActive();
  } finally {
    isRefreshing.value = false;
  }
};

const applyWindow = () => {
  const parsed = Number(windowDraft.value);
  if (Number.isFinite(parsed)) {
    windowStore.setWindowMinutes(parsed);
  } else {
    windowDraft.value = String(windowMinutes.value);
  }
};

const syncSelected = () => {
  const value = treeValueFromRoute(route);
  selected.value = treeStore.findNodeByValue(value) ?? treeItems.value[0];
};

const navigateFromSelection = (node?: MetricsTreeNode) => {
  if (!node) {
    return;
  }
  const next = routeFromTreeValue(node.value);
  if (!next || next === route.path) {
    return;
  }
  router.push(next);
};

const startAutoRefresh = () => {
  if (refreshTimer) {
    return;
  }
  refreshTimer = setInterval(() => {
    refreshAll();
  }, refreshMs);
};

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

watch(autoRefresh, (value) => {
  if (value) {
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
});

watch(windowMinutes, (value) => {
  windowDraft.value = String(value);
  refreshAll();
});

watch(() => route.fullPath, () => {
  syncSelected();
});

watch(treeItems, () => {
  syncSelected();
});

watch(selected, (value) => {
  navigateFromSelection(value);
});

onMounted(async () => {
  await refreshBase(true);
  syncSelected();
  if (autoRefresh.value) {
    startAutoRefresh();
  }
});

onBeforeUnmount(() => {
  stopAutoRefresh();
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <MetricsOverviewCard
        class="flex-1 min-w-[280px]"
        :window-minutes="windowMinutes"
        :host-count="hostCount"
        :signal-count="totalMetricCount"
        :container-count="overview.total_containers"
        :running-count="overview.total_running"
        :last-updated="lastUpdated"
      />
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-2">
          <UFormField label="Window (min)" size="xs">
            <UInput
              v-model="windowDraft"
              type="number"
              min="1"
              max="1440"
              size="xs"
              class="w-24"
              @keydown.enter="applyWindow"
            />
          </UFormField>
          <UButton size="xs" color="neutral" variant="soft" @click="applyWindow">
            Set
          </UButton>
        </div>
        <UButton size="sm" color="neutral" variant="ghost" @click="refreshAll(true)">
          Refresh
        </UButton>
        <UButton
          size="sm"
          :color="autoRefresh ? 'primary' : 'neutral'"
          variant="soft"
          @click="autoRefresh = !autoRefresh"
        >
          Auto {{ autoRefresh ? 'On' : 'Off' }}
        </UButton>
      </div>
    </div>

    <UPage>
      <template #left>
        <UPageAside>
          <UCard>
            <UTree v-model="selected" :items="treeItems" :get-key="(item) => item.value" />
          </UCard>
        </UPageAside>
      </template>

      <UPageBody>
        <slot />
      </UPageBody>
    </UPage>
  </div>
</template>
