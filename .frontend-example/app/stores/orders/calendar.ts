export type CalendarInteractionItem = {
    unitId: string,
    itemId: string | null, // null is used for newly drawn items
    itemType: CalendarItemType,
    resourceId: string | null, // null is used for newly drawn items
    segmentIndex: number | null,
    start?: Date,
    end?: Date,
};

type Nullable<T> = { [P in keyof T]: T[P] | null };

export type NullableCalendarInteractionItem = Nullable<CalendarInteractionItem>;

export const useOrdersCalendarStore = defineStore("orders-calendar", () => {
    const numberOfDays = ref(3);

    const firstHour = ref(8);
    const lastHour = ref(17);

    const blankInteractionItem: NullableCalendarInteractionItem = {
        unitId: null,
        itemId: null,
        itemType: null,
        resourceId: null,
        segmentIndex: null
    };

    const hint = ref(blankInteractionItem as NullableCalendarInteractionItem);

    const activateHint = (item: CalendarInteractionItem) => {
        hint.value = item;
    };

    const deactivateHint = (item?: CalendarInteractionItem) => {
        if (!item || (hint.value.unitId === item.unitId && hint.value.itemId === item.itemId)) {
            hint.value = blankInteractionItem;
        }
    };

    const menu = ref(blankInteractionItem as NullableCalendarInteractionItem);

    const activateMenu = (item: CalendarInteractionItem) => {
        menu.value = item;
        deactivateHint();
    };

    const deactivateMenu = (item?: CalendarInteractionItem) => {
        if (!item || menu.value.unitId === item.unitId) {
            menu.value = blankInteractionItem;
        }
    };

    const toggleMenu = (item: CalendarInteractionItem) => {
        if (menu.value.unitId === item.unitId && menu.value.itemId === item.itemId) {
            deactivateMenu();
        } else {
            activateMenu(item);
        }
    };

    return {
        numberOfDays,
        firstHour,
        lastHour,

        hint,
        activateHint,
        deactivateHint,

        menu,
        activateMenu,
        deactivateMenu,
        toggleMenu
    };
});
