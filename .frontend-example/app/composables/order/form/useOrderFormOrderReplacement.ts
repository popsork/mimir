import type { BaseModel } from "~/models/BaseModel";
import { CustomerOrder, type CustomerOrderApiResponseResource } from "~/models/CustomerOrder";
import type { GoodsTotalOverride } from "~/models/GoodsTotalOverride";

export const useOrderFormOrderReplacement = (
    { originalState, currentState, receivedResource, originalRelationshipChanges, processDeviationRows }:
    {
        originalState: CustomerOrder, // the order form state at the moment when the API request was initiated
        currentState: CustomerOrder, // the order form state at the moment when the response was received
        receivedResource: CustomerOrderApiResponseResource, // the recalculated order form resource received from the API
        originalRelationshipChanges: OrderRelationshipChangesByClass,
        processDeviationRows: boolean,
    }
) => {
    const buildReplacement = () => {
        // the receivedResource contains the order and all its relationships, just like when fetching an order via GET,
        // and the full order form state can be reconstructed from it
        const replacementOrder = CustomerOrder.fromApiResponse(receivedResource);

        if (!processDeviationRows) {
            // if deviation rows are not processed, their state needs to be copied from the original state,
            // and anything received in the response need to be ignored,
            // because the server does not know about the user's latest changes
            // since they were not sent in the request
            replacementOrder.deviationRows = originalState.deviationRows;
        }

        // while the saving/recalculation API call was in progress,
        // the user may have already made some changes to other fields in the form.
        // in order to not lose those changes when replacing the form state with the received replacement,
        // we need to copy those newer changes to the received replacement order before putting it in the form

        // in practice, for dry runs this does not overwrite any values in fields that cause recalculation,
        // because if they have been changed by the user, then a new recalculation has been already triggered
        // and the latest response will be used/processed.

        // this DOES overwrite any values that were calculated by the server, if the user has manually edited them
        // while the API call was in progress. if that turns out to be a problem in practice,
        // the copying code will need adjustments by only replacing the value if it has not been changed by the server.

        copyChangedValuesToReplacement({
            original: originalState,
            current: currentState,
            replacement: replacementOrder
        });

        // the server may have added or removed some items in 1:n relationships in the order during its calculation.
        // this needs to be reflected in the list of relationship changes in the form,
        // e.g., if during a dry run the server auto-adds a new debit row based on the user having selected a specific article,
        // then the ID of the newly added row needs to be added to "addedIds" for debit rows.
        // the changes can be detected by comparing 1:n relationships from the original to the ones in the replacement order

        const replacementRelationshipChanges = calculateUpdatedRelationshipChangesByClass({
            originalOrder: originalState,
            replacementOrder,
            originalRelationshipChanges
        });

        return {
            replacementOrder,
            replacementRelationshipChanges
        };
    };

    const copyChangedValuesToReplacement = <T extends BaseModel<{ type: string, id: string }>>(
        { original, current, replacement }:
        { original: T, current: T, replacement: T }
    ) => {
        const constructor = original.constructor as typeof BaseModel;

        const attributeNames = Object.keys(original.$getAttributes()) as Array<keyof T>;

        copyChangedAttributesToReplacement({ original, current, replacement, attributeNames });

        const fieldNames = Object.keys(constructor.fields()) as Array<keyof T>;
        const relationshipNames = fieldNames.filter(fieldName => !attributeNames.includes(fieldName));

        copyChangedRelationshipsToReplacement({ original, current, replacement, relationshipNames });
    };

    const copyChangedAttributesToReplacement = <T extends BaseModel<{ type: string, id: string }>>(
        { original, current, replacement, attributeNames }:
        { original: T, current: T, replacement: T, attributeNames: Array<keyof T> }
    ) => {
        // plain attributes can be copied directly
        attributeNames.forEach((attributeName) => {
            const currentValue = current[attributeName as keyof typeof current];
            const originalValue = original[attributeName as keyof typeof original];
            if (JSON.stringify(originalValue) === JSON.stringify(currentValue)) {
                // value has not changed during API call, skip it
                return;
            }
            // value has changed during API call, copy it to the replacement object
            replacement[attributeName as keyof typeof replacement] = currentValue;
        });
    };

    const copyChangedRelationshipsToReplacement = <T extends BaseModel<{ type: string, id: string }>>(
        { original, current, replacement, relationshipNames }:
        { original: T, current: T, replacement: T, relationshipNames: Array<keyof T> }
    ) => {
        relationshipNames.forEach((relationshipName) => {
            const originalValue = original[relationshipName];
            const currentValue = current[relationshipName];
            const replacementValue = replacement[relationshipName];

            if (Array.isArray(currentValue)) {
                // array value means that this is a 1:n relationship (debit rows, packages etc)
                copyChangedRelationshipArrayToReplacement({
                    originalArray: originalValue as any[],
                    currentArray: currentValue as any[],
                    replacementArray: replacementValue as any[]
                });
            } else {
                // single relationships can be copied directly, without cloning and without processing their attributes,
                // since they are simply linked by ID and do not have anything editable inside
                if (JSON.stringify(originalValue) === JSON.stringify(currentValue)) {
                    // value has not changed during API call, skip it
                    return;
                }
                // value has changed during API call, copy it to the replacement object
                replacement[relationshipName as keyof typeof replacement] = currentValue;
            }
        });
    };

    const copyChangedRelationshipArrayToReplacement = <T extends BaseModel<{ type: string, id: string }>>(
        { originalArray, currentArray, replacementArray }:
        { originalArray: T[], currentArray: T[], replacementArray: T[] }
    ) => {
        // for each array item (e.g. debit row) we need to find the corresponding item
        // in the replacement object's corresponding relationship array,
        // because the indexes may not match if the replacement has some rows automatically added or removed.

        // :NOTE: for this to work correctly, ALL 1:n relationships must trigger recalculation
        // when their items get added or removed.
        // not only main rows in tabs, but deeper arrays as well, like packages for goods rows etc

        currentArray.forEach((currentItem, currentIndex) => {
            const originalIndex = originalArray.findIndex((originalItem: T) => originalItem.id === currentItem.id);
            if (originalIndex === -1) {
                // if a matching item is not found in the original state,
                // the item must have been added by the user during the API call.
                // this should not normally happen, because adding/removing array items must trigger a new recalculation
                // before execution reaches this place for the previous response,
                // but just in case it happens, simply skip the item
                return;
            }

            const replacementIndex = replacementArray.findIndex((replacementItem: T) => replacementItem.id === currentItem.id);
            if (replacementIndex === -1) {
                // if the item was originally present but is not found in the replacement array, skip it.
                // it may have been auto-removed by BE during recalculation.
                return;
            }

            // once the corresponding indexes are found in all three states,
            // call the copying recursively by passing the item itself as the main object
            copyChangedValuesToReplacement({
                original: originalArray[originalIndex]!,
                current: currentArray[currentIndex]!,
                replacement: replacementArray[replacementIndex]!,
            });
        });
    };



    const calculateUpdatedRelationshipChangesByClass = (
        { originalOrder, replacementOrder, originalRelationshipChanges }:
        {
            originalOrder: CustomerOrder,
            replacementOrder: CustomerOrder,
            originalRelationshipChanges: OrderRelationshipChangesByClass,
        }
    ) => {
        // define the whole blank object here, so that when new relationships get added in the future,
        // this code throws a typescript error about a missing property
        const replacementRelationshipChanges: OrderRelationshipChangesByClass = {
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

        replacementRelationshipChanges.Stop = calculateUpdatedRelationshipChanges({
            originalArray: originalOrder.stops!,
            replacementArray: replacementOrder.stops!,
            originalChanges: originalRelationshipChanges.Stop
        });

        replacementRelationshipChanges.TransportOrder = calculateUpdatedRelationshipChanges({
            originalArray: originalOrder.transportOrders!,
            replacementArray: replacementOrder.transportOrders!,
            originalChanges: originalRelationshipChanges.TransportOrder
        });

        replacementRelationshipChanges.SpecificationRow = calculateUpdatedRelationshipChanges({
            originalArray: originalOrder.specificationRows!,
            replacementArray: replacementOrder.specificationRows!,
            originalChanges: originalRelationshipChanges.SpecificationRow
        });

        replacementRelationshipChanges.DebitRow = calculateUpdatedRelationshipChanges({
            originalArray: originalOrder.debitRows!,
            replacementArray: replacementOrder.debitRows!,
            originalChanges: originalRelationshipChanges.DebitRow
        });

        replacementRelationshipChanges.GoodsRow = calculateUpdatedRelationshipChanges({
            originalArray: originalOrder.goodsRows!,
            replacementArray: replacementOrder.goodsRows!,
            originalChanges: originalRelationshipChanges.GoodsRow
        });

        const originalPackages = originalOrder.goodsRows!.flatMap(goodsRow => goodsRow.packages || []);
        const replacementPackages = replacementOrder.goodsRows!.flatMap(goodsRow => goodsRow.packages || []);

        replacementRelationshipChanges.Package = calculateUpdatedRelationshipChanges({
            originalArray: originalPackages,
            replacementArray: replacementPackages,
            originalChanges: originalRelationshipChanges.Package
        });

        replacementRelationshipChanges.DangerousGoodsRow = calculateUpdatedRelationshipChanges({
            originalArray: originalOrder.dangerousGoodsRows!,
            replacementArray: replacementOrder.dangerousGoodsRows!,
            originalChanges: originalRelationshipChanges.DangerousGoodsRow
        });

        replacementRelationshipChanges.DocumentModel = calculateUpdatedRelationshipChanges({
            originalArray: originalOrder.documents!,
            replacementArray: replacementOrder.documents!,
            originalChanges: originalRelationshipChanges.DocumentModel
        });

        replacementRelationshipChanges.DeviationRow = calculateUpdatedRelationshipChanges({
            originalArray: originalOrder.deviationRows!,
            replacementArray: replacementOrder.deviationRows!,
            originalChanges: originalRelationshipChanges.DeviationRow
        });

        replacementRelationshipChanges.OrderNote = calculateUpdatedRelationshipChanges({
            originalArray: originalOrder.notes!,
            replacementArray: replacementOrder.notes!,
            originalChanges: originalRelationshipChanges.OrderNote
        });

        replacementRelationshipChanges.ScheduleEntry = calculateUpdatedRelationshipChanges({
            originalArray: originalOrder.scheduleEntries!,
            replacementArray: replacementOrder.scheduleEntries!,
            originalChanges: originalRelationshipChanges.ScheduleEntry
        });

        replacementRelationshipChanges.GoodsTotalOverride = calculateUpdatedRelationshipChanges({
            originalArray: [ originalOrder.goodsTotalOverride ].filter(Boolean) as GoodsTotalOverride[],
            replacementArray: [ replacementOrder.goodsTotalOverride ].filter(Boolean) as GoodsTotalOverride[],
            originalChanges: originalRelationshipChanges.GoodsTotalOverride
        });

        return replacementRelationshipChanges;
    };


    const calculateUpdatedRelationshipChanges = <T extends BaseModel<{ type: string, id: string }>>(
        { originalArray, replacementArray, originalChanges }:
        { originalArray: T[], replacementArray: T[], originalChanges: RelationshipChanges }
    ) => {
        const updatedChanges = clone(originalChanges);
        // the relationship changes will only be used during dry runs, because all changes get cleared after a full save.

        // any items that are present in the replacement array but not in the original must be added to addedIds
        // since they have been added by the server during recalculation
        const newIds = replacementArray.map(item => item.id).filter(id => !originalArray.some(item => item.id === id));
        newIds.forEach((id) => {
            if (!updatedChanges.addedIds.includes(id)) {
                updatedChanges.addedIds.push(id);
            }
        });

        // handling of items that were present in the original but are no longer present in the replacement
        // depends on whether they had previously already been saved or not
        const removedIds = originalArray.map(item => item.id).filter(id => !replacementArray.some(item => item.id === id));
        removedIds.forEach((id) => {
            const index = updatedChanges.addedIds.indexOf(id);
            if (index === -1) {
                // removed item had been previously saved, so it needs to be marked as removed
                // as it will need a remove operation built for it
                if (!updatedChanges.removedIds.includes(id)) {
                    updatedChanges.removedIds.push(id);
                }
            } else {
                // removed item had not been previously saved, so it simply needs to be removed from addedIds
                // since it is no longer present
                updatedChanges.addedIds.splice(index, 1);
            }
        });

        return updatedChanges;
    };


    return buildReplacement();
};
