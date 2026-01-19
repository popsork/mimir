<template lang="pug">
td(data-name="message") {{ logEntry.message }}
</template>
<script setup lang="ts">
import type { InvoicingProcessLogEntry } from "~/models/InvoicingProcessLogEntry";

defineProps<{
    logEntry: InvoicingProcessLogEntry,
}>();

</script>
<style scoped lang="scss"></style>
