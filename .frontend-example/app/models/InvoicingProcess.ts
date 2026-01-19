import { BaseModel } from "~/models/BaseModel";
import { InvoicingProfile, type InvoicingProfileApiResourceIdentifier } from "~/models/InvoicingProfile";
import { CustomerOrder, type CustomerOrderApiResourceIdentifier } from "~/models/CustomerOrder";
import { InvoicingProcessStep, type InvoicingProcessStepApiResponseResource } from "~/models/InvoicingProcessStep";
import { InvoicingProcessLogEntry, type InvoicingProcessLogEntryApiResponseResource } from "~/models/InvoicingProcessLogEntry";

import { User, type UserApiResponseResource } from "~/models/User";
import { Invoice, type InvoiceApiResponseResource } from "~/models/Invoice";


export type InvoicingProcessApiResourceIdentifier = { type: "invoiceProcesses", id: string };

type InvoicingProcessApiResourceAttributes = {
    status: InvoicingProcessStatus,
    is_active: boolean,

    invoice_date: string | null, // ISO 8601 date
    bookkeeping_date: string | null, // ISO 8601 date

    number_of_orders: number | null,
    number_of_invoices: number | null,
    total_amount: number | null, // integer, precision in separate attribute, calculated value indicates major units
    total_amount_precision: number | null, // integer

    first_invoice_number: string | null,
    last_invoice_number: string | null,

    created_at: string | null,
    started_at: string | null,
    completed_at: string | null,
    cancelled_at: string | null,
};

// read-only attributes are not sent in the request
type InvoicingProcessApiRequestResourceAttributes = Omit<
    InvoicingProcessApiResourceAttributes,
    "status" | "is_active"
    | "number_of_orders" | "number_of_invoices" | "total_amount" | "total_amount_precision"
    | "first_invoice_number" | "last_invoice_number"
    | "created_at" | "started_at" | "completed_at" | "cancelled_at"
>;

export type InvoicingProcessApiRequestResource = InvoicingProcessApiResourceIdentifier & {
    attributes: InvoicingProcessApiRequestResourceAttributes,
    relationships: {
        invoiceProfile?: { data: InvoicingProfileApiResourceIdentifier | null },
        orders?: { data: CustomerOrderApiResourceIdentifier[] },
    },
};

export type InvoicingProcessStatusChangeApiRequestResource = InvoicingProcessApiResourceIdentifier & {
    attributes: Pick<InvoicingProcessApiResourceAttributes, "status">,
};

export type InvoicingProcessApiResponseResource = InvoicingProcessApiResourceIdentifier & InvoicingProcessApiResourceAttributes & {
    steps: { data?: InvoicingProcessStepApiResponseResource[] },
    user?: { data?: UserApiResponseResource },
    invoices?: { data?: InvoiceApiResponseResource[] },
    logs?: { data?: InvoicingProcessLogEntryApiResponseResource[] },
};

export class InvoicingProcess extends BaseModel<InvoicingProcessApiResourceIdentifier> {
    static override entity = "orm-invoicing-processes";
    static override apiResourceType = "invoiceProcesses" as const;

    static override fields() {
        return {
            id: this.string(null),
            sequenceNumber: this.number(null),

            status: this.string(null),
            isActive: this.boolean(false),

            invoiceDate: this.string(null),
            bookkeepingDate: this.string(null),

            numberOfOrders: this.number(null),
            numberOfInvoices: this.number(null),
            totalAmount: this.number(null),
            totalAmountPrecision: this.number(null),

            firstInvoiceNumber: this.string(null),
            lastInvoiceNumber: this.string(null),

            createdAt: this.string(null),
            startedAt: this.string(null),
            completedAt: this.string(null),
            cancelledAt: this.string(null),

            invoicingProfileId: this.string(null),
            invoicingProfile: this.belongsTo(InvoicingProfile, "invoicingProfileId"),

            orderIds: this.attr(null),
            steps: this.hasMany(InvoicingProcessStep, "processId"),
            invoices: this.hasMany(Invoice, "processId"),
            logEntries: this.hasMany(InvoicingProcessLogEntry, "processId"),

            userId: this.string(null),
            user: this.belongsTo(User, "userId"),

            userName: this.string(null), // pre-calculated field to avoid having to load the relationship
        };
    }

    declare id: string;
    declare sequenceNumber: number;
    declare isActive: boolean;
    declare status: InvoicingProcessStatus | null;

