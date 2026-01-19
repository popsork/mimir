import { BaseModel } from "~/models/BaseModel";

export type DocumentTypeApiResourceIdentifier = { type: "documentTypes", id: string };

type DocumentTypeApiResourceAttributes = {
    name: string,
    description: string | null,
    attach_to_invoice: boolean,
};

export type DocumentTypeApiResponseResource = DocumentTypeApiResourceIdentifier & DocumentTypeApiResourceAttributes & {

};

// using DocumentTypeModel as name since DocumentType is used by the browser's DOM
export class DocumentTypeModel extends BaseModel<DocumentTypeApiResourceIdentifier> {
    static override entity = "orm-document-types";
    static override apiResourceType = "documentTypes" as const;

    static override fields() {
        return {
            id: this.string(null),

            name: this.string(null),
            description: this.string(null),
            attachToInvoice: this.boolean(false),

            sequenceNumber: this.number(null),

        };
    }

    declare id: string;

    declare name: string;
    declare description: string | null;
    declare attachToInvoice: boolean;

    declare sequenceNumber: number;

    static fromApiResponse(resource: DocumentTypeApiResponseResource) {
        return new DocumentTypeModel({
            id: resource.id,
            name: resource.name,
            description: resource.description,
            attachToInvoice: resource.attach_to_invoice,
        });
    }
}
