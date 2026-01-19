import type { ScheduleEntry } from "~/models/ScheduleEntry";

export const useOrderFormScheduleEntryAccessor = (indexFunction: () => number) => {
    const { form } = storeToRefs(useOrderFormStore());

    const getScheduleEntry = () => {
        const entries = (form.value.order.scheduleEntries || []) as ScheduleEntry[];
        const index = indexFunction();
        return entries[index];
    };

    return {
        getScheduleEntry
    };
};
