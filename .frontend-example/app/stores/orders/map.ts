import { add, endOfDay, startOfDay } from "date-fns";

export type GroupedOrderRows = Record<Exclude<OrderRow["order_number"], null>, OrderRow[]>;
export const ALL_OPERATIONS_KEY = "<<<ALL-OPERATIONS>>>" as const;

export const useOrdersMapStore = defineStore("orders-map", () => {
    const config = useConfiguration();

    const { t } = useI18n();
    const rowsStore = useOrdersRowsStore();
    const viewsStore = useOrdersMapViewsStore();
    const { selectedView } = storeToRefs(viewsStore);
    const allOperationsLabel = t("orders.map.filters.All operations");

    const selectedRowId = ref(null as string | null);

    const getDefaultCenter = () => ({
        lat: parseFloat(config.ordersMapCenterLat || "0"),
        lng: parseFloat(config.ordersMapCenterLng || "0"),
    });

    const getDefaultZoom = () => parseInt(config.ordersMapInitialZoomLevel || "8");
    const getDefaultStatuses = () => ([TransportOrderStatusName.Pending, TransportOrderStatusName.Planned]);

    const getDefaultStopTypes = () => ([StopType.Pickup, StopType.Delivery, StopType.Terminal]);

    const getDefaultMaximumStopsInVisibleArea = () => 100;

    const getDefaultMinStopsInCluster = () => 2;
    //
    // This here is needed because when just updating the property directly
    // (i.e selectedView.value.config.showLines = true/false) the watchers/refs
    // sometimes miss the update and nothing happens. So we need to update the
    // entire config object every time. That seem to work as expected.
    const updateSelectedViewConfig = (key: keyof OrderMapView["config"], value: any) => {
        if (!selectedView.value) {
            return;
        }

        if (selectedView.value.config[key] === value) {
            return;
        }

        selectedView.value.config = {
            ...selectedView.value.config,
            [key]: value,
        };
    };

    const center = computed({
        get() {
            if (!selectedView.value) {
                return getDefaultCenter();
            }

            if (!selectedView.value.config.lat) {
                return getDefaultCenter();
            }

            return {
                lat: selectedView.value.config.lat!,
                lng: selectedView.value.config.lng!,
            };
        },

        set({ lat, lng }) {
            updateSelectedViewConfig("lat", lat);
            updateSelectedViewConfig("lng", lng);
        }
    });

    const zoom = computed({
        get() {
            if (!selectedView.value) {
                return getDefaultZoom();
            }

            if (!selectedView.value.config.zoom) {
                return getDefaultZoom();
            }

            return selectedView.value.config.zoom;
        },

        set(zoom) {
            updateSelectedViewConfig("zoom", zoom);
        }
    });

    const maxStopsInVisibleArea = computed({
        get() {
            if (!selectedView.value) {
                return getDefaultMaximumStopsInVisibleArea();
            }

            if (!selectedView.value.config.maxStopsInVisibleArea) {
                return getDefaultMaximumStopsInVisibleArea();
            }

            return selectedView.value.config.maxStopsInVisibleArea;
        },
        set(value) {
            updateSelectedViewConfig("maxStopsInVisibleArea", value);
        }
    });

    const minStopsInCluster = computed({
        get() {
            if (!selectedView.value) {
                return getDefaultMinStopsInCluster();
            }

            if (!selectedView.value.config.minStopsInCluster) {
                return getDefaultMinStopsInCluster();
            }

            return selectedView.value.config.minStopsInCluster;
        },
        set(value) {
            updateSelectedViewConfig("minStopsInCluster", value);
        }
    });

    const filters = computed({
        get() {
            if (!selectedView.value) {
                return getEmptyFilterExpression();
            }

            //
            // this construct differs from the rest as we here set
            // a default value instead of just returning it. This
            // is because `filters` is deeply nested and the
            // setter is not "called" when updating something deep down.
            // Which is done by the filter builder
            if (!selectedView.value.config.filters) {
                selectedView.value.config.filters = getEmptyFilterExpression();
            }

            return selectedView.value.config.filters;
        },

        set(filters) {
            updateSelectedViewConfig("filters", filters);
        }
    });

    // operation list for map filters is reused from the order form operations store.
    // if functionality starts to diverge, these should be separated
    const operationsStore = useOrderFormOperationsStore();
    const { operations, operationsLoaded } = storeToRefs(operationsStore);

    const availableOperations = computed(() => {
        return operations.value;
    });

    const operationOptions = computed(() => {
        return [
            ...availableOperations.value.map(({ id, name }) => ({ id, name })),
            {
                id: ALL_OPERATIONS_KEY,
                name: allOperationsLabel,
            }
        ];
    });

    const loadOperationsIfNeeded = () => {
        operationsStore.loadOperationsIfNeeded();
    };

    const showLines = computed({
        get() {
            if (!selectedView.value) {
                return false;
            }

            return !!selectedView.value.config.showLines;
        },

        set(showLines) {
            updateSelectedViewConfig("showLines", showLines);
        }
    });

    const selectedOperationIds = computed({
        get() {
            if (!selectedView.value) {
                return [];
            }

            if (!selectedView.value.config.operationIds) {
                return [];
            }

            return selectedView.value.config.operationIds;
        },

        set(operationIds) {
            updateSelectedViewConfig("operationIds", operationIds);
        }
    });

    const selectedOperationNames = computed(() => {
        const selectedOperations = availableOperations.value.filter(operation => selectedOperationIds.value.includes(operation.id));

        return selectedOperations.map(operation => operation.name);
    });

    const selectedStatuses = computed({
        get() {
            if (!selectedView.value) {
                return getDefaultStatuses();
            }

            if (!selectedView.value.config.statuses) {
                selectedView.value.config.statuses = getDefaultStatuses();
            }

            return selectedView.value.config.statuses;
        },

        set(statuses) {
            updateSelectedViewConfig("statuses", statuses);
        }
    });

    const today = ref(new Date());
    const daysInPast = computed<number | null>({
        get() {
            if (!selectedView.value) {
                return 0;
            }

            //
            // null is a special placeholder for "infinite"
            // so if null exists, use that. Otherwise, we need to check
            // if the value is undefined (i.e. hasn't been configured yet)
            // and in that case return 0
            if (selectedView.value.config.daysInPast === null) {
                return null;
            }

            if (!selectedView.value.config.daysInPast) {
                return 0;
            }

            return selectedView.value.config.daysInPast;
        },
        set(daysInPast) {
            updateSelectedViewConfig("daysInPast", daysInPast);
        }
    });

    const daysInFuture = computed<number | null>({
        get() {
            if (!selectedView.value) {
                return 0;
            }

            if (selectedView.value.config.daysInFuture === null) {
                return null;
            }

            //
            // null is a special placeholder for "infinite"
            // so if null exists, use that. Otherwise, we need to check
            // if the value is undefined (i.e. hasn't been configured yet)
            // and in that case return 0
            if (!selectedView.value.config.daysInFuture) {
                return 0;
            }

            return selectedView.value.config.daysInFuture;
        },
        set(daysInFuture) {
            updateSelectedViewConfig("daysInFuture", daysInFuture);
        }
    });

    const dateFilterRange = computed(() => {
        let startDate: Date | null = null;
        let endDate: Date | null = null;

        if (daysInPast.value !== null) {
            startDate = add(today.value, { days: daysInPast.value });
        }

        if (daysInFuture.value !== null) {
            endDate = add(today.value, { days: daysInFuture.value });
        }

        return { startDate, endDate };
    });

    const dateFilterQuery = computed(() => {
        const systemTimeZoneStartDate = getSystemTimeZoneDate(dateFilterRange.value.startDate);
        const systemTimeZoneEndDate = getSystemTimeZoneDate(dateFilterRange.value.endDate);
        if (!systemTimeZoneStartDate && !systemTimeZoneEndDate) {
            return null;
        }

        const conditions = {} as { $gte?: string, $lte?: string };

        if (systemTimeZoneStartDate) {
            conditions.$gte = getUtcDatetimeString(startOfDay(systemTimeZoneStartDate))!;
        }

        if (systemTimeZoneEndDate) {
            conditions.$lte = getUtcDatetimeString(endOfDay(systemTimeZoneEndDate))!;
        }

        return {
            pickup_earliest_at_utc: conditions
        };
    });

    const selectedStopTypes = computed({
        get() {
            if (!selectedView.value) {
                return getDefaultStopTypes();
            }

            selectedView.value.config.stopTypes ??= getDefaultStopTypes();

            return selectedView.value.config.stopTypes;
        },

        set(stopTypes) {
            updateSelectedViewConfig("stopTypes", stopTypes);
        }
    });


    const groupedOrderRows = computed(() => {
        const rows = getOrderRows();

        const groupedRows = groupOrderRows(rows);

        sortGroupedOrderRows(groupedRows);

        return groupedRows;
    });

    const allOperationsOptionSelected = computed(() => selectedOperationIds.value.includes(ALL_OPERATIONS_KEY));

    const getOrderRows = (): OrderRow[] => {
        if (!selectedView.value) {
            return [];
        }

        const notEmptyFilterQuery = (property: string) => ({
            [property]: { $nin: [null, "0"] }
        });

        const filteredRows = rowsStore
            .collection
            .chain()
            .find({
                // either pickup or delivery coordinates should be present
                $or: [
                    {
                        ...notEmptyFilterQuery("pickup_latitude"),
                        ...notEmptyFilterQuery("pickup_longitude"),
                    },
                    {

                        ...notEmptyFilterQuery("deliver_latitude"),
                        ...notEmptyFilterQuery("deliver_longitude"),
                    },
                ],
            });

        if (!allOperationsOptionSelected.value) {
            filteredRows.find({
                // only selected operations should be included
                order_operation: {
                    $in: selectedOperationNames.value
                }
            });
        }

        filteredRows.find({
            status: {
                $in: Array.from(selectedStatuses.value)
            }
        });

        if (dateFilterQuery.value) {
            filteredRows.find(dateFilterQuery.value);
        }

        if (filters.value) {
            filteredRows.find(getSylvieJSQuery(filters.value));
        }

        return filteredRows.data();
    };

    const groupOrderRows = (rows: OrderRow[]): GroupedOrderRows => {
        return rows.reduce((groups: GroupedOrderRows, row: OrderRow) => {
            const groupingKey = row.order_number;
            if (!groupingKey) {
                return groups;
            }
            if (!groups[groupingKey]) {
                groups[groupingKey] = [];
            }
            groups[groupingKey].push(row);
            return groups;
        }, {});
    };

    const sortGroupedOrderRows = (groupedRows: GroupedOrderRows) => {
        Object.keys(groupedRows).forEach((key) => {
            groupedRows[key]!.sort(
                (a: OrderRow, b: OrderRow) => {
                    const firstNumber = a.sequence_number || 0;
                    const secondNumber = b.sequence_number || 0;

                    return firstNumber - secondNumber;
                }
            );
        });
    };

    const geoFeatures = computed(() => {
        return buildOrdersMapGeoFeatures({
            groupedOrderRows: groupedOrderRows.value,
            displayableStopTypes: selectedStopTypes.value,
            showLines: showLines.value,
        });
    });

    return {
        center,
        zoom,
        filters,
        geoFeatures,
        showLines,
        operationsLoaded,
        loadOperationsIfNeeded,
        operationOptions,
        selectedOperationIds,
        selectedStatuses,
        maxStopsInVisibleArea,
        minStopsInCluster,
        dateFilterRange,
        today,
        daysInPast,
        daysInFuture,
        selectedRowId,
        selectedStopTypes,
    };
});
