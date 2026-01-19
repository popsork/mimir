<template lang="pug">
td(data-name="time") {{ timeText }}
</template>
<script setup lang="ts">
import type { InvoicingProcessLogEntry } from "~/models/InvoicingProcessLogEntry";

const props = defineProps<{
    logEntry: InvoicingProcessLogEntry,
}>();

const timeText = computed(() => {
    return formatSystemTimeZoneTime(props.logEntry.timestamp, { includeDate: false, includeSeconds: true });
});

</script>
<style scoped lang="scss"></style>
