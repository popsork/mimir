import { Route, type RouteApiResponseResource } from "~/models/Route";
import { useRouteFormStore } from "~/stores/route/form";

export const useOrdersAddToRouteStore = defineStore("orders-add-to-route", () => {
    const getDefaultValues = () => {
        return {
            shouldShowDialog: false,
            form: {
                route: null as Route | null,
                selectedOrderIds: [] as string[],

                // route search field values
                searchQuery: "",
                searchMaxNumberOfRoutes: null as number | null,
                routes: [] as Route[],
            }
        };
    };

    const defaults = getDefaultValues();
    const waitStore = useWaitStore();
    const routeSearchWaiterName = WaitingFor.Routes;
    const additionWaiterName = WaitingFor.AddingToRoute;

    const shouldShowDialog = ref(defaults.shouldShowDialog);
    const form = ref(defaults.form);
    const routeFormStore = useRouteFormStore();
    const routeFormRouteStopsStore = useRouteFormRouteStopsStore();

    const initializeDialog = (selectedOrderIds: string[]) => {
        clearForm();
        if (!selectedOrderIds.length) {
            return;
        }
        form.value.selectedOrderIds = selectedOrderIds;
        shouldShowDialog.value = true;
    };

    const waitingForSearch = (query: string) => {
        return waitStore.isWaitingFor(routeSearchWaiterName, { query });
    };

    const performRouteSearch = async (
        { query, maxNumberOfRoutes }:
        { query: string, maxNumberOfRoutes: number }
    ) => {
        const waiterParams = { query };
        waitStore.start(routeSearchWaiterName, waiterParams);
        try {
            form.value.searchQuery = query;
            form.value.searchMaxNumberOfRoutes = maxNumberOfRoutes;
            const records = await fetchRoutes();
            if (form.value.searchQuery !== query) {
                // this response is not to the current/latest query, so discard it
                return;
            }
            form.value.routes = records;
        } finally {
            waitStore.end(routeSearchWaiterName, waiterParams);
        }
    };

    const fetchRoutes = wrapFunctionInApiErrorHandler(async () => {
        const apiClient = useApi();
        const parameters: Parameters<typeof apiClient.getRoutes>[0] = {
            latestFirst: false,
            searchQuery: form.value.searchQuery
        };

        if (form.value.searchMaxNumberOfRoutes) {
            parameters.maxNumberOfResults = form.value.searchMaxNumberOfRoutes;
        }

        const apiResponse: { data: RouteApiResponseResource[] } = await apiClient.getRoutes(parameters);

        const records = apiResponse.data.map(resource => {
            return Route.fromApiResponse(resource);
        });

        return records;
    });


    const addSelectedOrdersToRoute = async () => {
        if (!form.value.route) {
            return false;
        }

        try {
            waitStore.start(additionWaiterName);
            await routeFormStore.loadRoute(form.value.route.id);

            form.value.selectedOrderIds.forEach((rowId) => {
                routeFormRouteStopsStore.addRouteStopsFromOrderRowId(rowId);
            });
        } finally {
            waitStore.end(additionWaiterName);
        }

        return true;
    };

    const clearRouteSearch = () => {
        const defaults = getDefaultValues();
        form.value.searchQuery = defaults.form.searchQuery;
        form.value.searchMaxNumberOfRoutes = defaults.form.searchMaxNumberOfRoutes;
        form.value.routes = defaults.form.routes;
    };

    const clearForm = () => {
        const defaults = getDefaultValues();
        form.value = defaults.form;
    };

    const clearFormAndCloseDialog = () => {
        clearForm();
        shouldShowDialog.value = defaults.shouldShowDialog;
    };

    return {
        form,
        shouldShowDialog,
        initializeDialog,
        addSelectedOrdersToRoute,
        clearFormAndCloseDialog,

        waitingForSearch,
        performRouteSearch,
        clearRouteSearch,
    };
});
