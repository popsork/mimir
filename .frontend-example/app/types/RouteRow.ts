export const ROUTE_ROW_DEFINITION = buildTableColumnDefinition({
    name: "string",
    startAt: {
        type: "date",
    },
    endAt: {
        type: "date",
    },
    status: {
        type: "enum",
        enum: TransportOrderStatusName,
        translationScope: "transport_orders.statuses",
    },
    unitNumber: "string",
    unitTotal: "number",
    customerTotal: "number",
    lineOverride: "boolean",
    operationOverride: "boolean",
    autoDeleteAfterDays: "number",
    schedule: "string"
} as const);

// Base columns (mostly ids) which are never shown to the user
// thus not needed to have definitions
type RouteRowBaseColumns = {
    id: string,
};

type RouteRowDefinedColumns = InferRowType<typeof ROUTE_ROW_DEFINITION>;

export type RouteRow = RouteRowBaseColumns & RouteRowDefinedColumns;
export type RouterRowKey = keyof RouteRow;
export type DefinedRouteRowKey = keyof RouteRowDefinedColumns;

