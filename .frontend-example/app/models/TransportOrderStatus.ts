import { BaseModel } from "~/models/BaseModel";

export type TransportOrderStatusApiResourceIdentifier = { type: "transportOrderStatuses", id: string };


export type TransportOrderStatusApiResponseResource = TransportOrderStatusApiResourceIdentifier & {
    name: TransportOrderStatusName | null,
};

export class TransportOrderStatus extends BaseModel<TransportOrderStatusApiResourceIdentifier> {
    static override entity = "orm-transport-order-statuses";
    static override apiResourceType = "transportOrderStatuses" as const;

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null)
        };
    }

    declare id: string;
    declare name: TransportOrderStatusName;

    static fromApiResponse(resource: TransportOrderStatusApiResponseResource) {
        return new TransportOrderStatus({
            id: resource.id,
            name: resource.name,
        });
    }
}
