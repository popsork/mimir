import { BaseModel } from "~/models/BaseModel";

import { Package, type PackageApiResponseResource } from "~/models/Package";
import { GoodsRowQuantityType, type GoodsRowQuantityTypeApiResourceIdentifier, type GoodsRowQuantityTypeApiResponseResource } from "~/models/GoodsRowQuantityType";
import { CustomerOrder, type CustomerOrderApiResourceIdentifier } from "~/models/CustomerOrder";

export type GoodsRowApiResourceIdentifier = { type: "goodsRows", id: string };

type GoodsRowApiResourceAttributes = {
    order_by: number, // sequence number
    specification: string | null,
    specification_is_manual: boolean,

    quantity: number | null, // integer, precision in separate attribute
    quantity_precision: number | null, // integer
    quantity_is_manual: boolean,

    weight: number | null, // integer, precision in separate attribute, unit may vary but is not important here
    weight_is_manual: boolean,
    weight_precision: number | null, // integer

    volume: number | null, // integer, precision in separate attribute, cubic metres
    volume_is_manual: boolean,
    volume_precision: number | null, // integer

    loading_metres: number | null, // integer, precision in separate attribute
    loading_metres_precision: number | null, // integer
    loading_metres_is_manual: boolean,

    pallet_places: number | null, // integer, precision in separate attribute
    pallet_places_precision: number | null, // integer
    pallet_places_is_manual: boolean,

    calculated_weight: number | null, // integer, precision in separate attribute, no unit
    calculated_weight_precision: number | null, // integer

    length: number | null, // integer, precision in separate attribute, unit is always centimetres
    length_precision: number | null, // integer, should normally always be 0

    width: number | null, // integer, precision in separate attribute, unit is always centimetres
    width_precision: number | null, // integer, should normally always be 0

    height: number | null, // integer, precision in separate attribute, unit is always centimetres
    height_precision: number | null, // integer, should normally always be 0

    dimensions_are_manual: boolean,

    goods_row_quantity_type_id_is_manual: boolean,
};


// calculated weight values are not sent in the request, as they are always displayed as read only
type GoodsRowApiRequestResourceAttributes = Omit<
    GoodsRowApiResourceAttributes,
    "calculated_weight" | "calculated_weight_precision"
>;

export type GoodsRowApiRequestResource = GoodsRowApiResourceIdentifier & {
    attributes: GoodsRowApiRequestResourceAttributes,
    relationships: {
        order?: { data: CustomerOrderApiResourceIdentifier | null },
        goodsRowQuantityType?: { data: GoodsRowQuantityTypeApiResourceIdentifier | null },
        // do not send packages array with goods row request,
        // as packages will have their own operations and will be linked to goods row from the other side
    },
};

export type GoodsRowApiResponseResource = GoodsRowApiResourceIdentifier & GoodsRowApiResourceAttributes & {
    goodsRowQuantityType: { data?: GoodsRowQuantityTypeApiResponseResource },
    packages: { data?: PackageApiResponseResource[] },
};

export type GoodsRowApiResourceFieldName = Exclude<keyof GoodsRowApiResponseResource, "id" | "type">;

export class GoodsRow extends BaseModel<GoodsRowApiResourceIdentifier> {
    static override entity = "orm-goods-rows";
    static override apiResourceType = "goodsRows" as const;

    static override fields() {
        return {
            id: this.string(null),
            sequenceNumber: this.number(null),

            specification: this.string(null),
            specificationIsManual: this.boolean(false),

            quantity: this.number(null),
            quantityPrecision: this.number(null),
            quantityIsManual: this.boolean(false),

            weight: this.number(null),
            weightPrecision: this.number(null),
            weightIsManual: this.boolean(false),

            volume: this.number(null),
            volumePrecision: this.number(null),
            volumeIsManual: this.boolean(false),

            loadingMetres: this.number(null),
            loadingMetresPrecision: this.number(null),
            loadingMetresIsManual: this.boolean(false),

            palletPlaces: this.number(null),
            palletPlacesPrecision: this.number(null),
            palletPlacesIsManual: this.boolean(false),

            calculatedWeight: this.number(null),
            calculatedWeightPrecision: this.number(null),

            length: this.number(null),
            lengthPrecision: this.number(null),
            width: this.number(null),
            widthPrecision: this.number(null),
            height: this.number(null),
            heightPrecision: this.number(null),

            dimensionsAreManual: this.boolean(false),

            customerOrderId: this.string(null),

            quantityTypeId: this.string(null),
            quantityTypeIdIsManual: this.boolean(false),
            quantityType: this.belongsTo(GoodsRowQuantityType, "quantityTypeId"),

            packages: this.hasMany(Package, "goodsRowId")
        };
    }

    declare id: string;

    declare sequenceNumber: number;

    declare specification: string | null;
    declare specificationIsManual: boolean;

    declare quantity: number | null;
    declare quantityPrecision: number | null;
    declare quantityIsManual: boolean;

    declare weight: number | null;
    declare weightPrecision: number | null;
    declare weightIsManual: boolean;

    declare volume: number | null;
    declare volumePrecision: number | null;
    declare volumeIsManual: boolean;

    declare loadingMetres: number | null;
    declare loadingMetresPrecision: number | null;
    declare loadingMetresIsManual: boolean;

    declare palletPlaces: number | null;
    declare palletPlacesPrecision: number | null;
    declare palletPlacesIsManual: boolean;

    declare calculatedWeight: number | null;
    declare calculatedWeightPrecision: number | null;

