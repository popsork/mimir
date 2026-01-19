import { Route, type RouteApiResponseResource } from "~/models/Route";
import { JsonApiErrorCollection } from "~/models/JsonApiErrorCollection";
import { RouteStatus } from "~/models/RouteStatus";

export type RouteRelationshipChangesByClass = {
    RouteStop: RelationshipChanges,
    RouteStatus: RelationshipChanges,
};

export const useRouteFormStore = defineStore("route-form", () => {

    const getDefaultValues = () => {
        const route = Route.buildBlank();
        const relationshipChanges = getDefaultRelationshipChanges(route);
        return {
            form: {
                routeId: route.id as string | null,
                route,

                // this tracks added and removed ids for various relationships,
                // so that a list of create / delete operations can be generated for the API
                // when submitting the whole form
                relationshipChanges,

                errors: new JsonApiErrorCollection(),
            },
            routeIsNew: true,
            routeIsLoading: false,
            routeIsLoaded: false,
            routeIsMissing: false,
        };
    };

    const getDefaultRelationshipChanges = (defaultRoute: Route) => {
        const changes = getBlankRelationshipChanges() as RouteRelationshipChangesByClass;
        type RelationshipsByClass = Record<keyof RouteRelationshipChangesByClass, keyof Route>;

        const relationships: Omit<RelationshipsByClass, "RouteStatus"> = {
            RouteStop: "routeStops",
        };

        Object.entries(relationships).forEach(([className, relationshipKey]) => {
            const relationshipArray = defaultRoute[relationshipKey]! as unknown as { id: string }[];
            changes[className as keyof RouteRelationshipChangesByClass].addedIds = relationshipArray.map(
                (record: { id: string }) => {
                    return record.id;
                });
        });

        return changes;
    };

    const getBlankRelationshipChanges = (): RouteRelationshipChangesByClass => {
        return {
            RouteStop: { addedIds: [], removedIds: [] },
            RouteStatus: { addedIds: [], removedIds: [] }
        };
    };

    const defaults = getDefaultValues();
    const form = ref(defaults.form);
    const routeIsNew = ref(defaults.routeIsNew);
    const routeIsLoading = ref(defaults.routeIsLoading);
    const routeIsLoaded = ref(defaults.routeIsLoaded);
    const routeIsMissing = ref(defaults.routeIsMissing);

    const routeId = computed(() => form.value.routeId);

    const loadRouteIfNeeded = async (neededRouteId: string) => {
        const needingSameExistingRoute = neededRouteId && neededRouteId === routeId.value;
        const routeIsLoadedOrLoading = routeIsLoaded.value || routeIsLoading.value;

        if (needingSameExistingRoute && routeIsLoadedOrLoading) {
            // correct record already loaded or being loaded, do nothing
            return;
        }

        return loadRoute(neededRouteId);
    };

    const setRouteId = (newValue: string | null) => {
        if (newValue === null) {
            reset();
            return;
        }

        form.value.routeId = newValue;
        routeIsNew.value = false;
    };

    const loadRoute = async (routeId: string) => {
        setRouteId(routeId);
        waitStore.start(WaitingFor.RouteFormRouteLoading);
        routeIsLoading.value = true;

        try {
            const routeResource = await fetchRoute();

            if (!routeResource) {
                routeIsMissing.value = true;
                return;
            }

            loadRouteFromResource(routeResource);
        } finally {
            routeIsLoading.value = false;
            waitStore.end(WaitingFor.RouteFormRouteLoading);
        }
    };

    const setRoute = (route: Route) => {
        form.value.route = route;
        routeIsLoaded.value = true;
    };

    const loadRouteFromResource = (routeResource: RouteApiResponseResource) => {
        const route = Route.fromApiResponse(routeResource);
        setRoute(route);
        clearRelationshipChanges();
    };

    const setRouteStatus = (name: TransportOrderStatusName) => {
        if (!route.value) {
            return;
        }
        const status = RouteStatus.buildBlank({ routeId: route.value.id, name });
        route.value.routeStatus = status;
        route.value.status = status.name;
        registerRelationshipAddition("RouteStatus", status.id);
    };

    const registerRelationshipAddition = (className: keyof RouteRelationshipChangesByClass, id: string) => {
        form.value.relationshipChanges[className].addedIds.push(id);
    };

    const registerRelationshipRemoval = (className: keyof RouteRelationshipChangesByClass, id: string) => {
        // removing a record that has just been added should simply remove it from the added list
        // without adding it to the removed list

        const changes = form.value.relationshipChanges[className];

        const addedIndex = changes.addedIds.indexOf(id);
        if (addedIndex === -1) {
            changes.removedIds.push(id);
        } else {
            changes.addedIds.splice(addedIndex, 1);
        }
    };

    const clearRelationshipChanges = () => {
        form.value.relationshipChanges = getBlankRelationshipChanges();
    };


    const waitStore = useWaitStore();

    const fetchRoute = wrapFunctionInApiErrorHandler(async () => {
        if (!routeId.value) {
            return null;
        }

        let apiResponse: any;
        try {
            apiResponse = await useApi().getRoute({ routeId: routeId.value });
        } catch (error) {
            if (error && error.isAxiosError && error.response && error.response.status === HttpStatus.NotFound) {
                return null;
            } else {
                throw error;
            }
        }

        if (!apiResponse || !apiResponse.data) {
            return null;
        }

        return apiResponse.data as RouteApiResponseResource;
    });

    const route = computed(() => form.value.route as Route);

    const savingIsEnabled = computed(() => {
        if (waitStore.is(WaitingFor.RouteFormRouteSaving)) {
            return false;
        }

        if (!route.value.name || route.value.name.length === 0) {
            return false;
        }
        if (!route.value.startAt) {
            return false;
        }
        return true;
    });

    const saveRoute = async (
        { processStops, processStatus }:
        {
            processStops: boolean,
            processStatus: boolean,
        }
    ) => {
        const requestTimestamp = registerSavingRequest();

        try {
            waitStore.start(WaitingFor.RouteFormRouteSaving, requestTimestamp);
            return await performSaving({ requestTimestamp, processStops, processStatus });
        } finally {
            waitStore.end(WaitingFor.RouteFormRouteSaving, requestTimestamp);
        }
    };

    const performSaving = wrapFunctionInApiErrorHandler(async (
        { requestTimestamp, processStops, processStatus }:
        {
            requestTimestamp: number,
            processStops: boolean,
            processStatus: boolean,
        }
    ) => {
        const { operations, routeOperationIndex } = useRouteFormSavingOperations({ processStops, processStatus });

        try {
            const results = await useApi().saveRoute({ operations });
            if (!isRelevantSavingRequest(requestTimestamp)) {
                return;
            }
            clearErrors();

            // the route operation response contains the fully updated route resource, including all relationships.
            // it should be replaced in the form
            const routeResource = results[routeOperationIndex].data as RouteApiResponseResource;

            loadRouteFromResource(routeResource);
            routeIsNew.value = false;
            return route.value;
        } catch (error) {
            if (!isRelevantSavingRequest(requestTimestamp)) {
                return;
            }

            const validationErrors = extractDisplayableJsonApiErrors({ error, atomicOperations: operations });
            if (validationErrors) {
                form.value.errors = validationErrors;
            } else {
                clearErrors();
                throw error;
            }
        }
    });

    const latestSavingRequestTimestamp = ref(null as number | null);

    const registerSavingRequest = () => {
        const timestamp = Date.now();

        latestSavingRequestTimestamp.value = timestamp;
        return timestamp;
    };

    const isRelevantSavingRequest = (requestTimestamp: number) => {
        // a response to a saving request may arrive after a newer request has already been initiated,
        // in which case the previous response becomes irrelevant
        if (latestSavingRequestTimestamp.value && latestSavingRequestTimestamp.value > requestTimestamp) {
            return false;
        }
        return true;
    };


    const clearErrors = () => {
        form.value.errors = new JsonApiErrorCollection();
    };

    const reset = () => {
        const defaults = getDefaultValues();
        form.value = defaults.form;
        routeIsNew.value = defaults.routeIsNew;
        routeIsLoading.value = defaults.routeIsLoading;
        routeIsLoaded.value = defaults.routeIsLoaded;
        routeIsMissing.value = defaults.routeIsMissing;
    };

    return {
        loadRouteIfNeeded,
        loadRoute,
        routeIsNew,
        routeIsMissing,
        form,

        // rename when exporting, so that outside code can use "routeRecord" without mixing it up with "route" from navigation
        routeRecord: route,
        routeId,

        setRouteStatus,
        registerRelationshipAddition,
        registerRelationshipRemoval,

        savingIsEnabled,
        saveRoute,
        clearErrors,
        reset
    };
});

