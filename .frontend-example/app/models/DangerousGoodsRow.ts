import { BaseModel } from "~/models/BaseModel";
import { CustomerOrder, type CustomerOrderApiResourceIdentifier } from "~/models/CustomerOrder";
import { GoodsRow, type GoodsRowApiResourceIdentifier, type GoodsRowApiResponseResource } from "~/models/GoodsRow";
import { DangerousGoodsRowSubstanceType, type DangerousGoodsRowSubstanceTypeApiResourceIdentifier, type DangerousGoodsRowSubstanceTypeApiResponseResource } from "~/models/DangerousGoodsRowSubstanceType";
import { DangerousGoodsRowQuantityType, type DangerousGoodsRowQuantityTypeApiResourceIdentifier, type DangerousGoodsRowQuantityTypeApiResponseResource } from "~/models/DangerousGoodsRowQuantityType";
import { UnitedNationsNumber, type UnitedNationsNumberApiResourceIdentifier, type UnitedNationsNumberApiResponseResource } from "~/models/UnitedNationsNumber";
import { WasteCode, type WasteCodeApiResourceIdentifier, type WasteCodeApiResponseResource } from "~/models/WasteCode";

export type DangerousGoodsRowApiResourceIdentifier = { type: "dangerousGoodsRows", id: string };

type DangerousGoodsRowApiResourceAttributes = {
    order_by: number, // sequence number

    adr_class: string | null,
    specification: string | null,

    quantity: number | null, // integer, precision in separate attribute
    quantity_precision: number | null, // integer

    substance_quantity_unit: string | null,
    substance_amount: number | null, // integer, precision in separate attribute
    substance_amount_precision: number | null, // integer
};

export type DangerousGoodsRowApiRequestResource = DangerousGoodsRowApiResourceIdentifier & {
    attributes: DangerousGoodsRowApiResourceAttributes,
    relationships: {
        order?: { data: CustomerOrderApiResourceIdentifier | null },
        goodsRow?: { data: GoodsRowApiResourceIdentifier | null },
        dangerousGoodsRowSubstanceType?: { data: DangerousGoodsRowSubstanceTypeApiResourceIdentifier | null },
        dangerousGoodsRowQuantityType?: { data: DangerousGoodsRowQuantityTypeApiResourceIdentifier | null },
        wasteCode?: { data: WasteCodeApiResourceIdentifier | null },
        unitedNationsNumber?: { data: UnitedNationsNumberApiResourceIdentifier | null },
    },
};

export type DangerousGoodsRowApiResponseResource = DangerousGoodsRowApiResourceIdentifier & DangerousGoodsRowApiResourceAttributes & {
    goodsRow: { data?: GoodsRowApiResponseResource },
    dangerousGoodsRowSubstanceType: { data?: DangerousGoodsRowSubstanceTypeApiResponseResource },
    dangerousGoodsRowQuantityType?: { data?: DangerousGoodsRowQuantityTypeApiResponseResource },
    wasteCode?: { data?: WasteCodeApiResponseResource },
    unitedNationsNumber?: { data?: UnitedNationsNumberApiResponseResource },
};

export type DangerousGoodsRowApiResourceFieldName = Exclude<keyof DangerousGoodsRowApiResponseResource, "id" | "type">;

export class DangerousGoodsRow extends BaseModel<GoodsRowApiResourceIdentifier> {
    static override entity = "orm-dangerous-goods-rows";
    static override apiResourceType = "dangerousGoodsRows" as const;

    static override fields() {
        return {
            id: this.string(null),
            sequenceNumber: this.number(null),

            specification: this.string(null),
            adrClass: this.string(null),

            quantity: this.number(null),
            quantityPrecision: this.number(null),

            substanceUnit: this.string(null),
            substanceAmount: this.number(null),
            substanceAmountPrecision: this.number(null),

            customerOrderId: this.string(null),
            goodsRowId: this.string(null),

            substanceTypeId: this.string(null),
            substanceType: this.belongsTo(DangerousGoodsRowSubstanceType, "substanceTypeId"),

            quantityTypeId: this.string(null),
            quantityType: this.belongsTo(DangerousGoodsRowQuantityType, "quantityTypeId"),

            wasteCodeId: this.string(null),
            wasteCode: this.belongsTo(WasteCode, "wasteCodeId"),

            unitedNationsNumberId: this.string(null),
            unitedNationsNumber: this.belongsTo(UnitedNationsNumber, "unitedNationsNumberId"),
        };
    }

