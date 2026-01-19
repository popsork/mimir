import { BaseModel } from "~/models/BaseModel";

export type ScheduleEntryApiResourceIdentifier = { type: "schedules", id: string };

type ScheduleEntryApiResourceAttributes = {
    name: string | null,
    minute: string | null,
    hour: string | null,
    month: string | null,
    day_of_week: number | null, // this is a string in DB, but is handled as a number in the API resource
    day_of_month: string | null,
    whole_day: boolean | null,
    time_from: string | null,
    time_till: string | null,
    day: number,
    cron: string | null,
    active_from: string | null,
    active_till: string | null,
    offset_days: number,
};

// cron string is never sent in the request. it is not enterable by the user and is always generated server-side.
type ScheduleEntryApiRequestResourceAttributes = Omit<ScheduleEntryApiResourceAttributes, "cron">;

export type ScheduleEntryApiRequestResource = ScheduleEntryApiResourceIdentifier & {
    attributes: ScheduleEntryApiRequestResourceAttributes,
};

export type ScheduleEntryApiResponseResource = ScheduleEntryApiResourceIdentifier & ScheduleEntryApiResourceAttributes & {

};

export type ScheduleEntryApiResourceFieldName = Exclude<keyof ScheduleEntryApiResponseResource, "id" | "type">;

export class ScheduleEntry extends BaseModel<ScheduleEntryApiResourceIdentifier> {
    static override entity = "orm-schedule-entries";
    static override apiResourceType = "schedules" as const;

    static override fields() {
        return {
            id: this.string(null),

            name: this.string(null),
            minute: this.string(null),
            hour: this.string(null),
            month: this.string(null),
            dayOfWeek: this.number(null),
            dayOfMonth: this.string(null),
            wholeDay: this.boolean(null),
            timeFrom: this.string(null),
            timeTill: this.string(null),
            day: this.number(null),
            cron: this.string(null),
            activeFrom: this.string(null),
            activeTill: this.string(null),
            offsetDays: this.number(null),
        };
    }

    declare id: string;

    declare name: string | null;
    declare minute: string | null;
    declare hour: string | null;
    declare month: string | null;
    declare dayOfWeek: number | null;
    declare dayOfMonth: string | null;
    declare wholeDay: boolean | null;
    declare timeFrom: string | null;
    declare timeTill: string | null;
    declare day: number;
    declare cron: string | null;
    declare activeFrom: string | null;
    declare activeTill: string | null;
    declare offsetDays: number;

    static buildBlank() {
        const record = new ScheduleEntry();
        record.id = generateNewUuid();
        record.hour = "0";
        record.minute = "0";
        record.day = 0;
        record.offsetDays = 0;
        return record;
    }

    static fromApiResponse(resource: ScheduleEntryApiResponseResource) {
        return new ScheduleEntry({
            id: resource.id,
            name: resource.name,
            minute: resource.minute,
            hour: resource.hour,
            month: resource.month,
            dayOfWeek: resource.day_of_week,
            dayOfMonth: resource.day_of_month,
            wholeDay: resource.whole_day,
            timeFrom: resource.time_from,
            timeTill: resource.time_till,
            day: resource.day,
            cron: resource.cron,
            activeFrom: getUtcDatetimeString(resource.active_from),
            activeTill: getUtcDatetimeString(resource.active_till),
            offsetDays: resource.offset_days,
        });
    }

    toApiRequestResource(): ScheduleEntryApiRequestResource {
        return {
            ...(ScheduleEntry.getApiResourceIdentifier(this.id)!),
            attributes: {
                name: this.name,
                minute: this.minute,
                hour: this.hour,
                month: this.month,
                day_of_week: this.dayOfWeek,
                day_of_month: this.dayOfMonth,
                whole_day: this.wholeDay,
                time_from: this.timeFrom,
                time_till: this.timeTill,
                day: this.day,
                active_from: getSystemTimeZoneDatetimeString(this.activeFrom),
                active_till: getSystemTimeZoneDatetimeString(this.activeTill),
                offset_days: this.offsetDays,
            }
        };
    }
}
