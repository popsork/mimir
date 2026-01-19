<template lang="pug">
.goods-summary(v-if="goodsSummary")
    OrdersSidebarSummaryHeader(:heading="$t('orders.sidebar.goods_summary.Summary of goods')")
        .calculated-weight
            span.label {{ $t("orders.sidebar.goods_summary.Calculated weight") }}:
            | &nbsp;
            span.value {{ calculatedWeight }}
    OrdersSidebarSummaryList(:items="goodsSummaryItems")
</template>
<script setup lang="ts">
const { t } = useI18n();

const detailsSidebarStore = useOrdersDetailsSidebarStore();
const { goodsSummary } = storeToRefs(detailsSidebarStore);

const calculatedWeight = computed(() => {
    if (!goodsSummary.value) {
        return null;
    }
    return goodsSummary.value.calculatedWeight || getBlankValueLabelText();
});

const goodsSummaryItems = computed(() => {
    if (!goodsSummary.value) {
        return [];
    }
    return [
        {
            label: t("orders.sidebar.goods_summary.Quantity"),
            value: goodsSummary.value.quantity,
        },
        {
            label: t("orders.sidebar.goods_summary.Type"),
            value: goodsSummary.value.type,
        },
        {
            label: t("orders.sidebar.goods_summary.Weight"),
            value: goodsSummary.value.weight,
        },
        {
            label: t("orders.sidebar.goods_summary.Volume"),
            value: goodsSummary.value.volume,
        },
        {
            label: t("orders.sidebar.goods_summary.Loading metres"),
            value: goodsSummary.value.loadingMetres,
        },
        {
            label: t("orders.sidebar.goods_summary.Pallet places"),
            value: goodsSummary.value.palletPlaces,
        }
    ];
});
</script>
<style scoped lang="scss">
.goods-summary {
    margin-left: $gutter * -1;
    margin-right: $gutter * -1;

    .header {
        .calculated-weight {
            @include small-text;
        }
    }
}
</style>
