type JsonApiResourceIdentifier = {
    type: string,
    id: string,
};

type JsonApiResource = {
    type: string,
    id: string,
    attributes?: Record<string, string | number | boolean | object | null>,
    relationships?: Record<string, { data: JsonApiResourceIdentifier | JsonApiResourceIdentifier[] | null }>,
};

export class JsonApiOperation {
    type: JsonApiOperationType;
    resource: JsonApiResource | undefined;
    identifier: JsonApiResourceIdentifier | undefined;

    resourceType: string;
    resourceId: string;

    // either resource or identifier must be set
    constructor(
        { type, resource, identifier }:
        { type: JsonApiOperationType } & (
            { resource: JsonApiResource, identifier?: never }
            |
            { resource?: never, identifier: JsonApiResourceIdentifier }
        )
    ) {
        this.type = type;
        this.resource = resource;
        this.identifier = identifier;

        this.resourceType = (resource) ? resource.type : identifier.type;
        this.resourceId = (resource) ? resource.id : identifier.id;
    }

    getRequestBody() {
        if (this.type === JsonApiOperationType.Remove) {
            return {
                op: this.type,
                ref: this.identifier
            };
        }
        return {
            op: this.type,
            data: this.resource
        };
    }
}
