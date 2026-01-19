import { Model } from "pinia-orm";
import type { Unit } from "~/models/Unit";

export class CalendarUnit extends Model {
    static override entity = "orm-calendar-units";

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),
            number: this.string(null),
            carrierName: this.string(null),
            driverName: this.string(null),
            driverPhone: this.string(null),
            vehicleDescription: this.string(null),
            vehicleComment: this.string(null)
        };
    }

    declare id: string;
    declare name: string | null;
    declare number: string | null;
    declare carrierName: string | null;
    declare driverName: string | null;
    declare driverPhone: string | null;
    declare vehicleDescription: string | null;
    declare vehicleComment: string | null;

    static fromUnit(unit: Unit): CalendarUnit {
        return new CalendarUnit({
            id: unit.id,
            name: unit.name,
            number: unit.number,

            // loading of these fields is not currently implemented.
            // could be through deeper relationships of the unit in the future (:TODO:TMS-1885:),
            // as these are not part of the Unit model in BE.
            // note that if these get implemented, then it probably is not enough to load these records only once,
            // as some of these values may change during the day, e.g., driver's name
            carrierName: null,
            driverName: null,
            driverPhone: null,
            vehicleDescription: null,
            vehicleComment: null
        });
    }
}

