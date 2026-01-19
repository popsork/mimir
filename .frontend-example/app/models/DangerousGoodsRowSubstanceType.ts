import { BaseModel } from "~/models/BaseModel";

export type DangerousGoodsRowSubstanceTypeApiResourceIdentifier = { type: "dangerousGoodsRowSubstanceTypes", id: string };

export type DangerousGoodsRowSubstanceTypeApiResponseResource = DangerousGoodsRowSubstanceTypeApiResourceIdentifier & {
    name: string,
};

export class DangerousGoodsRowSubstanceType extends BaseModel<DangerousGoodsRowSubstanceTypeApiResourceIdentifier> {
    static override entity = "orm-dangerous-goods-row-substance-types";
    static override apiResourceType = "dangerousGoodsRowSubstanceTypes" as const;

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

    static fromApiResponse(resource: DangerousGoodsRowSubstanceTypeApiResponseResource) {
        return new DangerousGoodsRowSubstanceType({
            id: resource.id,
            name: resource.name,
        });
    }
}
