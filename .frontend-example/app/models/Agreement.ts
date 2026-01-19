import { BaseModel } from "~/models/BaseModel";
import { Customer, type CustomerApiResponseResource } from "~/models/Customer";

export type AgreementApiResourceIdentifier = { type: "agreements", id: string };

export type AgreementApiResponseResource = AgreementApiResourceIdentifier & {
    name: string,

    customer?: { data?: CustomerApiResponseResource },
};

export class Agreement extends BaseModel<AgreementApiResourceIdentifier> {
    static override entity = "orm-agreements";
    static override apiResourceType = "agreements" as const;

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),

            customerId: this.string(null),
            customer: this.belongsTo(Customer, "customerId"),

            sequenceNumber: this.number(null)
        };
    }

    declare id: string;
    declare name: string;

    declare customerId: string;
    declare customer: Customer | null;

    declare sequenceNumber: number;

    static fromApiResponse(resource: AgreementApiResponseResource) {
        const customerId = resource.customer?.data?.id ?? null;
        const customer = resource.customer?.data ? Customer.fromApiResponse(resource.customer.data) : null;

        return new Agreement({
            id: resource.id,
            name: resource.name,

            customerId,
            customer
        });
    }
}
