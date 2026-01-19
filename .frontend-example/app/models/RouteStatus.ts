import { BaseModel } from "~/models/BaseModel";
import { Route, type RouteApiResourceIdentifier, type RouteApiResponseResource } from "~/models/Route";

export type RouteStatusApiResourceIdentifier = { type: "routeStatuses", id: string };

export type RouteStatusApiResourceAttributes = {
    name: TransportOrderStatusName,
};

export type RouteStatusApiResponseResource = RouteStatusApiResourceIdentifier & RouteStatusApiResourceAttributes & {
    route: { data?: RouteApiResponseResource },
};

export type RouteStatusApiRequestResource = RouteStatusApiResourceIdentifier & {
    attributes: RouteStatusApiResourceAttributes,
    relationships: {
        route: { data: RouteApiResourceIdentifier | null },
    },
};

export class RouteStatus extends BaseModel<RouteStatusApiResourceIdentifier> {
    static override entity = "orm-transport-order-statuses";
    static override apiResourceType = "routeStatuses" as const;

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),
            routeId: this.string(null),
        };
    }

    declare id: string;
    declare name: TransportOrderStatusName;
    declare routeId: string;

    static fromApiResponse(resource: RouteStatusApiResponseResource) {
        return new RouteStatus({
            id: resource.id,
            name: resource.name,
        });
    }

    static buildBlank(
        { routeId, name }:
        { routeId: string, name: TransportOrderStatusName }
    ) {
        const record = new RouteStatus();
        record.id = generateNewUuid();
        record.routeId = routeId;
        record.name = name;
        return record;
    }

    toApiRequestResource(): RouteStatusApiRequestResource {
        return {
            ...(RouteStatus.getApiResourceIdentifier(this.id)!),
            attributes: {
                name: this.name,
            },
            relationships: {
                route: { data: Route.getApiResourceIdentifier(this.routeId) }
            }
        };
    }
}
