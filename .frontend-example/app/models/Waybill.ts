import { BaseModel } from "~/models/BaseModel";

export type WaybillApiResourceIdentifier = { type: "waybills", id: string };

export type WaybillApiResponseResource = WaybillApiResourceIdentifier & {
    number: string,
};

export class Waybill extends BaseModel<WaybillApiResourceIdentifier> {
    static override entity = "orm-waybills";
    static override apiResourceType = "waybills" as const;

    static override fields() {
        return {
            id: this.string(null),
            number: this.string(null),
        };
    }

    declare id: string;
    declare number: string;

    static fromApiResponse(resource: WaybillApiResponseResource) {
        return new Waybill({
            id: resource.id,
            number: resource.number,
        });
    }
}
