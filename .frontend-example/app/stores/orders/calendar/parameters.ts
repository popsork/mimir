import { add } from "date-fns";
import { CalendarStart } from "~/enums/CalendarStart";

type OrdersCalendarParameters = {
    firstDate: Date,
    numberOfDays: number,
    firstHour: number,
    lastHour: number,
};

export const useOrdersCalendarParametersStore = defineStore("orders-calendar-parameters", () => {
    const calendarViewsStore = useOrdersCalendarViewsStore();
    const { selectedView } = storeToRefs(calendarViewsStore);
    const dayOffsets = ref({} as Record<string, number>);

    const minMaxValues = {
        numberOfDays: {
            min: 1,
            max: 7
        },
        firstHour: {
            min: 0,
            max: 23
        },
        lastHour: {
            min: 0,
            max: 23
        }
    } as {
        [K in keyof OrdersCalendarParameters]: {
            min: number,
            max: number,
        };
    };

    const getToday = () => {
        return new Date();
    };

    const getYesterday = () => {
        return add(getToday(), { days: -1 });
    };

    const getLastMonday = () => {
        const today = getToday();

        const dayOfWeek = today.getDay(); // 0-6, 0 = Sunday
        const daysSinceLastMonday = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;

        return add(today, { days: -daysSinceLastMonday });
    };

    const getFirstDateByStart = (start?: CalendarStart) => {
        switch (start) {
            case CalendarStart.LastMonday: return getLastMonday();
            case CalendarStart.Yesterday: return getYesterday();
        }

        return getLastMonday();
    };

    const getDefaultValues = () => {
        return {
            parameters: {
                firstDate: getLastMonday(),
                numberOfDays: 5,
                firstHour: 6,
                lastHour: 16
            } as OrdersCalendarParameters
        };
    };

    const enforceMinMaxValue = (value: number, minMaxValue: { min: number, max: number }) => {
        if (value < minMaxValue.min) {
            return minMaxValue.min;
        }

        if (value > minMaxValue.max) {
            return minMaxValue.max;
        }

        return value;
    };

    const firstDate = computed(() => {
        if (!selectedView.value) {
            return getLastMonday();
        }

        const dayOffset = dayOffsets.value[selectedView.value.id] ?? 0;
        return add(getFirstDateByStart(selectedView.value?.config.start), { days: dayOffset });
    });

    const setFirstDate = (start: CalendarStart) => {
        if (!selectedView.value) {
            return;
        }

        dayOffsets.value[selectedView.value.id] = 0;
        updateSelectedViewConfig("start", start);
    };

    const adjustFirstDate = (daysOffset: number) => {
        if (!selectedView.value) {
            return;
        }

        dayOffsets.value[selectedView.value.id] = (dayOffsets.value[selectedView.value.id] ?? 0) + daysOffset;
    };

    const lastDate = computed(() => {
        return add(firstDate.value, { days: numberOfDays.value - 1 });
    });

    //
    // This here is needed because when just updating the property directly
    // (i.e selectedView.value.config.numberOfDays = 7) the watchers/refs
    // sometimes miss the update and nothing happens. So we need to update the
    // entire config object every time. That seem to work as expected.
    const updateSelectedViewConfig = (key: keyof CalendarView["config"], value: any) => {
        if (!selectedView.value) {
            return;
        }

        if (selectedView.value.config[key] === value) {
            return;
        }

        selectedView.value.config = {
            ...selectedView.value.config,
            [key]: value,
        };
    };

    const numberOfDays = computed({
        get() {
            if (!selectedView.value) {
                return getDefaultValues().parameters.numberOfDays;
            }

            if (!selectedView.value.config.numberOfDays) {
                selectedView.value.config.numberOfDays = getDefaultValues().parameters.numberOfDays;
            }

            return selectedView.value.config.numberOfDays;
        },

        set(numberOfDays) {
            if (!selectedView.value) {
                return;
            }

            updateSelectedViewConfig("numberOfDays", enforceMinMaxValue(numberOfDays, minMaxValues.numberOfDays));
        }
    });

    const firstHour = computed({
        get() {
            if (!selectedView.value) {
                return getDefaultValues().parameters.firstHour;
            }

            if (!selectedView.value.config.firstHour) {
                selectedView.value.config.firstHour = getDefaultValues().parameters.firstHour;
            }

            return selectedView.value.config.firstHour;
        },

        set(firstHour) {
            if (!selectedView.value) {
                return;
            }

            updateSelectedViewConfig("firstHour", enforceMinMaxValue(firstHour, minMaxValues.firstHour));
        }
    });

    const lastHour = computed({
        get() {
            if (!selectedView.value) {
                return getDefaultValues().parameters.lastHour;
            }

            if (!selectedView.value.config.lastHour) {
                selectedView.value.config.lastHour = getDefaultValues().parameters.lastHour;
            }

            return selectedView.value.config.lastHour;
        },

        set(lastHour) {
            if (!selectedView.value) {
                return;
            }

            updateSelectedViewConfig("lastHour", enforceMinMaxValue(lastHour, minMaxValues.lastHour));
        }
    });

    return {
        getYesterday,
        getLastMonday,

        firstDate,
        setFirstDate,
        adjustFirstDate,

        numberOfDays,

        lastDate,

        firstHour,
        lastHour,
    };
});

