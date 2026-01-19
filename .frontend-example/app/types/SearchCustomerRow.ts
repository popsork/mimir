export const SEARCH_CUSTOMER_ROW_DEFINITION = buildTableColumnDefinition({
    name: "string",
    short_name: "string",
    number: "string",
    vat: "string",
    order_count: "number",
});

type SearchCustomerRowBaseColumns = {
    id: string,
    order_id: string | null,
};

type SearchCustomerRowDefinedColumns = InferRowType<typeof SEARCH_CUSTOMER_ROW_DEFINITION>;

export type SearchCustomerRow = SearchCustomerRowBaseColumns & SearchCustomerRowDefinedColumns;
export type SearchCustomerRowKey = keyof SearchCustomerRow;
export type DefinedSearchCustomerRowKey = keyof SearchCustomerRowDefinedColumns;
