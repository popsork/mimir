<template>
  <MetricsGaugeCard :label="label" :value="value" :unit="unit" :timestamp="timestamp" :sub-text="usageText" />
</template>

<script setup lang="ts">
const props = defineProps<{
  host: string,
  device: string,
  label?: string | null,
}>();

const { t } = useI18n();
const { formatValue, gaugePercent, gaugeTone, formatTime } = useMetricsFormatting();

const metricStore = useMetricsStore();
const usageMetric = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, "usage"));
const usedMetric = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, "used"));
const totalMetric = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, "total"));

const value = computed(() => usageMetric.value?.value ?? null);
const unit = computed(() => usageMetric.value?.unit ?? null);
const timestamp = computed(() => usageMetric.value?.timestamp ?? null);
const label = computed(() => props.label || t(`metrics.devices.labels.${props.device}`));

const usageText = computed(() => {
  return formatValue(usedMetric.value?.value ?? null, 'bytes') + " / " +formatValue(totalMetric.value?.value ?? null, 'bytes');
});
</script>

<style scoped lang="scss">

</style>
