import { BaseModel } from "~/models/BaseModel";

export type ActionApiResourceIdentifier = { type: "actions", id: string };

export type ActionApiResponseResource = ActionApiResourceIdentifier & {
    name: string,
    key: string,
};

export class Action extends BaseModel<ActionApiResourceIdentifier> {
    static override entity = "orm-actions";
    static override apiResourceType = "actions" as const;

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),
            key: this.string(null),
        };
    }

    declare id: string;
    declare name: string;
    declare key: string;


    static fromApiResponse(resource: ActionApiResponseResource): Action {
        return new Action({
            id: resource.id,
            name: resource.name,
            key: resource.key,
        });
    }
}
