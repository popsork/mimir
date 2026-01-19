import type { View, ViewConfig  } from "~/models/View";

/**
 * This composable/watcher ensures that if url (viewId) is invalid, if it is missing
 * or the selected view does not exist ("Temporary" Views will not exist on page refresh)
 *  user is redirected to the "default" view for that type.
 */

export const useViewRouteParamCorrection = (
    { routeName, viewIdParam, context, selectedView }:
    { routeName: string, viewIdParam: MaybeRefOrGetter<string | null>, context: ViewContext, selectedView: MaybeRefOrGetter<View<ViewConfig> | null> }
) => {
    const viewsStore = useViewsStore();
    const { viewsLoaded } = storeToRefs(viewsStore);

    watch([viewsLoaded, viewIdParam], ([loaded, viewId]) => {
        const viewByIdParamExists = !!viewsStore.views.find(v => v.id === viewId);

        if (loaded && (!viewId || !viewByIdParamExists)) {
            const initialView = toValue(selectedView) || viewsStore.getDefaultView(context);
            if (!initialView) {
                return;
            }

            goToRoute({
                name: routeName,
                query: {
                    view: initialView.id
                }
            }, { replace: true } );
        }
    }, { immediate: true });
};
