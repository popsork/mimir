<template lang="pug">
tr
    InvoicingProcessesTableCellsCreatedAt(:process="process")
    InvoicingProcessesTableCellsStatus(:process="process")
    InvoicingProcessesTableCellsNumberOfOrders(:process="process")
    InvoicingProcessesTableCellsProgress(:process="process")
</template>
<script setup lang="ts">
import type { InvoicingProcess } from "~/models/InvoicingProcess";

defineProps<{
    process: InvoicingProcess,
}>();

</script>
<style scoped lang="scss"></style>
