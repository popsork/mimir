import { Destination, type DestinationWithLocation } from "~/models/Destination";
import { Location } from "~/models/Location";
import { RouteStop } from "~/models/RouteStop";
import { useRouteFormRouteStopsStore } from "~/stores/route/form/routeStops";

export const useRouteAddStopStore = defineStore("route-add-stop", () => {
    const settingsStore = useRouteSettingsStore();
    const { defaultOrderHandlingTimeInMinutes } = storeToRefs(settingsStore);

    const formStore = useRouteFormStore();
    const { routeRecord } = storeToRefs(formStore);

    const routeStopsStore = useRouteFormRouteStopsStore();

    const getDefaultValues = () => {
        const destination = new Destination();
        destination.location = new Location();

        return {
            shouldShowDialog: false,
            form: {
                destination: destination as DestinationWithLocation,
            }
        };
    };
    const defaults = getDefaultValues();

    const shouldShowDialog = ref(defaults.shouldShowDialog);
    const form = ref(defaults.form);

    const addManualStop = () => {
        const route = routeRecord.value;

        const routeStop = RouteStop.buildBlank({
            routeId: route.id,
            routeStopType: RouteStopType.Manual
        });

        const destination = form.value.destination;

        routeStop.destinationId = destination.id;
        routeStop.name = destination.name;
        routeStop.city = destination.location.city;
        routeStop.latitude = destination.location.latitude;
        routeStop.longitude = destination.location.longitude;

        routeStop.isPlanned = true;
        routeStop.handlingTimeInMinutes = defaultOrderHandlingTimeInMinutes.value;

        routeStopsStore.addRouteStop({ routeStop, asFirst: true });
    };

    const reset = () => {
        const defaults = getDefaultValues();
        form.value = defaults.form;
        shouldShowDialog.value = defaults.shouldShowDialog;
    };

    return {
        form,
        shouldShowDialog,
        addManualStop,
        reset
    };
});