    declare length: number | null;
    declare lengthPrecision: number | null;
    declare width: number | null;
    declare widthPrecision: number | null;
    declare height: number | null;
    declare heightPrecision: number | null;
    declare dimensionsAreManual: boolean;

    declare quantityTypeId: string | null;
    declare quantityTypeIdIsManual: boolean;
    declare quantityType: GoodsRowQuantityType | null;

    declare packages: Package[] | null;

    declare customerOrderId: string;

    // used by multiple fields so these got moved to model constants
    static readonly MAX_VOLUME_DECIMAL_PLACES = 6;
    static readonly MAX_LOADING_METRES_DECIMAL_PLACES = 6;
    static readonly MAX_PALLET_PLACES_DECIMAL_PLACES = 6;

    static buildBlank(
        { customerOrderId, sequenceNumber }:
        { customerOrderId: string, sequenceNumber: number }
    ) {
        const record = new GoodsRow();
        record.id = generateNewUuid();
        record.customerOrderId = customerOrderId;
        record.sequenceNumber = sequenceNumber;
        return record;
    }

    static fromApiResponse({ resource, customerOrderId }: { resource: GoodsRowApiResponseResource, customerOrderId?: string }) {
        // customer order relationship is not included in the API response, so it needs to be passed in
        // since it is needed for building the packages.
        // if packages are not needed, customerOrderId can be omitted
        const packages = (customerOrderId) ? this.buildRelationshipsFromApiResponse({ resource, customerOrderId }).packages : null;

        return new GoodsRow({
            id: resource.id,
            sequenceNumber: resource.order_by,

            specification: resource.specification,
            specificationIsManual: resource.specification_is_manual,

            quantity: resource.quantity,
            quantityPrecision: resource.quantity_precision,
            quantityIsManual: resource.quantity_is_manual,

            weight: resource.weight,
            weightPrecision: resource.weight_precision,
            weightIsManual: resource.weight_is_manual,

            volume: resource.volume,
            volumePrecision: resource.volume_precision,
            volumeIsManual: resource.volume_is_manual,

            loadingMetres: resource.loading_metres,
            loadingMetresPrecision: resource.loading_metres_precision,
            loadingMetresIsManual: resource.loading_metres_is_manual,

            palletPlaces: resource.pallet_places,
            palletPlacesPrecision: resource.pallet_places_precision,
            palletPlacesIsManual: resource.pallet_places_is_manual,

            calculatedWeight: resource.calculated_weight,
            calculatedWeightPrecision: resource.calculated_weight_precision,

            length: resource.length,
            lengthPrecision: resource.length_precision,
            width: resource.width,
            widthPrecision: resource.width_precision,
            height: resource.height,
            heightPrecision: resource.height_precision,
            dimensionsAreManual: resource.dimensions_are_manual,

            quantityTypeId: resource.goodsRowQuantityType?.data?.id ?? null,
            quantityTypeIdIsManual: resource.goods_row_quantity_type_id_is_manual,
            quantityType: resource.goodsRowQuantityType?.data ? GoodsRowQuantityType.fromApiResponse(resource.goodsRowQuantityType.data) : null,

            packages
        });
    }

    static buildRelationshipsFromApiResponse({ resource, customerOrderId }: { resource: GoodsRowApiResponseResource, customerOrderId: string }) {
        const goodsRowId = resource.id;

        const packages = resource.packages.data
            ? resource.packages.data.map((relatedResource) => {
                const record = Package.fromApiResponse(relatedResource);
                record.customerOrderId = customerOrderId;
                record.goodsRowId = goodsRowId;
                return record;
            })
            : null
        ;
        const sortedPackages = packages?.sort((a, b) => a.sequenceNumber - b.sequenceNumber) ?? null;
        return {
            packages: sortedPackages
        };
    }

    toApiRequestResource(): GoodsRowApiRequestResource {
        return {
            ...(GoodsRow.getApiResourceIdentifier(this.id)!),
            attributes: {
                order_by: this.sequenceNumber,

                specification: this.specification,
                specification_is_manual: this.specificationIsManual,

                quantity: this.quantity,
                quantity_precision: this.quantityPrecision,
                quantity_is_manual: this.quantityIsManual,

                weight: this.weight,
                weight_precision: this.weightPrecision,
                weight_is_manual: this.weightIsManual,

                volume: this.volume,
                volume_precision: this.volumePrecision,
                volume_is_manual: this.volumeIsManual,

                loading_metres: this.loadingMetres,
                loading_metres_precision: this.loadingMetresPrecision,
                loading_metres_is_manual: this.loadingMetresIsManual,

                pallet_places: this.palletPlaces,
                pallet_places_precision: this.palletPlacesPrecision,
                pallet_places_is_manual: this.palletPlacesIsManual,

                length: this.length,
                length_precision: this.lengthPrecision,

                width: this.width,
                width_precision: this.widthPrecision,

                height: this.height,
                height_precision: this.heightPrecision,

                dimensions_are_manual: this.dimensionsAreManual,

                goods_row_quantity_type_id_is_manual: this.quantityTypeIdIsManual,
            },
            relationships: {
                order: { data: CustomerOrder.getApiResourceIdentifier(this.customerOrderId) },
                goodsRowQuantityType: { data: GoodsRowQuantityType.getApiResourceIdentifier(this.quantityTypeId) },
                // do not send packages array with goods row request,
                // as packages will have their own operations and will be linked to goods row from the other side
            }
        };
    }
}
