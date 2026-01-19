import { BaseModel } from "~/models/BaseModel";

export type SpecificationRowQuantityTypeApiResourceIdentifier = { type: "specificationRowQuantityTypes", id: string };

export type SpecificationRowQuantityTypeApiResponseResource = SpecificationRowQuantityTypeApiResourceIdentifier & {
    name: string,
    precision: number,
    order_by: string,
};

export class SpecificationRowQuantityType extends BaseModel<SpecificationRowQuantityTypeApiResourceIdentifier> {
    static override entity = "orm-specification-row-quantity-types";
    static override apiResourceType = "specificationRowQuantityTypes" as const;

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),
            precision: this.number(null),

            sequenceNumber: this.number(null),
        };
    }

    declare id: string;
    declare name: string;
    declare precision: number;

    declare sequenceNumber: number;

    static fromApiResponse(resource: SpecificationRowQuantityTypeApiResponseResource) {
        return new SpecificationRowQuantityType({
            id: resource.id,
            name: resource.name,
            precision: resource.precision,
            sequenceNumber: resource.order_by,
        });
    }
}
