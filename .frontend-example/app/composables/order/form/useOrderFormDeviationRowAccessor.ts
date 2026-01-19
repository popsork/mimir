import type { DeviationRow } from "~/models/DeviationRow";

export const useOrderFormDeviationRowAccessor = (indexFunction: () => number) => {
    const { form } = storeToRefs(useOrderFormStore());

    const getDeviationRow = () => {
        const rows = (form.value.order.deviationRows || []) as DeviationRow[];
        const index = indexFunction();
        return rows[index];
    };

    return {
        getDeviationRow
    };
};
