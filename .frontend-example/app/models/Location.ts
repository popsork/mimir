import { BaseModel } from "~/models/BaseModel";

export type LocationApiResourceIdentifier = { type: "locations", id: string };

type LocationApiResourceAttributes = {
    street_name: string | null,
    street_number: string | null,
    postal_code: string | null,
    city: string | null,
    country: string | null,
    latitude: number | null,
    longitude: number | null,
    accuracy: LocationAccuracy | null,
};

export type LocationApiRequestResource = LocationApiResourceIdentifier & {
    attributes: LocationApiResourceAttributes,
};

export type LocationApiResponseResource = LocationApiResourceIdentifier & LocationApiResourceAttributes;


export class Location extends BaseModel<LocationApiResourceIdentifier> {
    static override entity = "orm-locations";
    static override apiResourceType = "locations" as const;

    static override fields() {
        return {
            id: this.string(null),

            streetName: this.string(null),
            streetNumber: this.string(null),
            postalCode: this.string(null),
            city: this.string(null),
            country: this.string(null),
            latitude: this.number(null),
            longitude: this.number(null),
            accuracy: this.string(null),

            sequenceNumber: this.number(null)
        };
    }

    declare id: string;
    declare streetName: string | null;
    declare streetNumber: string | null;
    declare postalCode: string | null;
    declare city: string | null;
    declare country: string | null;
    declare latitude: number | null;
    declare longitude: number | null;
    declare accuracy: LocationAccuracy | null;

    declare sequenceNumber: number;

    hasAnyAddressParts() {
        return [
            this.streetName,
            this.streetNumber,
            this.postalCode,
            this.city,
            this.country
        ].some(value => value !== null && value !== undefined);
    }

    hasAnyCoordinates() {
        return [
            this.latitude,
            this.longitude,
            this.accuracy
        ].some(value => value !== null && value !== undefined);
    }

    hasAnyValues() {
        return this.hasAnyAddressParts() || this.hasAnyCoordinates();
    }

    static fromApiResponse(resource: LocationApiResponseResource) {
        return new Location({
            id: resource.id,
            streetName: resource.street_name,
            streetNumber: resource.street_number,
            postalCode: resource.postal_code,
            city: resource.city,
            country: resource.country,
            latitude: resource.latitude,
            longitude: resource.longitude,
            accuracy: resource.accuracy,
        });
    }

    toApiRequestResource(): LocationApiRequestResource {
        return {
            ...(Location.getApiResourceIdentifier(this.id)!),
            attributes: {
                street_name: this.streetName,
                street_number: this.streetNumber,
                postal_code: this.postalCode,
                city: this.city,
                country: this.country,
                latitude: this.latitude,
                longitude: this.longitude,
                accuracy: this.accuracy
            }
        };
    }
}
