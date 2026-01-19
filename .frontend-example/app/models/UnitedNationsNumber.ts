import { BaseModel } from "~/models/BaseModel";

export type UnitedNationsNumberApiResourceIdentifier = { type: "unitedNationsNumbers", id: string };

export type UnitedNationsNumberApiResponseResource = UnitedNationsNumberApiResourceIdentifier & {
    value: number,
    class: string,
    name: string | null,
};

export class UnitedNationsNumber extends BaseModel<UnitedNationsNumberApiResourceIdentifier> {
    static override entity = "orm-united-nations-numbers";
    static override apiResourceType = "unitedNationsNumbers" as const;

    static override fields() {
        return {
            id: this.string(null),
            value: this.string(null),
            adrClass: this.string(null),

            name: this.string(null),

            label: this.string(null), // a calculated field for displaying

            sequenceNumber: this.number(null),
        };
    }

    declare id: string;
    declare value: string;
    declare adrClass: string;

    declare name: string;

    declare label: string;

    declare sequenceNumber: number;

    static buildLabel({ value, adrClass, name }: { value: string, adrClass: string, name: string | null }) {
        const label = [
            value,
            adrClass,
            name,
        ].filter(value => !!value).join(", ");

        return label;
    }

    static fromApiResponse(resource: UnitedNationsNumberApiResponseResource) {
        const value = resource.value.toString().padStart(4, "0");

        const adrClass = resource.class;

        const name = resource.name;
        const label = this.buildLabel({ value, adrClass, name });

        return new UnitedNationsNumber({
            id: resource.id,
            value,
            adrClass,
            name,

            label,
        });
    }
}
