export const ORDER_TEMPLATE_ROW_DEFINITION = buildTableColumnDefinition({
    name: "string",
    customerShortName: "string",
    subcustomerName: "string",
    operationName: "string",
    serviceName: "string",
    customerReference: "string",
    senderReference: "string",
    recipientReference: "string",
    plannedPickupAt: {
        type: "date",
    },
    plannedDeliveryAt: {
        type: "date",
        timeFormat: "delivery",
    },
    pickupName: "string",
    pickupPostalCode: "string",
    pickupCity: "string",
    deliveryName: "string",
    deliveryPostalCode: "string",
    deliveryCity: "string",
    plannerInstructions: "string",
    isScheduled: "boolean",
} as const);

// Base columns (mostly ids) which are never shown to the user
// thus not needed to have definitions
type OrderTemplateRowBaseColumns = {
    id: string,
};

type OrderTemplateRowDefinedColumns = InferRowType<typeof ORDER_TEMPLATE_ROW_DEFINITION>;

export type OrderTemplateRow = OrderTemplateRowBaseColumns & OrderTemplateRowDefinedColumns;
export type OrderTemplateRowKey = keyof OrderTemplateRow;
export type DefinedOrderTemplateRowKey = keyof OrderTemplateRowDefinedColumns;

