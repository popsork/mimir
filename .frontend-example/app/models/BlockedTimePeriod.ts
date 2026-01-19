import { BaseModel } from "~/models/BaseModel";
import { Unit, type UnitApiResourceIdentifier, type UnitApiResponseResource } from "~/models/Unit";
import { BlockedTimeReason, type BlockedTimeReasonApiResourceIdentifier, type BlockedTimeReasonApiResponseResource } from "~/models/BlockedTimeReason";

export type BlockedTimePeriodApiResourceIdentifier = { type: "blockedTimePeriods", id: string };

type BlockedTimePeriodApiResourceAttributes = {
    starts_at: string | null,
    ends_at: string | null,
};

export type BlockedTimePeriodApiRequestResource = BlockedTimePeriodApiResourceIdentifier & {
    attributes: BlockedTimePeriodApiResourceAttributes,
    relationships: {
        unit: { data: UnitApiResourceIdentifier | null },
        blockedTimeReason: { data: BlockedTimeReasonApiResourceIdentifier | null },
    },
};

export type BlockedTimePeriodPartialApiRequestResource = BlockedTimePeriodApiResourceIdentifier & {
    attributes: BlockedTimePeriodApiResourceAttributes,
};

export type BlockedTimePeriodApiResponseResource = BlockedTimePeriodApiResourceIdentifier & BlockedTimePeriodApiResourceAttributes & {
    unit: { data?: UnitApiResponseResource },
    blockedTimeReason: { data?: BlockedTimeReasonApiResponseResource },
};

export class BlockedTimePeriod extends BaseModel<BlockedTimePeriodApiResourceIdentifier> {
    static override entity = "orm-blocked-time-periods" as const;
    static override apiResourceType = "blockedTimePeriods" as const;

    static override fields() {
        return {
            id: this.string(null),

            startsAt: this.string(null),
            endsAt: this.string(null),

            unitId: this.string(null),
            unit: this.belongsTo(Unit, "unitId"),

            reasonId: this.string(null),
            reason: this.belongsTo(BlockedTimeReason, "reasonId"),
            // store some reason values on the period itself to avoid having to load the reason relation from repo
            reasonName: this.string(null),
            isWorkingTime: this.boolean(null),
        };
    }

    declare id: string;

    declare startsAt: string | null;
    declare endsAt: string | null;


    declare unitId: string | null;
    declare unit: Unit | null;

    declare reasonId: string | null;
    declare reason: BlockedTimeReason | null;
    declare reasonName: string | null;
    declare isWorkingTime: boolean | null;

    static buildBlank() {
        const record = new BlockedTimePeriod();
        record.id = generateNewUuid();
        return record;
    }

    static fromApiResponse(resource: BlockedTimePeriodApiResponseResource) {

        const reason = resource.blockedTimeReason?.data ? BlockedTimeReason.fromApiResponse(resource.blockedTimeReason.data) : null;

        return new BlockedTimePeriod({
            id: resource.id,

            startsAt: getUtcDatetimeString(resource.starts_at),
            endsAt: getUtcDatetimeString(resource.ends_at),

            unitId: resource.unit?.data?.id ?? null,
            unit: resource.unit?.data ? Unit.fromApiResponse(resource.unit.data) : null,

            reasonId: resource.blockedTimeReason?.data?.id ?? null,
            reason,
            reasonName: reason?.name ?? null,
            isWorkingTime: reason?.isWorkingTime ?? null,
        });
    }

    toApiRequestResource(): BlockedTimePeriodApiRequestResource {
        return {
            ...(BlockedTimePeriod.getApiResourceIdentifier(this.id)!),
            attributes: {
                starts_at: getSystemTimeZoneDatetimeString(this.startsAt),
                ends_at: getSystemTimeZoneDatetimeString(this.endsAt),
            },
            relationships: {
                unit: { data: Unit.getApiResourceIdentifier(this.unitId) },
                blockedTimeReason: { data: BlockedTimeReason.getApiResourceIdentifier(this.reasonId) },
            }
        };
    }

    static buildTimesUpdateApiRequestResource(
        { id, startsAt, endsAt }:
        { id: string, startsAt: string, endsAt: string }
    ) {
        const partialResource: BlockedTimePeriodPartialApiRequestResource = {
            id,
            type: "blockedTimePeriods",
            attributes: {
                starts_at: getSystemTimeZoneDatetimeString(startsAt),
                ends_at: getSystemTimeZoneDatetimeString(endsAt),
            },
        };
        return partialResource;
    }

}
