import { BaseModel } from "~/models/BaseModel";

export type WasteCodeApiResourceIdentifier = { type: "wasteCodes", id: string };

export type WasteCodeApiResponseResource = WasteCodeApiResourceIdentifier & {
    shortname: string,
    product_type: string,
    description: string | null,
    variant: WasteCodeVariant,
};

export class WasteCode extends BaseModel<WasteCodeApiResourceIdentifier> {
    static override entity = "orm-waste-codes";
    static override apiResourceType = "wasteCodes" as const;

    static override fields() {
        return {
            id: this.string(null),
            shortName: this.string(null),
            productType: this.string(null),
            description: this.string(null),
            variant: this.string(null),

            label: this.string(null), // a calculated field for displaying

            sequenceNumber: this.number(null),
        };
    }

    declare id: string;
    declare shortName: string;
    declare productType: string;
    declare description: string | null;
    declare variant: WasteCodeVariant;

    declare label: string;

    declare sequenceNumber: number;

    static buildLabel(
        { shortName, variant, description }:
        {
            shortName: string,
            variant: WasteCodeVariant,
            description: string | null,
        }
    ) {
        const { $i18n } = useNuxtApp();
        const t = $i18n.t;

        const label = [
            shortName,
            t(`waste_codes.variants.${variant}`),
            description,
        ].filter(value => !!value).join(", ");

        return label;
    }


    static fromApiResponse(resource: WasteCodeApiResponseResource) {
        const shortName = String(resource.shortname).padStart(6, "0");
        const variant = resource.variant;
        const description = resource.description;

        const label = this.buildLabel({ shortName, variant, description });

        return new WasteCode({
            id: resource.id,
            shortName,
            productType: resource.product_type,
            description,
            variant,
            label
        });
    }
}
