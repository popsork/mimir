import type { DangerousGoodsRow } from "~/models/DangerousGoodsRow";

export const useOrderFormDangerousGoodsRowAccessor = (idFunction: () => string) => {
    const { form } = storeToRefs(useOrderFormStore());

    const getDangerousGoodsRow = () => {
        // this function assumes that it is only called if the row exists,
        // so that calling code does not have to do null-checks
        const rows = (form.value.order.dangerousGoodsRows || []);
        const id = idFunction();
        return rows.find(record => record.id === id) as DangerousGoodsRow;
    };

    return {
        getDangerousGoodsRow
    };
};
