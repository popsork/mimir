import { BaseModel } from "~/models/BaseModel";

import { Location, type LocationApiResourceIdentifier, type LocationApiResponseResource } from "~/models/Location";

// a narrower type for when it is ensured that a location is definitely set
export type DestinationWithLocation = Destination & { location: Location };

export type DestinationApiResourceIdentifier = { type: "destinations", id: string };

type DestinationApiResourceAttributes = {
    name: string | null,
    contact: string | null,
    phone: string | null,
    email: string | null,
    information: string | null,
};

export type DestinationApiRequestResource = DestinationApiResourceIdentifier & {
    attributes: DestinationApiResourceAttributes,
    relationships: {
        location?: { data: LocationApiResourceIdentifier | null },
    },
};

export type DestinationApiResponseResource = DestinationApiResourceIdentifier & DestinationApiResourceAttributes & {
    location?: { data?: LocationApiResponseResource },
};


export class Destination extends BaseModel<DestinationApiResourceIdentifier> {
    static override entity = "orm-destinations";
    static override apiResourceType = "destinations" as const;

    static override fields() {
        return {
            id: this.string(null),

            name: this.string(null),
            contact: this.string(null),
            phone: this.string(null),
            email: this.string(null),
            notes: this.string(null),

            locationId: this.string(null),
            location: this.belongsTo(Location, "locationId"),

            label: this.string(null), // a calculated field for displaying

            sequenceNumber: this.number(null),

            // this is used in the location dialog to indicate whether the destination is saved or not
            isPersisted: this.boolean(false),
        };
    }

    declare id: string;

    declare name: string | null;
    declare contact: string | null;
    declare phone: string | null;
    declare email: string | null;
    declare notes: string | null;

    declare locationId: string | null;
    declare location: Location | null;

    declare label: string;

    declare sequenceNumber: number;
    declare isPersisted: boolean;

    getLabel() {
        if (!this.location) {
            throw new Error("Cannot build a destination's label when location relationship is not loaded.");
        }
        return Destination.buildLabel({
            name: this.name,
            streetName: this.location.streetName,
            streetNumber: this.location.streetNumber,
            postalCode: this.location.postalCode,
            city: this.location.city,
            country: this.location.country,
        });
    }

    hasAnyLocationValues() {
        if (!this.location) {
            throw new Error("Cannot check for a destination's location values when location relationship is not loaded.");
        }

        if (this.name) {
            // if name is set on destination itself, we have a location label to display, so count that as having location values
            return true;
        }

        return this.location.hasAnyValues();
    }


    static buildLabel(
        { name, streetName, streetNumber, postalCode, city, country }: {
            name: string | null,
            streetName: string | null,
            streetNumber: string | null,
            postalCode: string | null,
            city: string | null,
            country: string | null,
        }
    ) {
        const label = [
            name,
            [streetName, streetNumber].filter(value => !!value).join(" "),
            postalCode,
            city,
            country,
        ].filter(value => !!value).join(", ");

        return label;
    }

    static fromApiResponse(resource: DestinationApiResponseResource) {
        const locationId = resource.location?.data?.id ?? null;
        const location = resource.location?.data ? Location.fromApiResponse(resource.location.data) : null;

        const label = this.buildLabel({
            name: resource.name,
            streetName: location?.streetName || null,
            streetNumber: location?.streetNumber || null,
            postalCode: location?.postalCode || null,
            city: location?.city || null,
            country: location?.country || null,
        });

        return new Destination({
            id: resource.id,

            name: resource.name,
            contact: resource.contact,
            phone: resource.phone,
            email: resource.email,
            notes: resource.information,

            locationId,
            location,

            label,
            isPersisted: true,
        });
    }

    toApiRequestResource(): DestinationApiRequestResource {
        return {
            ...(Destination.getApiResourceIdentifier(this.id)!),
            attributes: {
                name: this.name,
                contact: this.contact,
                phone: this.phone,
                email: this.email,
                information: this.notes,
            },
            relationships: {
                location: { data: Location.getApiResourceIdentifier(this.locationId) },
            }
        };
    }
}
