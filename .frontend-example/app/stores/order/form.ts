import { CustomerOrder, type CustomerOrderApiResponseResource } from "~/models/CustomerOrder";
import { DangerousGoodsRow } from "~/models/DangerousGoodsRow";
import { DebitRow } from "~/models/DebitRow";
import { DeviationRow } from "~/models/DeviationRow";
import { DocumentModel } from "~/models/DocumentModel";
import { GoodsRow } from "~/models/GoodsRow";
import { JsonApiErrorCollection } from "~/models/JsonApiErrorCollection";
import { Package } from "~/models/Package";
import { ScheduleEntry } from "~/models/ScheduleEntry";
import { SpecificationRow } from "~/models/SpecificationRow";
import { Stop } from "~/models/Stop";
import { TransportOrder } from "~/models/TransportOrder";

export type OrderRelationshipChangesByClass = {
    Stop: RelationshipChanges,
    TransportOrder: RelationshipChanges,
    SpecificationRow: RelationshipChanges,
    DebitRow: RelationshipChanges,
    GoodsRow: RelationshipChanges,
    Package: RelationshipChanges,
    DangerousGoodsRow: RelationshipChanges,
    DocumentModel: RelationshipChanges,
    DeviationRow: RelationshipChanges,
    OrderNote: RelationshipChanges,
    ScheduleEntry: RelationshipChanges,
    GoodsTotalOverride: RelationshipChanges,
};

