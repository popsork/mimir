import { BaseModel } from "~/models/BaseModel";

export type CustomerApiResourceIdentifier = {
    id: string,
    type: "customers",
};

export type CustomerApiResponseResource = CustomerApiResourceIdentifier & {
    number: string,
    name: string,
    short_name: string,
    mainCustomer?: { data: CustomerApiResponseResource | null },
};

export class Customer extends BaseModel<CustomerApiResourceIdentifier> {
    static override apiResourceType = "customers" as const;

    static override entity = "orm-customers";

    static override fields() {
        return {
            id: this.string(null),
            number: this.string(null),
            name: this.string(null),
            shortName: this.string(null),
            isSubcustomer: this.boolean(null),

            sequenceNumber: this.number(null)
        };
    }

    declare id: string;
    declare number: string;
    declare name: string;
    declare shortName: string;
    declare isSubcustomer: boolean;

    declare sequenceNumber: number;

    static fromApiResponse(resource: CustomerApiResponseResource) {
        const mainCustomerExists = resource.mainCustomer && resource.mainCustomer.data;

        return new Customer({
            id: resource.id,
            number: resource.number,
            name: resource.name,
            shortName: resource.short_name,
            isSubcustomer: mainCustomerExists ? true : false,
        });
    }
}
