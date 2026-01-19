import { BaseModel } from "~/models/BaseModel";
import { InvoicingProcess } from "~/models/InvoicingProcess";


export type InvoicingProcessLogEntryApiResourceIdentifier = { type: "invoiceProcessLogs", id: string };

type InvoicingProcessLogEntryContext = Record<string, any> | Record<string, any>[];

type InvoicingProcessLogEntryApiResourceAttributes = {
    timestamp: string | null,
    message: string | null,
    context: InvoicingProcessLogEntryContext | null,
};

export type InvoicingProcessLogEntryApiResponseResource = InvoicingProcessLogEntryApiResourceIdentifier & InvoicingProcessLogEntryApiResourceAttributes;

export class InvoicingProcessLogEntry extends BaseModel<InvoicingProcessLogEntryApiResourceIdentifier> {
    static override entity = "orm-invoicing-process-log-entries";
    static override apiResourceType = "invoiceProcessLogs" as const;

    static override fields() {
        return {
            id: this.string(null),
            sequenceNumber: this.number(null),

            timestamp: this.string(null),
            message: this.string(null),
            context: this.attr(null),

            processId: this.string(null),
            process: this.belongsTo(InvoicingProcess, "processId"),
        };
    }

    declare id: string;
    declare sequenceNumber: number;

    declare timestamp: string | null;
    declare message: string | null;
    declare context: InvoicingProcessLogEntryContext | null;

    declare processId: string | null;
    declare process: InvoicingProcess | null;

    static fromApiResponse(resource: InvoicingProcessLogEntryApiResponseResource) {
        return new InvoicingProcessLogEntry({
            id: resource.id,
            timestamp: getUtcDatetimeString(resource.timestamp),
            message: resource.message,
            context: resource.context,
        });
    }
}
