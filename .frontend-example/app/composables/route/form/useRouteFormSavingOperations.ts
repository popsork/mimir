import { RouteStop } from "~/models/RouteStop";
import { JsonApiOperation } from "~/models/JsonApiOperation";

export const useRouteFormSavingOperations = (
    { processStops, processStatus }:
    {
        processStops: boolean,
        processStatus: boolean,
    }
) => {
    const { form, routeRecord, routeIsNew } = storeToRefs(useRouteFormStore());

    const relationshipChanges = computed(() => form.value.relationshipChanges);

    const buildOperations = () => {
        const operations = [] as JsonApiOperation[];

        // take note of the index of the route operation, so that outside code can detect which operation is the main one
        const routeOperationIndex = operations.length;
        operations.push(buildRouteSavingOperation());

        if (processStops) {
            operations.push(...buildRouteStopSavingOperations());
            operations.push(...buildRouteStopRemovalOperations());
        }
        if (processStatus) {
            operations.push(...buildRouteStatusSavingOperations());
        }

        return {
            operations,
            routeOperationIndex
        };
    };

    const buildRouteSavingOperation = () => {
        return new JsonApiOperation({
            type: routeIsNew.value ? JsonApiOperationType.Add : JsonApiOperationType.Update,
            resource: routeRecord.value.toApiRequestResource()
        });
    };

    const getRelationshipSavingOperationType = <K extends keyof (typeof relationshipChanges)["value"]>(className: K, id: string) => {
        return relationshipChanges.value[className].addedIds.includes(id) ? JsonApiOperationType.Add : JsonApiOperationType.Update;
    };

    const buildRouteStopSavingOperations = () => {
        return (routeRecord.value.routeStops || []).map((routeStop) => {
            return new JsonApiOperation({
                type: getRelationshipSavingOperationType("RouteStop", routeStop.id),
                resource: routeStop.toApiRequestResource()
            });
        });
    };

    const buildRouteStatusSavingOperations = () => {
        const routeStatus = routeRecord.value.routeStatus;
        if (!routeStatus) {
            return [];
        }
        const operationType = getRelationshipSavingOperationType("RouteStatus", routeStatus.id);
        if (operationType !== JsonApiOperationType.Add) {
            // route status records are never updated, only added when a new status has to be set
            return [];
        }
        return [
            new JsonApiOperation({
                type: operationType,
                resource: routeStatus.toApiRequestResource(),
            })
        ];
    };

    const buildRouteStopRemovalOperations = () => {
        return relationshipChanges.value.RouteStop.removedIds.map((routeStopId) => {
            return new JsonApiOperation({
                type: JsonApiOperationType.Remove,
                identifier: RouteStop.getApiResourceIdentifier(routeStopId)!
            });
        });
    };

    return buildOperations();
};
