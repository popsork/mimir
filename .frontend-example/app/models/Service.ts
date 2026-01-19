import { BaseModel } from "~/models/BaseModel";
import type { OperationApiResponseResource } from "~/models/Operation";

export type ServiceApiResourceIdentifier = { type: "services", id: string };

type ServiceApiResourceAttributes = {
    name: string,
    is_additional: boolean,
};

export type ServiceApiResponseResource = ServiceApiResourceIdentifier & ServiceApiResourceAttributes & {
    operations: { data?: OperationApiResponseResource[] },
};

export class Service extends BaseModel<ServiceApiResourceIdentifier> {
    static override entity = "orm-services";
    static override apiResourceType = "services" as const;

    static override fields() {
        return {
            id: this.string(null),
            name: this.string(null),

            isAdditional: this.boolean(false),

            sequenceNumber: this.number(null),

            operationIds: this.attr([]),
        };
    }

    declare id: string;
    declare name: string;

    declare isAdditional: boolean;

    declare sequenceNumber: number;

    declare operationIds: string[];

    static fromApiResponse(resource: ServiceApiResponseResource) {
        const operationIds = (resource.operations?.data || []).map(relation => relation.id);

        return new Service({
            id: resource.id,
            name: resource.name,
            isAdditional: resource.is_additional,
            operationIds
        });
    }
}
