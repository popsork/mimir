import { BaseModel } from "~/models/BaseModel";

export type RouteSettingsApiResourceIdentifier = { type: "routeSettings", id: string };

type RouteSettingsApiResourceAttributes = {
    counter_start: number | null,
    default_load_time_per_order: number | null,
    default_unload_time_per_order: number | null,
};

export type RouteSettingsApiRequestResource = RouteSettingsApiResourceIdentifier & {
    attributes: RouteSettingsApiResourceAttributes,
};

export type RouteSettingsApiResponseResource = RouteSettingsApiResourceIdentifier & RouteSettingsApiResourceAttributes;

export type RouteSettingsApiResourceFieldName = Exclude<keyof RouteSettingsApiResponseResource, "id" | "type">;

export class RouteSettings extends BaseModel<RouteSettingsApiResourceIdentifier> {
    static override entity = "orm-route-settings";
    static override apiResourceType = "route-settings" as const;

    static override fields() {
        return {
            id: this.string(null),

            counterStart: this.number(null),

            defaultOrderLoadingTimeInMinutes: this.number(null),
            defaultOrderUnloadingTimeInMinutes: this.number(null),

            defaultOrderHandlingTimeInMinutes: this.number(0),
        };
    }

    declare id: string;

    declare counterStart: number | null;
    declare defaultOrderLoadingTimeInMinutes: number | null;
    declare defaultOrderUnloadingTimeInMinutes: number | null;

    declare defaultOrderHandlingTimeInMinutes: number;

    static fromApiResponse(resource: RouteSettingsApiResponseResource) {
        return new RouteSettings({
            id: resource.id,

            counterStart: resource.counter_start,
            defaultOrderLoadingTimeInMinutes: resource.default_load_time_per_order,
            defaultOrderUnloadingTimeInMinutes: resource.default_unload_time_per_order,

            defaultOrderHandlingTimeInMinutes: (resource.default_load_time_per_order ?? 0) + (resource.default_unload_time_per_order ?? 0),
        });
    }
}
