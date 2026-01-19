export const useRoutesListDetailsStore = defineStore("routes-list-details", () => {

    const routeListStore = useRoutesListRoutesStore();

    const { selectedRowIds, routes } = storeToRefs(routeListStore);

    const routeId = computed(() => selectedRowIds.value[0] || null);

    const routeRecord = computed(() => {
        return routes.value.find((value) => value.id === routeId.value) ?? null;
    });

    return {
        routeRecord,
    };
});
