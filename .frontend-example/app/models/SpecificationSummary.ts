import { BaseModel } from "~/models/BaseModel";

export type SpecificationSummaryApiResourceIdentifier = { type: "specificationSummaries", id: string };

export type SpecificationSummaryApiResponseResource = SpecificationSummaryApiResourceIdentifier & {

    real_quantity: number | null, // float in API
    real_hours: number | null,    // float in API
    executions: number | null,    // integer in API
};

export class SpecificationSummary extends BaseModel<SpecificationSummaryApiResourceIdentifier> {
    static override entity = "orm-specification-summaries";
    static override apiResourceType = "specificationSummaries" as const;

    static override fields() {
        return {
            id: this.string(null),

            realQuantity: this.number(null),
            realHours: this.number(null),
            executions: this.number(null),
        };
    }

    declare id: string;

    declare realQuantity: number | null;
    declare realHours: number | null;
    declare executions: number | null;

    static fromApiResponse(resource: SpecificationSummaryApiResponseResource) {
        return new SpecificationSummary({
            id: resource.id,
            realQuantity: resource.real_quantity,
            realHours: resource.real_hours,
            executions: resource.executions,
        });
    }
}
