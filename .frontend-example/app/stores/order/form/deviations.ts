import { DeviationRow } from "~/models/DeviationRow";

export const useOrderFormDeviationsStore = defineStore("order-form-deviations", () => {
    const formStore = useOrderFormStore();

    const { form } = storeToRefs(formStore);

    const addDeviationRow = () => {
        const order = form.value.order;

        if (!order.deviationRows) {
            order.deviationRows = [];
        }

        const newDeviationRow = DeviationRow.buildBlank({
            customerOrderId: order.id,
            sequenceNumber: order.deviationRows.length + 1
        });

        order.deviationRows.push(newDeviationRow);

        formStore.registerRelationshipAddition("DeviationRow", newDeviationRow.id);

        fixDeviationRowSequenceNumbers();
    };

    const getDeviationRowByIndex = (index: number) => {
        const order = form.value.order;
        if (!order.deviationRows || !order.deviationRows[index]) {
            return null;
        }
        return order.deviationRows[index] as DeviationRow;
    };

    const removeDeviationRow = (index: number) => {
        const order = form.value.order;

        const removableDeviationRow = getDeviationRowByIndex(index);
        if (!removableDeviationRow) {
            return;
        }

        order.deviationRows!.splice(index, 1);
        formStore.registerRelationshipRemoval("DeviationRow", removableDeviationRow.id);

        fixDeviationRowSequenceNumbers();
    };

    const fixDeviationRowSequenceNumbers = () => {
        const order = form.value.order;
        if (!order.deviationRows) {
            return;
        }
        order.deviationRows.forEach((record, index) => {
            record.sequenceNumber = index + 1;
        });
    };

    return {
        addDeviationRow,
        removeDeviationRow,
    };
});

