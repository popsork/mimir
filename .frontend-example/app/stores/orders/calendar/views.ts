import type { View } from "~/models/View";
import type { OrdersCalendarOrderAttribute } from "~/stores/orders/calendar/orderAttributes";
import type { CalendarStart } from "~/enums/CalendarStart";

export type CalendarViewConfig = {
    unitIds?: string[],
    numberOfDays?: number,
    firstHour?: number,
    lastHour?: number,
    attributes?: OrdersCalendarOrderAttribute[],
    start?: CalendarStart,
};

export type CalendarView = View<CalendarViewConfig>;

export const useOrdersCalendarViewsStore = defineStore("calendar-views", () => {
    const viewsStore = useViewsStore();

    const {
        selectedViewId,
        selectedView,
        selectedViewIsDirty,
        refreshSelectedView,
    } = useSelectedView<CalendarView>();

    const views = computed(() => {
        const views = viewsStore.getViewsByContext(ViewContext.OrderCalendar);

        return views.map(view => {
            if (view.id === selectedView.value?.id) {
                return selectedView.value!;
            }

            return view;
        }) as CalendarView[];
    });

    return {
        views,
        selectedViewId,
        selectedView,
        selectedViewIsDirty,
        refreshSelectedView,
    };
});
