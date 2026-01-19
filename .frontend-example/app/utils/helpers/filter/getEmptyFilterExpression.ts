export const getEmptyFilterExpression = (): FilterExpression => {
    return {
        groups: [],
        operator: FilterLogicalOperator.And,
    };
};
