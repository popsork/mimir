import { BaseModel, type ModelEntityNames } from "~/models/BaseModel";
import { Action, type ActionApiResourceIdentifier, type ActionApiResponseResource } from "~/models/Action";
import {
    TransportOrder,
    type TransportOrderApiResourceIdentifier,
    type TransportOrderApiResponseResource
} from "~/models/TransportOrder";
import {
    CustomerOrder,
    type CustomerOrderApiResourceIdentifier,
    type CustomerOrderApiResponseResource
} from "~/models/CustomerOrder";

const ACTIONABLE_MODELS = [TransportOrder, CustomerOrder];

type ActionableModel = typeof ACTIONABLE_MODELS[number];

type ActionableModelEntityName = ModelEntityNames<typeof ACTIONABLE_MODELS>;
type ActionableRecord = InstanceType<(typeof ACTIONABLE_MODELS)[number]>;

type ActionableModelApiResourceIdentifier = TransportOrderApiResourceIdentifier | CustomerOrderApiResourceIdentifier;
type ActionableModelApiResponseResource = TransportOrderApiResponseResource | CustomerOrderApiResponseResource;

export type TransportOrderActionExecutionContext = {
    unit_id: string | null,
    status: TransportOrderStatusName,
};

export type ScheduleDispatchTransportOrderActionExecutionContext = TransportOrderActionExecutionContext & {
    create_action_execution_context: {
        unit_id: string | null,
        status: TransportOrderStatusName,
        execute_at: string | null,
        rollback_interval: string | null,
    },
};

export type CompleteTransportOrderActionExecutionContext = {
    unit_id: string | null,
    status: TransportOrderStatusName,
    created_at: string | null,
};

export type CompleteAndVerifyTransportOrderActionExecutionContext = CompleteTransportOrderActionExecutionContext & {
    create_action_execution_context: {
        status: TransportOrderStatusName,
    },
};

type ActionExecutionContext =
    TransportOrderActionExecutionContext
    | ScheduleDispatchTransportOrderActionExecutionContext;

export type ActionExecutionApiResourceIdentifier = { type: "actionExecutions", id: string };

type ActionExecutionApiResourceAttributes = {
    context: ActionExecutionContext | null,
    execute_at: string | null,
    rollback_at: string | null,
    rollback_interval: string | null,
    dispatched_at: string | null,
    performed_at: string | null,
};

// context is not returned in the response for some reason
type ActionExecutionApiResponseResourceAttributes = Omit<
    ActionExecutionApiResourceAttributes,
    "context" | "rollback_interval"
>;

// rollback_at is not passed along with request, as it is calculated on the server from rollback_interval
// dispatched_at and performed_at are not passed along as they are always set by the server
type ActionExecutionApiRequestResourceAttributes = Omit<
    ActionExecutionApiResourceAttributes,
    "rollback_at" | "dispatched_at" | "performed_at"
>;


export type ActionExecutionApiResponseResource =
    ActionExecutionApiResourceIdentifier
    & ActionExecutionApiResponseResourceAttributes
    & {
        action?: { data: ActionApiResponseResource | null },
        actionable?: { data: ActionableModelApiResponseResource | null },
    };

export type ActionExecutionApiRequestResource = ActionExecutionApiResourceIdentifier & {
    attributes: ActionExecutionApiRequestResourceAttributes,
    relationships: {
        action?: { data: ActionApiResourceIdentifier | null },
        actionable?: { data: ActionableModelApiResourceIdentifier | null },
    },
};

export class ActionExecution extends BaseModel<ActionExecutionApiResourceIdentifier> {
    static override entity = "orm-action-executions";
    static override apiResourceType = "actionExecutions" as const;

    static override fields() {
        return {
            id: this.string(null),
            context: this.attr(null),

            rollbackInterval: this.string(null),
            rollbackAt: this.string(null),
            executeAt: this.string(null),
            dispatchedAt: this.string(null),
            performedAt: this.string(null),

            actionId: this.string(null),
            action: this.belongsTo(Action, "action_id"),

            actionableRecordId: this.string(null),
            actionableEntityName: this.string(null),
            actionableRecord: this.morphTo(
                ACTIONABLE_MODELS,
                "actionableRecordId",
                "actionableEntityName"
            )
        };
    }

    declare id: string;
    declare context: ActionExecutionContext | null;

    declare rollbackInterval: string | null;
    declare rollbackAt: string | null;
    declare executeAt: string | null;
    declare dispatchedAt: string | null;
    declare performedAt: string | null;

    declare actionId: string;
    declare action: Action;

    declare actionableRecordId: string | null;
    declare actionableEntityName: ActionableModelEntityName | null;
    declare actionableRecord: ActionableRecord | null;

    static buildBlank() {
        const record = new ActionExecution();
        record.id = generateNewUuid();
        return record;
    }

    setRollbackIntervalInMinutes(minutes: number | null) {
        this.rollbackInterval = (minutes !== null) ? `${minutes}M` : null;
    }

    setActionableRecord(record: ActionableRecord | null) {
        this.actionableRecordId = (record) ? record.id : null;
        this.actionableEntityName = (record) ? (record.constructor as ActionableModel).entity : null;
        this.actionableRecord = record;
    }

    static fromApiResponse(resource: ActionExecutionApiResponseResource) {
        const record = new ActionExecution({
            id: resource.id,

            rollbackAt: getUtcDatetimeString(resource.rollback_at),
            executeAt: getUtcDatetimeString(resource.execute_at),
            dispatchedAt: getUtcDatetimeString(resource.dispatched_at),
            performedAt: getUtcDatetimeString(resource.performed_at),

            actionId: resource.action?.data?.id ?? null,
            action: resource.action?.data ? Action.fromApiResponse(resource.action.data) : null,
        });

        if (resource.actionable?.data) {
            let actionableRecord: ActionableRecord;
            switch (resource.actionable.data.type) {
                case "transportOrders":
                    actionableRecord = TransportOrder.fromApiResponse(resource.actionable.data);
                    break;
                case "orders":
                    actionableRecord = CustomerOrder.fromApiResponse(resource.actionable.data);
                    break;
            }
            record.setActionableRecord(actionableRecord);
        }

        return record;
    }

    toApiRequestResource(): ActionExecutionApiRequestResource {
        return {
            ...(ActionExecution.getApiResourceIdentifier(this.id)!),
            attributes: {
                execute_at: getSystemTimeZoneDatetimeString(this.executeAt),
                context: this.context,
                rollback_interval: this.rollbackInterval,
            },
            relationships: {
                action: { data: Action.getApiResourceIdentifier(this.actionId) },
                actionable: { data: this.actionableRecord?.getApiResourceIdentifier() ?? null }
            },
        };
    }
}
