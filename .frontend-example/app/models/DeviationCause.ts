import { BaseModel } from "~/models/BaseModel";
import { DeviationTypeCause } from "~/models/DeviationTypeCause";
import { DeviationType } from "~/models/DeviationType";

export type DeviationCauseApiResourceIdentifier = { type: "deviationCauses", id: string };

type DeviationCauseApiResourceAttributes = {
    name: string,
    code: string,
    description: string | null,
};

export type DeviationCauseApiResponseResource = DeviationCauseApiResourceIdentifier & DeviationCauseApiResourceAttributes & {

};

export class DeviationCause extends BaseModel<DeviationCauseApiResourceIdentifier> {
    static override entity = "orm-deviation-causes";
    static override apiResourceType = "deviationCauses" as const;

    static override fields() {
        return {
            id: this.string(null),

            name: this.string(null),
            code: this.string(null),
            description: this.string(null),

            sequenceNumber: this.number(null),

            types: this.belongsToMany(DeviationType, DeviationTypeCause, "causeId", "typeId")
        };
    }

    declare id: string;

    declare name: string;
    declare code: string;
    declare description: string | null;

    declare sequenceNumber: number;

    static fromApiResponse(resource: DeviationCauseApiResponseResource) {
        return new DeviationCause({
            id: resource.id,
            name: resource.name,
            code: resource.code,
            description: resource.description,
        });
    }
}
