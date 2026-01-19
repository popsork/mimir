import { BaseModel } from "~/models/BaseModel";

import { Customer, type CustomerApiResourceIdentifier, type CustomerApiResponseResource } from "~/models/Customer";
import { Contact, type ContactApiResourceIdentifier, type ContactApiResponseResource } from "~/models/Contact";
import { Agreement, type AgreementApiResourceIdentifier, type AgreementApiResponseResource } from "~/models/Agreement";
import { Project, type ProjectApiResourceIdentifier, type ProjectApiResponseResource } from "~/models/Project";
import { Operation, type OperationApiResourceIdentifier, type OperationApiResponseResource } from "~/models/Operation";
import { Service, type ServiceApiResourceIdentifier, type ServiceApiResponseResource } from "~/models/Service";
import { CargoType, type CargoTypeApiResourceIdentifier, type CargoTypeApiResponseResource } from "~/models/CargoType";

import { Stop, type StopApiResponseResource } from "~/models/Stop";
import { TransportOrder, type TransportOrderApiResponseResource } from "~/models/TransportOrder";
import { GoodsRow, type GoodsRowApiResponseResource } from "~/models/GoodsRow";
import { DangerousGoodsRow, type DangerousGoodsRowApiResponseResource } from "./DangerousGoodsRow";
import { DebitRow, type DebitRowApiResponseResource } from "~/models/DebitRow";
import { SpecificationRow, type SpecificationRowApiResponseResource } from "~/models/SpecificationRow";
import { DeviationRow, type DeviationRowApiResponseResource } from "~/models/DeviationRow";
import { OrderNote, type OrderNoteApiResponseResource } from "~/models/OrderNote";
import { ScheduleEntry, type ScheduleEntryApiResourceIdentifier, type ScheduleEntryApiResponseResource } from "~/models/ScheduleEntry";
import { DebitRowSummary, type DebitRowSummaryApiResponseResource } from "~/models/DebitRowSummary";
import { GoodsRowSummary, type GoodsRowSummaryApiResponseResource } from "~/models/GoodsRowSummary";
import { SpecificationSummary, type SpecificationSummaryApiResponseResource } from "~/models/SpecificationSummary";
import { GoodsTotalOverride, type GoodsTotalOverrideApiResponseResource } from "~/models/GoodsTotalOverride";
import { DocumentModel, type DocumentApiResponseResource } from "~/models/DocumentModel";

export type CustomerOrderApiResourceIdentifier = { type: "orders", id: string };

type CustomerOrderApiResourceAttributes = {
    number: string | null,
    contact_name_override: string | null,
    contact_name_override_is_manual: boolean,

    waybill: string | null,
    waybill_is_manual: boolean,

    customer_reference: string | null,
    customer_reference_is_manual: boolean,

    sender_reference: string | null,
    sender_reference_is_manual: boolean,

    recipient_reference: string | null,
    recipient_reference_is_manual: boolean,

    planned_pickup_at: string | null,
    planned_pickup_at_is_manual: boolean,

    planned_delivery_at: string | null,
    planned_delivery_at_is_manual: boolean,

    driving_distance: number | null,

    phase: OrderPhase | null,

    is_template: boolean | null,
    template_name: string | null,

    version: string | null,

    customer_id_is_manual: boolean,
    contact_id_is_manual: boolean,
    agreement_id_is_manual: boolean,
    project_id_is_manual: boolean,

    operation_id_is_manual: boolean,
    service_id_is_manual: boolean,
    cargo_type_id_is_manual: boolean,
};


// number and driving_distance are never sent in the request, as they are always displayed as read only
type CustomerOrderApiRequestResourceAttributes = Omit<CustomerOrderApiResourceAttributes, "number" | "driving_distance">;

export type CustomerOrderApiRequestResource = CustomerOrderApiResourceIdentifier & {
    attributes: CustomerOrderApiRequestResourceAttributes,
    relationships: {
        customer?: { data: CustomerApiResourceIdentifier | null },
        contact?: { data: ContactApiResourceIdentifier | null },
        agreement?: { data: AgreementApiResourceIdentifier | null },
        project?: { data: ProjectApiResourceIdentifier | null },
        operation?: { data: OperationApiResourceIdentifier | null },
        service?: { data: ServiceApiResourceIdentifier | null },
        cargoType?: { data: CargoTypeApiResourceIdentifier | null },
        additionalServices?: { data: ServiceApiResourceIdentifier[] },
        schedules?: { data: ScheduleEntryApiResourceIdentifier[] },
    },
};

