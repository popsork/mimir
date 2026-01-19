<template lang="pug">
OrderFormFooterSummaryPanel(:state="state" :title="$t('order.summaries.debit_rows.Debit rows')")
    template(v-if="summary")
        OrderFormFooterDebitRowsSummaryTaxSwitch(v-if="taxSwitchEnabled" v-model="withTax")
        OrderFormFooterDebitRowsSummaryRevenue(:with-tax="withTax")
        OrderFormFooterDebitRowsSummaryExpenses(:with-tax="withTax")
    template(v-else)
        p {{ $t('order.summaries.debit_rows.No summary available') }}
</template>
<script setup lang="ts">

const { order } = storeToRefs(useOrderFormStore());

const summary = computed(() => {
    return order.value.debitRowSummary;
});

const state = computed(() => {
    if (summary.value && summary.value.expenseLargerThanRevenue()) {
        return "warning";
    }
    return "normal";
});

const withTax = ref(false);

const taxSwitchEnabled = false; // tax switch currently hidden until we implement tax handling fully


</script>
<style scoped lang="scss"></style>
