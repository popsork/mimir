import type { View, ViewConfig } from "~/models/View";

export const useSelectedView = <T extends View<ViewConfig>>() => {
    const viewsStore = useViewsStore();
    const selectedViewId = ref(null as string | null);
    const selectedView = ref(null as T | null);

    const { viewsLoaded } = storeToRefs(viewsStore);

    watch(selectedView, (newView, oldView) => {
        //
        // If we are switching view, do not set isDirty flag to true.
        if (oldView !== newView || newView === null) {
            return;
        }

        newView.isDirty = true;
    }, { deep: true });

    const updateSelectedViewFromId = (viewId: string) => {
        selectedView.value = viewsStore.views.find(v => v.id === viewId)?.clone() as T;
    };

    const refreshSelectedView = () => {
        if (!selectedView.value) {
            return false;
        }

        updateSelectedViewFromId(selectedView.value.id);
        return true;
    };

    watch([selectedViewId, viewsLoaded], ([id, loaded]) => {
        if (!loaded) {
            return;
        }

        if (selectedView.value) {
            viewsStore.updateLocal(selectedView.value);
        }

        if (!id) {
            selectedView.value = null;
            return;
        }

        updateSelectedViewFromId(id);
    }, { immediate: true });

    const selectedViewIsDirty = computed(() => {
        if (!selectedView.value) {
            return false;
        }

        return selectedView.value.isDirty;
    });

    return {
        selectedViewId,
        selectedView,
        selectedViewIsDirty,
        updateSelectedViewFromId,
        refreshSelectedView,
    };
};
