import { BaseModel } from "~/models/BaseModel";

import { Unit, type UnitApiResourceIdentifier, type UnitApiResponseResource } from "~/models/Unit";
import { Line, type LineApiResourceIdentifier, type LineApiResponseResource } from "~/models/Line";
import { Operation, type OperationApiResourceIdentifier, type OperationApiResponseResource } from "~/models/Operation";
import { TransportOrderStage, type TransportOrderStageApiResourceIdentifier, type TransportOrderStageApiResponseResource } from "~/models/TransportOrderStage";
import { Stop, type StopApiResourceIdentifier, type StopApiResponseResource } from "~/models/Stop";
import { CustomerOrder, type CustomerOrderApiResourceIdentifier } from "~/models/CustomerOrder";
import { TransportOrderStatus, type TransportOrderStatusApiResponseResource } from "~/models/TransportOrderStatus";
import { TrackingEvent, type TrackingEventApiResponseResource } from "~/models/TrackingEvent";


export type TransportOrderApiResourceIdentifier = { type: "transportOrders", id: string };

type TransportOrderApiResourceAttributes = {
    order_by: number, // sequence number
    number: string | null,
    driver_instructions: string | null,
    pickup_earliest_at: string | null,
    pickup_earliest_at_is_manual: boolean,
    pickup_latest_at: string | null,
    pickup_latest_at_is_manual: boolean,
    delivery_earliest_at: string | null,
    delivery_earliest_at_is_manual: boolean,
    delivery_latest_at: string | null,
    delivery_latest_at_is_manual: boolean,

    amount: number | null, // integer, precision in separate attribute, calculated value indicates major units
    amount_precision: number | null, // integer

    driving_distance: number | null, // integer, in kilometres (rounded)
    driving_time: number | null, // integer, in minutes (rounded)

    auto_dispatch: boolean,
};

// some attributes are not sent in the request, as they are always displayed as read only
type TransportOrderApiRequestResourceAttributes = Omit<
    TransportOrderApiResourceAttributes,
    "number" | "amount" | "amount_precision" | "driving_distance" | "driving_time"
>;

export type TransportOrderApiRequestResource = TransportOrderApiResourceIdentifier & {
    attributes: TransportOrderApiRequestResourceAttributes,
    relationships: {
        order?: { data: CustomerOrderApiResourceIdentifier | null },
        pickup?: { data: StopApiResourceIdentifier | null },
        delivery?: { data: StopApiResourceIdentifier | null },
        unit?: { data: UnitApiResourceIdentifier | null },
        line?: { data: LineApiResourceIdentifier | null },
        operation?: { data: OperationApiResourceIdentifier | null },
        transportOrderStage?: { data: TransportOrderStageApiResourceIdentifier | null },
        // transportOrderStatus relationship is not sent in the request, as it is always set by the server
        // and changing a status means creating the new status record directly
    },
};

export type TransportOrderPartialApiRequestResource = TransportOrderApiResourceIdentifier & {
    attributes: Partial<TransportOrderApiRequestResourceAttributes>,
};

export type TransportOrderApiResponseResource = TransportOrderApiResourceIdentifier & TransportOrderApiResourceAttributes & {
    pickup?: { data?: StopApiResponseResource },
    delivery?: { data?: StopApiResponseResource },
    unit?: { data?: UnitApiResponseResource },
    line?: { data?: LineApiResponseResource },
    operation?: { data?: OperationApiResponseResource },
    transportOrderStage?: { data?: TransportOrderStageApiResponseResource },
    transportOrderStatus?: { data?: TransportOrderStatusApiResponseResource },
    latestTrackingEvent?: { data?: TrackingEventApiResponseResource },
};

export type TransportOrderApiResourceFieldName = Exclude<keyof TransportOrderApiResponseResource, "id" | "type">;

export class TransportOrder extends BaseModel<TransportOrderApiResourceIdentifier> {
    static override entity = "orm-transport-orders" as const;
    static override apiResourceType = "transportOrders" as const;

