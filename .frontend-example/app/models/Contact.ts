import { BaseModel } from "~/models/BaseModel";
import { Customer, type CustomerApiResponseResource } from "~/models/Customer";

export type ContactApiResourceIdentifier = { type: "contacts", id: string };

export type ContactApiResponseResource = ContactApiResourceIdentifier & {
    name: string,
    customer?: { data?: CustomerApiResponseResource },
};

export class Contact extends BaseModel<ContactApiResourceIdentifier> {
    static override entity = "orm-contacts";
    static override apiResourceType = "contacts" as const;

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

    static fromApiResponse(resource: ContactApiResponseResource) {
        const customerId = resource.customer?.data?.id ?? null;
        const customer = resource.customer?.data ? Customer.fromApiResponse(resource.customer.data) : null;

        return new Contact({
            id: resource.id,
            name: resource.name,

            customerId,
            customer
        });
    }
}
