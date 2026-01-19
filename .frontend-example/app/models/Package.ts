import { BaseModel } from "~/models/BaseModel";
import { CustomerOrder, type CustomerOrderApiResourceIdentifier } from "~/models/CustomerOrder";
import { GoodsRow, type GoodsRowApiResourceIdentifier } from "~/models/GoodsRow";

export type PackageApiResourceIdentifier = { type: "packages", id: string };

type PackageApiResourceAttributes = {
    order_by: number, // sequence number
    number: string,
};

export type PackageApiRequestResource = PackageApiResourceIdentifier & {
    attributes: PackageApiResourceAttributes,
    relationships: {
        order?: { data: CustomerOrderApiResourceIdentifier | null },
        goodsRow?: { data: GoodsRowApiResourceIdentifier | null },
    },
};

// response resource does not include relationships,
// because packages are always fetched as included resources within order -> goods rows
// so they don't have their order and goodsRow relationships included for themselves
export type PackageApiResponseResource = PackageApiResourceIdentifier & PackageApiResourceAttributes;


export class Package extends BaseModel<PackageApiResourceIdentifier> {
    static override entity = "orm-packages";
    static override apiResourceType = "packages" as const;

    static override fields() {
        return {
            id: this.string(null),
            number: this.string(null),

            sequenceNumber: this.number(null),

            customerOrderId: this.string(null),
            goodsRowId: this.string(null),
        };
    }

    declare id: string;
    declare number: string;

    declare sequenceNumber: number;

    declare customerOrderId: string;
    declare goodsRowId: string;


    static buildBlank(
        { customerOrderId, goodsRowId, sequenceNumber }:
        { customerOrderId: string, goodsRowId: string, sequenceNumber: number }
    ) {
        const record = new Package();
        record.id = generateNewUuid();
        record.customerOrderId = customerOrderId;
        record.goodsRowId = goodsRowId;
        record.sequenceNumber = sequenceNumber;
        return record;
    }


    static fromApiResponse(resource: PackageApiResponseResource) {
        return new Package({
            id: resource.id,
            sequenceNumber: resource.order_by,
            number: resource.number,
        });
    }

    toApiRequestResource(): PackageApiRequestResource {
        return {
            ...(Package.getApiResourceIdentifier(this.id)!),
            attributes: {
                order_by: this.sequenceNumber,
                number: this.number
            },
            relationships: {
                order: { data: CustomerOrder.getApiResourceIdentifier(this.customerOrderId) },
                goodsRow: { data: GoodsRow.getApiResourceIdentifier(this.goodsRowId) },
            }
        };
    }
}
