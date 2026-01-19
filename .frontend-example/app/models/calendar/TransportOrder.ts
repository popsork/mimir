import { Model } from "pinia-orm";
import { CalendarUnit } from "~/models/calendar/Unit";

export class CalendarTransportOrder extends Model {
    static override entity = "orm-calendar-transport-orders";

    static override fields() {
        return {
            id: this.string(null),
            orderId: this.string(null),
            status: this.string(null),
            customerShortName: this.string(null),
            lastStopPostalCode: this.string(null),
            lastStopCity: this.string(null),
            number: this.string(null),

            startsAt: this.string(null),
            endsAt: this.string(null),

            unitId: this.string(null),
            unit: this.belongsTo(CalendarUnit, "unitId"),

            updatedAt: this.string(null),
        };
    }

    declare id: string;
    declare orderId: string | null;
    declare status: TransportOrderStatusName;
    declare customerShortName: string;
    declare lastStopPostalCode: string;
    declare lastStopCity: string;
    declare number: string;

    declare startsAt: string; // not using Date here because pinia-orm seems to transform it to a string anyway
    declare endsAt: string;

    declare unitId: string;

    declare updatedAt: string;

    static fromOrderRow(row: OrderRow) {
        return new CalendarTransportOrder({
            id: row.id,
            orderId: row.order_id,
            unitId: row.unit_id,
            startsAt: row.pickup_earliest_at_utc,
            endsAt: row.delivery_latest_at_utc,

            status: row.status,
            customerShortName: row.customer_short_name,
            lastStopPostalCode: row.customer_delivery_postal_code,
            lastStopCity: row.customer_delivery_city,
            number: row.number,

            updatedAt: row.updated_at_utc,
        });
    }
}
