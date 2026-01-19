import type { ShallowRef } from "vue";

export const useElementHeightTracking = (name: DimensionTrackingElementName, element: ShallowRef<HTMLElement | null>) => {
    const dimensionsStore = useDimensionsStore();

    const { height } = useElementBounding(element);

    watch(height, (value) => {
        dimensionsStore.setHeight(name, value);
    }, { immediate: true });
};


