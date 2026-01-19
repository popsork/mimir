<template lang="pug">
td(data-name="date") {{ dateText }}
</template>
<script setup lang="ts">
import type { InvoicingProcessLogEntry } from "~/models/InvoicingProcessLogEntry";

const props = defineProps<{
    logEntry: InvoicingProcessLogEntry,
}>();

const dateText = computed(() => {
    return formatSystemTimeZoneTime(props.logEntry.timestamp, { includeTime: false });
});

</script>
<style scoped lang="scss"></style>
