import { BaseModel } from "~/models/BaseModel";
import { ActivityGroup, type ActivityGroupApiResponseResource } from "~/models/ActivityGroup";

export type ActivityApiResourceIdentifier = { type: "activities", id: string };

export type ActivityApiResponseResource = ActivityApiResourceIdentifier & {
    name: string,
    order_by: number, // sequence number
    activityGroup?: { data?: ActivityGroupApiResponseResource },
};

export class Activity extends BaseModel<ActivityApiResourceIdentifier> {
    static override entity = "orm-activities";
    static override apiResourceType = "activities" as const;

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),

            sequenceNumber: this.number(null),
            groupId: this.string(null),
            group: this.belongsTo(ActivityGroup, "groupId"),

            visible: this.boolean(true), // duplicated over from ActivityGroup for easier filtering
        };
    }

    declare id: string;
    declare name: string;

    declare sequenceNumber: number;
    declare groupId: string | null;
    declare group: ActivityGroup | null;

    declare visible: boolean;

    static fromApiResponse(resource: ActivityApiResponseResource) {
        const groupId = resource.activityGroup?.data?.id ?? null;
        const group = resource.activityGroup?.data ? ActivityGroup.fromApiResponse(resource.activityGroup.data) : null;

        return new Activity({
            id: resource.id,
            name: resource.name,
            sequenceNumber: resource.order_by,
            groupId,
            group,
            visible: group ? group.visible : true,
        });
    }
}
