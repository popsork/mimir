export const SEARCH_SPECIFICATION_ROW_DEFINITION = buildTableColumnDefinition({
    order_number: "string",
    transport_order_number: "string",
    unit_number: "string",
    started_at: "string",
    ended_at: "string",
    start_point_name: "string",
    end_point_name: "string",
    activity: "string",
    notes: "string",
    quantity: "number",
    quantity_type_name: "string",
    hours: "number",
    executions: "number",
});

type SearchSpecificationRowBaseColumns = {
    id: string,
    order_id: string | null,
};

type SearchSpecificationRowDefinedColumns = InferRowType<typeof SEARCH_SPECIFICATION_ROW_DEFINITION>;

export type SearchSpecificationRow = SearchSpecificationRowBaseColumns & SearchSpecificationRowDefinedColumns;
export type SearchSpecificationRowKey = keyof SearchSpecificationRow;
export type DefinedSearchSpecificationRowKey = keyof SearchSpecificationRowDefinedColumns;
