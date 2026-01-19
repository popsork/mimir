<template lang="pug">
td(data-name="number-of-orders")
    InvoicingProcessesTableProcessLink(:process="process") {{ process.numberOfOrders }}
</template>
<script setup lang="ts">
import type { InvoicingProcess } from "~/models/InvoicingProcess";

defineProps<{
    process: InvoicingProcess,
}>();

</script>
<style scoped lang="scss">
td {
    @include small-strong-text;
}
</style>
