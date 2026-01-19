import { GoodsRow } from "~/models/GoodsRow";
import { Package } from "~/models/Package";

export const useOrderFormGoodsStore = defineStore("order-form-goods", () => {
    const formStore = useOrderFormStore();
    const dangerousGoodsStore = useOrderFormDangerousGoodsStore();

    const { form } = storeToRefs(formStore);

    const addGoodsRow = () => {
        const order = form.value.order;

        if (!order.goodsRows) {
            order.goodsRows = [];
        }

        const newGoodsRow = GoodsRow.buildBlank({
            customerOrderId: order.id,
            sequenceNumber: order.goodsRows.length + 1
        });

        order.goodsRows.push(newGoodsRow);

        formStore.registerRelationshipAddition("GoodsRow", newGoodsRow.id);

        fixGoodsRowSequenceNumbers();
    };

    const getGoodsRowByIndex = (index: number) => {
        const order = form.value.order;
        if (!order.goodsRows || !order.goodsRows[index]) {
            return null;
        }
        return order.goodsRows[index] as GoodsRow;
    };

    const removeGoodsRow = (index: number) => {
        const order = form.value.order;

        const removableGoodsRow = getGoodsRowByIndex(index);
        if (!removableGoodsRow) {
            return;
        }

        // when removing a goods row, all its dangerous goods rows also must be removed
        dangerousGoodsStore.removeDangerousGoodsRowsByGoodsRowId(removableGoodsRow.id);

        // when removing a goods row, all its packages also must be registered as removed
        const packageIds = removableGoodsRow.packages?.map(record => record.id) ?? [];
        order.goodsRows!.splice(index, 1);
        formStore.registerRelationshipRemoval("GoodsRow", removableGoodsRow.id);
        packageIds.forEach(packageId => formStore.registerRelationshipRemoval("Package", packageId));

        fixGoodsRowSequenceNumbers();
    };

    const fixGoodsRowSequenceNumbers = () => {
        const order = form.value.order;
        if (!order.goodsRows) {
            return;
        }
        order.goodsRows.forEach((record, index) => {
            record.sequenceNumber = index + 1;
        });
    };

    const hoveredGoodsRowIndex = ref(null as number | null);

    const addPackage = (goodsRowIndex: number, number: string) => {
        const goodsRow = getGoodsRowByIndex(goodsRowIndex);

        if (!goodsRow) {
            return;
        }

        if (!goodsRow.packages) {
            goodsRow.packages = [];
        }

        const newPackage = buildNewPackage({
            customerOrderId: goodsRow.customerOrderId,
            goodsRowId: goodsRow.id,
            sequenceNumber: goodsRow.packages.length + 1,
            number
        });

        goodsRow.packages.push(newPackage);

        formStore.registerRelationshipAddition("Package", newPackage.id);
        fixPackageSequenceNumbers(goodsRowIndex);
    };

    const buildNewPackage = (
        { customerOrderId, goodsRowId, sequenceNumber, number }:
        { customerOrderId: string, goodsRowId: string, sequenceNumber: number, number: string }
    ) => {
        const record = Package.buildBlank({ customerOrderId, goodsRowId, sequenceNumber });
        record.number = number;
        return record;
    };

    const removePackage = (goodsRowIndex: number, index: number) => {
        const order = form.value.order;

        if (!order || !order.goodsRows) {
            return;
        }
        const goodsRow = order.goodsRows[goodsRowIndex];

        if (!goodsRow || !goodsRow.packages || !goodsRow.packages[index]) {
            return;
        }

        const removablePackage = goodsRow.packages[index];
        if (!removablePackage) {
            return;
        }

        order.goodsRows[goodsRowIndex]!.packages!.splice(index, 1);

        formStore.registerRelationshipRemoval("Package", removablePackage.id);
        fixPackageSequenceNumbers(goodsRowIndex);
    };


    const fixPackageSequenceNumbers = (goodsRowIndex: number) => {
        const order = form.value.order;
        if (!order.goodsRows || !order.goodsRows[goodsRowIndex] || !order.goodsRows[goodsRowIndex].packages) {
            return;
        }
        order.goodsRows[goodsRowIndex].packages.forEach((record, index) => {
            record.sequenceNumber = index + 1;
        });
    };

    return {
        addGoodsRow,
        removeGoodsRow,

        hoveredGoodsRowIndex,

        addPackage,
        removePackage
    };
});

