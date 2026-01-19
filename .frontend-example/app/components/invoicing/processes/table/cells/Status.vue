<template lang="pug">
td(data-name="process-status")
    InvoicingProcessesTableProcessLink(:process="process")
        InvoicingProcessStatusBadge(:status="process.status" size="small")
</template>
<script setup lang="ts">
import type { InvoicingProcess } from "~/models/InvoicingProcess";

defineProps<{
    process: InvoicingProcess,
}>();

</script>
<style scoped lang="scss"></style>