export const useOrderFormStore = defineStore("order-form", () => {

    const getDefaultValues = () => {
        const order = CustomerOrder.buildBlank();
        const relationshipChanges = getDefaultRelationshipChanges(order);
        return {
            form: {
                orderId: order.id as string | null,
                order,

                // this tracks added and removed ids for various relationships,
                // so that a list of create / delete operations can be generated for the API
                // when submitting the whole form
                relationshipChanges,

                // multiple collections for holding errors:
                // "errors" contains form validation errors to display to the user after saving
                errors: new JsonApiErrorCollection(),

                // "specialErrors" is for errors not associated with form fields
                // that shouod be handled and displayed differently
                specialErrors: new JsonApiErrorCollection(),

                // "internalErrors" is for accessing all errors received, even during dry runs
                internalErrors: new JsonApiErrorCollection(),

            },
            orderIsNew: true,
            orderIsLoading: false,
            orderIsLoaded: false,
            orderIsMissing: false,
        };
    };

    const getDefaultRelationshipChanges = (defaultOrder: CustomerOrder) => {
        const changes = getBlankRelationshipChanges() as OrderRelationshipChangesByClass;
        type RelationshipsByClass = Record<keyof OrderRelationshipChangesByClass, keyof CustomerOrder>;

        const relationships: Omit<RelationshipsByClass, "Package" | "GoodsTotalOverride"> = {
            Stop: "stops",
            TransportOrder: "transportOrders",
            SpecificationRow: "specificationRows",
            DebitRow: "debitRows",
            GoodsRow: "goodsRows",
            DangerousGoodsRow: "dangerousGoodsRows",
            DocumentModel: "documents",
            DeviationRow: "deviationRows",
            OrderNote: "notes",
            ScheduleEntry: "scheduleEntries",
        };

        Object.entries(relationships).forEach(([className, relationshipKey]) => {
            const relationshipArray = defaultOrder[relationshipKey]! as unknown as { id: string }[];
            changes[className as keyof OrderRelationshipChangesByClass].addedIds = relationshipArray.map(
                (record: { id: string }) => {
                    return record.id;
                });
        });

        return changes;
    };

    const getBlankRelationshipChanges = (): OrderRelationshipChangesByClass => {
        return {
            Stop: { addedIds: [], removedIds: [] },
            TransportOrder: { addedIds: [], removedIds: [] },
            SpecificationRow: { addedIds: [], removedIds: [] },
            DebitRow: { addedIds: [], removedIds: [] },
            GoodsRow: { addedIds: [], removedIds: [] },
            Package: { addedIds: [], removedIds: [] },
            DangerousGoodsRow: { addedIds: [], removedIds: [] },
            DocumentModel: { addedIds: [], removedIds: [] },
            DeviationRow: { addedIds: [], removedIds: [] },
            OrderNote: { addedIds: [], removedIds: [] },
            ScheduleEntry: { addedIds: [], removedIds: [] },
            GoodsTotalOverride: { addedIds: [], removedIds: [] },
        };
    };


    const defaults = getDefaultValues();
    const form = ref(defaults.form);
    const orderIsNew = ref(defaults.orderIsNew);
    const orderIsLoading = ref(defaults.orderIsLoading);
    const orderIsLoaded = ref(defaults.orderIsLoaded);
    const orderIsMissing = ref(defaults.orderIsMissing);
    const orderIsTemplate = computed(() => order.value.isTemplate);

    const orderId = computed(() => form.value.orderId);

    const loadOrderIfNeeded = async (neededOrderId: string | null) => {
        // this gets called also when switching between tabs in the same order,
        // so we need to check whether we actually need to load something new
        const needingSameExistingOrder = neededOrderId && neededOrderId === orderId.value;
        const needingSameNewOrder = !neededOrderId && orderIsNew.value;
        const orderIsLoadedOrLoading = orderIsLoaded.value || orderIsLoading.value;

        if ((needingSameExistingOrder || needingSameNewOrder) && orderIsLoadedOrLoading) {
            // correct order already loaded or being loaded, do nothing
            return;
        }

        setOrderId(neededOrderId);
        loadOrder();
    };

    const setOrderId = (newValue: string | null) => {
        if (newValue === null) {
            reset();
            return;
        }

        form.value.orderId = newValue;
        orderIsNew.value = false;
    };

    const loadOrder = async () => {
        waitStore.start(WaitingFor.OrderFormOrderLoading);
        orderIsLoading.value = true;

        try {
            if (orderIsNew.value) {
                // initiate a dry run to ensure any default values for the blank order are pre-filled
                await immediatelyRecalculateOrder();
                return;
            }

            const orderResource = await fetchOrder();

            if (!orderResource) {
                orderIsMissing.value = true;
                return;
            }

            const order = CustomerOrder.fromApiResponse(orderResource);
            setOrder(order);
            clearRelationshipChanges();
        } finally {
            orderIsLoading.value = false;
            waitStore.end(WaitingFor.OrderFormOrderLoading);
        }
    };

    const setOrder = (order: CustomerOrder) => {
        form.value.order = order;
        orderIsLoaded.value = true;
    };


    const registerRelationshipAddition = (className: keyof OrderRelationshipChangesByClass, id: string) => {
        form.value.relationshipChanges[className].addedIds.push(id);
    };

    const registerRelationshipRemoval = (className: keyof OrderRelationshipChangesByClass, id: string) => {
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

    const fetchOrder = wrapFunctionInApiErrorHandler(async () => {
        if (!orderId.value) {
            return null;
        }

        let apiResponse: any;
        try {
            apiResponse = await useApi().getOrder({ orderId: orderId.value });
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

        return apiResponse.data as CustomerOrderApiResponseResource;
    });

    const order = computed(() => form.value.order as CustomerOrder);


    // when the customerId gets changed/cleared,
    // the contactId, agreementId and projectId relationships should also get cleared,
    // because these depend on the customer.
    // but this should only happen if the customerId changes while the order remains the same,
    // otherwise this would also reset the values when an order gets freshly loaded for the first time.
    // since deep watchers do not return the old value unless the whole object gets replaced,
    // we need a custom getter that always creates a new object instance with both values.
    const orderIdAndCustomerId = computed(() => {
        return {
            orderId: order.value.id,
            customerId: order.value.customerId
        };
    });
    watch(orderIdAndCustomerId, (newValue, oldValue) => {
        if (newValue.orderId !== oldValue.orderId) {
            // whole order has changed, do not clear anything
            return;
        }

        if (newValue.customerId === oldValue.customerId) {
            // customer has not changed, do not clear anything
            return;
        }

        form.value.order.contactId = null;
        form.value.order.contact = null;
        form.value.order.agreementId = null;
        form.value.order.agreement = null;
        form.value.order.projectId = null;
        form.value.order.project = null;
    }, { deep: true });


    const RECALCULATION_THROTTLING_TIME_IN_MS = 2000;

    const recalculateOrder = useThrottleFn(
        async (action?: OrderAction) => {
            return immediatelyRecalculateOrder(action);
        },
        RECALCULATION_THROTTLING_TIME_IN_MS,
        true, // trailing. always ensure that the latest call gets executed

        // leading. execute the first call immediately. this ensures that the user does not experience lag on the first change
        true,

        false  // rejectOnCancel. do not reject the promise if a call gets cancelled due to throttling
    );

    const immediatelyRecalculateOrder = async (action?: OrderAction) => {
        if (waitStore.is(WaitingFor.OrderFormOrderSaving)) {
            // do not initiate dry runs while a full save is in progress.
            // initiating a dry run while a full save is in progress would discard the received full save response,
            // which should not be allowed to happen, because the full save may significantly change the form.

            // skipping a dry run might cause some missed calculations if the user very quickly changes some fields
            // after pressing Save, but that is an edge case we can live with, because the user will probably not do that.
            // and any skipped calculations will get processed on the next field change anyway
            return;
        }

        const requestTimestamp = registerSavingRequest();

        const waiterName = (action === OrderAction.AutoPlan) ? WaitingFor.OrderFormOrderAutoPlanning : WaitingFor.OrderFormOrderRecalculation;
        const savingAction = action || OrderAction.Calculate;

        try {
            waitStore.start(waiterName, requestTimestamp);
            return await performSaving({ requestTimestamp, action: savingAction });
        } finally {
            waitStore.end(waiterName, requestTimestamp);
        }
    };


    const autoPlanOrder = async () => {
        return immediatelyRecalculateOrder(OrderAction.AutoPlan);
    };

    const saveOrder = async () => {
        const requestTimestamp = registerSavingRequest();

        try {
            waitStore.start(WaitingFor.OrderFormOrderSaving, requestTimestamp);
            return await performSaving({ requestTimestamp, action: OrderAction.Save });
        } finally {
            waitStore.end(WaitingFor.OrderFormOrderSaving, requestTimestamp);
        }
    };

    const performSaving = wrapFunctionInApiErrorHandler(async (
        { requestTimestamp, action }:
        { requestTimestamp: number, action: OrderAction }
    ) => {
        const fullSave = action === OrderAction.Save;
        const dryRun = !fullSave;

        // deviation rows have non-nullable type and cause relationships
        // which halt dry runs if the user has a deviation row in the form with either of these two fields blank,
        // meaning, if the user adds a blank deviation row and does not immediately fill it in,
        // all other calculations in the form stop working because the row is not valid.
        // a workaround is to ignore deviation rows during dry runs completely,
        // so that they do not cause any issues in the background.
        // currently, no automation depends on deviation rows, so this is safe to do for now.
        const processDeviationRows = fullSave;

        const { operations, orderOperationIndex } = useOrderFormSavingOperations({ processDeviationRows });

        // before sending the request, preserve the original state of the complete form in a cloned copy
        const originalState = order.value.clone();
        const originalRelationshipChanges = clone(form.value.relationshipChanges);

        try {
            const results = await useApi().saveOrder({ operations, action });
            if (!isRelevantSavingRequest(requestTimestamp)) {
                return;
            }
            clearErrors();

            // the order operation response contains the fully updated order resource, including all relationships.
            // it should be replaced in the form
            const orderResource = results[orderOperationIndex].data as CustomerOrderApiResponseResource;

            const { replacementOrder, replacementRelationshipChanges } = useOrderFormOrderReplacement({
                originalState,
                currentState: order.value.clone(),
                receivedResource: orderResource,
                originalRelationshipChanges,
                processDeviationRows
            });

            setOrder(replacementOrder);
            if (dryRun) {
                // for dry runs, update relationship changes, as they may have been altered when building replacementOrder
                form.value.relationshipChanges = replacementRelationshipChanges;
            } else {
                // for full saves, clear the relationship changes, since any changes that were present have now been saved
                clearRelationshipChanges();
                orderIsNew.value = false;
            }
            return true;
        } catch (error) {
            if (!isRelevantSavingRequest(requestTimestamp)) {
                return;
            }

            const validationErrors = extractDisplayableJsonApiErrors({ error, atomicOperations: operations });
            if (validationErrors) {
                const processedErrors = new OrderFormErrorCollection(validationErrors);

                form.value.internalErrors = processedErrors.getAllErrors();
                form.value.specialErrors = processedErrors.getSpecialErrors();

                if (fullSave) {
                    // only display/update validation errors in form if this is not a dry run.
                    // this prevents error messages from appearing in the form while user is editing some fields
                    // and has not actually tried to save the form
                    form.value.errors = processedErrors.getResourceErrors();
                }
            } else {
                clearErrors();
                throw error;
            }
        }
    });


    const resourceTypesByTabName = {
        [OrderFormTabName.Transport]: [Stop.apiResourceType, TransportOrder.apiResourceType],
        [OrderFormTabName.Specification]: [SpecificationRow.apiResourceType],
        [OrderFormTabName.DebitRows]: [DebitRow.apiResourceType],
        [OrderFormTabName.Goods]: [GoodsRow.apiResourceType, Package.apiResourceType, DangerousGoodsRow.apiResourceType],
        [OrderFormTabName.Documents]: [DocumentModel.apiResourceType],
        [OrderFormTabName.Deviations]: [DeviationRow.apiResourceType],
        [OrderFormTabName.History]: [],
        [OrderFormTabName.Schedule]: [ScheduleEntry.apiResourceType],
    };

    const tabHasInternalErrors = (tabName: OrderFormTabName) => {
        return form.value.internalErrors.forResourceTypes(resourceTypesByTabName[tabName]).length > 0;
    };

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
        form.value.internalErrors = new JsonApiErrorCollection();
        form.value.errors = new JsonApiErrorCollection();
        clearSpecialErrors();
    };

    const clearSpecialErrors = () => {
        form.value.specialErrors = new JsonApiErrorCollection();
    };

    const reset = () => {
        const defaults = getDefaultValues();
        form.value = defaults.form;
        orderIsNew.value = defaults.orderIsNew;
        orderIsLoading.value = defaults.orderIsLoading;
        orderIsLoaded.value = defaults.orderIsLoaded;
        orderIsMissing.value = defaults.orderIsMissing;
    };

    return {
        loadOrderIfNeeded,
        orderIsNew,
        orderIsMissing,
        orderIsTemplate,
        orderIsLoaded,
        form,
        order,
        tabHasInternalErrors,
        registerRelationshipAddition,
        registerRelationshipRemoval,
        recalculateOrder,
        autoPlanOrder,
        saveOrder,
        clearSpecialErrors,
        reset
    };
});

