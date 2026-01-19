import type { SpecificationRow } from "~/models/SpecificationRow";

export const useOrderFormSpecificationRowAccessor = (indexFunction: () => number) => {
    const { form } = storeToRefs(useOrderFormStore());

    const getSpecificationRow = () => {
        const rows = (form.value.order.specificationRows || []) as SpecificationRow[];
        const index = indexFunction();
        return rows[index];
    };

    return {
        getSpecificationRow
    };
};