    declare id: string;
    declare sequenceNumber: number;

    declare specification: string | null;
    declare adrClass: string | null;

    declare quantity: number | null;
    declare quantityPrecision: number | null;

    declare substanceUnit: string | null;
    declare substanceAmount: number | null;
    declare substanceAmountPrecision: number | null;

    declare customerOrderId: string;

    declare goodsRowId: string;
    declare goodsRow: GoodsRow | null;

    declare substanceTypeId: string | null;
    declare substanceType: DangerousGoodsRowSubstanceType | null;

    declare quantityTypeId: string | null;
    declare quantityType: DangerousGoodsRowQuantityType | null;

    declare wasteCodeId: string | null;
    declare wasteCode: WasteCode | null;

    declare unitedNationsNumberId: string | null;
    declare unitedNationsNumber: UnitedNationsNumber | null;


    static buildBlank(
        { customerOrderId, sequenceNumber, goodsRowId }:
        { customerOrderId: string, sequenceNumber: number, goodsRowId: string }
    ) {
        const record = new DangerousGoodsRow();
        record.id = generateNewUuid();
        record.customerOrderId = customerOrderId;
        record.sequenceNumber = sequenceNumber;
        record.goodsRowId = goodsRowId;
        return record;
    }

    static fromApiResponse({ resource }: { resource: DangerousGoodsRowApiResponseResource }) {
        return new DangerousGoodsRow({
            id: resource.id,
            sequenceNumber: resource.order_by,

            specification: resource.specification,
            adrClass: resource.adr_class,

            quantity: resource.quantity,
            quantityPrecision: resource.quantity_precision,

            substanceUnit: resource.substance_quantity_unit,
            substanceAmount: resource.substance_amount,
            substanceAmountPrecision: resource.substance_amount_precision,

            substanceTypeId: resource.dangerousGoodsRowSubstanceType?.data?.id ?? null,
            substanceType: resource.dangerousGoodsRowSubstanceType?.data ? DangerousGoodsRowSubstanceType.fromApiResponse(resource.dangerousGoodsRowSubstanceType.data) : null,

            quantityTypeId: resource.dangerousGoodsRowQuantityType?.data?.id ?? null,
            quantityType: resource.dangerousGoodsRowQuantityType?.data ? DangerousGoodsRowQuantityType.fromApiResponse(resource.dangerousGoodsRowQuantityType.data) : null,

            wasteCodeId: resource.wasteCode?.data?.id ?? null,
            wasteCode: resource.wasteCode?.data ? WasteCode.fromApiResponse(resource.wasteCode.data) : null,

            unitedNationsNumberId: resource.unitedNationsNumber?.data?.id ?? null,
            unitedNationsNumber: resource.unitedNationsNumber?.data ? UnitedNationsNumber.fromApiResponse(resource.unitedNationsNumber.data) : null,

            goodsRowId: resource.goodsRow?.data?.id ?? null,
            goodsRow: resource.goodsRow?.data ? GoodsRow.fromApiResponse({ resource: resource.goodsRow.data }) : null,
        });
    }

    toApiRequestResource(): DangerousGoodsRowApiRequestResource {
        return {
            ...(DangerousGoodsRow.getApiResourceIdentifier(this.id)!),
            attributes: {
                order_by: this.sequenceNumber,

                adr_class: this.adrClass,
                specification: this.specification,

                quantity: this.quantity,
                quantity_precision: this.quantityPrecision,

                substance_quantity_unit: this.substanceUnit,
                substance_amount: this.substanceAmount,
                substance_amount_precision: this.substanceAmountPrecision,

            },
            relationships: {
                order: { data: CustomerOrder.getApiResourceIdentifier(this.customerOrderId) },
                goodsRow: { data: GoodsRow.getApiResourceIdentifier(this.goodsRowId) },
                dangerousGoodsRowQuantityType: { data: DangerousGoodsRowQuantityType.getApiResourceIdentifier(this.quantityTypeId) },
                dangerousGoodsRowSubstanceType: { data: DangerousGoodsRowSubstanceType.getApiResourceIdentifier(this.substanceTypeId) },
                wasteCode: { data: WasteCode.getApiResourceIdentifier(this.wasteCodeId) },
                unitedNationsNumber: { data: UnitedNationsNumber.getApiResourceIdentifier(this.unitedNationsNumberId) },
            }
        };
    }

}