export type CustomerOrderApiResponseResource = CustomerOrderApiResourceIdentifier & CustomerOrderApiResourceAttributes & {
    customer?: { data: CustomerApiResponseResource | null },
    contact?: { data: ContactApiResponseResource | null },
    agreement?: { data: AgreementApiResponseResource | null },
    project?: { data: ProjectApiResponseResource | null },
    operation?: { data: OperationApiResponseResource | null },
    service?: { data: ServiceApiResponseResource | null },
    cargoType?: { data: CargoTypeApiResponseResource | null },
    debitRowSummary?: { data?: DebitRowSummaryApiResponseResource | null },
    goodsRowSummary?: { data?: GoodsRowSummaryApiResponseResource | null },
    specificationSummary?: { data?: SpecificationSummaryApiResponseResource | null },
    goodsTotalOverride?: { data?: GoodsTotalOverrideApiResponseResource | null },

    stops?: { data?: StopApiResponseResource[] },
    transportOrders?: { data?: TransportOrderApiResponseResource[] },
    specificationRows?: { data?: SpecificationRowApiResponseResource[] },
    debitRows?: { data?: DebitRowApiResponseResource[] },
    goodsRows?: { data?: GoodsRowApiResponseResource[] },
    dangerousGoodsRows?: { data?: DangerousGoodsRowApiResponseResource[] },
    documents: { data?: DocumentApiResponseResource[] },
    deviationRows?: { data?: DeviationRowApiResponseResource[] },
    orderNotes?: { data?: OrderNoteApiResponseResource[] },
    additionalServices?: { data?: ServiceApiResponseResource[] },
    schedules?: { data?: ScheduleEntryApiResponseResource[] },
};

export type CustomerOrderApiResourceFieldName = Exclude<keyof CustomerOrderApiResponseResource, "id" | "type">;

export class CustomerOrder extends BaseModel<CustomerOrderApiResourceIdentifier> {
    static override entity = "orm-customer-orders" as const;
    static override apiResourceType = "orders" as const;

    static override fields() {
        return {
            id: this.string(null),
            number: this.string(null),

            customerId: this.string(null),
            customerIdIsManual: this.boolean(false),
            customer: this.belongsTo(Customer, "customerId"),

            contactId: this.string(null),
            contactIdIsManual: this.boolean(false),
            contact: this.belongsTo(Contact, "contactId"),
            contactNameOverride: this.string(null),
            contactNameOverrideIsManual: this.boolean(false),

            agreementId: this.string(null),
            agreementIdIsManual: this.boolean(false),
            agreement: this.belongsTo(Agreement, "agreementId"),

            projectId: this.string(null),
            projectIdIsManual: this.boolean(false),
            project: this.belongsTo(Project, "projectId"),

            waybillNumber: this.string(null),
            waybillNumberIsManual: this.boolean(false),
            customerReference: this.string(null),
            customerReferenceIsManual: this.boolean(false),
            senderReference: this.string(null),
            senderReferenceIsManual: this.boolean(false),
            recipientReference: this.string(null),
            recipientReferenceIsManual: this.boolean(false),

            operationId: this.string(null),
            operationIdIsManual: this.boolean(false),
            operation: this.belongsTo(Operation, "operationId"),

            serviceId: this.string(null),
            serviceIdIsManual: this.boolean(false),
            service: this.belongsTo(Service, "serviceId"),

            cargoTypeId: this.string(null),
            cargoTypeIdIsManual: this.boolean(false),
            cargoType: this.belongsTo(CargoType, "cargoTypeId"),

            plannedPickupAt: this.string(null),
            plannedPickupAtIsManual: this.boolean(false),
            plannedDeliveryAt: this.string(null),
            plannedDeliveryAtIsManual: this.boolean(false),

            drivingDistance: this.number(null),

            phase: this.string(null),

            isTemplate: this.boolean(null),
            templateName: this.string(null),
            version: this.string(null),

            stops: this.hasMany(Stop, "customerOrderId"),
            transportOrders: this.hasMany(TransportOrder, "customerOrderId"),

            specificationRows: this.hasMany(SpecificationRow, "customerOrderId"),
            debitRows: this.hasMany(DebitRow, "customerOrderId"),
            goodsRows: this.hasMany(GoodsRow, "customerOrderId"),
            dangerousGoodsRows: this.hasMany(DangerousGoodsRow, "customerOrderId"),
            documents: this.hasMany(DocumentModel, "customerOrderId"),
            deviationRows: this.hasMany(DeviationRow, "customerOrderId"),
            notes: this.hasMany(OrderNote, "customerOrderId"),

            // schedule resources don't have a foreign key to customer orders, so just define the relationship as an attribute
            scheduleEntries: this.attr([]),

            additionalServiceIds: this.attr([]),

            // we're not using the order id for summaries, so just define the relationship as an attribute
            debitRowSummary: this.attr(null),
            goodsRowSummary: this.attr(null),
            specificationSummary: this.attr(null),
            goodsTotalOverride: this.attr(null),
        };
    }

