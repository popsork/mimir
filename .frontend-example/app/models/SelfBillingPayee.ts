import { BaseModel } from "~/models/BaseModel";

export type SelfBillingPayeeApiResourceIdentifier = { type: "selfBillingPayees", id: string };

export type SelfBillingPayeeApiResponseResource = SelfBillingPayeeApiResourceIdentifier & {
    name: string,
    include_in_self_billing: boolean,
};

export class SelfBillingPayee extends BaseModel<SelfBillingPayeeApiResourceIdentifier> {
    static override entity = "orm-self-billing-payees";
    static override apiResourceType = "selfBillingPayees" as const;

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),
            includeInSelfBilling: this.boolean(null),

            sequenceNumber: this.number(null),
        };
    }

    declare id: string;
    declare name: string;
    declare includeInSelfBilling: boolean;

    declare sequenceNumber: number;

    static fromApiResponse(resource: SelfBillingPayeeApiResponseResource) {
        return new SelfBillingPayee({
            id: resource.id,
            name: resource.name,
            includeInSelfBilling: resource.include_in_self_billing,
        });
    }
}
