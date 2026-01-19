import { BaseModel } from "~/models/BaseModel";

import { CustomerOrder, type CustomerOrderApiResourceIdentifier } from "~/models/CustomerOrder";
import { DeviationCause, type DeviationCauseApiResourceIdentifier, type DeviationCauseApiResponseResource } from "~/models/DeviationCause";
import { DeviationType, type DeviationTypeApiResourceIdentifier, type DeviationTypeApiResponseResource } from "~/models/DeviationType";
import { User, type UserApiResponseResource } from "~/models/User";
import { TransportOrder, type TransportOrderApiResourceIdentifier, type TransportOrderApiResponseResource } from "./TransportOrder";
import { FileModel, type FileApiResourceIdentifier, type FileApiResponseResource } from "~/models/FileModel";

export type DeviationRowApiResourceIdentifier = { type: "deviationRows", id: string };

type DeviationRowApiResourceAttributes = {
    order_by: number, // sequence number
    status: DeviationRowStatus,
    description: string | null,
    source_name: string | null,
    created_at: string | null,
};

// created_at and source_name are never sent in the request, as they are always displayed as read only
type DeviationRowApiRequestResourceAttributes = Omit<DeviationRowApiResourceAttributes, "created_at" | "source_name">;

export type DeviationRowApiRequestResource = DeviationRowApiResourceIdentifier & {
    attributes: DeviationRowApiRequestResourceAttributes,
    relationships: {
        order?: { data: CustomerOrderApiResourceIdentifier | null },
        deviationType?: { data: DeviationTypeApiResourceIdentifier | null },
        deviationCause?: { data: DeviationCauseApiResourceIdentifier | null },
        transportOrder?: { data: TransportOrderApiResourceIdentifier | null },
        files?: { data: FileApiResourceIdentifier[] },
        // user relationship is not sent in the request, as it is not editable
    },
};

export type DeviationRowApiResponseResource = DeviationRowApiResourceIdentifier & DeviationRowApiResourceAttributes & {
    deviationType: { data?: DeviationTypeApiResponseResource },
    deviationCause: { data?: DeviationCauseApiResponseResource },
    transportOrder: { data?: TransportOrderApiResponseResource },
    user: { data?: UserApiResponseResource },
    files?: { data?: FileApiResponseResource[] },
};

export type DeviationRowApiResourceFieldName = Exclude<keyof DeviationRowApiResponseResource, "id" | "type">;

export class DeviationRow extends BaseModel<DeviationRowApiResourceIdentifier> {
    static override entity = "orm-deviation-rows";
    static override apiResourceType = "deviationRows" as const;

    static override fields() {
        return {
            id: this.string(null),
            sequenceNumber: this.number(null),

            status: this.string(null),
            description: this.string(null),
            createdAt: this.string(null),

            deviationTypeId: this.string(null),
            deviationType: this.belongsTo(DeviationType, "deviationTypeId"),

            deviationCauseId: this.string(null),
            deviationCause: this.belongsTo(DeviationCause, "deviationCauseId"),

            transportOrderId: this.string(null),
            transportOrder: this.belongsTo(TransportOrder, "transportOrderId"),

            sourceName: this.string(null),

            userId: this.string(null),
            user: this.belongsTo(User, "userId"),

            customerOrderId: this.string(null),

            // files are not added as hasMany here, because they don't have an owner ID
            // and are simply loaded into the array without pinia-orm knowing any relationships
            files: this.attr([]),
        };
    }

    declare id: string;

    declare sequenceNumber: number;

    declare status: DeviationRowStatus;
    declare description: string | null;
    declare createdAt: string | null;

    declare deviationTypeId: string | null;
    declare deviationType: DeviationType | null;

    declare deviationCauseId: string | null;
    declare deviationCause: DeviationCause | null;

    declare transportOrderId: string | null;
    declare transportOrder: TransportOrder | null;

    declare sourceName: string | null;

    declare userId: string | null;
    declare user: User | null;

    declare customerOrderId: string;
    declare files: FileModel[] | null;

    static buildBlank(
        { customerOrderId, sequenceNumber }:
        { customerOrderId: string, sequenceNumber: number }
    ) {
        const record = new DeviationRow();
        record.id = generateNewUuid();
        record.customerOrderId = customerOrderId;
        record.sequenceNumber = sequenceNumber;
        record.status = DeviationRowStatus.New;
        return record;
    }

    static fromApiResponse(resource: DeviationRowApiResponseResource) {

        const files = Array.isArray(resource.files?.data)
            ? resource.files.data.map((relatedResource) => {
                const record = FileModel.fromApiResponse(relatedResource);
                return record;
            })
            : null
        ;

        return new DeviationRow({
            id: resource.id,
            sequenceNumber: resource.order_by,

            status: resource.status,
            description: resource.description,
            createdAt: getUtcDatetimeString(resource.created_at),

            deviationTypeId: resource.deviationType?.data?.id ?? null,
            deviationType: resource.deviationType?.data ? DeviationType.fromApiResponse(resource.deviationType.data) : null,

            deviationCauseId: resource.deviationCause?.data?.id ?? null,
            deviationCause: resource.deviationCause?.data ? DeviationCause.fromApiResponse(resource.deviationCause.data) : null,

            transportOrderId: resource.transportOrder?.data?.id ?? null,
            transportOrder: resource.transportOrder?.data ? TransportOrder.fromApiResponse(resource.transportOrder.data) : null,

            sourceName: resource.source_name,

            userId: resource.user?.data?.id ?? null,
            user: resource.user?.data ? User.fromApiResponse(resource.user.data) : null,

            files,
        });
    }

    toApiRequestResource() {
        const resource: DeviationRowApiRequestResource = {
            ...(DeviationRow.getApiResourceIdentifier(this.id)!),
            attributes: {
                order_by: this.sequenceNumber,

                status: this.status,
                description: this.description,

            },
            relationships: {
                order: { data: CustomerOrder.getApiResourceIdentifier(this.customerOrderId) },
                deviationType: { data: DeviationType.getApiResourceIdentifier(this.deviationTypeId) },
                deviationCause: { data: DeviationCause.getApiResourceIdentifier(this.deviationCauseId) },
                transportOrder: { data: TransportOrder.getApiResourceIdentifier(this.transportOrderId) },
            }
        };

        if (this.files !== null) {
            resource.relationships.files = { data: this.files.map(file => FileModel.getApiResourceIdentifier(file.id)! ) };
        }

        return resource;

    }
}
