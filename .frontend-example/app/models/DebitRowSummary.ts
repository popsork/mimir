import { BaseModel } from "~/models/BaseModel";

export type DebitRowSummaryApiResourceIdentifier = { type: "debitRowSummaries", id: string };

export type DebitRowSummaryApiResponseResource = DebitRowSummaryApiResourceIdentifier & {

    // these are all floats in API
    real_revenue: number | null,
    real_revenue_with_tax: number | null,
    real_expense: number | null,
    real_expense_with_tax: number | null,

};


export class DebitRowSummary extends BaseModel<DebitRowSummaryApiResourceIdentifier> {
    static override entity = "orm-debit-row-summaries";
    static override apiResourceType = "debitRowSummaries" as const;

    static override fields() {
        return {
            id: this.string(null),

            revenueWithoutTax: this.number(null),
            revenueWithTax: this.number(null),
            expensesWithoutTax: this.number(null),
            expensesWithTax: this.number(null),

        };
    }

    declare id: string;
    declare revenueWithoutTax: number | null;
    declare revenueWithTax: number | null;
    declare expensesWithoutTax: number | null;
    declare expensesWithTax: number | null;

    expenseLargerThanRevenue() {
        if (this.revenueWithoutTax === null || this.expensesWithoutTax === null) {
            return false;
        }
        return this.expensesWithoutTax > this.revenueWithoutTax;
    }

    static fromApiResponse(resource: DebitRowSummaryApiResponseResource) {
        return new DebitRowSummary({
            id: resource.id,
            revenueWithoutTax: resource.real_revenue,
            revenueWithTax: resource.real_revenue_with_tax,
            expensesWithoutTax: resource.real_expense,
            expensesWithTax: resource.real_expense_with_tax,
        });
    }
}
