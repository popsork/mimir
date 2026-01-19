export const ORDER_ROW_DEFINITION = buildTableColumnDefinition({
    accepted_at: {
        type: "date",
        filterOn: "accepted_at_date",
        sortDateOn: "accepted_at_date",
        sortTimeOn: "accepted_at_time"
    },
    alystra_customer_total: "number",
    alystra_unit_total: "number",
    carrier_name: "string",
    carrier_shortname: "string",
    carrier_instructions: "string",
    completed_at: {
        type: "date",
        filterOn: "completed_at_date",
        sortDateOn: "completed_at_date",
        sortTimeOn: "completed_at_time"
    },
    created_at: {
        type: "date",
        filterOn: "created_at_date",
        sortDateOn: "created_at_date",
        sortTimeOn: "created_at_time"
    },
    customer_contact: "string",
    customer_delivery_city: "string",
    customer_delivery_contact: "string",
    customer_delivery_country: "string",
    customer_delivery_email: "string",
    customer_delivery_information: "string",
    customer_delivery_latitude: "number",
    customer_delivery_longitude: "number",
    customer_delivery_name: "string",
    customer_delivery_phone: "string",
    customer_delivery_postal_code: "string",
    customer_delivery_street_name: "string",
    customer_delivery_street_number: "string",
    customer_department: "string",
    customer_difference: "number",
    customer_email: "string",
    customer_mobile: "string",
    customer_name: "string",
    customer_number: "string",
    customer_phone: "string",
    customer_pickup_city: "string",
    customer_pickup_contact: "string",
    customer_pickup_country: "string",
    customer_pickup_email: "string",
    customer_pickup_information: "string",
    customer_pickup_latitude: "number",
    customer_pickup_longitude: "number",
    customer_pickup_name: "string",
    customer_pickup_phone: "string",
    customer_pickup_postal_code: "string",
    customer_pickup_street_name: "string",
    customer_pickup_street_number: "string",
    customer_short_name: "string",
    delivery_city: "string",
    delivery_contact: "string",
    delivery_country: "string",
    delivery_earliest_at: {
        type: "date",
        timeFormat: "delivery",
        filterOn: "delivery_earliest_at_date",
        sortDateOn: "delivery_earliest_at_date",
        sortTimeOn: "delivery_earliest_at_time"
    },
    delivery_email: "string",
    delivery_information: "string",
    delivery_latest_at: {
        type: "date",
        timeFormat: "delivery",
        filterOn: "delivery_latest_at_date",
        sortDateOn: "delivery_latest_at_date",
        sortTimeOn: "delivery_latest_at_time"
    },
    delivery_latitude: "number",
    delivery_longitude: "number",
    delivery_name: "string",
    delivery_phone: "string",
    delivery_postal_code: "string",
    delivery_street_name: "string",
    delivery_street_number: "string",
    deviation_count: "number",
    dispatched_at: {
        type: "date",
        filterOn: "dispatched_at_date",
        sortDateOn: "dispatched_at_date",
        sortTimeOn: "dispatched_at_time"
    },
    dispatched_by: "string",
    document_count: "number",
    driver_instructions: "string",
    driver_name: "string",
    driver_phone: "string",
    driving_distance: "number",
    last_comment: "string",
    line_name: "string",
    last_action_at: {
        type: "date",
        filterOn: "last_action_at_date",
        sortDateOn: "last_action_at_date",
        sortTimeOn: "last_action_at_time"
    },
    last_action_name: "string",
    next_action_at: {
        type: "date",
        filterOn: "next_action_at_date",
        sortDateOn: "next_action_at_date",
        sortTimeOn: "next_action_at_time"
    },
    next_action_name: "string",
    next_unit_name: "string",
    next_vehicle_name: "string",
    number: "string",
    order_actual_weight_total: "number",
    order_agreement: "string",
    order_calculated_weight_total: "number",
    order_consignee_ref: "string",
    order_consignor_ref: "string",
    order_customer_ref: "string",
    order_date: "string",
    order_has_pod: "boolean",
    order_loading_meters_total: "number",
    order_markings: "string",
    order_number: "string",
    order_operation: "string",
    order_package_count: "number",
    order_pod_name: "string",
    order_quantity_types: "string",
    order_status: {
        type: "enum",
        enum: OrderStatus,
        translationScope: "order.statuses"
    },
    order_expense: "number",
    order_revenue: "number",
    order_type: "string",
    order_volume_total: "number",
    invoice_text: "string",
    internal_notes: "string",
    pallet_places_total: "number",
    order_weight_total: "number",
    pickup_city: "string",
    pickup_contact: "string",
    pickup_country: "string",
    pickup_earliest_at: {
        type: "date",
        filterOn: "pickup_earliest_at_date",
        sortDateOn: "pickup_earliest_at_date",
        sortTimeOn: "pickup_earliest_at_time"
    },
    pickup_email: "string",
    pickup_information: "string",
    pickup_latest_at: {
        type: "date",
        filterOn: "pickup_latest_at_date",
        sortDateOn: "pickup_latest_at_date",
        sortTimeOn: "pickup_latest_at_time"
    },
    pickup_latitude: "number",
    pickup_longitude: "number",
    pickup_name: "string",
    pickup_phone: "string",
    pickup_postal_code: "string",
    pickup_street_name: "string",
    pickup_street_number: "string",
    planned_at: {
        type: "date",
        filterOn: "planned_at_date",
        sortDateOn: "planned_at_date",
        sortTimeOn: "planned_at_time"
    },
    planner_instructions: "string",
    previous_unit_name: "string",
    previous_vehicle_name: "string",
    project_name: "string",
    project_number: "string",
    release_for_invoicing_at: {
        type: "date",
        filterOn: "release_for_invoicing_at_date",
        sortDateOn: "release_for_invoicing_at_date",
        sortTimeOn: "release_for_invoicing_at_time"
    },
    route_name: "string",
    registered_by: "string",
    sequence_in_route: "number",
    sequence_number: "number",
    transport_order_stage_name: {
        type: "enum",
        enum: TransportOrderStageName,
        translationScope: "transport_orders.stage_names",
    },
    service_name: "string",
    started_at: {
        type: "date",
        filterOn: "started_at_date",
        sortDateOn: "started_at_date",
        sortTimeOn: "started_at_time"
    },
    status: {
        type: "enum",
        enum: TransportOrderStatusName,
        translationScope: "transport_orders.statuses",
    },
    subcustomer_name: "string",
    timeout: "string",
    transport_order_count: "number",
    unit_difference: "number",
    unit_name: "string",
    unit_number: "string",
    updated_at: {
        type: "date",
        filterOn: "updated_at_date",
        sortDateOn: "updated_at_date",
        sortTimeOn: "updated_at_time"
    },
    vehicle_comment: "string",
    vehicle_description: "string",
    vehicle_name: "string",
    vehicle_tare_weight: "number",
    vehicle_type: "string",
    waybill: "string",
    goods_quantity: "number",
    goods_quantity_types: "string",
    goods_weight: {
        type: "number",
        decimals: 2,
    },
    goods_volume: {
        type: "number",
        decimals: 2,
    },
    goods_loading_metres: {
        type: "number",
        decimals: 2,
    },
    goods_pallet_places: {
        type: "number",
        decimals: 2,
    },
    goods_calculated_weight: {
        type: "number",
        decimals: 2,
    },
    goods_calculated_volume: {
        type: "number",
        decimals: 2,
    },
    goods_calculated_loading_metres: {
        type: "number",
        decimals: 2,
    },
    goods_calculated_pallet_places: {
        type: "number",
        decimals: 2,
    },
    specification_quantity_types: "string",
    specification_quantity: {
        type: "number",
        decimals: 2,
    },
    specification_hours: {
        type: "number",
        decimals: 2,
    },
    specification_executions: {
        type: "number",
        decimals: 2,
    },
    verified_at: {
        type: "date",
        filterOn: "verified_at_date",
        sortDateOn: "verified_at_date",
        sortTimeOn: "verified_at_time"
    },
    is_denied: "boolean"
} as const);


