export const SEARCH_ORDER_ROW_DEFINITION = buildTableColumnDefinition({
    waybill: "string",
    order_number: "string",
    number: "string",
    order_operation: "string",
    customer_short_name: "string",
    subcustomer_name: "string",
    order_markings: "string",
    customer_contact: "string",
    unit_number: "string",
    pickup_name: "string",
    pickup_postal_code: "string",
    pickup_city: "string",
    pickup_contact: "string",
    delivery_name: "string",
    delivery_postal_code: "string",
    delivery_city: "string",
    delivery_contact: "string",
    order_package_count: "string",
    order_actual_weight_total: "string",
    order_volume_total: "string",
    order_loading_meters_total: "string",
    pallet_places_total: "string",
    driver_instructions: "string",
    planner_instructions: "string",
    status: "string",
    order_pod_name: "string",
});

type SearchOrderRowBaseColumns = {
    id: string,
    order_id: string | null,
};

type SearchOrderRowDefinedColumns = InferRowType<typeof SEARCH_ORDER_ROW_DEFINITION>;

export type SearchOrderRow = SearchOrderRowBaseColumns & SearchOrderRowDefinedColumns;
export type SearchOrderRowKey = keyof SearchOrderRow;
export type DefinedSearchOrderRowKey = keyof SearchOrderRowDefinedColumns;
