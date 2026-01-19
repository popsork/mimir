import { getEmptyFilterCondition } from "~/utils/helpers/filter/getEmptyFilterCondition";

export const getEmptyConditionGroup = () : FilterConditionGroup => {
    return {
        operator: null,
        conditions: [
            getEmptyFilterCondition(),
        ],
    };
};
