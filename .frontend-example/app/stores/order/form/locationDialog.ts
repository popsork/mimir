import { Destination, type DestinationApiResponseResource, type DestinationWithLocation } from "~/models/Destination";
import { Location } from "~/models/Location";
import { JsonApiErrorCollection } from "~/models/JsonApiErrorCollection";
import { JsonApiOperation } from "~/models/JsonApiOperation";

export const useOrderFormLocationDialogStore = defineStore("order-form-location-dialog", () => {
    const waiterName = WaitingFor.OrderFormDestinationSaving;

    const waitStore = useWaitStore();

    const getDefaultValues = () => {
        const blankDestination = new Destination();
        blankDestination.location = new Location();
        return {
            form: {
                destination: blankDestination as DestinationWithLocation,

                locationHasAddressParts: false,

                // these come from the order form validation, based on the owner record (stop, etc.)
                ownerErrors: new JsonApiErrorCollection(),

                // these come from the dialog validation when saving a new destination for reuse
                internalErrors: new JsonApiErrorCollection(),
            },
        };
    };

    const defaults = getDefaultValues();
    const form = ref(defaults.form);

    const loadForm = (destination: DestinationWithLocation) => {
        clearForm();

        form.value.destination = destination.clone();

        // store whether the location initially already has something filled out in the address fields
        // this is used to determine whether we should update the address parts when clicking on the map,
        // or whether to only update the coordinates
        form.value.locationHasAddressParts = form.value.destination.location.hasAnyAddressParts();
    };

    const saveDestination = wrapFunctionInApiErrorHandler(async (
        {
            destinationId,
            locationId
        }: {
            destinationId: string | null,
            locationId: string | null,
        }
    ) => {
        const { operations, destinationOperationIndex } = buildSavingOperations({ destinationId, locationId });
        waitStore.start(waiterName);

        try {
            const results = await useApi().saveDestination({ operations });
            clearFormErrors();

            const destinationResource = results[destinationOperationIndex].data as DestinationApiResponseResource;
            form.value.destination = Destination.fromApiResponse(destinationResource) as DestinationWithLocation;

            return true;
        } catch (error) {
            const validationErrors = extractDisplayableJsonApiErrors({ error, atomicOperations: operations });
            if (validationErrors) {
                form.value.internalErrors = validationErrors;
            } else {
                clearFormErrors();
                throw error;
            }
        } finally {
            waitStore.end(waiterName);
        }
    });

    const buildSavingOperations = (
        {
            destinationId,
            locationId
        }: {
            destinationId: string | null,
            locationId: string | null,
        }
    ) => {
        const operations = [] as JsonApiOperation[];

        const saveableDestination = form.value.destination.clone();
        saveableDestination.id = destinationId || generateNewUuid();
        saveableDestination.location.id = locationId || generateNewUuid();
        saveableDestination.locationId = saveableDestination.location.id;


        operations.push(new JsonApiOperation({
            type: (locationId) ? JsonApiOperationType.Update : JsonApiOperationType.Add,
            resource: saveableDestination.location.toApiRequestResource()
        }));

        operations.push(new JsonApiOperation({
            type: (destinationId) ? JsonApiOperationType.Update : JsonApiOperationType.Add,
            resource: saveableDestination.toApiRequestResource()
        }));

        return {
            operations,
            destinationOperationIndex: operations.length - 1
        };
    };



    const setOwnerErrors = (errors: JsonApiErrorCollection | null) => {
        form.value.ownerErrors = errors ?? getDefaultValues().form.ownerErrors;
    };

    const getInternalErrorsForField = (fieldName: string) => {
        return form.value.internalErrors.forField(fieldName);
    };

    const getOwnerErrorsForField = (fieldName: string) => {
        return form.value.ownerErrors.forField(fieldName);
    };

    const getErrorsForField = (fieldName: string) => {
        // this dialog has two separate error collections - one is from the owner record in the main order form,
        // and another is from the dialog itself when saving a destination for reuse (not yet implemented; TMS-1083).

        // merge the two error collections to display errors in both scenarios
        return getInternalErrorsForField(fieldName).append(getOwnerErrorsForField(fieldName));
    };

    const clearFormErrors = () => {
        form.value.internalErrors = getDefaultValues().form.internalErrors;
        form.value.ownerErrors = getDefaultValues().form.ownerErrors;
    };

    const clearForm = () => {
        form.value = getDefaultValues().form;
    };

    const reset = () => {
        clearForm();
    };


    return {
        form,
        loadForm,
        saveDestination,
        setOwnerErrors,
        getErrorsForField,
        clearForm,
        reset
    };
});
