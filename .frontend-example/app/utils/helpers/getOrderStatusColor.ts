export const getOrderStatusColor = (status: TransportOrderStatusName | null): OrderStatusColor | null => {
    switch (status) {
        case TransportOrderStatusName.Pending:
            return OrderStatusColor.Pending;

        case TransportOrderStatusName.Planned:
            return OrderStatusColor.Planned;

        case TransportOrderStatusName.Dispatched:
            return OrderStatusColor.Dispatched;

        case TransportOrderStatusName.Accepted:
            return OrderStatusColor.Accepted;

        case TransportOrderStatusName.Started:
            return OrderStatusColor.Started;

        case TransportOrderStatusName.Completed:
            return OrderStatusColor.Completed;

        case TransportOrderStatusName.Verified:
        case TransportOrderStatusName.Invoicing:
        case TransportOrderStatusName.SelfBillable:
        case TransportOrderStatusName.SelfBilling:
        case TransportOrderStatusName.Archived:
            return OrderStatusColor.Completed; // no specified colors for these statuses, use same color as completed

        default:
            return null;
    }
};
