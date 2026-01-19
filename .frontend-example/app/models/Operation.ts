import { BaseModel } from "~/models/BaseModel";

export type OperationApiResourceIdentifier = { type: "operations", id: string };

export type OperationApiResponseResource = OperationApiResourceIdentifier & {
    name: string,
    acceptance_time_minutes: number | null,
    allow_zero_article: boolean,
    allow_zero_order: boolean,
};

export class Operation extends BaseModel<OperationApiResourceIdentifier> {
    static override entity = "orm-operations";
    static override apiResourceType = "operations" as const;

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),
            acceptanceTimeMinutes: this.number(null),
            allowZeroArticle: this.boolean(false),
            allowZeroOrder: this.boolean(false),
            sequenceNumber: this.number(null)
        };
    }

    declare id: string;
    declare name: string;
    declare acceptanceTimeMinutes: number | null;
    declare allowZeroArticle: boolean;
    declare allowZeroOrder: boolean;

    declare sequenceNumber: number;

    static fromApiResponse(resource: OperationApiResponseResource) {
        return new Operation({
            id: resource.id,
            name: resource.name,
            acceptanceTimeMinutes: resource.acceptance_time_minutes,
            allowZeroArticle: resource.allow_zero_article,
            allowZeroOrder: resource.allow_zero_order,
        });
    }
}