    declare id: string;
    declare number: string | null;

    declare customerId: string | null;
    declare customerIdIsManual: boolean;
    declare customer: Customer | null;

    declare contactId: string | null;
    declare contactIdIsManual: boolean;
    declare contact: Contact | null;
    declare contactNameOverride: string | null;
    declare contactNameOverrideIsManual: boolean;

    declare agreementId: string | null;
    declare agreementIdIsManual: boolean;
    declare agreement: Agreement | null;

    declare projectId: string | null;
    declare projectIdIsManual: boolean;
    declare project: Project | null;

    declare waybillNumber: string | null;
    declare waybillNumberIsManual: boolean;
    declare customerReference: string | null;
    declare customerReferenceIsManual: boolean;
    declare senderReference: string | null;
    declare senderReferenceIsManual: boolean;
    declare recipientReference: string | null;
    declare recipientReferenceIsManual: boolean;

    declare operationId: string | null;
    declare operationIdIsManual: boolean;
    declare operation: Operation | null;

    declare serviceId: string | null;
    declare serviceIdIsManual: boolean;
    declare service: Service | null;

    declare cargoTypeId: string | null;
    declare cargoTypeIdIsManual: boolean;
    declare cargoType: CargoType | null;

    declare plannedPickupAt: string | null;
    declare plannedPickupAtIsManual: boolean;
    declare plannedDeliveryAt: string | null;
    declare plannedDeliveryAtIsManual: boolean;

    declare drivingDistance: number | null;

    declare phase: OrderPhase | null;

    declare isTemplate: boolean | null;
    declare templateName: string | null;
    declare version: string | null;

    declare stops: Stop[] | null;
    declare transportOrders: TransportOrder[] | null;
    declare specificationRows: SpecificationRow[] | null;
    declare debitRows: DebitRow[] | null;
    declare goodsRows: GoodsRow[] | null;
    declare dangerousGoodsRows: DangerousGoodsRow[] | null;
    declare documents: DocumentModel[] | null;
    declare deviationRows: DeviationRow[] | null;
    declare notes: OrderNote[] | null;

    declare scheduleEntries: ScheduleEntry[] | null;

    declare additionalServiceIds: string[];

    declare debitRowSummary: DebitRowSummary | null;
    declare goodsRowSummary: GoodsRowSummary | null;
    declare specificationSummary: SpecificationSummary | null;
    declare goodsTotalOverride: GoodsTotalOverride | null;

    canHaveScheduleEntries() {
        return !!this.isTemplate;
    }

    static buildBlank() {
        const record = new CustomerOrder();
        record.id = generateNewUuid();
        record.isTemplate = false; // this is needed for dry runs to go through, as not setting it causes a validation error
        return record;
    }

