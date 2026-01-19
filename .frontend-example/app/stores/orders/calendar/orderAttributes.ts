const definedAttributes = [
    "customerShortName",
    "number",
    "lastStopCity",
    "lastStopPostalCode",
] as const;

export type OrdersCalendarOrderAttribute = typeof definedAttributes[number];

export const useOrdersCalendarOrderAttributesStore = defineStore("orders-calendar-order-attributes", () => {
    const calendarViewsStore = useOrdersCalendarViewsStore();
    const { selectedView } = storeToRefs(calendarViewsStore);

    const availableAttributes = ref(definedAttributes);

    const defaultAttributes: OrdersCalendarOrderAttribute[] = [
        "customerShortName",
        "lastStopCity"
    ];

    const selectedAttributes = computed({
        get() {
            if (!selectedView.value) {
                return [];
            }

            if (!selectedView.value.config.attributes) {
                selectedView.value.config.attributes = clone(defaultAttributes);
            }

            return selectedView.value.config.attributes;
        },

        set(value) {
            if (!selectedView.value) {
                return;
            }

            selectedView.value.config = {
                ...selectedView.value.config,
                attributes: value
            };
        }
    });

    const setSelectdAttributes = (attributes: OrdersCalendarOrderAttribute[]) => {
        // do not assign the value directly, but filter the available attributes to preserve their defined order
        selectedAttributes.value = availableAttributes.value.filter(attribute => attributes.includes(attribute));
    };

    return {
        availableAttributes,
        selectedAttributes,
        setSelectdAttributes
    };
});
