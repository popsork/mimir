<template lang="pug">
GenericTableCellLink(:to="getInvoicingProcessRoute(process.id)")
    slot
</template>
<script setup lang="ts">
import type { InvoicingProcess } from "~/models/InvoicingProcess";

defineProps<{
    process: InvoicingProcess,
}>();

</script>
<style scoped lang="scss"></style>