    static override fields() {
        return {
            id: this.string(null),
            sequenceNumber: this.number(null),

            number: this.string(null),

            pickupStopId: this.string(null),
            pickupStop: this.belongsTo(Stop, "pickupStopId"),

            deliveryStopId: this.string(null),
            deliveryStop: this.belongsTo(Stop, "deliveryStopId"),

            unitId: this.string(null),
            unit: this.belongsTo(Unit, "unitId"),

            lineId: this.string(null),
            line: this.belongsTo(Line, "lineId"),

            operationId: this.string(null),
            operation: this.belongsTo(Operation, "operationId"),

            stageId: this.string(null),
            stage: this.belongsTo(TransportOrderStage, "stageId"),

            statusId: this.string(null),
            status: this.belongsTo(TransportOrderStatus, "statusId"),

            latestTrackingEventId: this.string(null),
            latestTrackingEvent: this.belongsTo(TrackingEvent, "latestTrackingEventId"),

            driverInstructions: this.string(null),

            departureStart: this.string(null),
            departureStartIsManual: this.boolean(false),
            departureEnd: this.string(null),
            departureEndIsManual: this.boolean(false),
            arrivalStart: this.string(null),
            arrivalStartIsManual: this.boolean(false),
            arrivalEnd: this.string(null),
            arrivalEndIsManual: this.boolean(false),

            amount: this.number(null),
            amountPrecision: this.number(null),

            drivingDistanceInKilometres: this.number(null),
            drivingTimeInMinutes: this.number(null),

            autoDispatch: this.boolean(false),

            customerOrderId: this.string(null),
        };
    }

    declare id: string;
    declare sequenceNumber: number;

    declare number: string | null;

    declare pickupStopId: string | null;
    declare pickupStop: Stop | null;

    declare deliveryStopId: string | null;
    declare deliveryStop: Stop | null;

    declare unitId: string | null;
    declare unit: Unit | null;

    declare lineId: string | null;
    declare line: Line | null;

    declare operationId: string | null;
    declare operation: Operation | null;

    declare stageId: string | null;
    declare stage: TransportOrderStage | null;

    declare statusId: string | null;
    declare status: TransportOrderStatus | null;

    declare latestTrackingEventId: string | null;
    declare latestTrackingEvent: TrackingEvent | null;

    declare driverInstructions: string | null;

    declare departureStart: string | null;
    declare departureStartIsManual: boolean;
    declare departureEnd: string | null;
    declare departureEndIsManual: boolean;
    declare arrivalStart: string | null;
    declare arrivalStartIsManual: boolean;
    declare arrivalEnd: string | null;
    declare arrivalEndIsManual: boolean;

    declare amount: number | null;
    declare amountPrecision: number | null;

    declare drivingDistanceInKilometres: number | null;
    declare drivingTimeInMinutes: number | null;

    declare autoDispatch: boolean;

    declare customerOrderId: string;

    static buildBlank(
        { customerOrderId, pickupStopId, deliveryStopId }:
        { customerOrderId: string, pickupStopId: string, deliveryStopId: string }
    ) {
        const record = new TransportOrder();
        record.id = generateNewUuid();
        record.customerOrderId = customerOrderId;
        record.sequenceNumber = 0; // currently always 0 until work on TMS-1065 gets resumed
        record.pickupStopId = pickupStopId;
        record.deliveryStopId = deliveryStopId;
        record.autoDispatch = false;
        return record;
    }

