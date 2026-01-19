import { BaseModel } from "~/models/BaseModel";

import { Route, type RouteApiResourceIdentifier } from "~/models/Route";
import { Stop, type StopApiResourceIdentifier, type StopApiResponseResource } from "~/models/Stop";

import { TransportOrder, type TransportOrderApiResourceIdentifier, type TransportOrderApiResponseResource } from "~/models/TransportOrder";
import {
    Destination,
    type DestinationApiResourceIdentifier,
    type DestinationApiResponseResource
} from "~/models/Destination";

export type RouteStopApiResourceIdentifier = { type: "routeStops", id: string };

type RouteStopApiResourceAttributes = {
    order_by: number, // sequence number. null means route stop is not yet planned in route
    route_stop_type: RouteStopType,
    is_planned: boolean,
    handling_time_in_minutes: number | null, // integer
    driving_time_in_minutes: number | null, // integer
    estimated_arrival_at: string | null,
};

export type RouteStopApiRequestResource = RouteStopApiResourceIdentifier & {
    attributes: RouteStopApiResourceAttributes,
    relationships: {
        route?: { data: RouteApiResourceIdentifier | null },
        stop?: { data: StopApiResourceIdentifier | null },
        destination?: { data: DestinationApiResourceIdentifier | null },
        transportOrder?: { data: TransportOrderApiResourceIdentifier | null },
    },
};

export type RouteStopApiResponseResource = RouteStopApiResourceIdentifier & RouteStopApiResourceAttributes & {
    stop: { data?: StopApiResponseResource },
    destination: { data?: DestinationApiResponseResource },
    transportOrder: { data?: TransportOrderApiResponseResource },
};

export class RouteStop extends BaseModel<RouteStopApiResourceIdentifier> {
    static override entity = "orm-route-stops";
    static override apiResourceType = "routeStops" as const;

    static override fields() {
        return {
            id: this.string(null),

            stopId: this.string(null),
            destinationId: this.string(null),
            transportOrderId: this.string(null),
            // there are no stop/transportOrder belongsTo relationships because we're not using those records
            // and only need the IDs for linking purposes.
            // all needed values loaded from the stop are duplicated on the route stop itself

            sequenceNumber: this.number(null),
            routeStopType: this.string(null),
            isPlanned: this.boolean(false),
            handlingTimeInMinutes: this.number(null),
            drivingTimeInMinutes: this.number(null),
            estimatedArrivalAt: this.string(null),

            routeId: this.string(null),

            // these fields are duplicated on the route stop from the stop or destination relationships for easier access
            name: this.string(null),
            city: this.string(null),
            latitude: this.number(null),
            longitude: this.number(null),
        };
    }

    declare id: string;
    declare stopId: string | null;
    declare destinationId: string | null;
    declare transportOrderId: string | null;

    declare sequenceNumber: number;
    declare routeStopType: RouteStopType;
    declare isPlanned: boolean;
    declare handlingTimeInMinutes: number | null;
    declare drivingTimeInMinutes: number | null;
    declare estimatedArrivalAt: string | null;

    declare routeId: string;

    declare name: string | null;
    declare city: string | null;
    declare latitude: number | null;
    declare longitude: number | null;

    hasCoordinates(): boolean {
        if (this.latitude === null || this.longitude === null) {
            return false;
        }
        if (this.latitude === 0 && this.longitude === 0) {
            return false;
        }
        return true;
    }

    static buildBlank(
        { routeId, routeStopType }:
        { routeId: string, routeStopType: RouteStopType }
    ) {
        const record = new RouteStop();
        record.id = generateNewUuid();
        record.routeId = routeId;
        record.routeStopType = routeStopType;
        return record;
    }

    static fromApiResponse(resource: RouteStopApiResponseResource) {
        const stop = resource.stop?.data ? Stop.fromApiResponse(resource.stop.data) : null;
        const destination = resource.destination?.data ? Destination.fromApiResponse(resource.destination.data) : null;

        return new RouteStop({
            id: resource.id,

            stopId: resource.stop?.data?.id ?? null,
            destinationId: resource.destination?.data?.id ?? null,
            transportOrderId: resource.transportOrder?.data?.id ?? null,

            sequenceNumber: resource.order_by,
            routeStopType: resource.route_stop_type,
            isPlanned: resource.is_planned,
            handlingTimeInMinutes: resource.handling_time_in_minutes,
            drivingTimeInMinutes: resource.driving_time_in_minutes,
            estimatedArrivalAt: getUtcDatetimeString(resource.estimated_arrival_at),

            name: (stop) ? stop.name : (destination?.name ?? null),
            city: (stop) ? stop.city : (destination?.location?.city ?? null),
            latitude: (stop) ? stop.latitude : (destination?.location?.latitude ?? null),
            longitude: (stop) ? stop.longitude : (destination?.location?.longitude ?? null),
        });
    }

    toApiRequestResource(): RouteStopApiRequestResource {
        return {
            ...(RouteStop.getApiResourceIdentifier(this.id)!),
            attributes: {
                order_by: this.sequenceNumber,
                route_stop_type: this.routeStopType,
                is_planned: this.isPlanned,
                handling_time_in_minutes: this.handlingTimeInMinutes,
                driving_time_in_minutes: this.drivingTimeInMinutes,
                estimated_arrival_at: getSystemTimeZoneDatetimeString(this.estimatedArrivalAt),
            },
            relationships: {
                route: { data: Route.getApiResourceIdentifier(this.routeId) },
                stop: { data: Stop.getApiResourceIdentifier(this.stopId) },
                destination: { data: Destination.getApiResourceIdentifier(this.destinationId) },
                transportOrder: { data: TransportOrder.getApiResourceIdentifier(this.transportOrderId) },
            },
        };
    }
}
