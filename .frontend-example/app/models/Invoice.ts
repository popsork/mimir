import { BaseModel } from "~/models/BaseModel";
import { InvoicingProcess } from "~/models/InvoicingProcess";

export type InvoiceApiResourceIdentifier = { type: "invoices", id: string };

type InvoiceAddressSnapshotApiAttributes = {
    street: string,
    number: string,
    postcode: string,
    city: string,
    country: string,
};

type InvoiceAddress = {
    streetName: string,
    streetNumber: string,
    postalCode: string,
    city: string,
    country: string,
};

type InvoiceIssuerSnapshotApiAttributes = {
    name: string,
    phone: string,
    orgNr: string,
    vatNr: string,
    web: string,
    bank: string,
    iban: string,
    swift: string,
    bankgiro: string,
    address: InvoiceAddressSnapshotApiAttributes,
};

type InvoiceIssuer = {
    name: string,
    phone: string,
    organizationNumber: string,
    vatNumber: string,
    website: string,
    bank: string,
    iban: string,
    swift: string,
    bankgiro: string,
    address: InvoiceAddress,
};

type InvoiceCustomerSnapshotApiAttributes = {
    number: string,
    name: string,
    vatNr: string,
    gln: string,
    address: InvoiceAddressSnapshotApiAttributes,
};

type InvoiceCustomer = {
    number: string,
    name: string,
    vatNumber: string,
    gln: string,
    address: InvoiceAddress,
};

type InvoiceGoodsRowSnapshotApiAttributes = {
    quantity: string, // number with unit text, e.g., "37899.0 litres"
    loadingMetres: string, // numerical amount with no unit, served as string, e.g. "12.23"
    palletPlaces: string, // numerical amount with no unit, served as string, e.g. "2.0"
    weight: string, // number with unit text, e.g., "849.00 KG"
    volume: string, // number with unit text, e.g., "4.21 M3"
};

export type InvoiceGoodsRow = {
    quantityText: string,
    loadingMetres: number, // actual number, as float
    palletPlaces: number, // actual number, as float
    weightText: string,
    volumeText: string,
};

type InvoiceSpecificationRowSnapshotApiAttributes = {
    startDate: string, // not in the normal Y-m-d format, but a string like "20250816". should be used without parsing or formatting
    endDate: string, // not in the normal Y-m-d format, but a string like "20250818". should be used without parsing or formatting
    from: string,
    to: string,
    activity: string,
    quantity: string, // numerical amount with no unit, served as string, e.g. "1.0"
    unit: string, // unit text
    executions: string, // numerical amount with no unit, served as string, e.g. "1",
    hours: string, // numerical amount with no unit, served as string, e.g. "1.25"
};

export type InvoiceSpecificationRow = {
    startDateText: string,
    endDateText: string,
    startPointName: string,
    endPointName: string,
    activityName: string,
    quantity: number, // actual number, as float
    unitText: string,
    executions: number, // actual number, treateed as float, though probably always an integer
    hours: number, // actual number, as float
};

type InvoiceDebitRowSnapshotApiAttributes = {
    specification: string,
    quantity: string, // number with unit text, e.g. "1 styck"
    price: string,  // amount in major units, served as string, e.g. "1234.56"
    total: string,  // amount in major units, served as string, e.g. "1234.56"
};

export type InvoiceDebitRow = {
    specification: string,
    quantityText: string,
    price: number,  // amount in major units as float
    total: number,  // amount in major units as float
};

type InvoiceOrderSnapshotApiAttributes = {
    startDate: string, // not in the normal Y-m-d format, but a string like "20250812"
    endDate: string, // not in the normal Y-m-d format, but a string like "20250818"
    orderNumber: string,
    waybillNumber: string,
    customerContact: string,
    orderReference: string,
    firstStop: string,
    lastStop: string,
    goodsRows: InvoiceGoodsRowSnapshotApiAttributes[],
    specifications: InvoiceSpecificationRowSnapshotApiAttributes[],
    debitRows: InvoiceDebitRowSnapshotApiAttributes[],
};

export type InvoiceOrder = {
    startDateText: string,
    endDateText: string,
    number: string,
    waybillNumber: string,
    contactName: string,
    customerReference: string,
    firstStopName: string,
    lastStopName: string,
    goodsRows: InvoiceGoodsRow[],
    specificationRows: InvoiceSpecificationRow[],
    debitRows: InvoiceDebitRow[],
};

type InvoiceVatAmountSnapshotApiAttributes = {
    vatRate: string, // percentage number, served as string, e.g. "25"
    amount: string, // amount in major units, served as string, e.g. "1234.56"
};

