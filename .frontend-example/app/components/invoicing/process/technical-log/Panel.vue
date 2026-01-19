<template lang="pug">
InvoicingProcessTabPanel(name="technical-log")
    InvoicingProcessTechnicalLogTable(:log-entries="process.logEntries || []")
</template>
<script setup lang="ts">

const store = useInvoicingProcessStore();

const { process } = storeToRefs(store);


</script>
<style scoped lang="scss"></style>
