import { BaseModel } from "~/models/BaseModel";

export type TransportOrderStageApiResourceIdentifier = { type: "transportOrderStages", id: string };


export type TransportOrderStageApiResponseResource = TransportOrderStageApiResourceIdentifier & {
    name: TransportOrderStageName | null,
    label: string,
};

export class TransportOrderStage extends BaseModel<TransportOrderStageApiResourceIdentifier> {
    static override entity = "orm-transport-order-stages";
    static override apiResourceType = "transportOrderStages" as const;

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),
            label: this.string(null),

            sequenceNumber: this.number(null)
        };
    }

    declare id: string;
    declare name: TransportOrderStageName | null;
    declare label: string;

    declare sequenceNumber: number;

    static fromApiResponse(resource: TransportOrderStageApiResponseResource) {
        return new TransportOrderStage({
            id: resource.id,
            name: resource.name,
            label: resource.label,
        });
    }
}