type InvoiceVatAmount = {
    vatRate: number, // percentage number as float
    amount: number, // amount in major units as float
};

type InvoiceTotalsSnapshotApiAttributes = {
    vatAmounts: InvoiceVatAmountSnapshotApiAttributes[],
    taxableAmount: string, // amount in major units, served as string, e.g. "1234.56"
    netAmount: string, // amount in major units, served as string, e.g. "1234.56"
    totalAmount: string, // amount in major units, served as string, e.g. "1234.56"
    rounding: string, // amount in major units, served as string, e.g. "0.00"
    finalAmount: string, // amount in major units, served as string, e.g. "1234.56"
};

type InvoiceTotals = {
    vatAmounts: InvoiceVatAmount[],
    taxableAmount: number, // amount in major units as float
    netAmount: number, // amount in major units as float
    totalAmount: number, // amount in major units as float
    roundingAmount: number, // amount in major units as float
    finalAmount: number, // amount in major units as float
};


type InvoiceSnapshotApiAttributes = {
    issuer: InvoiceIssuerSnapshotApiAttributes,
    customer: InvoiceCustomerSnapshotApiAttributes,
    orders: InvoiceOrderSnapshotApiAttributes[],
    totals: InvoiceTotalsSnapshotApiAttributes,
};

type InvoiceApiResourceAttributes = {
    number: number, // API sends this as a number, but it should be treated as a string
    invoice_date: string | null, // ISO 8601 date
    bookkeeping_date: string | null, // ISO 8601 date
    payment_terms_days: number | null,
    data_snapshot: InvoiceSnapshotApiAttributes,
};

export type InvoiceApiResponseResource = InvoiceApiResourceIdentifier & InvoiceApiResourceAttributes & {

};

export class Invoice extends BaseModel<InvoiceApiResourceIdentifier> {
    static override entity = "orm-invoices";
    static override apiResourceType = "invoices" as const;

    static override fields() {
        return {
            id: this.string(null),
            sequenceNumber: this.number(null),

            number: this.string(null),
            invoiceDate: this.string(null),
            bookkeepingDate: this.string(null),
            paymentTermsDays: this.number(null),

            issuer: this.attr(null),
            customer: this.attr(null),
            orders: this.attr(null),
            totals: this.attr(null),

            processId: this.string(null),
            process: this.belongsTo(InvoicingProcess, "processId"),
        };
    }

    declare id: string;
    declare sequenceNumber: number;

    declare number: string | null;

    declare invoiceDate: string | null;
    declare bookkeepingDate: string | null;

    declare paymentTermsDays: number | null;

    declare issuer: InvoiceIssuer | null;
    declare customer: InvoiceCustomer | null;
    declare orders: InvoiceOrder[] | null;
    declare totals: InvoiceTotals | null;

    declare processId: string | null;
    declare process: InvoicingProcess | null;

    static fromApiResponse(resource: InvoiceApiResponseResource) {
        const {
            issuer,
            customer,
            orders,
            totals
        } = this.buildSnapshotAttributesFromApiResponse(resource.data_snapshot);

        return new Invoice({
            id: resource.id,

            number: resource.number?.toString() ?? null,

            invoiceDate: resource.invoice_date,
            bookkeepingDate: resource.bookkeeping_date,

            paymentTermsDays: resource.payment_terms_days,

            issuer,
            customer,
            orders,
            totals,
        });
    }

    static buildSnapshotAttributesFromApiResponse(snapshot: InvoiceSnapshotApiAttributes) {
        return {
            issuer: this.buildIssuerFromApiResponse(snapshot.issuer ?? null),
            customer: this.buildCustomerFromApiResponse(snapshot.customer ?? null),
            orders: this.buildOrdersFromApiResponse(snapshot.orders ?? null),
            totals: this.buildTotalsFromApiResponse(snapshot.totals ?? null),
        };
    }

    static buildIssuerFromApiResponse(issuerAttributes: InvoiceIssuerSnapshotApiAttributes | null) {
        if (!issuerAttributes) {
            return null;
        }

        const issuer: InvoiceIssuer = {
            name: issuerAttributes.name,
            phone: issuerAttributes.phone,
            organizationNumber: issuerAttributes.orgNr,
            vatNumber: issuerAttributes.vatNr,
            website: issuerAttributes.web,
            bank: issuerAttributes.bank,
            iban: issuerAttributes.iban,
            swift: issuerAttributes.swift,
            bankgiro: issuerAttributes.bankgiro,
            address: this.buildAddressFromApiResponse(issuerAttributes.address),
        };

        return issuer;
    }

