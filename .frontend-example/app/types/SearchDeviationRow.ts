
export const SEARCH_DEVIATION_ROW_DEFINITION = buildTableColumnDefinition({
    deviation_cause_code: "string",
    deviation_type_code: "string",
    deviation_status: {
        type: "enum",
        enum: DeviationRowStatus,
        translationScope: "deviation_rows.statuses",
    },
    deviation_cause_description: "string",
    deviation_type_description: "string",
    deviation_description: "string",
    number_of_images: "number",
    user: "string",
    registered_by: "string",
    driver: "string",
    unit_number: "string",
    customer_short_name: "string",
    customer_name: "string",
    order_number: "string",
    order_status: {
        type: "enum",
        enum: OrderStatus,
        translationScope: "order.statuses",
    },
    transport_order_number: "string",
    littera: "string",
    action_type: "string",
    action_description: "string",
});

type SearchDeviationRowBaseColumns = {
    id: string,
    order_id: string | null,
    latitude: number | null,
    longitude: number | null,
};

type SearchDeviationRowDefinedColumns = InferRowType<typeof SEARCH_DEVIATION_ROW_DEFINITION>;

export type SearchDeviationRow = SearchDeviationRowBaseColumns & SearchDeviationRowDefinedColumns;
export type SearchDeviationRowKey = keyof SearchDeviationRow;
export type DefinedSearchDeviationRowKey = keyof SearchDeviationRowDefinedColumns;
