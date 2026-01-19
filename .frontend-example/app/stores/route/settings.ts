import { RouteSettings, type RouteSettingsApiResponseResource } from "~/models/RouteSettings";

export const useRouteSettingsStore = defineStore("route-settings", () => {

    const settings = ref(null as RouteSettings | null);
    const settingsLoaded = ref(false);

    const loadRouteSettingsIfNeeded = async () => {
        if (settingsLoaded.value) {
            return;
        }
        return await loadRouteSettings();
    };

    const loadRouteSettings = async () => {
        const routeSettings = await fetchRouteSettings();
        settings.value = routeSettings;
    };

    const fetchRouteSettings = wrapFunctionInApiErrorHandler(async () => {
        const apiResponse: { data: RouteSettingsApiResponseResource[] } = await useApi().getRouteSettings();

        const firstResource = apiResponse.data?.[0] || null;

        return firstResource ? RouteSettings.fromApiResponse(firstResource) : null;
    });


    const defaultOrderHandlingTimeInMinutes = computed(() => {
        return settings.value ? settings.value.defaultOrderHandlingTimeInMinutes : 10;
    });


    return {
        loadRouteSettingsIfNeeded,
        defaultOrderHandlingTimeInMinutes,
    };
});
