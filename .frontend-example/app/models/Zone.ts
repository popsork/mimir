import { Model } from "pinia-orm";

export type ZoneApiResponseResource = {
    id: string,
    type: "zones",
    name: string,
};

export class Zone extends Model {
    static override entity = "orm-zones";

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null)
        };
    }

    declare id: string;
    declare name: string;

    static buildDummyApiResponseResource(id: string): ZoneApiResponseResource {
        return {
            id,
            type: "zones" as const,
            name: `Example zone ${id}`
        };
    }

    static fromApiResponse(resource: ZoneApiResponseResource) {
        return new Zone({
            id: resource.id,
            name: resource.name
        });
    }
}
