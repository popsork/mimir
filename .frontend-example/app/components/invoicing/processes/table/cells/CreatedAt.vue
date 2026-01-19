<template lang="pug">
td(data-name="created-at")
    InvoicingProcessesTableProcessLink(:process="process") {{ formatSystemTimeZoneTime(process.createdAt) }}
</template>
<script setup lang="ts">
import type { InvoicingProcess } from "~/models/InvoicingProcess";

defineProps<{
    process: InvoicingProcess,
}>();

</script>
<style scoped lang="scss">
td {
    @include small-text;
}
</style>
