import { BaseModel } from "~/models/BaseModel";

import { CustomerOrder, type CustomerOrderApiResourceIdentifier } from "~/models/CustomerOrder";

export type OrderNoteApiResourceIdentifier = { type: "orderNotes", id: string };

type OrderNoteApiResourceAttributes = {
    note_type: OrderNoteType,
    notes: string,

    // these do not contain a reference to a related API resource, and therefore are not implemented as a relationship,
    // but are included as attributes instead.
    // frontend is not using them, they just need to be passed back to the API if the backend has assigned them
    origin_id: string | null,
    origin_type: string | null,
};

export type OrderNoteApiRequestResource = OrderNoteApiResourceIdentifier & {
    attributes: OrderNoteApiResourceAttributes,
    relationships: {
        order?: { data: CustomerOrderApiResourceIdentifier | null },
    },
};

export type OrderNoteApiResponseResource = OrderNoteApiResourceIdentifier & OrderNoteApiResourceAttributes;

export class OrderNote extends BaseModel<OrderNoteApiResourceIdentifier> {
    static override entity = "orm-order-notes";
    static override apiResourceType = "orderNotes" as const;

    static override fields() {
        return {
            id: this.string(null),

            noteType: this.string(null),
            notes: this.string(null),

            originId: this.string(null),
            originType: this.string(null),

            customerOrderId: this.string(null),
        };
    }

    declare id: string;

    declare noteType: OrderNoteType;
    declare notes: string;

    declare originId: string | null;
    declare originType: string | null;

    declare customerOrderId: string;

    static buildBlank(
        { customerOrderId, noteType }:
        { customerOrderId: string, noteType: OrderNoteType }
    ) {
        const record = new OrderNote();
        record.id = generateNewUuid();
        record.customerOrderId = customerOrderId;
        record.noteType = noteType;
        return record;
    }

    static fromApiResponse(resource: OrderNoteApiResponseResource) {
        return new OrderNote({
            id: resource.id,
            noteType: resource.note_type,
            notes: resource.notes,

            originId: resource.origin_id,
            originType: resource.origin_type,
        });
    }

    toApiRequestResource(): OrderNoteApiRequestResource {
        return {
            ...(OrderNote.getApiResourceIdentifier(this.id)!),
            attributes: {
                note_type: this.noteType,
                notes: this.notes ?? "", // column is non-nullable in DB, so a blank value needs to be a string instead of null
                origin_id: this.originId,
                origin_type: this.originType,
            },

            relationships: {
                order: { data: CustomerOrder.getApiResourceIdentifier(this.customerOrderId) },
            }
        };
    }
}
