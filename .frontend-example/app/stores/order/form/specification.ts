import { SpecificationRow } from "~/models/SpecificationRow";

export const useOrderFormSpecificationStore = defineStore("order-form-specification", () => {
    const formStore = useOrderFormStore();

    const { form } = storeToRefs(formStore);

    const addSpecificationRow = () => {
        const order = form.value.order;

        if (!order.specificationRows) {
            order.specificationRows = [];
        }

        const newSpecificationRow = SpecificationRow.buildBlank({
            customerOrderId: order.id,
            sequenceNumber: order.specificationRows.length + 1
        });

        order.specificationRows.push(newSpecificationRow);

        formStore.registerRelationshipAddition("SpecificationRow", newSpecificationRow.id);

        fixSpecificationRowSequenceNumbers();
    };

    const getSpecificationRowByIndex = (index: number) => {
        const order = form.value.order;
        if (!order.specificationRows || !order.specificationRows[index]) {
            return null;
        }
        return order.specificationRows[index] as SpecificationRow;
    };

    const removeSpecificationRow = (index: number) => {
        const order = form.value.order;

        const removableSpecificationRow = getSpecificationRowByIndex(index);
        if (!removableSpecificationRow) {
            return;
        }

        order.specificationRows!.splice(index, 1);
        formStore.registerRelationshipRemoval("SpecificationRow", removableSpecificationRow.id);

        fixSpecificationRowSequenceNumbers();
    };

    const fixSpecificationRowSequenceNumbers = () => {
        const order = form.value.order;
        if (!order.specificationRows) {
            return;
        }
        order.specificationRows.forEach((record, index) => {
            record.sequenceNumber = index + 1;
        });
    };

    return {
        addSpecificationRow,
        removeSpecificationRow,
    };
});