    static fromApiResponse(resource: TransportOrderApiResponseResource) {
        return new TransportOrder({
            id: resource.id,
            sequenceNumber: resource.order_by,
            number: resource.number,

            pickupStopId: resource.pickup?.data?.id ?? null,
            pickupStop: resource.pickup?.data ? Stop.fromApiResponse(resource.pickup.data) : null,

            deliveryStopId: resource.delivery?.data?.id ?? null,
            deliveryStop: resource.delivery?.data ? Stop.fromApiResponse(resource.delivery.data) : null,

            unitId: resource.unit?.data?.id ?? null,
            unit: resource.unit?.data ? Unit.fromApiResponse(resource.unit.data) : null,

            lineId: resource.line?.data?.id ?? null,
            line: resource.line?.data ? Line.fromApiResponse(resource.line.data) : null,

            operationId: resource.operation?.data?.id ?? null,
            operation: resource.operation?.data ? Operation.fromApiResponse(resource.operation.data) : null,

            stageId: resource.transportOrderStage?.data?.id ?? null,
            stage: resource.transportOrderStage?.data ? TransportOrderStage.fromApiResponse(resource.transportOrderStage.data) : null,

            statusId: resource.transportOrderStatus?.data?.id ?? null,
            status: resource.transportOrderStatus?.data ? TransportOrderStatus.fromApiResponse(resource.transportOrderStatus.data) : null,

            latestTrackingEventId: resource.latestTrackingEvent?.data?.id ?? null,
            latestTrackingEvent: resource.latestTrackingEvent?.data ? TrackingEvent.fromApiResponse(resource.latestTrackingEvent.data) : null,

            driverInstructions: resource.driver_instructions,

            departureStart: getUtcDatetimeString(resource.pickup_earliest_at),
            departureStartIsManual: resource.pickup_earliest_at_is_manual,
            departureEnd: getUtcDatetimeString(resource.pickup_latest_at),
            departureEndIsManual: resource.pickup_latest_at_is_manual,
            arrivalStart: getUtcDatetimeString(resource.delivery_earliest_at),
            arrivalStartIsManual: resource.delivery_earliest_at_is_manual,
            arrivalEnd: getUtcDatetimeString(resource.delivery_latest_at),
            arrivalEndIsManual: resource.delivery_latest_at_is_manual,

            amount: resource.amount,
            amountPrecision: resource.amount_precision,

            drivingDistanceInKilometres: resource.driving_distance,
            drivingTimeInMinutes: resource.driving_time,

            autoDispatch: resource.auto_dispatch,
        });
    }


    toApiRequestResource(): TransportOrderApiRequestResource {
        return {
            ...(TransportOrder.getApiResourceIdentifier(this.id)!),
            attributes: {
                order_by: this.sequenceNumber,
                driver_instructions: this.driverInstructions,
                pickup_earliest_at: getSystemTimeZoneDatetimeString(this.departureStart),
                pickup_earliest_at_is_manual: this.departureStartIsManual,
                pickup_latest_at: getSystemTimeZoneDatetimeString(this.departureEnd),
                pickup_latest_at_is_manual: this.departureEndIsManual,
                delivery_earliest_at: getSystemTimeZoneDatetimeString(this.arrivalStart),
                delivery_earliest_at_is_manual: this.arrivalStartIsManual,
                delivery_latest_at: getSystemTimeZoneDatetimeString(this.arrivalEnd),
                delivery_latest_at_is_manual: this.arrivalEndIsManual,
                auto_dispatch: this.autoDispatch,
            },
            relationships: {
                order: { data: CustomerOrder.getApiResourceIdentifier(this.customerOrderId) },
                pickup: { data: Stop.getApiResourceIdentifier(this.pickupStopId) },
                delivery: { data: Stop.getApiResourceIdentifier(this.deliveryStopId) },
                unit: { data: Unit.getApiResourceIdentifier(this.unitId) },
                line: { data: Line.getApiResourceIdentifier(this.lineId) },
                operation: { data: Operation.getApiResourceIdentifier(this.operationId) },
                transportOrderStage: { data: TransportOrderStage.getApiResourceIdentifier(this.stageId) },
            }
        };
    }

    static buildTimesUpdateApiRequestResource(
        { id, startsAt, endsAt }:
        { id: string, startsAt: string, endsAt: string }
    ) {
        const partialResource: TransportOrderPartialApiRequestResource = {
            id,
            type: "transportOrders",
            attributes: {
                pickup_earliest_at: getSystemTimeZoneDatetimeString(startsAt),
                pickup_earliest_at_is_manual: true,
                pickup_latest_at: getSystemTimeZoneDatetimeString(startsAt),
                pickup_latest_at_is_manual: true,
                delivery_earliest_at: getSystemTimeZoneDatetimeString(endsAt),
                delivery_earliest_at_is_manual: true,
                delivery_latest_at: getSystemTimeZoneDatetimeString(endsAt),
                delivery_latest_at_is_manual: true,
            }
        };
        return partialResource;
    }

}
