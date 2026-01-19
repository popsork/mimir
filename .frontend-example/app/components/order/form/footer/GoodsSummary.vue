<template lang="pug">
OrderFormFooterSummaryPanel(state="normal" :title="$t('order.summaries.goods.Goods')")
    template(v-if="summary")
        OrderFormFooterGoodsSummaryVolume
        OrderFormFooterGoodsSummaryLoadingMetres
        OrderFormFooterGoodsSummaryPalletPlaces
        OrderFormFooterGoodsSummaryCalculatedWeight
    template(v-else)
        p {{ $t('order.summaries.debit_rows.No summary available') }}
</template>
<script setup lang="ts">

const { order } = storeToRefs(useOrderFormStore());

const summary = computed(() => {
    return order.value.goodsRowSummary;
});


</script>
<style scoped lang="scss"></style>
