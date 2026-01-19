import { BaseModel } from "~/models/BaseModel";
import { CustomerOrder, type CustomerOrderApiResourceIdentifier } from "~/models/CustomerOrder";

export type OrderInvoiceabilityApiResourceIdentifier = { type: "orderInvoiceabilities", id: string };

type OrderInvoiceabilityApiResourceResult = {
    orderId: string,
    success: boolean,
    message: string | null,
};

type OrderInvoiceabilityApiResourceAttributes = {
    results: OrderInvoiceabilityApiResourceResult[],
};

// results are not sent to the server and only appear in the response
type OrderInvoiceabilityApiRequestResourceAttributes = Omit<OrderInvoiceabilityApiResourceAttributes, "results">;

export type OrderInvoiceabilityApiRequestResource = OrderInvoiceabilityApiResourceIdentifier & {
    attributes: OrderInvoiceabilityApiRequestResourceAttributes,
    relationships: {
        orders: { data: CustomerOrderApiResourceIdentifier[] },
    },
};

export type OrderInvoiceabilityApiResponseResource = OrderInvoiceabilityApiResourceIdentifier & OrderInvoiceabilityApiResourceAttributes;

export class OrderInvoiceability extends BaseModel<OrderInvoiceabilityApiResourceIdentifier> {
    static override entity = "orm-order-invoiceabilities";
    static override apiResourceType = "orderInvoiceabilities" as const;

    static override fields() {
        return {
            id: this.string(null),

            orderIds: this.attr([]),
            results: this.attr([]),
        };
    }

    declare id: string;

    declare orderIds: string[];
    declare results: OrderInvoiceabilityApiResourceResult[] | null;

    static buildBlank({ orderIds }: { orderIds: string[] }) {
        const record = new OrderInvoiceability();
        record.id = generateNewUuid();
        record.orderIds = orderIds;
        return record;
    }

    getResultTotals() {
        const totals = {
            success: 0,
            failure: 0,
        };
        this.results?.forEach(result => {
            if (result.success) {
                totals.success++;
            } else {
                totals.failure++;
            }
        });
        return totals;
    }

    static fromApiResponse(resource: OrderInvoiceabilityApiResponseResource) {
        return new OrderInvoiceability({
            id: resource.id,
            results: resource.results || [],
        });
    }

    toApiRequestResource(): OrderInvoiceabilityApiRequestResource {
        return {
            ...(OrderInvoiceability.getApiResourceIdentifier(this.id)!),
            attributes: {},
            relationships: {
                orders: { data: this.orderIds.map(id => CustomerOrder.getApiResourceIdentifier(id)!) }
            }
        };
    }
}
