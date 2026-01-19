import type { View } from "~/models/View";
import type { FilterExpression } from "~/types/filter/FilterExpression";

export type OrderMapViewConfig = {
    showLines?: boolean,
    operationIds?: string[],
    statuses?: Array<TransportOrderStatusName>,
    daysInPast?: number | undefined,
    daysInFuture?: number | undefined,
    zoom?: number,
    maxStopsInVisibleArea?: number,
    minStopsInCluster?: number,
    lat?: number,
    lng?: number,
    filters?: FilterExpression,
    sidebar?: ViewTool | null,
    stopTypes?: StopType[],
};

export type OrderMapView = View<OrderMapViewConfig>;

export const useOrdersMapViewsStore = defineStore("orders-map-views", () => {
    const viewsStore = useViewsStore();
    const { viewsLoaded } = storeToRefs(viewsStore);

    const {
        selectedViewId,
        selectedView,
        selectedViewIsDirty,
        refreshSelectedView,
    } = useSelectedView<OrderMapView>();

    const views = computed(() => {
        const views = viewsStore.getViewsByContext(ViewContext.OrderMap);

        return views.map((view) => {
            if (view.id === selectedView.value?.id) {
                return selectedView.value!;
            }

            return view;
        }) as OrderMapView[];
    });

    const getDefaultView = () => {
        if (!viewsLoaded.value) {
            return null;
        }

        return views.value.find(v => v.type === ViewType.Default);
    };

    return {
        views,
        selectedView,
        refreshSelectedView,
        getDefaultView,
        selectedViewIsDirty,
        selectedViewId,
    };
});
