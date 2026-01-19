import { BaseModel } from "~/models/BaseModel";

export type TrackingEventApiResourceIdentifier = { type: "trackingEvents", id: string };


export type TrackingEventApiResponseResource = TrackingEventApiResourceIdentifier & {
    event_name: ActionType | null,
    location_city: string | null,
    created_at: string,
};

export class TrackingEvent extends BaseModel<TrackingEventApiResourceIdentifier> {
    static override entity = "orm-tracking-events";
    static override apiResourceType = "trackingEvents" as const;

    static override fields() {
        return {
            id: this.string(null),
            eventType: this.string(null),
            city: this.string(null),
            createdAt: this.string(null),
        };
    }

    declare id: string;
    declare eventType: ActionType | null;
    declare city: string | null;
    declare createdAt: string;

    static fromApiResponse(resource: TrackingEventApiResponseResource) {
        return new TrackingEvent({
            id: resource.id,
            eventType: resource.event_name,
            city: resource.location_city,
            createdAt: getUtcDatetimeString(resource.created_at),
        });
    }
}
