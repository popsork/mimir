
export enum ActionType {
    // Dispatch TransportOrder: only for active units in Dispatch
    DispatchTransportOrder = "DISPATCH_TRANSPORT_ORDER_TO_UNIT",
    UndispatchTransportOrder = "UNDISPATCH_TRANSPORT_ORDER_FROM_UNIT",
    // Plan and Dispatch TransportOrder: for both active, inactive units in Dispatch
    PlanDispatchTransportOrder = "PLAN_DISPATCH_TRANSPORT_ORDER",
    // Plan Transport Order: for both active, inactive units in Plan
    PlanTransportOrder = "PLAN_TRANSPORT_ORDER",
    AcceptTransportOrder = "ACCEPT_TRANSPORT_ORDER",
    CompleteTransportOrder = "COMPLETE_TRANSPORT_ORDER",
    VerifyTransportOrder = "VERIFY_TRANSPORT_ORDER",
    CompleteAndVerifyTransportOrder = "COMPLETE_AND_VERIFY_TRANSPORT_ORDER",


    // these are currently not used by FE except for having translations to display the latest tracking event
    StartTransportOrder = "START_TRANSPORT_ORDER",
    LoadTransportOrderFromTerminal = "LOAD_TRANSPORT_ORDER_FROM_TERMINAL",
    LoadTransportOrderFromCustomer = "LOAD_TRANSPORT_ORDER_FROM_CUSTOMER",
    DeliverTransportOrderToTerminal = "DELIVER_TRANSPORT_ORDER_TO_TERMINAL",
    DeliverTransportOrderToCustomer = "DELIVER_TRANSPORT_ORDER_TO_CUSTOMER",
    RejectTransportOrder = "REJECT_TRANSPORT_ORDER",
    AddDeviationRow = "ADD_DEVIATION_ROW",
}
