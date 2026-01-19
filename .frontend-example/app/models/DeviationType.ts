import { BaseModel } from "~/models/BaseModel";
import { DeviationTypeCause } from "~/models/DeviationTypeCause";
import { DeviationCause, type DeviationCauseApiResponseResource } from "~/models/DeviationCause";

export type DeviationTypeApiResourceIdentifier = { type: "deviationTypes", id: string };

type DeviationTypeApiResourceAttributes = {
    name: string,
    code: string,
    description: string | null,
};

export type DeviationTypeApiResponseResource = DeviationTypeApiResourceIdentifier & DeviationTypeApiResourceAttributes & {
    deviationCauses: { data?: DeviationCauseApiResponseResource[] },
};

export class DeviationType extends BaseModel<DeviationTypeApiResourceIdentifier> {
    static override entity = "orm-deviation-types";
    static override apiResourceType = "deviationTypes" as const;

    static override fields() {
        return {
            id: this.string(null),

            name: this.string(null),
            code: this.string(null),
            description: this.string(null),

            sequenceNumber: this.number(null),

            causes: this.belongsToMany(DeviationCause, DeviationTypeCause, "typeId", "causeId"),
        };
    }

    declare id: string;

    declare name: string;
    declare code: string;
    declare description: string | null;

    declare sequenceNumber: number;

    static fromApiResponse(resource: DeviationTypeApiResponseResource) {
        return new DeviationType({
            id: resource.id,
            name: resource.name,
            code: resource.code,
            description: resource.description,
        });
    }
}
