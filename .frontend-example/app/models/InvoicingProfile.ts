import { BaseModel } from "~/models/BaseModel";

export type InvoicingProfileApiResourceIdentifier = { type: "invoiceProfiles", id: string };

export type InvoicingProfileApiResponseResource = InvoicingProfileApiResourceIdentifier & {
    name: string,
};

export class InvoicingProfile extends BaseModel<InvoicingProfileApiResourceIdentifier> {
    static override entity = "orm-invoicing-profiles";
    static override apiResourceType = "invoiceProfiles" as const;

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

    static fromApiResponse(resource: InvoicingProfileApiResponseResource) {
        return new InvoicingProfile({
            id: resource.id,
            name: resource.name
        });
    }
}
