import { BaseModel } from "~/models/BaseModel";

import { CustomerOrder, type CustomerOrderApiResourceIdentifier } from "~/models/CustomerOrder";
import { DocumentTypeModel, type DocumentTypeApiResourceIdentifier, type DocumentTypeApiResponseResource } from "~/models/DocumentTypeModel";
import { FileModel, type FileApiResourceIdentifier, type FileApiResponseResource } from "~/models/FileModel";

export type DocumentApiResourceIdentifier = { type: "documents", id: string };

type DocumentApiResourceAttributes = {
    order_by: number, // sequence number
    name: string | null,
    attach_to_invoice: boolean,
    attach_to_invoice_is_manual: boolean,
};

export type DocumentApiRequestResource = DocumentApiResourceIdentifier & {
    attributes: DocumentApiResourceAttributes,
    relationships: {
        order?: { data: CustomerOrderApiResourceIdentifier | null },
        documentType?: { data: DocumentTypeApiResourceIdentifier | null },
        file?: { data: FileApiResourceIdentifier | null },
    },
};

export type DocumentApiResponseResource = DocumentApiResourceIdentifier & DocumentApiResourceAttributes & {
    documentType: { data?: DocumentTypeApiResponseResource },
    file: { data?: FileApiResponseResource },
};

export type DocumentApiResourceFieldName = Exclude<keyof DocumentApiResponseResource, "id" | "type">;

// using DocumentModel as name since Document is used by the browser's DOM
export class DocumentModel extends BaseModel<DocumentApiResourceIdentifier> {
    static override entity = "orm-documents";
    static override apiResourceType = "documents" as const;

    static override fields() {
        return {
            id: this.string(null),
            sequenceNumber: this.number(null),

            name: this.string(null),
            attachToInvoice: this.boolean(false),
            attachToInvoiceIsManual: this.boolean(false),

            documentTypeId: this.string(null),
            documentType: this.belongsTo(DocumentTypeModel, "documentTypeId"),

            fileId: this.string(null),
            file: this.belongsTo(FileModel, "fileId"),

            customerOrderId: this.string(null),
        };
    }

    declare id: string;

    declare sequenceNumber: number;

    declare name: string | null;
    declare attachToInvoice: boolean;
    declare attachToInvoiceIsManual: boolean;

    declare documentTypeId: string | null;
    declare documentType: DocumentTypeModel | null;

    declare fileId: string | null;
    declare file: FileModel | null;

    declare customerOrderId: string;

    static buildBlank(
        { customerOrderId, sequenceNumber }:
        { customerOrderId: string, sequenceNumber: number }
    ) {
        const record = new DocumentModel();
        record.id = generateNewUuid();
        record.customerOrderId = customerOrderId;
        record.sequenceNumber = sequenceNumber;
        return record;
    }

    static fromApiResponse(resource: DocumentApiResponseResource) {
        return new DocumentModel({
            id: resource.id,
            sequenceNumber: resource.order_by,

            name: resource.name,
            attachToInvoice: resource.attach_to_invoice,
            attachToInvoiceIsManual: resource.attach_to_invoice_is_manual,

            documentTypeId: resource.documentType?.data?.id ?? null,
            documentType: resource.documentType?.data ? DocumentTypeModel.fromApiResponse(resource.documentType.data) : null,

            fileId: resource.file?.data?.id ?? null,
            file: resource.file?.data ? FileModel.fromApiResponse(resource.file.data) : null,
        });
    }

    toApiRequestResource() {
        const resource: DocumentApiRequestResource = {
            ...(DocumentModel.getApiResourceIdentifier(this.id)!),
            attributes: {
                order_by: this.sequenceNumber,

                name: this.name,
                attach_to_invoice: this.attachToInvoice,
                attach_to_invoice_is_manual: this.attachToInvoiceIsManual,

            },
            relationships: {
                order: { data: CustomerOrder.getApiResourceIdentifier(this.customerOrderId) },
                documentType: { data: DocumentTypeModel.getApiResourceIdentifier(this.documentTypeId) },
                file: { data: FileModel.getApiResourceIdentifier(this.fileId) },
            }
        };

        return resource;
    }
}
