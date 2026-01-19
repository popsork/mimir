import { add, format } from "date-fns";
import { getSystemTimeZoneDate } from "~/utils/helpers/time/getSystemTimeZoneDate";
import { getSystemTimeZoneDateString } from "~/utils/helpers/time/getSystemTimeZoneDateString";

export const getSylvieJSQuery = (filterExpression: FilterExpression, filterDefinitions?: Record<string, FilterConditionDefinition>): Record<string, any> => {
    const query = filterExpression.groups.map((conditionGroup) => {
        const filterConditions = conditionGroup.conditions
            .map(condition => {
                const definition = condition.key ? filterDefinitions?.[condition.key] : null;
                return filterConditionToQuery(condition, definition);
            })
            .filter(filterQuery => filterQuery !== null);

        if (filterConditions.length === 0) {
            return [];
        }

        const groupOperatorKey = "$" + conditionGroup.operator;
        return conditionGroup.operator
            ? [{ [groupOperatorKey]: filterConditions }]
            : filterConditions;
    }).flat();

    if (query.length === 0) {
        return {};
    }

    const operatorKey = "$" + filterExpression.operator;
    return { [operatorKey]: query };
};

const filterConditionToQuery = ({ key, operator, value }: FilterCondition, definition?: FilterConditionDefinition | null) => {
    if (!key || !operator) {
        return null;
    }

    const filterKey = definition?.filterOn || key;
    if (isBlankOperator(operator)) {
        return buildBlankQuery({ key: filterKey, operator });
    }

    if (definition?.type === "date") {
        return dateFilterToQuery({ key: filterKey, operator, value });
    }

    if (definition?.type === "number") {
        return numberFilterToQuery({ key: filterKey, operator, value });
    }

    return stringFilterToQuery({ key: filterKey, operator, value });
};

const numberFilterToQuery = (
    { key, operator, value }:
    { key: string, operator: FilterComparisonOperator, value: string | null }
) => {
    //
    // Number cannot filter on empty values, if the user selects blank/not blank
    // it is handled by filterConditionToQuery before calling this function.
    if (isConsideredEmpty(value)) {
        return null;
    }

    const numberValue = parseFloat(value);
    if (isNaN(numberValue)) {
        return null;
    }

    if (isSylvieOperator(operator)) {
        return buildOperatorQuery({ key, operator, value: numberValue });
    }

    return null;
};

const relativeDateFilterToQuery = (
    { key, value }:
    { key: string, value: string }
) => {
    let internalValue = null as number[] | null;
    try {
        internalValue = JSON.parse(value);
    } catch {
        return null;
    }

    if (!Array.isArray(internalValue) || internalValue.length !== 2) {
        return null;
    }

    const [daysInPast, daysInFuture] = internalValue;

    const now = new Date();
    const fromDateString = getSystemTimeZoneDateString(add(now, { days: daysInPast! }));
    const toDateString = getSystemTimeZoneDateString(add(now, { days: daysInFuture! }));

    return {
        $and: [
            {
                [key]: {
                    $gte: fromDateString,
                }
            },
            {
                [key]: {
                    $lte: toDateString
                }
            }
        ]
    };
};

const dateFilterToQuery = (
    { key, operator, value }:
    { key: string, operator: FilterComparisonOperator, value: string | null }
) => {
    //
    // Dates cannot filter on empty values, if the user selects blank/not blank
    // it is handled by filterConditionToQuery before calling this function.
    if (isConsideredEmpty(value)) {
        return null;
    }

    if (operator === FilterComparisonOperator.Relative) {
        return relativeDateFilterToQuery({ key, value });
    }

    const dateValue = getSystemTimeZoneDate(value);
    if (!dateValue) {
        return null;
    }

    const dateValueString = format(dateValue, "yyyy-MM-dd");
    return stringFilterToQuery({ key, operator, value: dateValueString });
};

const stringFilterToQuery = ({ key, operator, value }: {
    key: string,
    operator: FilterComparisonOperator,
    value: string | null,
}) => {
    if (isSylvieOperator(operator)) {
        return buildOperatorQuery({ key, operator, value });
    }

    switch (operator) {
        case FilterComparisonOperator.Matches:
            return buildRegexQuery({ key, value, negate: false });
        case FilterComparisonOperator.NotMatches:
            return buildRegexQuery({ key, value, negate: true });
    }

    return null;
};

const isBlankOperator = (operator: FilterComparisonOperator) => operator === FilterComparisonOperator.Blank || operator === FilterComparisonOperator.NotBlank;
const isSylvieOperator = (operator: FilterComparisonOperator) => operator in comparisonOperatorToSylvieOperatorMap;
const isConsideredEmpty = (value?: string | null | Date | number) => (value === undefined || value === null || value === "");

const comparisonOperatorToSylvieOperatorMap: Partial<Record<FilterComparisonOperator, string>> = {
    [FilterComparisonOperator.Equals]: "$eq",
    [FilterComparisonOperator.NotEquals]: "$ne",
    [FilterComparisonOperator.GreaterThan]: "$gt",
    [FilterComparisonOperator.GreaterThanOrEqual]: "$gte",
    [FilterComparisonOperator.LessThan]: "$lt",
    [FilterComparisonOperator.LessThanOrEqual]: "$lte",
};

const buildRegexQuery = (
    { key, value, negate }:
    { key: string, value: null | string, negate: boolean }
) => {
    if (isConsideredEmpty(value)) {
        return;
    }

    let regex = escapeAndTransformPattern(value as string);
    if (negate) {
        regex = `(?!${regex}$).*`;
    }

    return {
        [key]: {
            $regex: [`^${regex}$`, "i"]
        }
    };
};

const escapeAndTransformPattern = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\\\?/g, ".")
        .replace(/\\\*/g, ".*?");
};

const buildBlankQuery = (
    { key, operator }:
    { key: string, operator: FilterComparisonOperator.Blank | FilterComparisonOperator.NotBlank }
) => {
    const equalityOperator = operator === FilterComparisonOperator.NotBlank ? "$ne" : "$eq";
    const logicalOperator = operator === FilterComparisonOperator.NotBlank ? "$and" : "$or";

    return {
        [logicalOperator]: [
            {
                [key]: {
                    [equalityOperator]: null
                }
            },
            {
                [key]: {
                    [equalityOperator]: ""
                }
            }
        ]
    };
};

const buildOperatorQuery = (
    { key, operator, value }:
    { key: string, operator: SylvieOperatorKeys, value: string | null | Date | number }
) => {
    if (isConsideredEmpty(value)) {
        return null;
    }

    const sylvieOperator = comparisonOperatorToSylvieOperatorMap[operator];
    if (!sylvieOperator) {
        return null;
    }

    return {
        [key]: {
            [sylvieOperator]: value,
        },
    };
};

type SylvieOperatorKeys = keyof typeof comparisonOperatorToSylvieOperatorMap;

export type FilterConditionDefinition = {
    type: "string" | "date" | "number" | "boolean" | "enum",
    filterOn?: string,
};