    static fromApiResponse(resource: CustomerOrderApiResponseResource) {
        const {
            stops,
            transportOrders,
            specificationRows,
            debitRows,
            goodsRows,
            dangerousGoodsRows,
            documents,
            deviationRows,
            notes,
            scheduleEntries,
        } = this.buildRelationshipsFromApiResponse(resource);

        const goodsTotalOverride = resource.goodsTotalOverride?.data ? GoodsTotalOverride.fromApiResponse(resource.goodsTotalOverride.data) : null;
        if (goodsTotalOverride) {
            goodsTotalOverride.customerOrderId = resource.id;
        }

        return new CustomerOrder({
            id: resource.id,
            number: resource.number,

            customerId: resource.customer?.data?.id ?? null,
            customerIdIsManual: resource.customer_id_is_manual,
            customer: resource.customer?.data ? Customer.fromApiResponse(resource.customer.data) : null,

            contactId: resource.contact?.data?.id ?? null,
            contactIdIsManual: resource.contact_id_is_manual,
            contact: resource.contact?.data ? Contact.fromApiResponse(resource.contact.data) : null,
            contactNameOverride: resource.contact_name_override,
            contactNameOverrideIsManual: resource.contact_name_override_is_manual,

            agreementId: resource.agreement?.data?.id ?? null,
            agreementIdIsManual: resource.agreement_id_is_manual,
            agreement: resource.agreement?.data ? Agreement.fromApiResponse(resource.agreement.data) : null,

            projectId: resource.project?.data?.id ?? null,
            projectIdIsManual: resource.project_id_is_manual,
            project: resource.project?.data ? Project.fromApiResponse(resource.project.data) : null,

            waybillNumber: resource.waybill,
            waybillNumberIsManual: resource.waybill_is_manual,
            customerReference: resource.customer_reference,
            customerReferenceIsManual: resource.customer_reference_is_manual,
            senderReference: resource.sender_reference,
            senderReferenceIsManual: resource.sender_reference_is_manual,
            recipientReference: resource.recipient_reference,
            recipientReferenceIsManual: resource.recipient_reference_is_manual,

            operationId: resource.operation?.data?.id ?? null,
            operationIdIsManual: resource.operation_id_is_manual,
            operation: resource.operation?.data ? Operation.fromApiResponse(resource.operation.data) : null,

            serviceId: resource.service?.data?.id ?? null,
            serviceIdIsManual: resource.service_id_is_manual,
            service: resource.service?.data ? Service.fromApiResponse(resource.service.data) : null,

            cargoTypeId: resource.cargoType?.data?.id ?? null,
            cargoTypeIdIsManual: resource.cargo_type_id_is_manual,
            cargoType: resource.cargoType?.data ? CargoType.fromApiResponse(resource.cargoType.data) : null,

            plannedPickupAt: getUtcDatetimeString(resource.planned_pickup_at),
            plannedPickupAtIsManual: resource.planned_pickup_at_is_manual,
            plannedDeliveryAt: getUtcDatetimeString(resource.planned_delivery_at),
            plannedDeliveryAtIsManual: resource.planned_delivery_at_is_manual,

            drivingDistance: resource.driving_distance,

            phase: resource.phase,

            isTemplate: resource.is_template,
            templateName: resource.template_name,
            version: resource.version,

            stops,
            transportOrders,
            specificationRows,
            debitRows,
            goodsRows,
            dangerousGoodsRows,
            documents,
            deviationRows,
            notes,
            scheduleEntries,

            additionalServiceIds: (resource.additionalServices?.data || []).map(service => service.id),

            debitRowSummary: resource.debitRowSummary?.data ? DebitRowSummary.fromApiResponse(resource.debitRowSummary.data) : null,
            goodsRowSummary: resource.goodsRowSummary?.data ? GoodsRowSummary.fromApiResponse(resource.goodsRowSummary.data) : null,
            specificationSummary: resource.specificationSummary?.data ? SpecificationSummary.fromApiResponse(resource.specificationSummary.data) : null,

            goodsTotalOverride,
        });
    }

