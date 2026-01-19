import { Route, type RouteApiResponseResource } from "~/models/Route";
import type { RowKey } from "naive-ui/lib/data-table/src/interface";
import type { TransportOrderStatusName } from "~/enums/TransportOrderStatusName";
import { endOfDay, startOfDay } from "date-fns";

export const useRoutesListRoutesStore = defineStore("routes-list-routes", () => {
    const model = Route;
    const repo = useRepo(model);

    const waiterName = WaitingFor.Routes;
    const waitStore = useWaitStore();

    // this is a workaround for naive-ui data table messing up selected rows.
    // see defineTableStore.ts for more details.
    const internalSelectedRowIds = ref([] as RowKey[]);
    const availableRowIds = ref<Set<string>>(new Set());
    const selectedRowIds = computed(() => {
        const ids = internalSelectedRowIds.value;
        return ids.filter(id => availableRowIds.value.has(id as string));
    });

    const expandedRowKeys = ref([] as Array<string | number>);
    const isSingleRouteSelected = computed(() => selectedRowIds.value.length === 1);

    const getDefaultValues = () => {
        return {
            form: {
                searchQuery: "",
                status: null as TransportOrderStatusName | null, // routes use the same statuses as transport orders
                startDateFrom: null as string | null,
                startDateTill: null as string | null,
                endDateFrom: null as string | null,
                endDateTill: null as string | null,
            },
        };
    };

    const defaults = getDefaultValues();
    const form = ref(defaults.form);

    const records = computed(() => {
        return repo.get() as Route[];
    });

    const loadRecords = async () => {
        if ( waitStore.isWaitingFor(waiterName) ) {
            return;
        }

        waitStore.start(waiterName);
        try {
            const records = await fetchRecords();

            clearRecords();

            repo.save(records);

            availableRowIds.value = new Set(records.map((record) => record.id));

        } finally {
            waitStore.end(waiterName);
        }
    };

    const waitingForRecords = computed(() => {
        return waitStore.is(waiterName);
    });

    const fetchRecords = wrapFunctionInApiErrorHandler(async () => {
        const apiClient = useApi();

        const parameters: Parameters<typeof apiClient.getRoutes>[0] = {
            latestFirst: true,
            maxNumberOfResults: 100,
            searchQuery: form.value.searchQuery,
            status: form.value.status,
        };

        const timeZoneOptions = getSystemTimeZoneOptions();

        if (form.value.startDateFrom) {
            const startFrom = startOfDay(new Date(form.value.startDateFrom), timeZoneOptions);
            parameters.startFrom = getSystemTimeZoneDatetimeString(startFrom);
        }
        if (form.value.startDateTill) {
            const startTill = endOfDay(new Date(form.value.startDateTill), timeZoneOptions);
            parameters.startTill = getSystemTimeZoneDatetimeString(startTill);
        }
        if (form.value.endDateFrom) {
            const endFrom = startOfDay(new Date(form.value.endDateFrom), timeZoneOptions);
            parameters.endFrom = getSystemTimeZoneDatetimeString(endFrom);
        }
        if (form.value.endDateTill) {
            const endTill = endOfDay(new Date(form.value.endDateTill), timeZoneOptions);
            parameters.endTill = getSystemTimeZoneDatetimeString(endTill);
        }

        const apiResponse: { data: RouteApiResponseResource[] } = await apiClient.getRoutes(parameters);

        return apiResponse.data.map((resource) => {
            return model.fromApiResponse(resource);
        });
    });

    const clearRecords = () => {
        repo.flush();
        availableRowIds.value = new Set();
    };

    const reset = () => {
        clearRecords();
        const defaults = getDefaultValues();
        form.value = defaults.form;
        internalSelectedRowIds.value = [];
        expandedRowKeys.value = [];
    };

    return {
        loadRoutes: loadRecords,
        routes: records,
        waitingForRoutes: waitingForRecords,
        reset,
        internalSelectedRowIds,
        selectedRowIds,
        expandedRowKeys,
        form,
        isSingleRouteSelected,
    };
});