    declare invoiceDate: string | null;
    declare bookkeepingDate: string | null;

    declare numberOfOrders: number | null;
    declare numberOfInvoices: number | null;
    declare totalAmount: number | null;
    declare totalAmountPrecision: number | null;

    declare firstInvoiceNumber: string | null;
    declare lastInvoiceNumber: string | null;

    declare createdAt: string | null;
    declare startedAt: string | null;
    declare completedAt: string | null;
    declare cancelledAt: string | null;

    declare invoicingProfileId: string | null;
    declare invoicingProfile: InvoicingProfile | null;

    declare orderIds: string[] | null;

    declare steps: InvoicingProcessStep[] | null;
    declare invoices: Invoice[] | null;
    declare logEntries: InvoicingProcessLogEntry[] | null;

    declare userId: string | null;
    declare user: User | null;
    declare userName: string | null;


    static buildBlank() {
        const record = new InvoicingProcess();
        record.id = generateNewUuid();
        return record;
    }

    static fromApiResponse(resource: InvoicingProcessApiResponseResource) {
        const { steps, invoices, logEntries } = this.buildRelationshipsFromApiResponse(resource);

        return new InvoicingProcess({
            id: resource.id,

            status: resource.status,
            isActive: resource.is_active,

            invoiceDate: resource.invoice_date,
            bookkeepingDate: resource.bookkeeping_date,

            numberOfOrders: resource.number_of_orders,
            numberOfInvoices: resource.number_of_invoices,
            totalAmount: resource.total_amount,
            totalAmountPrecision: resource.total_amount_precision,

            firstInvoiceNumber: resource.first_invoice_number,
            lastInvoiceNumber: resource.last_invoice_number,

            createdAt: getUtcDatetimeString(resource.created_at),
            startedAt: getUtcDatetimeString(resource.started_at),
            completedAt: getUtcDatetimeString(resource.completed_at),
            cancelledAt: getUtcDatetimeString(resource.cancelled_at),

            steps,
            invoices,
            logEntries,

            userId: resource.user?.data?.id ?? null,
            user: resource.user?.data ? User.fromApiResponse(resource.user.data) : null,
            userName: resource.user?.data?.name ?? null,
        });
    }

    static buildRelationshipsFromApiResponse(resource: InvoicingProcessApiResponseResource) {
        const steps = resource.steps?.data
            ? resource.steps.data.map((relatedResource, index) => {
                const record = InvoicingProcessStep.fromApiResponse(relatedResource);
                record.processId = resource.id;
                record.sequenceNumber = index + 1;
                return record;
            })
            : null
        ;

        const invoices = resource.invoices?.data
            ? resource.invoices.data.map((relatedResource, index) => {
                const record = Invoice.fromApiResponse(relatedResource);
                record.processId = resource.id;
                record.sequenceNumber = index + 1;
                return record;
            })
            : null
        ;

        const logEntries = resource.logs?.data
            ? resource.logs.data.map((relatedResource, index) => {
                const record = InvoicingProcessLogEntry.fromApiResponse(relatedResource);
                record.processId = resource.id;
                record.sequenceNumber = index + 1;
                return record;
            })
            : null
        ;

        return {
            steps,
            invoices,
            logEntries
        };
    }

    toApiRequestResource() {
        const resource: InvoicingProcessApiRequestResource = {
            ...(InvoicingProcess.getApiResourceIdentifier(this.id)!),
            attributes: {
                invoice_date: this.invoiceDate,
                bookkeeping_date: this.bookkeepingDate,
            },
            relationships: {
                invoiceProfile: { data: InvoicingProfile.getApiResourceIdentifier(this.invoicingProfileId) },
            }
        };
        // when order ids are null, it means the process should get started with no orders relationship
        // (invoicing based on profile, orders will get auto-selected by backend).
        // otherwise, include the orders relationship, even if the array is empty.
        if (this.orderIds !== null) {
            resource.relationships.orders = { data: this.orderIds.map(id => CustomerOrder.getApiResourceIdentifier(id)!) };
        }
        return resource;
    }

    static buildStatusChangeApiRequestResource(
        { id, status }:
        { id: string, status: InvoicingProcessStatus }
    ) {
        const resource: InvoicingProcessStatusChangeApiRequestResource = {
            id,
            type: this.apiResourceType,
            attributes: {
                status
            }
        };
        return resource;
    }

}
