export const getTransportOrderNumbersFilterExpression = (orderIds: OrderRow["id"][] = []): FilterExpression => {
    const rowsStore = useOrdersRowsStore();

    const filteredOrderNumbers = rowsStore.collection
        .chain()
        .find({ id: { $in: orderIds } })
        .data()
        .map((orderRow: OrderRow) => orderRow.number);

    const conditions = filteredOrderNumbers.map((orderNumber : OrderRow["number"]) : FilterCondition => ({
        key: "number",
        operator: FilterComparisonOperator.Equals,
        value: orderNumber,
    })) as FilterCondition[];

    const filteredOrderIdsGroup = { conditions, operator: FilterLogicalOperator.Or } as FilterConditionGroup;

    return {
        groups: conditions.length ? [filteredOrderIdsGroup] : [],
        operator: FilterLogicalOperator.And
    };
};
