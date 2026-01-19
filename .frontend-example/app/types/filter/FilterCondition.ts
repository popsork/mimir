export type FilterCondition = {
    key: string | null,
    operator?: FilterComparisonOperator | null,
    value: string | null,
    type?: TableColumnDefinition["type"] | null,
};
