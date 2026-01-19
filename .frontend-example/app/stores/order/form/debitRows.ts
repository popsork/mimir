import { DebitRow } from "~/models/DebitRow";

export const useOrderFormDebitRowsStore = defineStore("debit-rows", () => {
    const formStore = useOrderFormStore();

    const { form } = storeToRefs(formStore);

    const getDebitRows = (transportOrderId: string | null): DebitRow[] => {
        const order = form.value.order;
        if (!order.debitRows) {
            return [];
        }
        return order.debitRows.filter(record => record.transportOrderId === transportOrderId) as DebitRow[];
    };

    const addDebitRow = (transportOrderId: string | null) => {
        const order = form.value.order;

        if (!order.debitRows) {
            order.debitRows = [];
        }

        const newDebitRow = DebitRow.buildBlank({
            customerOrderId: order.id,
            debitRowType: DebitRowType.Normal,
            transportOrderId,
            sequenceNumber: getLargestSequenceNumber(transportOrderId) + 1
        });

        order.debitRows.push(newDebitRow);

        formStore.registerRelationshipAddition("DebitRow", newDebitRow.id);

        fixDebitRowSequenceNumbers(transportOrderId);
    };

    const getLargestSequenceNumber = (transportOrderId: string | null) => {
        const relevantRows = getDebitRows(transportOrderId);
        if (relevantRows.length < 1) {
            return 0;
        }
        const sequenceNumbers = relevantRows.map(record => record.sequenceNumber);
        return Math.max(...sequenceNumbers);
    };

    const getDebitRowByIndex = (transportOrderId: string | null, index: number) => {
        const debitRows = getDebitRows(transportOrderId);
        if (!debitRows[index]) {
            return null;
        }
        return debitRows[index] as DebitRow;
    };

    const removeDebitRow = (transportOrderId: string | null, index: number) => {
        const order = form.value.order;

        const removableDebitRow = getDebitRowByIndex(transportOrderId, index);
        if (!removableDebitRow) {
            return;
        }

        const removableId = removableDebitRow.id;

        const removableIndex = order.debitRows!.indexOf(removableDebitRow);

        order.debitRows!.splice(removableIndex, 1);
        formStore.registerRelationshipRemoval("DebitRow", removableId);
        fixDebitRowSequenceNumbers(transportOrderId);

        // remove all debit rows for which parentId is the removed debit row's id.
        // this will remove both add-on rows and normal child rows.
        // customer debit rows may also be parents for transport debit rows,
        // so we need to look accross all transport order rows as well.
        const removableChildRows = order.debitRows!.filter(row => row.parentId === removableId);
        removableChildRows.forEach(removableChild => {
            // locate the debit row in its corresponding set (customer rows or rows for a specific transport order)
            const relevantRows = getDebitRows(removableChild.transportOrderId);
            const childIndex = relevantRows.findIndex(row => row.id === removableChild.id);
            if (childIndex !== -1) {
                // call removal recursively to handle possible nested children as well
                removeDebitRow(removableChild.transportOrderId, childIndex);
            }
        });
    };

    const removeAllDebitRowsForTransportOrder = (transportOrderId: string) => {
        const debitRow = getDebitRowByIndex(transportOrderId, 0);
        if (debitRow) {
            removeDebitRow(transportOrderId, 0);
            removeAllDebitRowsForTransportOrder(transportOrderId);
        }
    };

    const fixDebitRowSequenceNumbers = (transportOrderId: string | null) => {
        const debitRows = getDebitRows(transportOrderId);

        debitRows.forEach((record, index) => {
            record.sequenceNumber = index + 1;
        });
    };

    const hoveredDebitRowReference = ref(null as { transportOrderId: string | null, index: number } | null);

    const getHighlightedDebitRowIndexes = (transportOrderId: string | null) => {
        if (!hoveredDebitRowReference.value || hoveredDebitRowReference.value.transportOrderId !== transportOrderId) {
            return [];
        }

        // if a row is hovered, then the highlighted rows are that one row
        // + all "addon" rows immediately following it
        const indexes = [hoveredDebitRowReference.value.index];
        const debitRows = getDebitRows(transportOrderId);
        let nextNonAddonRowReached = false;
        debitRows.forEach((row, index) => {
            if (index <= hoveredDebitRowReference.value!.index) {
                return;
            }
            if (row.debitRowType !== DebitRowType.Addon) {
                nextNonAddonRowReached = true;
            }
            if (nextNonAddonRowReached) {
                return;
            }
            indexes.push(index);
        });
        return indexes;
    };


    return {
        getDebitRows,

        addDebitRow,
        removeDebitRow,

        removeAllDebitRowsForTransportOrder,

        hoveredDebitRowReference,
        getHighlightedDebitRowIndexes
    };
});

