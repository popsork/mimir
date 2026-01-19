const elementNames = [
    "pageHeader",
    "secondaryPageHeader",
    "viewsHeader",

    "ordersCalendarControlsHeader",

    "ordersMapControlsHeader",

    "orderFormHeader",
    "orderFormTabSelector",
    "orderFormFooter",

    "invoicingProcessHeader",
    "invoicingProcessTabSelector",
] as const;

export type DimensionTrackingElementName = typeof elementNames[number];

export const useDimensionsStore = defineStore("dimensions", () => {
    const defaultValues = elementNames.reduce((values, name) => {
        values[name] = 0 as number;
        return values;
    }, {} as { [key in DimensionTrackingElementName]: number });

    const heights = ref(defaultValues);

    const setHeight = (name: DimensionTrackingElementName, height: number) => {
        heights.value[name] = height;
    };

    return {
        heights,
        setHeight,
    };
});
