<template lang="pug">
.summary
    OrderFormFooterDebitRowsSummary
    OrderFormFooterSpecificationSummary
    OrderFormFooterGoodsSummary
</template>
<script setup lang="ts">

</script>
<style scoped lang="scss">
.summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
    gap: steps(1);

    .summary-panel:nth-child(3) {
        grid-column: 1 / span 2;
    }
}
</style>
