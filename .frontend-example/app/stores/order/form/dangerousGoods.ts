import { DangerousGoodsRow } from "~/models/DangerousGoodsRow";

export const useOrderFormDangerousGoodsStore = defineStore("order-form-dangerous-goods", () => {
    const formStore = useOrderFormStore();

    const { form } = storeToRefs(formStore);

    const addDangerousGoodsRow = (goodsRowId: string) => {
        const order = form.value.order;

        if (!order.dangerousGoodsRows) {
            order.dangerousGoodsRows = [];
        }

        const newDangerousGoodsRow = DangerousGoodsRow.buildBlank({
            customerOrderId: order.id,
            sequenceNumber: order.dangerousGoodsRows.length + 1,
            goodsRowId,
        });

        order.dangerousGoodsRows.push(newDangerousGoodsRow);

        formStore.registerRelationshipAddition("DangerousGoodsRow", newDangerousGoodsRow.id);

        fixDangerousGoodsRowSequenceNumbers();
    };

    const getDangerousGoodsRowsByGoodsRowId = (goodsRowId: string) => {
        const order = form.value.order;
        if (!order.dangerousGoodsRows) {
            return [];
        }
        return order.dangerousGoodsRows.filter(record => record.goodsRowId === goodsRowId);
    };

    const getDangerousGoodsRowById = (id: string) => {
        const order = form.value.order;
        if (!order.dangerousGoodsRows) {
            return null;
        }
        const record = order.dangerousGoodsRows.find(record => record.id === id);
        if (!record) {
            return null;
        }
        return record as DangerousGoodsRow;
    };

    const removeDangerousGoodsRow = (id: string) => {
        const order = form.value.order;

        const removableDangerousGoodsRow = getDangerousGoodsRowById(id);
        if (!removableDangerousGoodsRow) {
            return;
        }

        const index = order.dangerousGoodsRows!.findIndex(record => record.id === id);
        if (index === -1) {
            return;
        }

        order.dangerousGoodsRows!.splice(index, 1);
        formStore.registerRelationshipRemoval("DangerousGoodsRow", removableDangerousGoodsRow.id);

        fixDangerousGoodsRowSequenceNumbers();
    };

    const removeDangerousGoodsRowsByGoodsRowId = (goodsRowId: string) => {
        const order = form.value.order;

        if (!order.dangerousGoodsRows) {
            return;
        }

        const removableRowIds = getDangerousGoodsRowsByGoodsRowId(goodsRowId).map(record => record.id);
        removableRowIds.forEach(rowId => {
            removeDangerousGoodsRow(rowId);
        });
    };

    const fixDangerousGoodsRowSequenceNumbers = () => {
        // dangerous goods rows are globally sequenced within the order
        // without taking into account the order of the goods rows they belong to
        const order = form.value.order;
        if (!order.dangerousGoodsRows) {
            return;
        }
        order.dangerousGoodsRows.forEach((record, index) => {
            record.sequenceNumber = index + 1;
        });
    };

    const hoveredDangerousGoodsRowId = ref(null as string | null);

    return {
        getDangerousGoodsRowsByGoodsRowId,

        addDangerousGoodsRow,
        removeDangerousGoodsRow,
        removeDangerousGoodsRowsByGoodsRowId,

        hoveredDangerousGoodsRowId,
    };
});

