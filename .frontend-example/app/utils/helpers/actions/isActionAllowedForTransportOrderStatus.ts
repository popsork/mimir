export function isActionAllowedForTransportOrderStatus(
    {
        actionType,
        status,
    }: {
        actionType: ActionType,
        status: TransportOrderStatusName,
    }
) {
    const postOperativePhaseStatuses = [
        TransportOrderStatusName.Invoicing,
        TransportOrderStatusName.SelfBillable,
        TransportOrderStatusName.SelfBilling,
        TransportOrderStatusName.Archived,
    ];

    // no actions are currently allowed for orders in post-operative phases
    if (postOperativePhaseStatuses.includes(status)) {
        return false;
    }

    switch (actionType) {
        case ActionType.PlanTransportOrder:
        case ActionType.DispatchTransportOrder:
            // planning and dispatching is available from any order status
            return true;

        case ActionType.UndispatchTransportOrder:
            return [
                // planned orders should have an "Unplan" action instead,
                // but since we currently don't have an action for that,
                // the "Undispatch" action can be used for the same thing (removes unit, sets status to pending)
                TransportOrderStatusName.Planned,

                TransportOrderStatusName.Dispatched,
                TransportOrderStatusName.Accepted,
                TransportOrderStatusName.Started,
                TransportOrderStatusName.Completed,
            ].includes(status);

        case ActionType.AcceptTransportOrder:
            return status === TransportOrderStatusName.Dispatched;

        case ActionType.CompleteTransportOrder:
        case ActionType.CompleteAndVerifyTransportOrder:
            return [
                TransportOrderStatusName.Accepted,
                TransportOrderStatusName.Started,
            ].includes(status);
        case ActionType.VerifyTransportOrder:
            return status === TransportOrderStatusName.Completed;
    }

    return true;
}
