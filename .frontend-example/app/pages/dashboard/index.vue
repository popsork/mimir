<template lang="pug">
.dashboard.page(:style="{ height: availableHeight + 'px' }")
    .sections
        .section(v-for="type in sections" :key="type" :class="{ active: isSectionActive(type) }")
            DashboardOrdersToBeInvoicedSection(:type="type")
    DashboardOrdersToBeInvoicedFilters(v-if="currentEditingChart")
</template>
<script setup lang="ts">
const rowsStore = useOrdersRowsStore();
rowsStore.loadRowsIfNeeded();

const columnsStore = useOrdersListColumnsStore();
columnsStore.loadColumnsIfNeeded();

const viewsStore = useViewsStore();
viewsStore.loadViewsIfNeeded();

const filtersStore = useDashboardInvoiceableOrderFiltersStore();
const { currentEditingChart } = storeToRefs(filtersStore);

const { heights } = storeToRefs(useDimensionsStore());

const totalHeaderHeight = computed(() => {
    return heights.value.pageHeader;
});

const { height: windowHeight } = useWindowSize({ includeScrollbar: true, type: "inner" });
const availableHeight = computed(() => windowHeight.value - totalHeaderHeight.value);

const sections = computed(() => {
    return [
        InvoiceableOrdersChart.Personal,
        InvoiceableOrdersChart.Team
    ];
});

const isSectionActive = (type: InvoiceableOrdersChart) => {
    return currentEditingChart.value === type || currentEditingChart.value === null;
};

</script>
<style scoped lang="scss">
.dashboard.page {
    display: flex;
    height: 100%;

    .sections {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: $gutter;
        row-gap: steps(2);
        width: 100%;

        .section {
            @include content-padding;
            background-color: $color-background-light;
            border-radius: $element-border-radius;
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            position: relative;

            &:not(.active) {
                &::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background-color: $color-background-lightest;
                    opacity: 0.5;
                    z-index: 100;
                }
            }

            :deep(.orders-to-be-invoiced-chart) {
                width: 40%;
                margin: 0 auto steps(2);
            }
        }
    }
}
</style>
