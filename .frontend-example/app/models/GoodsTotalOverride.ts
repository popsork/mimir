import { BaseModel } from "~/models/BaseModel";
import { CustomerOrder, type CustomerOrderApiResourceIdentifier } from "./CustomerOrder";

export type GoodsTotalOverrideApiResourceIdentifier = { type: "goodsTotalOverrides", id: string };

type GoodsTotalOverrideApiResourceAttributes = {
    // these are all integers in API
    volume: number | null,
    volume_precision: number | null,

    loading_metres: number | null,
    loading_metres_precision: number | null,

    pallet_places: number | null,
    pallet_places_precision: number | null,
};


export type GoodsTotalOverrideApiResponseResource = GoodsTotalOverrideApiResourceIdentifier & GoodsTotalOverrideApiResourceAttributes;

export type GoodsTotalOverrideApiRequestResource = GoodsTotalOverrideApiResourceIdentifier & {
    attributes: GoodsTotalOverrideApiResourceAttributes,
    relationships: {
        order?: { data: CustomerOrderApiResourceIdentifier | null },
    },
};


export class GoodsTotalOverride extends BaseModel<GoodsTotalOverrideApiResourceIdentifier> {
    static override entity = "orm-goods-total-overrides";
    static override apiResourceType = "goodsTotalOverrides" as const;

    static override fields() {
        return {
            id: this.string(null),

            volume: this.number(null),
            volumePrecision: this.number(null),

            loadingMetres: this.number(null),
            loadingMetresPrecision: this.number(null),

            palletPlaces: this.number(null),
            palletPlacesPrecision: this.number(null),

            customerOrderId: this.string(null),
        };
    }

    declare id: string;

    declare volume: number | null;
    declare volumePrecision: number | null;

    declare loadingMetres: number | null;
    declare loadingMetresPrecision: number | null;

    declare palletPlaces: number | null;
    declare palletPlacesPrecision: number | null;

    declare customerOrderId: string | null;

    getRealVolume() {
        return getRealNumberValue(this.volume, this.volumePrecision);
    }

    getRealLoadingMetres() {
        return getRealNumberValue(this.loadingMetres, this.loadingMetresPrecision);
    }

    getRealPalletPlaces() {
        return getRealNumberValue(this.palletPlaces, this.palletPlacesPrecision);
    }

    static buildBlank(
        { customerOrderId }:
        { customerOrderId: string }
    ) {
        const record = new GoodsTotalOverride();
        record.id = generateNewUuid();
        record.customerOrderId = customerOrderId;
        return record;
    }

    static fromApiResponse(resource: GoodsTotalOverrideApiResponseResource) {
        return new GoodsTotalOverride({
            id: resource.id,
            volume: resource.volume,
            volumePrecision: resource.volume_precision,
            loadingMetres: resource.loading_metres,
            loadingMetresPrecision: resource.loading_metres_precision,
            palletPlaces: resource.pallet_places,
            palletPlacesPrecision: resource.pallet_places_precision,
        });
    }

    toApiRequestResource(): GoodsTotalOverrideApiRequestResource {
        return {
            ...(GoodsTotalOverride.getApiResourceIdentifier(this.id)!),
            attributes: {
                volume: this.volume,
                volume_precision: this.volumePrecision,
                loading_metres: this.loadingMetres,
                loading_metres_precision: this.loadingMetresPrecision,
                pallet_places: this.palletPlaces,
                pallet_places_precision: this.palletPlacesPrecision,
            },
            relationships: {
                order: { data: CustomerOrder.getApiResourceIdentifier(this.customerOrderId) },
            }
        };
    }
}
