import { BaseModel } from "~/models/BaseModel";

export type BlockedTimeReasonApiResourceIdentifier = { type: "blockedTimeReasons", id: string };

export type BlockedTimeReasonApiResponseResource = BlockedTimeReasonApiResourceIdentifier & {
    name: string,
    is_working_time: boolean,
};

export class BlockedTimeReason extends BaseModel<BlockedTimeReasonApiResourceIdentifier> {
    static override entity = "orm-blocked-time-reasons";
    static override apiResourceType = "blockedTimeReasons" as const;

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),
            isWorkingTime: this.boolean(null),

            sequenceNumber: this.number(null)
        };
    }

    declare id: string;
    declare name: string;

    declare isWorkingTime: boolean | null;

    declare sequenceNumber: number;

    static fromApiResponse(resource: BlockedTimeReasonApiResponseResource) {
        return new BlockedTimeReason({
            id: resource.id,
            name: resource.name,
            isWorkingTime: resource.is_working_time,
        });
    }
}
