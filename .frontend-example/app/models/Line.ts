import { BaseModel } from "~/models/BaseModel";

export type LineApiResourceIdentifier = { type: "lines", id: string };

export type LineApiResponseResource = LineApiResourceIdentifier & {
    name: string,
    line_type: LineType,
};

export class Line extends BaseModel<LineApiResourceIdentifier> {
    static override entity = "orm-lines";
    static override apiResourceType = "lines" as const;

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),
            type: this.string(null),

            sequenceNumber: this.number(null)
        };
    }

    declare id: string;
    declare name: string;
    declare type: LineType;

    declare sequenceNumber: number;

    static fromApiResponse(resource: LineApiResponseResource) {
        return new Line({
            id: resource.id,
            name: resource.name,
            type: resource.line_type,
        });
    }
}
