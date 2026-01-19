import type { GoodsRow } from "~/models/GoodsRow";

export const useOrderFormGoodsRowAccessor = (indexFunction: () => number) => {
    const { form } = storeToRefs(useOrderFormStore());

    const getGoodsRow = () => {
        const rows = (form.value.order.goodsRows || []) as GoodsRow[];
        const index = indexFunction();
        return rows[index];
    };

    return {
        getGoodsRow
    };
};