    static buildRelationshipsFromApiResponse(resource: CustomerOrderApiResponseResource) {
        const customerOrderId = resource.id;

        const stops = Array.isArray(resource.stops?.data)
            ? resource.stops.data.map((relatedResource) => {
                const record = Stop.fromApiResponse(relatedResource);
                record.customerOrderId = customerOrderId;
                return record;
            })
            : null
        ;

        const sortedStops = stops?.sort((a, b) => a.sequenceNumber - b.sequenceNumber) ?? null;

        const transportOrders = Array.isArray(resource.transportOrders?.data)
            ? resource.transportOrders.data.map((relatedResource) => {
                const record = TransportOrder.fromApiResponse(relatedResource);
                record.customerOrderId = customerOrderId;
                return record;
            })
            : null
        ;
        const sortedTransportOrders = this.getSortedTransportOrders({
            stops: sortedStops,
            transportOrders
        });

        const specificationRows = Array.isArray(resource.specificationRows?.data)
            ? resource.specificationRows.data.map((relatedResource) => {
                const record = SpecificationRow.fromApiResponse(relatedResource);
                record.customerOrderId = customerOrderId;
                return record;
            })
            : null
        ;
        const sortedSpecificationRows = specificationRows?.sort((a, b) => a.sequenceNumber - b.sequenceNumber) ?? null;

        const debitRows = Array.isArray(resource.debitRows?.data)
            ? resource.debitRows.data.map((relatedResource) => {
                const record = DebitRow.fromApiResponse(relatedResource);
                record.customerOrderId = customerOrderId;
                return record;
            })
            : null
        ;

        const sortedDebitRows = debitRows?.sort((a, b) => a.sequenceNumber - b.sequenceNumber) ?? null;

        const goodsRows = Array.isArray(resource.goodsRows?.data)
            ? resource.goodsRows.data.map((relatedResource) => {
                const record = GoodsRow.fromApiResponse({ resource: relatedResource, customerOrderId });
                record.customerOrderId = customerOrderId;
                return record;
            })
            : null
        ;
        const sortedGoodsRows = goodsRows?.sort((a, b) => a.sequenceNumber - b.sequenceNumber) ?? null;

        const dangerousGoodsRows = Array.isArray(resource.dangerousGoodsRows?.data)
            ? resource.dangerousGoodsRows.data.map((relatedResource) => {
                const record = DangerousGoodsRow.fromApiResponse({ resource: relatedResource });
                record.customerOrderId = customerOrderId;
                return record;
            })
            : null
        ;
        const sortedDangerousGoodsRows = dangerousGoodsRows?.sort((a, b) => a.sequenceNumber - b.sequenceNumber) ?? null;

        const documents = Array.isArray(resource.documents?.data)
            ? resource.documents.data.map((relatedResource) => {
                const record = DocumentModel.fromApiResponse(relatedResource);
                record.customerOrderId = customerOrderId;
                return record;
            })
            : null
        ;
        const sortedDocuments = documents?.sort((a, b) => a.sequenceNumber - b.sequenceNumber) ?? null;

        const deviationRows = Array.isArray(resource.deviationRows?.data)
            ? resource.deviationRows.data.map((relatedResource) => {
                const record = DeviationRow.fromApiResponse(relatedResource);
                record.customerOrderId = customerOrderId;
                return record;
            })
            : null
        ;
        const sortedDeviationRows = deviationRows?.sort((a, b) => a.sequenceNumber - b.sequenceNumber) ?? null;

        const notes = Array.isArray(resource.orderNotes?.data)
            ? resource.orderNotes.data.map((relatedResource) => {
                const record = OrderNote.fromApiResponse(relatedResource);
                record.customerOrderId = customerOrderId;
                return record;
            })
            : null
        ;

        const scheduleEntries = Array.isArray(resource.schedules?.data)
            ? resource.schedules.data.map((relatedResource) => {
                const record = ScheduleEntry.fromApiResponse(relatedResource);
                return record;
            })
            : null
        ;

        return {
            stops: sortedStops,
            transportOrders: sortedTransportOrders,
            specificationRows: sortedSpecificationRows,
            debitRows: sortedDebitRows,
            goodsRows: sortedGoodsRows,
            dangerousGoodsRows: sortedDangerousGoodsRows,
            documents: sortedDocuments,
            deviationRows: sortedDeviationRows,
            notes,
            scheduleEntries,
        };
    }

