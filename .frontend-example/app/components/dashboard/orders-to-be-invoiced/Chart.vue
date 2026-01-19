<template lang="pug">
.orders-to-be-invoiced-chart(ref="container")
    WaitingBox(:while="isLoading")
        .chart-actions
            FormSelectField(
                v-model="datePeriod"
                name="datePeriod"
                :options="datePeriodOptions"
            )
                template(v-slot:input)
                    GenericButton(
                        type="quaternary"
                        size="small"
                        icon="calendar-with-dates"
                    ) {{ datePeriodLabel }}
            GenericButton(
                type="quaternary"
                size="small"
                icon="sliders"
                v-on:click="editFilters"
            ) {{ $t("dashboard.actions.Edit") }}
        GenericButton(
            v-if="!hasFilters"
            class="add-filters"
            size="large"
            v-on:click="editFilters"
        ) {{ $t("dashboard.actions.Add filters") }}
        VChart(
            ref="chart"
            class="chart"
            :option="hasFilters ? chartOptions : blankChartOptions"
            autoresize
            v-on:click="openTemporaryViewIfOrdersFound"
        )
</template>
<script setup lang="ts">
import VChart from "vue-echarts";
import type { ECElementEvent } from "echarts/core";
import type { OptionDataItem } from "echarts/types/src/util/types";
import { DashboardOrdersToBeInvoicedChartTooltip } from "#components";

const props = defineProps<{
    title: string,
    dates: Array<{ value: string | number, [key: string]: any }>,
    ordersByDate: DashboardInvoiceableOrdersSummaryForDate[],
    type: InvoiceableOrdersChart,
}>();

const { t } = useI18n();

const container = useTemplateRef("container");

const { mountComponent } = useComponentMounting(container);

const viewsStore = useViewsStore();
viewsStore.loadViewsIfNeeded();

const rowsStore = useOrdersRowsStore();
const { someRowsLoaded } = storeToRefs(rowsStore);

const ordersListViewsStore = useOrdersListViewsStore();

const dashboardInvoiceableOrdersStore = useDashboardInvoiceableOrdersStore();

const filtersStore = useDashboardInvoiceableOrderFiltersStore();

const datePeriod = defineModel<number>("datePeriod");

const datePeriodLabel = computed(() => {
    return t("dashboard.orders.week", { count: datePeriod.value });
});

const datePeriodOptions = computed(() =>
    Array.from({ length: 4 }, (_, i) => ({
        label: t("dashboard.orders.week", { count: i + 1 }),
        value: i + 1,
    }))
);

const waitStore = useWaitStore();
const isLoading = computed(() => !someRowsLoaded.value || waitStore.is(WaitingFor.Views));

const chartFilters = computed(() => filtersStore.getFiltersForChart(props.type));

const hasFilters = computed(() => {
    if (!chartFilters.value) {
        return false;
    }

    return chartFilters.value.groups.length > 0;
});

const tooltipFormatter = ((params: TooltipParamFormatterParams) => {
    if (!params || params instanceof Array || !params.data) {
        return "";
    }
    const { invoiceableDateSystemOrOverdue } = params.data as TooltipParamsData & DashboardInvoiceableOrdersSummaryForDate;
    const date = dashboardInvoiceableOrdersStore.getDayLabel(invoiceableDateSystemOrOverdue);
    const { el } = mountComponent(DashboardOrdersToBeInvoicedChartTooltip, {
        props: { date, numberOfOrders: params.value },
    });
    return el;
}) as TooltipFormatter;

const chartSeriesData = computed((): BarChartSeriesData =>
    props.ordersByDate.map(({ numberOfOrders, ...rest }) => ({
        ...rest,
        value: numberOfOrders
    }))
);

const chartConfig = computed((): ChartConfig => ({
    title: props.title,
    xAxisData: props.dates,
    tooltipFormatter,
    seriesData: chartSeriesData.value
}));

const { chartOptions, blankChartOptions } = useOrdersToBeInvoicedChart(chartConfig);

const openTemporaryViewIfOrdersFound = (params: ECElementEvent) => {
    if (params.value === 0) {
        return;
    }
    const { transportOrderIds = [] } = params.data as (OptionDataItem & DashboardInvoiceableOrdersSummaryForDate);
    const orderNumbersFilterExpression = getTransportOrderNumbersFilterExpression(transportOrderIds);
    const filteredTemporaryView = ordersListViewsStore.getFilteredTemporaryView(orderNumbersFilterExpression);

    if (!filteredTemporaryView) {
        return;
    }

    goToRoute({
        name: "orders-list",
        query: {
            view: filteredTemporaryView.id
        }
    });
};

const editFilters = () => {
    if (!chartFilters.value) {
        return;
    }

    filtersStore.toggleEditing(props.type);
};

const chart = useTemplateRef<InstanceType<typeof VChart>>("chart");

const { height: windowHeight } = useWindowSize({ includeScrollbar: true, type: "inner" });

watch(windowHeight, () => {
    // the "autoresize" option for VChart is not always working properly, so trigger resize manually on window resize
    if (chart.value) {
        chart.value.resize();
    }
});

</script>
<style scoped lang="scss">
.orders-to-be-invoiced-chart {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1;
    justify-content: center;


    .chart-actions {
        display: flex;
        justify-content: flex-end;
        position: absolute;
        top: steps(2.5); // sync values with useOrdersToBeInvoicedChart, titleConfig: top
        right: steps(2.5); // sync values with useOrdersToBeInvoicedChart, gridConfig: right
        z-index: 1;
        gap: 0 steps(1);
    }

    .add-filters {
        position: absolute;
        z-index: 1;
        margin-top: steps(8)
    }

    .chart {
        background-color: $color-background-lighter;
        border-radius: $element-border-radius;
    }
}
</style>
