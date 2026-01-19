export const useOrderFormDebitRowAccessor = (paramsFunction: () => { transportOrderId: string | null, index: number }) => {
    const { getDebitRows } = useOrderFormDebitRowsStore();

    const getDebitRow = () => {
        const { transportOrderId, index } = paramsFunction();
        const rows = getDebitRows(transportOrderId);

        return rows[index];
    };

    return {
        getDebitRow
    };
};
