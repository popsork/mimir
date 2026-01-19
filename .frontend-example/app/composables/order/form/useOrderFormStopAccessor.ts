import type { Stop } from "~/models/Stop";

export const useOrderFormStopAccessor = (indexFunction: () => number) => {
    const { form } = storeToRefs(useOrderFormStore());

    const getStop = () => {
        const rows = (form.value.order.stops || []) as Stop[];
        const index = indexFunction();
        return rows[index];
    };

    return {
        getStop
    };
};


