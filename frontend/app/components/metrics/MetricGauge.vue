<template>
  <MetricsGaugeCard :label="label" :value="value" :unit="unit" :timestamp="timestamp" />
</template>

<script setup lang="ts">
const props = defineProps<{
  host: string,
  device: string,
  metric: string,
  label?: string | null,
}>();

const { t } = useI18n();
const metricStore = useMetricsStore();
const metric = computed(() => metricStore.getHostDeviceMetric(props.host, props.device, props.metric));

const value = computed(() => metric.value?.value ?? null);
const unit = computed(() => metric.value?.unit ?? null);
const timestamp = computed(() => metric.value?.timestamp ?? null);
const label = computed(() => {
  if (props.label) {
    return props.label;
  }

  return t(`metrics.devices.labels.${props.device}`) + " - " + t(`metrics.metrics.labels.${props.metric}`);
});
</script>

<style scoped lang="scss">

</style>