    static buildCustomerFromApiResponse(customerAttributes: InvoiceCustomerSnapshotApiAttributes | null) {
        if (!customerAttributes) {
            return null;
        }

        const customer: InvoiceCustomer = {
            number: customerAttributes.number,
            name: customerAttributes.name,
            vatNumber: customerAttributes.vatNr,
            gln: customerAttributes.gln,
            address: this.buildAddressFromApiResponse(customerAttributes.address),
        };

        return customer;
    }


    static buildAddressFromApiResponse(addressAtributes: InvoiceAddressSnapshotApiAttributes) {
        const address: InvoiceAddress = {
            streetName: addressAtributes.street,
            streetNumber: addressAtributes.number,
            postalCode: addressAtributes.postcode,
            city: addressAtributes.city,
            country: addressAtributes.country,
        };
        return address;
    }

    static buildOrdersFromApiResponse(ordersAttributes: InvoiceOrderSnapshotApiAttributes[] | null) {
        if (!ordersAttributes) {
            return null;
        }

        const orders: InvoiceOrder[] = ordersAttributes.map(orderAttributes => {
            const order: InvoiceOrder = {
                startDateText: orderAttributes.startDate,
                endDateText: orderAttributes.endDate,
                number: orderAttributes.orderNumber,
                waybillNumber: orderAttributes.waybillNumber,
                contactName: orderAttributes.customerContact,
                customerReference: orderAttributes.orderReference,
                firstStopName: orderAttributes.firstStop,
                lastStopName: orderAttributes.lastStop,
                goodsRows: this.buildGoodsRowsFromApiResponse(orderAttributes.goodsRows ?? []),
                specificationRows: this.buildSpecificationRowsFromApiResponse(orderAttributes.specifications ?? []),
                debitRows: this.buildDebitRowsFromApiResponse(orderAttributes.debitRows ?? []),
            };

            return order;
        });
        return orders;
    }

    static buildGoodsRowsFromApiResponse(goodsRowsAttributes: InvoiceGoodsRowSnapshotApiAttributes[]) {
        const goodsRows = goodsRowsAttributes.map(rowAttributes => {
            const goodsRow: InvoiceGoodsRow = {
                quantityText: rowAttributes.quantity,
                loadingMetres: parseFloat(rowAttributes.loadingMetres),
                palletPlaces: parseFloat(rowAttributes.palletPlaces),
                weightText: rowAttributes.weight,
                volumeText: rowAttributes.volume,
            };
            return goodsRow;
        });
        return goodsRows;
    }

    static buildSpecificationRowsFromApiResponse(specificationRowsAttributes: InvoiceSpecificationRowSnapshotApiAttributes[]) {
        const specificationRows = specificationRowsAttributes.map(rowAttributes => {
            const specificationRow: InvoiceSpecificationRow = {
                startDateText: rowAttributes.startDate,
                endDateText: rowAttributes.endDate,
                startPointName: rowAttributes.from,
                endPointName: rowAttributes.to,
                activityName: rowAttributes.activity,
                quantity: parseFloat(rowAttributes.quantity),
                unitText: rowAttributes.unit,
                executions: parseFloat(rowAttributes.executions),
                hours: parseFloat(rowAttributes.hours),
            };
            return specificationRow;
        });
        return specificationRows;
    }

    static buildDebitRowsFromApiResponse(debitRowsAttributes: InvoiceDebitRowSnapshotApiAttributes[]) {
        const debitRows = debitRowsAttributes.map(rowAttributes => {
            const debitRow: InvoiceDebitRow = {
                specification: rowAttributes.specification,
                quantityText: rowAttributes.quantity,
                price: parseFloat(rowAttributes.price),
                total: parseFloat(rowAttributes.total),
            };
            return debitRow;
        });
        return debitRows;
    }

    static buildTotalsFromApiResponse(totalsAttributes: InvoiceTotalsSnapshotApiAttributes | null) {
        if (!totalsAttributes) {
            return null;
        }

        const totals: InvoiceTotals = {
            vatAmounts: totalsAttributes.vatAmounts.map(vatAmountAttributes => ({
                vatRate: parseFloat(vatAmountAttributes.vatRate),
                amount: parseFloat(vatAmountAttributes.amount),
            })),
            taxableAmount: parseFloat(totalsAttributes.taxableAmount),
            netAmount: parseFloat(totalsAttributes.netAmount),
            totalAmount: parseFloat(totalsAttributes.totalAmount),
            roundingAmount: parseFloat(totalsAttributes.rounding),
            finalAmount: parseFloat(totalsAttributes.finalAmount),
        };

        return totals;
    }
}
