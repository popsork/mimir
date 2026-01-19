import { DangerousGoodsRow } from "~/models/DangerousGoodsRow";
import { DebitRow } from "~/models/DebitRow";
import { DeviationRow } from "~/models/DeviationRow";
import { DocumentModel } from "~/models/DocumentModel";
import { GoodsRow } from "~/models/GoodsRow";
import { JsonApiOperation } from "~/models/JsonApiOperation";
import { OrderNote } from "~/models/OrderNote";
import { Package } from "~/models/Package";
import { SpecificationRow } from "~/models/SpecificationRow";
import { Stop } from "~/models/Stop";
import { TransportOrder } from "~/models/TransportOrder";

export const useOrderFormSavingOperations = ({ processDeviationRows } : { processDeviationRows: boolean }) => {
    const { form, order, orderIsNew, orderIsTemplate } = storeToRefs(useOrderFormStore());

    const relationshipChanges = computed(() => form.value.relationshipChanges);

    const buildOperations = () => {
        const operations = [] as JsonApiOperation[];

        const shouldSaveScheduleEntries = orderIsTemplate.value;

        // take note of the index of the order operation, so that outside code can detect which operation is the main one
        const orderOperationIndex = operations.length;

        // never include newly added schedule entries in the first order saving operation,
        // because they will only be created in subseqeuent operations.
        // when saving a template with schedule entries, a second order saving operation will be put at the end,
        // after the schedule entries have been created/updated
        operations.push(buildOrderSavingOperation({ includeNewlyAddedScheduleEntries: false }));

        operations.push(...buildStopSavingOperations());
        operations.push(...buildTransportOrderSavingOperations());
        operations.push(...buildSpecificationRowSavingOperations());
        operations.push(...buildDebitRowSavingOperations());
        operations.push(...buildGoodsRowSavingOperations());
        // packages and dangerous goods rows should get saved after goods rows, because they refer to goods row IDs
        operations.push(...buildPackageSavingOperations());
        operations.push(...buildDangerousGoodsRowSavingOperations());
        operations.push(...buildDocumentSavingOperations());
        if (processDeviationRows) {
            operations.push(...buildDeviationRowSavingOperations());
        }
        operations.push(...buildNoteSavingOperations());
        operations.push(...buildGoodsTotalOverrideSavingOperations());


        // removal operations should go in reverse order, taking into account model dependencies through foreign keys
        operations.push(...buildNoteRemovalOperations());
        if (processDeviationRows) {
            operations.push(...buildDeviationRowRemovalOperations());
        }
        operations.push(...buildDocumentRemovalOperations());
        operations.push(...buildPackageRemovalOperations());
        operations.push(...buildDangerousGoodsRowRemovalOperations());
        operations.push(...buildGoodsRowRemovalOperations());
        operations.push(...buildDebitRowRemovalOperations());
        operations.push(...buildSpecificationRowRemovalOperations());
        operations.push(...buildTransportOrderRemovalOperations());
        operations.push(...buildStopRemovalOperations());

        if (shouldSaveScheduleEntries) {
            // when saving schedule entries, they should be added last, after all other stuff in the order has been saved,
            // and then a second order saving operation should be added, updating the schedule relationships,
            // and also so that the order itself can be re-validated,
            // as some validations depend on whether the order has schedule entries

            operations.push(...buildScheduleEntrySavingOperations());

            // since the order already exists due to the first operation above, the second operation is always an update,
            // even for a new order/template.
            // also, it needs to ignore the version to avoid version conflict errors
            operations.push(buildOrderSavingOperation({
                includeNewlyAddedScheduleEntries: true,
                forceUpdate: true,
                useVersion: false,
            }));

            // note that removed schedule entries are intentionally NOT deleted.
            // eventually schedule entries will become reusable, so we only unlink them from the order here,
            // but do not destroy them. BE will have a clenup job to remove orphaned schedule data after some time.
        }

        return {
            operations,
            orderOperationIndex
        };
    };

    const buildOrderSavingOperation = (
        { includeNewlyAddedScheduleEntries, forceUpdate, useVersion }: {
            includeNewlyAddedScheduleEntries: boolean,
            forceUpdate?: boolean,
            useVersion?: boolean,
        }
    ) => {
        const scheduleEntries = order.value.scheduleEntries || [];
        const includableScheduleEntries = includeNewlyAddedScheduleEntries
            ? scheduleEntries
            : scheduleEntries.filter(entry => !relationshipChanges.value.ScheduleEntry.addedIds.includes(entry.id))
        ;
        const includableScheduleEntryIds = includableScheduleEntries.map(entry => entry.id);

        const operationType = !orderIsNew.value || forceUpdate ? JsonApiOperationType.Update : JsonApiOperationType.Add;

        return new JsonApiOperation({
            type: operationType,
            resource: order.value.toApiRequestResource({
                scheduleEntryIds: includableScheduleEntryIds,
                useVersion
            })
        });
    };

    const getRelationshipSavingOperationType = <K extends keyof (typeof relationshipChanges)["value"]>(className: K, id: string) => {
        return relationshipChanges.value[className].addedIds.includes(id) ? JsonApiOperationType.Add : JsonApiOperationType.Update;
    };

    // the following methods look quite repetitive, but since they refer to different models/types,
    // trying to DRY them up more by using typescript generics would probably make the code way less readable
    // so they are kept as is, at least for now

    const buildStopSavingOperations = () => {
        return (order.value.stops || []).map((stop) => {
            return new JsonApiOperation({
                type: getRelationshipSavingOperationType("Stop", stop.id),
                resource: stop.toApiRequestResource()
            });
        });
    };

    const buildStopRemovalOperations = () => {
        return relationshipChanges.value.Stop.removedIds.map((stopId) => {
            return new JsonApiOperation({
                type: JsonApiOperationType.Remove,
                identifier: Stop.getApiResourceIdentifier(stopId)!
            });
        });
    };

    const buildTransportOrderSavingOperations = () => {
        return (order.value.transportOrders || []).map((transportOrder) => {
            return new JsonApiOperation({
                type: getRelationshipSavingOperationType("TransportOrder", transportOrder.id),
                resource: transportOrder.toApiRequestResource()
            });
        });
    };

    const buildTransportOrderRemovalOperations = () => {
        return relationshipChanges.value.TransportOrder.removedIds.map((transportOrderId) => {
            return new JsonApiOperation({
                type: JsonApiOperationType.Remove,
                identifier: TransportOrder.getApiResourceIdentifier(transportOrderId)!
            });
        });
    };

    const buildSpecificationRowSavingOperations = () => {
        return (order.value.specificationRows || []).map((row) => {
            return new JsonApiOperation({
                type: getRelationshipSavingOperationType("SpecificationRow", row.id),
                resource: row.toApiRequestResource()
            });
        });
    };

    const buildSpecificationRowRemovalOperations = () => {
        return relationshipChanges.value.SpecificationRow.removedIds.map((rowId) => {
            return new JsonApiOperation({
                type: JsonApiOperationType.Remove,
                identifier: SpecificationRow.getApiResourceIdentifier(rowId)!
            });
        });
    };

    const buildDebitRowSavingOperations = () => {
        return (order.value.debitRows || []).map((row) => {
            return new JsonApiOperation({
                type: getRelationshipSavingOperationType("DebitRow", row.id),
                resource: row.toApiRequestResource()
            });
        });
    };

    const buildDebitRowRemovalOperations = () => {
        return relationshipChanges.value.DebitRow.removedIds.map((rowId) => {
            return new JsonApiOperation({
                type: JsonApiOperationType.Remove,
                identifier: DebitRow.getApiResourceIdentifier(rowId)!
            });
        });
    };

    const buildGoodsRowSavingOperations = () => {
        return (order.value.goodsRows || []).map((row) => {
            return new JsonApiOperation({
                type: getRelationshipSavingOperationType("GoodsRow", row.id),
                resource: row.toApiRequestResource()
            });
        });
    };

    const buildGoodsRowRemovalOperations = () => {
        return relationshipChanges.value.GoodsRow.removedIds.map((rowId) => {
            return new JsonApiOperation({
                type: JsonApiOperationType.Remove,
                identifier: GoodsRow.getApiResourceIdentifier(rowId)!
            });
        });
    };

    const buildPackageSavingOperations = () => {
        return (order.value.goodsRows || []).map((row) => {
            return (row.packages || []).map((record) => {
                return new JsonApiOperation({
                    type: getRelationshipSavingOperationType("Package", record.id),
                    resource: record.toApiRequestResource()
                });
            });
        }).flat();
    };

    const buildDangerousGoodsRowSavingOperations = () => {
        return (order.value.dangerousGoodsRows || []).map((row) => {
            return new JsonApiOperation({
                type: getRelationshipSavingOperationType("DangerousGoodsRow", row.id),
                resource: row.toApiRequestResource()
            });
        });
    };

    const buildDangerousGoodsRowRemovalOperations = () => {
        return relationshipChanges.value.DangerousGoodsRow.removedIds.map((rowId) => {
            return new JsonApiOperation({
                type: JsonApiOperationType.Remove,
                identifier: DangerousGoodsRow.getApiResourceIdentifier(rowId)!
            });
        });
    };


    const buildPackageRemovalOperations = () => {
        return relationshipChanges.value.Package.removedIds.map((rowId) => {
            return new JsonApiOperation({
                type: JsonApiOperationType.Remove,
                identifier: Package.getApiResourceIdentifier(rowId)!
            });
        });
    };

    const buildDocumentSavingOperations = () => {
        return (order.value.documents || []).map((row) => {
            return new JsonApiOperation({
                type: getRelationshipSavingOperationType("DocumentModel", row.id),
                resource: row.toApiRequestResource()
            });
        });
    };

    const buildDocumentRemovalOperations = () => {
        return relationshipChanges.value.DocumentModel.removedIds.map((rowId) => {
            return new JsonApiOperation({
                type: JsonApiOperationType.Remove,
                identifier: DocumentModel.getApiResourceIdentifier(rowId)!
            });
        });
    };

    const buildDeviationRowSavingOperations = () => {
        return (order.value.deviationRows || []).map((row) => {
            return new JsonApiOperation({
                type: getRelationshipSavingOperationType("DeviationRow", row.id),
                resource: row.toApiRequestResource()
            });
        });
    };

    const buildDeviationRowRemovalOperations = () => {
        return relationshipChanges.value.DeviationRow.removedIds.map((rowId) => {
            return new JsonApiOperation({
                type: JsonApiOperationType.Remove,
                identifier: DeviationRow.getApiResourceIdentifier(rowId)!
            });
        });
    };

    const buildNoteSavingOperations = () => {
        return (order.value.notes || []).map((note) => {
            return new JsonApiOperation({
                type: getRelationshipSavingOperationType("OrderNote", note.id),
                resource: note.toApiRequestResource()
            });
        });
    };

    const buildNoteRemovalOperations = () => {
        return relationshipChanges.value.OrderNote.removedIds.map((noteId) => {
            return new JsonApiOperation({
                type: JsonApiOperationType.Remove,
                identifier: OrderNote.getApiResourceIdentifier(noteId)!
            });
        });
    };

    const buildGoodsTotalOverrideSavingOperations = () => {
        // goods total override is never deleted from the client side, only created or updated
        const override = order.value.goodsTotalOverride;
        if (!override) {
            return [];
        }
        return [
            new JsonApiOperation({
                type: getRelationshipSavingOperationType("GoodsTotalOverride", override.id),
                resource: override.toApiRequestResource()
            })
        ];
    };

    const buildScheduleEntrySavingOperations = () => {
        return (order.value.scheduleEntries || []).map((entry) => {
            return new JsonApiOperation({
                type: getRelationshipSavingOperationType("ScheduleEntry", entry.id),
                resource: entry.toApiRequestResource()
            });
        });
    };


    return buildOperations();
};
