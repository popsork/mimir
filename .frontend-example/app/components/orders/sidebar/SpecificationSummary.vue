<template lang="pug">
.specification-summary(v-if="specificationSummary")
    OrdersSidebarSummaryHeader(:heading="$t('orders.sidebar.specification_summary.Specification summary')")
    OrdersSidebarSummaryList(:items="specificationSummaryItems")
</template>
<script setup lang="ts">
const { t } = useI18n();

const detailsSidebarStore = useOrdersDetailsSidebarStore();
const { specificationSummary } = storeToRefs(detailsSidebarStore);

const specificationSummaryItems = computed(() => {
    if (!specificationSummary.value) {
        return [];
    }
    return [
        {
            label: t("orders.sidebar.specification_summary.Quantity"),
            value: specificationSummary.value.quantity,
        },
        {
            label: t("orders.sidebar.specification_summary.Type"),
            value: specificationSummary.value.type,
        },
        {
            label: t("orders.sidebar.specification_summary.Hours"),
            value: specificationSummary.value.hours,
        },
        {
            label: t("orders.sidebar.specification_summary.Executions"),
            value: specificationSummary.value.executions,
        }
    ];
});
</script>
<style scoped lang="scss"></style>
