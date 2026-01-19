import { BaseModel } from "~/models/BaseModel";

export type GoodsRowSummaryApiResourceIdentifier = { type: "goodsRowSummaries", id: string };

export type GoodsRowSummaryApiResponseResource = GoodsRowSummaryApiResourceIdentifier & {

    // these are all ints in API
    volume: number | null,
    volume_precision: number | null,
    loading_metres: number | null,
    loading_metres_precision: number | null,
    pallet_places: number | null,
    pallet_places_precision: number | null,

    // these are all floats in API, but only real_calculated_weight is currently actually used in the order form
    real_volume: number | null,
    real_loading_metres: number | null,
    real_pallet_places: number | null,
    real_calculated_weight: number | null,

};


export class GoodsRowSummary extends BaseModel<GoodsRowSummaryApiResourceIdentifier> {
    static override entity = "orm-goods-row-summaries";
    static override apiResourceType = "goodsRowSummaries" as const;

    static override fields() {
        return {
            id: this.string(null),

            volume: this.number(null),
            volumePrecision: this.number(null),

            loadingMetres: this.number(null),
            loadingMetresPrecision: this.number(null),

            palletPlaces: this.number(null),
            palletPlacesPrecision: this.number(null),

            realVolume: this.number(null),
            realLoadingMetres: this.number(null),
            realPalletPlaces: this.number(null),
            realCalculatedWeight: this.number(null),
        };
    }

    declare id: string;

    declare volume: number | null;
    declare volumePrecision: number | null;

    declare loadingMetres: number | null;
    declare loadingMetresPrecision: number | null;

    declare palletPlaces: number | null ;
    declare palletPlacesPrecision: number | null;

    declare realVolume: number | null;
    declare realLoadingMetres: number | null;
    declare realPalletPlaces: number | null;
    declare realCalculatedWeight: number | null;

    static fromApiResponse(resource: GoodsRowSummaryApiResponseResource) {
        return new GoodsRowSummary({
            id: resource.id,

            volume: resource.volume,
            volumePrecision: resource.volume_precision,

            loadingMetres: resource.loading_metres,
            loadingMetresPrecision: resource.loading_metres_precision,

            palletPlaces: resource.pallet_places,
            palletPlacesPrecision: resource.pallet_places_precision,

            realVolume: resource.real_volume,
            realLoadingMetres: resource.real_loading_metres,
            realPalletPlaces: resource.real_pallet_places,
            realCalculatedWeight: resource.real_calculated_weight,
        });
    }
}
