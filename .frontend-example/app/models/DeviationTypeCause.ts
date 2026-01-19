import { Model } from "pinia-orm";
export class DeviationTypeCause extends Model {
    static override entity = '"orm-deviation-types-causes';
    static override primaryKey = [ "typeId", "causeId" ];

    static override fields() {
        return {
            typeId: this.string(null),
            causeId: this.string(null),
            sequenceNumber: this.number(null),
        };
    }

    declare typeId: string;
    declare causeId: string;
    declare sequenceNumber: number;
}
