<script setup lang="ts">
import { DEFAULT_LOGS_TIME_RANGE_PRESET, LOGS_TIME_RANGE_PRESETS, findLogsTimeRangePreset } from '../../utils/logsTimeRangePresets';
import { useLogsStore } from '../../stores/logs/list';

const logsStore = useLogsStore();
const { from, to, rangePreset } = storeToRefs(logsStore);

const presets = LOGS_TIME_RANGE_PRESETS;

const applyPreset = async (preset: (typeof presets)[number]) => {
  rangePreset.value = preset.value;
  from.value = null;
  to.value = null;
  await logsStore.fetchLogs();
};

onMounted(() => {
  if (from.value || to.value || rangePreset.value) {
    return;
  }
  const preset = presets.find((item) => item.value === DEFAULT_LOGS_TIME_RANGE_PRESET);
  if (preset) {
    void applyPreset(preset);
  }
});

const applyRange = async () => {
  rangePreset.value = null;
  await logsStore.fetchLogs();
};

const onFromChange = (value: string | null) => {
  from.value = value;
  rangePreset.value = null;
};

const onToChange = (value: string | null) => {
  to.value = value;
  rangePreset.value = null;
};

const activePresetLabel = computed(() => {
  return findLogsTimeRangePreset(rangePreset.value)?.label ?? null;
});

const displayLabel = computed(() => {
  if (activePresetLabel.value) return activePresetLabel.value;
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
          :selected-value="rangePreset"
          @select="applyPreset"
        />
      </div>
    </template>
  </UPopover>
</template>
