import { View } from "~/models/View";

export type DashboardChartViewConfig = {
    filters: FilterExpression,
    datePeriod: number,
};

export type DashboardChartView = View<DashboardChartViewConfig>;

export const useDashboardChartViewsStore = defineStore("dashboard-chart-views", function() {
    const viewsStore = useViewsStore();
    const { viewsLoaded } = storeToRefs(viewsStore);

    const views = computed(() => {
        return viewsStore.getViewsByContext(ViewContext.DashboardChart) as DashboardChartView[];
    });

    const saveViewFilters = async (chart: InvoiceableOrdersChart, filters: FilterExpression) => {
        const view = getOrCreateForChart(chart);
        if (!view) {
            return null;
        }

        view.config.filters = filters;
        return await viewsStore.upsertView(view);
    };

    const saveViewDatePeriod = async (chart: InvoiceableOrdersChart, datePeriod: number) => {
        const view = getOrCreateForChart(chart);
        if (!view) {
            return null;
        }
        view.config.datePeriod = datePeriod;
        return await viewsStore.upsertView(view);
    };

    const getOrCreateForChart = (chart: InvoiceableOrdersChart) => {
        if (!viewsLoaded.value) {
            return null;
        }

        let view = views.value.find(v => v.name === chart);
        if (!view) {
            view = View.buildBlank({
                context: ViewContext.DashboardChart,
                name: chart,
                sequenceNumber: views.value.length,
            }) as DashboardChartView;

            viewsStore.updateLocal(view);
        }

        return view as DashboardChartView;
    };

    return {
        getOrCreateForChart,
        saveViewFilters,
        saveViewDatePeriod,
        views,
    };
});
