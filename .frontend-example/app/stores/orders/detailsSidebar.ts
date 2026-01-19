export type OrdersDetailsSidebarOverviewStopInfo = {
    name: string | null,
    streetName: string | null,
    postalCodeAndCity: string | null,
    notes: string | null,
};

export const useOrdersDetailsSidebarStore = defineStore("orders-details-sidebar", () => {
    const selectedOrderRowId = ref(null as string | null);

    const rowsStore = useOrdersRowsStore();

    const orderRow = computed(() => {
        if (!selectedOrderRowId.value) {
            return null;
        }

        return rowsStore.getRowById(selectedOrderRowId.value);
    });

    const customerInfo = computed(() => {
        if (!orderRow.value) {
            return null;
        }
        return {
            shortName: orderRow.value.customer_short_name,
            name: orderRow.value.customer_name,
            number: orderRow.value.customer_number,
            subcustomerName: orderRow.value.subcustomer_name,
        };
    });

    const serviceInfo = computed(() => {
        if (!orderRow.value) {
            return null;
        }
        return {
            operation: orderRow.value.order_operation,
            service: orderRow.value.service_name,
            start: orderRow.value.started_at,
            end: orderRow.value.completed_at,
        };
    });

    const orderInfo = computed(() => {
        if (!orderRow.value) {
            return null;
        }
        return {
            number: orderRow.value.order_number,
            waybill: orderRow.value.waybill,
            markings: orderRow.value.order_markings,
            status: orderRow.value.status,
            senderReference: orderRow.value.order_consignor_ref,
            recipientReference: orderRow.value.order_consignee_ref,
        };
    });

    const pickupInfo = computed(() : OrdersDetailsSidebarOverviewStopInfo | null => {
        if (!orderRow.value) {
            return null;
        }
        return {
            name: orderRow.value.pickup_name,
            streetName: orderRow.value.pickup_street_name,
            postalCodeAndCity: [
                orderRow.value.pickup_postal_code,
                orderRow.value.pickup_city
            ].filter(value => value && value !== "").join(" "),
            notes: orderRow.value.pickup_information,
        };
    });

    const deliveryInfo = computed(() : OrdersDetailsSidebarOverviewStopInfo | null => {
        if (!orderRow.value) {
            return null;
        }
        return {
            name: orderRow.value.delivery_name,
            streetName: orderRow.value.delivery_street_name,
            postalCodeAndCity: [
                orderRow.value.delivery_postal_code,
                orderRow.value.delivery_city
            ].filter(value => value && value !== "").join(" "),
            notes: orderRow.value.delivery_information,
        };
    });

    const instructions = computed(() => {
        if (!orderRow.value) {
            return null;
        }
        return {
            plannerInstructions: orderRow.value.planner_instructions,
            driverInstructions: orderRow.value.driver_instructions,
        };
    });

    const goodsSummary = computed(() => {
        if (!orderRow.value) {
            return null;
        }
        const values = {
            quantity: orderRow.value.goods_quantity,
            type: orderRow.value.goods_quantity_types,
            weight: orderRow.value.goods_weight,
            volume: orderRow.value.goods_volume,
            loadingMetres: orderRow.value.goods_loading_metres,
            palletPlaces: orderRow.value.goods_pallet_places,
            calculatedWeight: orderRow.value.goods_calculated_weight,
        };

        if (!summmaryHasValues(values)) {
            return null;
        }

        return values;
    });

    const specificationSummary = computed(() => {
        if (!orderRow.value) {
            return null;
        }
        const values = {
            quantity: orderRow.value.specification_quantity,
            type: orderRow.value.specification_quantity_types,
            hours: orderRow.value.specification_hours,
            executions: orderRow.value.specification_executions,
        };

        if (!summmaryHasValues(values)) {
            return null;
        }

        return values;
    });

    const summmaryHasValues = (values: Record<string, any>) => {
        // for summary blocks, if all non-empty value are only 0 and "0", the block is still treated as having no values
        return Object.values(values).some(value => value !== null && value !== "" && value !== 0 && value !== "0");
    };

    return {
        selectedOrderRowId,
        customerInfo,
        serviceInfo,
        orderInfo,
        pickupInfo,
        deliveryInfo,
        instructions,
        goodsSummary,
        specificationSummary,
        orderRow,
    };
});
