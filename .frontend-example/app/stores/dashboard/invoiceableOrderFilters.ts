export const useDashboardInvoiceableOrderFiltersStore = defineStore("dashboard-invoiceable-order-filters", () => {
    const viewsStore = useDashboardChartViewsStore();

    const currentEditingFilter = ref(null as FilterExpression | null);
    const currentEditingChart = ref(null as InvoiceableOrdersChart | null);

    const personalFilters = computed(() => {
        const view = viewsStore.getOrCreateForChart(InvoiceableOrdersChart.Personal);
        if (!view) {
            return null;
        }

        if (currentEditingChart.value === InvoiceableOrdersChart.Personal) {
            return currentEditingFilter.value;
        }

        return view.config.filters;
    });

    const teamFilters = computed(() => {
        const view = viewsStore.getOrCreateForChart(InvoiceableOrdersChart.Team);
        if (!view) {
            return null;
        }

        if (currentEditingChart.value === InvoiceableOrdersChart.Team) {
            return currentEditingFilter.value;
        }

        return view.config.filters;
    });

    const getFiltersForChart = (chartType: InvoiceableOrdersChart) => {
        switch (chartType) {
            case InvoiceableOrdersChart.Personal: return personalFilters.value;
            case InvoiceableOrdersChart.Team: return teamFilters.value;
        }
    };

    const startEditing = (chart: InvoiceableOrdersChart) => {
        currentEditingFilter.value = clone(getFiltersForChart(chart) || getEmptyFilterExpression());
        currentEditingChart.value = chart;
    };

    const closeEditing = () => {
        currentEditingChart.value = null;
        currentEditingFilter.value = null;
    };

    const toggleEditing = (chart: InvoiceableOrdersChart) => {
        if (currentEditingChart.value === chart) {
            closeEditing();
            return;
        }

        startEditing(chart);
    };

    const resetFilters = () => {
        if (!currentEditingFilter.value) {
            return null;
        }

        currentEditingFilter.value = getEmptyFilterExpression();
    };

    const saveFilters = async (filters: FilterExpression) => {
        if (!currentEditingChart.value) {
            return;
        }

        //
        // We wait for the save to actually go through before we
        // reset the currentEditingChart/currentEditingFilter.
        // Otherwise, there would be a flash when switching from
        // currentEditingChart -> current saved state in ORM -> new state from BE (what was in currentEditingChart)
        if (await viewsStore.saveViewFilters(currentEditingChart.value, filters)) {
            currentEditingChart.value = null;
            currentEditingFilter.value = null;
        }
    };

    return {
        personalFilters,
        teamFilters,

        getFiltersForChart,
        currentEditingChart,
        currentEditingFilter,
        toggleEditing,
        resetFilters,
        saveFilters,
    };
});
