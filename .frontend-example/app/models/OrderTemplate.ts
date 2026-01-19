import { BaseModel } from "~/models/BaseModel";
import { CustomerOrder, type CustomerOrderApiResourceIdentifier, type CustomerOrderApiResponseResource } from "~/models/CustomerOrder";

// this is a virtual model based on CustomerOrder and its relationships.
// it does not have its own resource types in the API, and is used only for order templates list page
// to simplify the data structure needed for the table
// as some columns for the the template table will need to come from various relationships of the CustomerOrder resource

export class OrderTemplate extends BaseModel<CustomerOrderApiResourceIdentifier> {
    static override entity = "orm-order-templates" as const;
    static override apiResourceType = "orders" as const;

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),
            customerShortName: this.string(null),
            subcustomerName: this.string(null),
            operationName: this.string(null),
            serviceName: this.string(null),
            customerReference: this.string(null),
            senderReference: this.string(null),
            recipientReference: this.string(null),
            plannedPickupAt: this.string(null),
            plannedDeliveryAt: this.string(null),
            pickupName: this.string(null),
            pickupPostalCode: this.string(null),
            pickupCity: this.string(null),
            deliveryName: this.string(null),
            deliveryPostalCode: this.string(null),
            deliveryCity: this.string(null),
            plannerInstructions: this.string(null),
            isScheduled: this.boolean(false),
        };
    }

    declare id: string;
    declare name: string | null;
    declare customerShortName: string | null;
    declare subcustomerName: string | null;
    declare operationName: string | null;
    declare serviceName: string | null;
    declare customerReference: string | null;
    declare senderReference: string | null;
    declare recipientReference: string | null;
    declare plannedPickupAt: string | null;
    declare plannedDeliveryAt: string | null;
    declare pickupName: string | null;
    declare pickupPostalCode: string | null;
    declare pickupCity: string | null;
    declare deliveryName: string | null;
    declare deliveryPostalCode: string | null;
    declare deliveryCity: string | null;
    declare plannerInstructions: string | null;
    declare isScheduled: boolean;

    static fromApiResponse(resource: CustomerOrderApiResponseResource) {
        const order = CustomerOrder.fromApiResponse(resource);

        const pickupStop = order.stops?.at(0) ?? null;
        const deliveryStop = order.stops?.at(-1) ?? null;

        const plannerNote = order.notes?.find(note => note.noteType === OrderNoteType.Planner) ?? null;

        return new OrderTemplate({
            id: resource.id,
            name: resource.template_name ?? getBlankValueLabelText(),
            customerShortName: order.customer?.shortName ?? null,
            subcustomerName: (order.customer?.isSubcustomer) ? (order.customer?.name ?? null) : null,
            operationName: order.operation?.name ?? null,
            serviceName: order.service?.name ?? null,
            customerReference: order.customerReference,
            senderReference: order.senderReference,
            recipientReference: order.recipientReference,
            plannedPickupAt: order.plannedPickupAt ?? null,
            plannedDeliveryAt: order.plannedDeliveryAt ?? null,
            pickupName: pickupStop?.name ?? null,
            pickupPostalCode: pickupStop?.postalCode ?? null,
            pickupCity: pickupStop?.city ?? null,
            deliveryName: deliveryStop?.name ?? null,
            deliveryPostalCode: deliveryStop?.postalCode ?? null,
            deliveryCity: deliveryStop?.city ?? null,
            plannerInstructions: plannerNote?.notes ?? null,
            isScheduled: (order.scheduleEntries?.length ?? 0) > 0,
        });
    }
}


