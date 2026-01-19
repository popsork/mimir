import { BaseModel } from "~/models/BaseModel";

export type GoodsRowQuantityTypeApiResourceIdentifier = { type: "goodsRowQuantityTypes", id: string };

export type GoodsRowQuantityTypeApiResponseResource = GoodsRowQuantityTypeApiResourceIdentifier & {
    name: string,
};

export class GoodsRowQuantityType extends BaseModel<GoodsRowQuantityTypeApiResourceIdentifier> {
    static override entity = "orm-goods-row-quantity-types";
    static override apiResourceType = "goodsRowQuantityTypes" as const;

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

    static fromApiResponse(resource: GoodsRowQuantityTypeApiResponseResource) {
        return new GoodsRowQuantityType({
            id: resource.id,
            name: resource.name,
        });
    }
}
