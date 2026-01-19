import { BaseModel } from "~/models/BaseModel";

import { Destination, type DestinationApiResourceIdentifier, type DestinationApiResponseResource } from "~/models/Destination";
import { Zone, type ZoneApiResponseResource } from "~/models/Zone";
import { CustomerOrder, type CustomerOrderApiResourceIdentifier } from "~/models/CustomerOrder";

export type StopApiResourceIdentifier = { type: "stops", id: string };

type StopApiResourceAttributes = {
    order_by: number, // sequence number

    // these values are duplicated from destination
    name: string | null,
    contact: string | null,
    phone: string | null,
    email: string | null,
    notes: string | null, // probably called "inforation" in destination model

    // these values are duplicated from destination->location
    street_name: string | null,
    street_number: string | null,
    postal_code: string | null,
    city: string | null,
    country: string | null,
    latitude: number | null, // float, up to 7 decimal places expected
    longitude: number | null, // float, up to 7 decimal places expected
    accuracy: LocationAccuracy | null,
};

export type StopApiRequestResource = StopApiResourceIdentifier & {
    attributes: StopApiResourceAttributes,
    relationships: {
        order?: { data: CustomerOrderApiResourceIdentifier | null },
        destination?: { data: DestinationApiResourceIdentifier | null },
        // zone never gets updated from the client side, it is read only and should not be passed in a request
    },
};

export type StopApiResponseResource = StopApiResourceIdentifier & StopApiResourceAttributes & {
    destination?: { data?: DestinationApiResponseResource },
    zone?: { data?: ZoneApiResponseResource },
};

export type StopApiResourceFieldName = Exclude<keyof StopApiResponseResource, "id" | "type">;


export class Stop extends BaseModel<StopApiResourceIdentifier> {
    static override entity = "orm-stops";
    static override apiResourceType = "stops" as const;

    static override fields() {
        return {
            id: this.string(null),
            sequenceNumber: this.number(null),

            name: this.string(null),
            contact: this.string(null),
            phone: this.string(null),
            email: this.string(null),
            notes: this.string(null),

            streetName: this.string(null),
            streetNumber: this.string(null),
            postalCode: this.string(null),
            city: this.string(null),
            country: this.string(null),
            latitude: this.number(null),
            longitude: this.number(null),
            accuracy: this.string(null),

            destinationId: this.string(null),
            destination: this.belongsTo(Destination, "destinationId"),

            zoneId: this.string(null),
            zone: this.belongsTo(Zone, "zoneId"),

            customerOrderId: this.string(null),
        };
    }

    declare id: string;
    declare sequenceNumber: number;

    declare name: string | null;
    declare contact: string | null;
    declare phone: string | null;
    declare email: string | null;
    declare notes: string | null;

    declare streetName: string | null;
    declare streetNumber: string | null;
    declare postalCode: string | null;
    declare city: string | null;
    declare country: string | null;
    declare latitude: number | null;
    declare longitude: number | null;
    declare accuracy: LocationAccuracy | null;

    declare destinationId: string | null;
    declare destination: Destination | null;

    declare zoneId: string | null;
    declare zone: Zone | null;

    declare customerOrderId: string;

    getLabel() {
        // the labels are constructed identically for destinations and stops, only the values come from different places
        return Destination.buildLabel({
            name: this.name,
            streetName: this.streetName,
            streetNumber: this.streetNumber,
            postalCode: this.postalCode,
            city: this.city,
            country: this.country,
        });
    }

    clear() {
        this.name = null;
        this.contact = null;
        this.phone = null;
        this.email = null;
        this.notes = null;

        this.streetName = null;
        this.streetNumber = null;
        this.postalCode = null;
        this.city = null;
        this.country = null;
        this.latitude = null;
        this.longitude = null;
        this.accuracy = null;

        this.destinationId = null;
        this.destination = null;
        this.zoneId = null;
        this.zone = null;
    }

    static buildBlank(
        { customerOrderId, sequenceNumber }:
        { customerOrderId: string, sequenceNumber: number }
    ) {
        const record = new Stop();
        record.id = generateNewUuid();
        record.sequenceNumber = sequenceNumber;
        record.customerOrderId = customerOrderId;
        return record;
    }

    static fromApiResponse(resource: StopApiResponseResource) {
        return new Stop({
            id: resource.id,
            sequenceNumber: resource.order_by,

            name: resource.name,
            contact: resource.contact,
            phone: resource.phone,
            email: resource.email,
            notes: resource.notes,

            streetName: resource.street_name,
            streetNumber: resource.street_number,
            postalCode: resource.postal_code,
            city: resource.city,
            country: resource.country,
            latitude: resource.latitude,
            longitude: resource.longitude,
            accuracy: resource.accuracy,

            destinationId: resource.destination?.data?.id ?? null,
            destination: resource.destination?.data ? Destination.fromApiResponse(resource.destination.data) : null,

            zoneId: resource.zone?.data?.id ?? null,
            zone: resource.zone?.data ? Zone.fromApiResponse(resource.zone.data) : null,
        });
    }

    toApiRequestResource(): StopApiRequestResource {
        return {
            ...(Stop.getApiResourceIdentifier(this.id)!),
            attributes: {
                order_by: this.sequenceNumber,

                name: this.name,
                contact: this.contact,
                phone: this.phone,
                email: this.email,
                notes: this.notes,

                street_name: this.streetName,
                street_number: this.streetNumber,
                postal_code: this.postalCode,

                city: this.city,
                country: this.country,
                latitude: this.latitude,
                longitude: this.longitude,
                accuracy: this.accuracy,
            },
            relationships: {
                order: { data: CustomerOrder.getApiResourceIdentifier(this.customerOrderId) },
                destination: { data: Destination.getApiResourceIdentifier(this.destinationId) },
            }
        };
    }
}
