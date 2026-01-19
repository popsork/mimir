import { Model } from "pinia-orm";
import type { TableColumnType } from "~/enums/TableColumnType";

export type SelfBillingOrderColumnApiResponseResource = {
    key: string,

    // As this data comes from an ordinary REST request and not JSON:API
    // the "type" property is used for column type.
    // :TODO:TMS-1020: This will need to be refactored
    type: TableColumnType, // column_type
    sortable: boolean,
    weight: number,
};

export class SelfBillingOrderColumn extends Model {
    static override entity = "orm-self-billing-order-columns";
    static override primaryKey = "key";

    static override fields() {
        return {
            key: this.string(null),
            columnType: this.string(null),
            sortable: this.boolean(null),
            weight: this.number(null)
        };
    }

    declare key: string;
    declare columnType: TableColumnType;
    declare sortable: boolean;
    declare weight: number;

    static fromApiResponse(resource: SelfBillingOrderColumnApiResponseResource) {
        return new SelfBillingOrderColumn({
            key: resource.key,
            columnType: resource.type, // :TODO:TMS-1020:
            sortable: resource.sortable,
            weight: resource.weight,
        });
    }
}
