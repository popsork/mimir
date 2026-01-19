import { BaseModel } from "~/models/BaseModel";
import { RouteStop, type RouteStopApiResponseResource } from "~/models/RouteStop";
import { Unit, type UnitApiResourceIdentifier, type UnitApiResponseResource } from "~/models/Unit";
import { RouteStatus, type RouteStatusApiResponseResource } from "~/models/RouteStatus";

export type RouteApiResourceIdentifier = { type: "routes", id: string };

type RouteApiRequestAttributes = {
    name: string | null,
    start_at: string | null,
    end_at: string | null,
    line_override: boolean,
    operation_override: boolean,
};

type RouteApiResourceAttributes = RouteApiRequestAttributes & {
    unit_total: number | null,
    customer_total: number | null,
};

export type RouteApiRequestResource = RouteApiResourceIdentifier & {
    attributes: RouteApiRequestAttributes,
    relationships: {
        unit?: { data: UnitApiResourceIdentifier | null },
    },
};

export type RouteApiResponseResource = RouteApiResourceIdentifier & RouteApiResourceAttributes & {
    routeStops?: { data?: RouteStopApiResponseResource[] },
    routeStatus?: { data?: RouteStatusApiResponseResource },
    schedules?: { data?: [] }, // @TODO: Add ScheduleApiResponseResource when TMS-2485 is done
    unit?: { data?: UnitApiResponseResource },
};

export class Route extends BaseModel<RouteApiResourceIdentifier> {
    static override entity = "orm-routes";
    static override apiResourceType = "routes" as const;

    static override fields() {
        return {
            id: this.string(null),

            name: this.string(null),
            startAt: this.string(null),
            endAt: this.string(null),
            lineOverride: this.boolean(false),
            operationOverride: this.boolean(false),
            unitTotal: this.number(null),
            customerTotal: this.number(null),
            schedule: this.string(null),

            routeStops: this.hasMany(RouteStop, "routeId"),
            routeStatus: this.attr(null),
            status: this.string(null),

            unitId: this.string(null),
            unit: this.belongsTo(Unit, "unitId"),
            unitNumber: this.string(null),
        };
    }

    declare id: string;

    declare name: string | null;
    declare startAt: string | null;
    declare endAt: string | null;
    declare lineOverride: boolean;
    declare operationOverride: boolean;
    declare unitTotal: number | null;
    declare unitNumber: string | null;
    declare customerTotal: number | null;
    declare autoDeleteAfterDays: number | null;
    declare schedule: string | null;

    declare routeStops: RouteStop[] | null;
    declare status: TransportOrderStatusName | null;
    declare routeStatus: RouteStatus | null;

    declare unitId: string | null;
    declare unit: Unit | null;

    static buildBlank() {
        const record = new Route();
        record.id = generateNewUuid();
        return record;
    }

    getTotalTimeInMinutes(): number | null {
        const plannedStops = this.routeStops?.filter((routeStop) => routeStop.isPlanned) ?? [];

        const totalInMinutes = plannedStops.reduce((total, routeStop, index, array) => {
            const lastStop = index === array.length - 1;
            total += routeStop.drivingTimeInMinutes ?? 0;
            if (!lastStop) {
                total += routeStop.handlingTimeInMinutes ?? 0;
            }
            return total;
        }, 0);

        if (totalInMinutes == 0) {
            return null;
        }

        return totalInMinutes;
    }

    static fromApiResponse(resource: RouteApiResponseResource) {
        const routeStops = Array.isArray(resource.routeStops?.data)
            ? resource.routeStops.data.map((relatedResource) => {
                const record = RouteStop.fromApiResponse(relatedResource);
                record.routeId = resource.id;
                return record;
            })
            : null;

        const sortedRouteStops = routeStops?.sort((a, b) => a.sequenceNumber - b.sequenceNumber) ?? null;
        const unit = resource.unit?.data ? Unit.fromApiResponse(resource.unit.data) : null;
        const routeStatus = resource.routeStatus?.data ? RouteStatus.fromApiResponse(resource.routeStatus.data) : null;

        return new Route({
            id: resource.id,

            name: resource.name,
            startAt: getUtcDatetimeString(resource.start_at),
            endAt: getUtcDatetimeString(resource.end_at),
            lineOverride: resource.line_override,
            operationOverride: resource.operation_override,
            unitTotal: resource.unit_total,
            customerTotal: resource.customer_total,
            unitNumber: unit?.number ?? null,

            routeStops: sortedRouteStops,
            status: routeStatus?.name ?? null,
            routeStatus,

            unitId: unit?.id ?? null,
            unit,
        });
    }

    toApiRequestResource(): RouteApiRequestResource {
        return {
            ...(Route.getApiResourceIdentifier(this.id)!),
            attributes: {
                name: this.name,
                start_at: getSystemTimeZoneDatetimeString(this.startAt),
                end_at: getSystemTimeZoneDatetimeString(this.endAt),
                line_override: this.lineOverride,
                operation_override: this.operationOverride,
            },
            relationships: {
                unit: { data: Unit.getApiResourceIdentifier(this.unitId ?? null) },
            }
        };
    }
}
