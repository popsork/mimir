<template lang="pug">
tr
    InvoicingProcessTechnicalLogTableCellsDate(:log-entry="logEntry")
    InvoicingProcessTechnicalLogTableCellsTime(:log-entry="logEntry")
    InvoicingProcessTechnicalLogTableCellsMessage(:log-entry="logEntry")
    InvoicingProcessTechnicalLogTableCellsContext(:log-entry="logEntry")
</template>
<script setup lang="ts">
import type { InvoicingProcessLogEntry } from "~/models/InvoicingProcessLogEntry";

defineProps<{
    logEntry: InvoicingProcessLogEntry,
}>();

</script>
<style scoped lang="scss"></style>
