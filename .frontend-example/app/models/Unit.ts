import { BaseModel } from "~/models/BaseModel";

export type UnitApiResourceIdentifier = { type: "units", id: string };

export type UnitApiResponseResource = UnitApiResourceIdentifier & {
    name: string,
    number: string,
    is_active: boolean,
};

export class Unit extends BaseModel<UnitApiResourceIdentifier> {
    static override entity = "orm-units";
    static override apiResourceType = "units" as const;

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),
            number: this.string(null),
            isActive: this.boolean(null),

            sequenceNumber: this.number(null),
        };
    }

    declare id: string;
    declare name: string;
    declare number: string | null;
    declare isActive: boolean;

    declare sequenceNumber: number;

    static fromApiResponse(resource: UnitApiResponseResource) {
        return new Unit({
            id: resource.id,
            name: resource.name,
            number: resource.number,
            isActive: resource.is_active,
        });
    }
}
