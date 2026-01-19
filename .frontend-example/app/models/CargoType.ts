import { BaseModel } from "~/models/BaseModel";

export type CargoTypeApiResourceIdentifier = { type: "cargoTypes", id: string };

export type CargoTypeApiResponseResource = CargoTypeApiResourceIdentifier & {
    name: string,
};

export class CargoType extends BaseModel<CargoTypeApiResourceIdentifier> {
    static override entity = "orm-cargo-types";
    static override apiResourceType = "cargoTypes" as const;

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),

            sequenceNumber: this.number(null)
        };
    }

    declare id: string;
    declare name: string;

    declare sequenceNumber: number;

    static fromApiResponse(resource: CargoTypeApiResponseResource) {
        return new CargoType({
            id: resource.id,
            name: resource.name
        });
    }
}
