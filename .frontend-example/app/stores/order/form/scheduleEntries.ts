import { ScheduleEntry } from "~/models/ScheduleEntry";

export const useOrderFormScheduleEntriesStore = defineStore("order-form-schedule-entries", () => {
    const formStore = useOrderFormStore();

    const { form } = storeToRefs(formStore);

    const addScheduleEntry = () => {
        const order = form.value.order;

        if (!order.scheduleEntries) {
            order.scheduleEntries = [];
        }

        const newScheduleEntry = ScheduleEntry.buildBlank();

        order.scheduleEntries.push(newScheduleEntry);

        formStore.registerRelationshipAddition("ScheduleEntry", newScheduleEntry.id);
    };

    const getScheduleEntryByIndex = (index: number) => {
        const order = form.value.order;
        if (!order.scheduleEntries || !order.scheduleEntries[index]) {
            return null;
        }
        return order.scheduleEntries[index] as ScheduleEntry;
    };

    const removeScheduleEntry = (index: number) => {

        const order = form.value.order;

        const removableScheduleEntry = getScheduleEntryByIndex(index);
        if (!removableScheduleEntry) {
            return;
        }

        order.scheduleEntries!.splice(index, 1);

        formStore.registerRelationshipRemoval("ScheduleEntry", removableScheduleEntry.id);
    };

    return {
        addScheduleEntry,
        removeScheduleEntry,
    };
});