// Base columns (mostly ids) which are never shown to the user
// thus not needed to have definitions
type OrderRowBaseColumns = {
    id: string,
    unit_id: string | null,
    vehicle_id: string | null,
    carrier_id: string | null,
    customer_id: string | null,
    delivery_id: string | null,
    driver_id: string | null,
    next_unit_id: string | null,
    line_id: string | null,
    order_id: string | null,
    pickup_id: string | null,
    previous_unit_id: string | null,
    route_id: string | null,
    service_id: string | null,
    transport_order_stage_id: string | null,
    project_id: string | null,
};

// columns that are generated by frontend or backend
type OrderRowGeneratedColumns = {
    created_at_utc: string | null,
    updated_at_utc: string | null,

    pickup_earliest_at_utc: string | null,
    delivery_latest_at_utc: string | null,

    //
    // generated fields by backend that contains
    // separated date and time for the dates, used by orderlist
    // to handle sort and filtering.
    accepted_at_date: string | null,
    accepted_at_time: string | null,

    completed_at_date: string | null,
    completed_at_time: string | null,

    created_at_date: string | null,
    created_at_time: string | null,

    delivery_earliest_at_date: string | null,
    delivery_earliest_at_time: string | null,

    delivery_latest_at_date: string | null,
    delivery_latest_at_time: string | null,

    dispatched_at_date: string | null,
    dispatched_at_time: string | null,

    pickup_latest_at_date: string | null,
    pickup_latest_at_time: string | null,

    planned_at_date: string | null,
    planned_at_time: string | null,

    release_for_invoicing_at_date: string | null,
    release_for_invoicing_at_time: string | null,

    started_at_date: string | null,
    started_at_time: string | null,

    updated_at_date: string | null,
    updated_at_time: string | null,

    pickup_earliest_at_date: string | null,
    pickup_earliest_at_time: string | null,

    last_action_at_date: string | null,
    last_action_at_time: string | null,

    next_action_at_date: string | null,
    next_action_at_time: string | null,

    verified_at_time: string | null,
    verified_at_date: string | null,
};


type OrderRowDefinedColumns = InferRowType<typeof ORDER_ROW_DEFINITION>;

export type OrderRow = OrderRowBaseColumns & OrderRowDefinedColumns & OrderRowGeneratedColumns;
export type OrderRowKey = keyof OrderRow;
export type DefinedOrderRowKey = keyof OrderRowDefinedColumns;
