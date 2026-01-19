<template lang="pug">
OrderFormFooterSummaryPanel(state="normal" :title="$t('order.summaries.specification.Specification')")
    template(v-if="summary")
        OrderFormFooterSpecificationSummaryQuantity
        OrderFormFooterSpecificationSummaryHours
        OrderFormFooterSpecificationSummaryExecutions
    template(v-else)
        p {{ $t('order.summaries.specification.No summary available') }}
</template>
<script setup lang="ts">

const { order } = storeToRefs(useOrderFormStore());

const summary = computed(() => {
    return order.value.specificationSummary;
});


</script>
<style scoped lang="scss"></style>
