import { BaseModel } from "~/models/BaseModel";

export type QuantityUnitApiResourceIdentifier = { type: "quantityUnits", id: string };

export type QuantityUnitApiResponseResource = QuantityUnitApiResourceIdentifier & {
    name: string,
    suffix: string | null,
};

export class QuantityUnit extends BaseModel<QuantityUnitApiResourceIdentifier> {
    static override entity = "orm-quantity-units";
    static override apiResourceType = "quantityUnits" as const;

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),
            suffix: this.string(null),

            sequenceNumber: this.number(null)
        };
    }

    declare id: string;
    declare name: string;
    declare suffix: string;

    declare sequenceNumber: number;

    static fromApiResponse(resource: QuantityUnitApiResponseResource) {
        return new QuantityUnit({
            id: resource.id,
            name: resource.name,
            suffix: resource.suffix
        });
    }
}
