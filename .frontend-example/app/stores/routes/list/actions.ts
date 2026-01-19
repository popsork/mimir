
import type { Unit } from "~/models/Unit";
import { JsonApiErrorCollection } from "~/models/JsonApiErrorCollection";

export const useRoutesListActionsStore = defineStore("routes-list-actions", () => {

    const getDefaultValues = () => {
        return {
            form: {
                status: null as TransportOrderStatusName | null, // routes use the same statuses as transport orders
                unit: null as Unit | null,
                timeoutInMinutes: 30 as number | null, // :TODO:TMS-2692: implement this
                immediateDispatch: true as boolean, // :TODO:TMS-2692: implement this
                errors: new JsonApiErrorCollection(),
            }
        };
    };

    const defaults = getDefaultValues();
    const form = ref(defaults.form);
    const shouldShowDialog = ref(false);

    const routeListStore = useRoutesListRoutesStore();

    const routeListDetailsStore = useRoutesListDetailsStore();
    const { routeRecord } = storeToRefs(routeListDetailsStore);

    const routeFormStore = useRouteFormStore();

    const waitStore = useWaitStore();

    const actionType = ref<RouteActionType>(RouteActionType.UpdateStatus);

    const settableStatuses = computed(() => {
        const definedStatuses = Object.values(TransportOrderStatusName);
        return definedStatuses.filter(status => {
            return ![TransportOrderStatusName.Planned, TransportOrderStatusName.Dispatched].includes(status);
        });
    });

    const updateRouteStatus = async () => {
        if (form.value.status === routeRecord.value?.status) {
            // do not actually save if route already has the selected status
            return true;
        }
        return performAction();
    };

    const planRoute = async () => {
        form.value.status = TransportOrderStatusName.Planned;
        return performAction();
    };

    const dispatchRoute = async () => {
        form.value.status = TransportOrderStatusName.Dispatched;
        return performAction();
    };

    const { routeRecord: routeFormRecord, form: routeForm } = storeToRefs(routeFormStore);

    const isCurrentActionAllowed = computed(() => {
        if (!routeRecord.value) {
            return false;
        }

        if (actionType.value === RouteActionType.UpdateStatus) {
            // for basic status updates, just check that a valid status is selected
            return form.value.status && settableStatuses.value.includes(form.value.status);
        }

        // currently, for planning and dispatching a unit must be selected.
        // this might need additional logic later to restrict which current route statuses can be planned / dispatched
        return !!form.value.unit;
    });

    const performAction = async () => {
        if (!isCurrentActionAllowed.value) {
            return;
        }

        waitStore.start(WaitingFor.RouteDialogAction);

        await routeFormStore.loadRoute(routeRecord.value!.id);

        routeFormStore.setRouteStatus(form.value.status!);

        const unit = form.value.unit as Unit | null;

        routeFormRecord.value.unitId = unit?.id || null;
        routeFormRecord.value.unit = unit;
        routeFormRecord.value.unitNumber = unit?.number || null;

        try {
            routeFormStore.clearErrors();

            await routeFormStore.saveRoute({ processStops: false, processStatus: true });

            if (routeForm.value.errors.length > 0) {
                // copy validation errors from the main form store back to the actions dialog form
                form.value.errors = routeForm.value.errors;
                return;
            }

            reset();
            routeListStore.loadRoutes();

            return true;
        } finally {
            waitStore.end(WaitingFor.RouteDialogAction);
        }
    };

    const clearForm = () => {
        form.value = getDefaultValues().form;
    };

    const reset = () => {
        clearForm();
        shouldShowDialog.value = false;
    };

    const initializeDialog = (selectedActionType: RouteActionType) => {
        const route = routeRecord.value;
        if (!route) {
            return;
        }

        clearForm();
        actionType.value = selectedActionType;

        form.value.status = route.status;
        form.value.unit = route.unit;

        shouldShowDialog.value = true;
    };

    return {
        form,
        routeRecord,
        routeFormRecord,
        settableStatuses,
        updateRouteStatus,
        planRoute,
        dispatchRoute,
        reset,
        shouldShowDialog,
        initializeDialog,
        actionType,
        isCurrentActionAllowed,
    };

});

