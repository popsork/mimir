import { BaseModel } from "~/models/BaseModel";

export type DangerousGoodsRowQuantityTypeApiResourceIdentifier = { type: "dangerousGoodsRowQuantityTypes", id: string };

export type DangerousGoodsRowQuantityTypeApiResponseResource = DangerousGoodsRowQuantityTypeApiResourceIdentifier & {
    name: string,
};

export class DangerousGoodsRowQuantityType extends BaseModel<DangerousGoodsRowQuantityTypeApiResourceIdentifier> {
    static override entity = "orm-dangerous-goods-row-quantity-types";
    static override apiResourceType = "dangerousGoodsRowQuantityTypes" as const;

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),

            sequenceNumber: this.number(null),
        };
    }

    declare id: string;
    declare name: string;

    declare sequenceNumber: number;

    static fromApiResponse(resource: DangerousGoodsRowQuantityTypeApiResponseResource) {
        return new DangerousGoodsRowQuantityType({
            id: resource.id,
            name: resource.name,
        });
    }
}
