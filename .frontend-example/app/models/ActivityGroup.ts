import { Model } from "pinia-orm";

export type ActivityGroupApiResponseResource = {
    id: string,
    type: "activityGroups",
    name: string,
    order_by: number | null, // sequence number
    visible: boolean,
};

export class ActivityGroup extends Model {
    static override entity = "orm-activity-groups";

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),
            sequenceNumber: this.number(null),
            visible: this.boolean(true)
        };
    }

    declare id: string;
    declare name: string;
    declare sequenceNumber: number;
    declare visible: boolean;

    static fromApiResponse(resource: ActivityGroupApiResponseResource) {
        return new ActivityGroup({
            id: resource.id,
            name: resource.name,
            sequenceNumber: resource.order_by,
            visible: resource.visible
        });
    }
}