    static getSortedTransportOrders(
        { transportOrders, stops }:
        {
            transportOrders: TransportOrder[] | null,
            stops: Stop[] | null,
        }
    ) {
        // as opposed to the stops relationship, the transport orders relationship does not come sorted in the API.
        // it contains all transport orders for the order, but they are not guaranteed to be in the order of the stops.
        // so their sequence needs to be set based on each transport order's pickup and delivery stops.
        if (!stops || !transportOrders) {
            return null;
        }

        const sortedTransportOrders: TransportOrder[] = [];

        stops.forEach((stop, index) => {
            const currentStop = stop;
            const nextStop = stops[index + 1];
            if (!nextStop) {
                return;
            }

            const transportOrder = transportOrders.find((transportOrder) => {
                return transportOrder.pickupStopId === currentStop.id && transportOrder.deliveryStopId === nextStop.id;
            });
            if (transportOrder) {
                sortedTransportOrders.push(transportOrder);
            } else {
                // for some reason a transport order that should be present is missing from the API response.
                // this should never happen, so it's not worth building an elaborate handling of such cases.
                // but since the app relies on stops and transport orders having matching indexes,
                // something needs to be inserted into the array in order not to mess up the rest of the stop-order sequence,
                // so just build a new blank and invalid transport order.
                const blankTransportOrder = new TransportOrder();
                sortedTransportOrders.push(blankTransportOrder);
            }
        });

        return sortedTransportOrders;
    }

    toApiRequestResource({ scheduleEntryIds, useVersion } : { scheduleEntryIds: string[], useVersion?: boolean }) {
        // saveable schedule entry ids are always passed in from outside,
        // because it depends on the context of the saving operation which schedule entries should be included

        const resource: CustomerOrderApiRequestResource = {
            ...(CustomerOrder.getApiResourceIdentifier(this.id)!),
            attributes: {
                customer_id_is_manual: this.customerIdIsManual,
                contact_id_is_manual: this.contactIdIsManual,
                contact_name_override: this.contactNameOverride,
                contact_name_override_is_manual: this.contactNameOverrideIsManual,
                agreement_id_is_manual: this.agreementIdIsManual,
                project_id_is_manual: this.projectIdIsManual,

                waybill: this.waybillNumber,
                waybill_is_manual: this.waybillNumberIsManual,
                customer_reference: this.customerReference,
                customer_reference_is_manual: this.customerReferenceIsManual,
                sender_reference: this.senderReference,
                sender_reference_is_manual: this.senderReferenceIsManual,
                recipient_reference: this.recipientReference,
                recipient_reference_is_manual: this.recipientReferenceIsManual,

                planned_pickup_at: getSystemTimeZoneDatetimeString(this.plannedPickupAt),
                planned_pickup_at_is_manual: this.plannedPickupAtIsManual,
                planned_delivery_at: getSystemTimeZoneDatetimeString(this.plannedDeliveryAt),
                planned_delivery_at_is_manual: this.plannedDeliveryAtIsManual,

                operation_id_is_manual: this.operationIdIsManual,
                service_id_is_manual: this.serviceIdIsManual,
                cargo_type_id_is_manual: this.cargoTypeIdIsManual,

                phase: this.phase,
                is_template: this.isTemplate,
                template_name: this.templateName,
                version: (useVersion === false) ? null : this.version,
            },
            relationships: {
                customer: { data: Customer.getApiResourceIdentifier(this.customerId) },
                contact: { data: Contact.getApiResourceIdentifier(this.contactId) },
                agreement: { data: Agreement.getApiResourceIdentifier(this.agreementId) },
                project: { data: Project.getApiResourceIdentifier(this.projectId) },
                operation: { data: Operation.getApiResourceIdentifier(this.operationId) },
                service: { data: Service.getApiResourceIdentifier(this.serviceId) },
                cargoType: { data: CargoType.getApiResourceIdentifier(this.cargoTypeId) },
                additionalServices: { data: this.additionalServiceIds.map(id => Service.getApiResourceIdentifier(id)! ) },
                schedules: { data: scheduleEntryIds.map(id => ScheduleEntry.getApiResourceIdentifier(id)! ) },
            }
        };

        return resource;
    }
}


