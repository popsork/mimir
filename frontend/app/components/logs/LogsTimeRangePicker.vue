<script setup lang="ts">
import { useLogsStore } from '../../stores/logs/list';

const logsStore = useLogsStore();
const { from, to } = storeToRefs(logsStore);

type Preset = {
  label: string;
  value: string;
  ms: number;
};

const presets: Preset[] = [
  { label: 'Last 1 minute', value: '1m', ms: 1 * 60 * 1000 },
  { label: 'Last 5 minutes', value: '5m', ms: 5 * 60 * 1000 },
  { label: 'Last 15 minutes', value: '15m', ms: 15 * 60 * 1000 },
  { label: 'Last 30 minutes', value: '30m', ms: 30 * 60 * 1000 },
  { label: 'Last hour', value: '1h', ms: 60 * 60 * 1000 },
  { label: 'Last 3 hours', value: '3h', ms: 3 * 60 * 60 * 1000 },
  { label: 'Last 6 hours', value: '6h', ms: 6 * 60 * 60 * 1000 },
  { label: 'Last 12 hours', value: '12h', ms: 12 * 60 * 60 * 1000 },
  { label: 'Last 1 day', value: '1d', ms: 24 * 60 * 60 * 1000 },
  { label: 'Last 2 days', value: '2d', ms: 2 * 24 * 60 * 60 * 1000 },
];

const activePreset = ref<string | null>('Last 5 minutes');

const pad = (value: number) => String(value).padStart(2, '0');
const toInputValue = (date: Date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const applyPreset = async (preset: Preset) => {
  const now = new Date();
  const fromDate = new Date(now.getTime() - preset.ms);
  from.value = toInputValue(fromDate);
  to.value = toInputValue(now);
  activePreset.value = preset.label;
  await logsStore.fetchLogs();
};

onMounted(() => {
  const preset = presets.find((item) => item.value === '5m');
  if (preset) {
    void applyPreset(preset);
  }
});

const applyRange = async () => {
  activePreset.value = null;
  await logsStore.fetchLogs();
};

const onFromChange = (value: string | null) => {
  from.value = value;
  activePreset.value = null;
};

const onToChange = (value: string | null) => {
  to.value = value;
  activePreset.value = null;
};

const displayLabel = computed(() => {
  if (activePreset.value) return activePreset.value;
  if (!from.value && !to.value) return 'Any time';
  return 'Custom range';
});
</script>

<template>
  <UPopover placement="bottom-end">
    <UButton size="sm" color="neutral" variant="soft" icon="i-heroicons-calendar-days-20-solid">
      {{ displayLabel }}
    </UButton>

    <template #content>
      <div class="grid gap-4 p-4 sm:grid-cols-[1fr_200px]">
        <LogsTimeRangeInputs
          :from="from"
          :to="to"
          @update:from="onFromChange"
          @update:to="onToChange"
          @apply="applyRange"
        />

        <LogsTimeRangePresetList
          :presets="presets"
          :selected-label="activePreset"
          @select="applyPreset"
        />
      </div>
    </template>
  </UPopover>
</template>
