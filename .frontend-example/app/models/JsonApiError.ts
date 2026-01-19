import type { JsonApiOperation } from "~/models/JsonApiOperation";

type JsonApiErrorSource = {
    pointer?: string,
};

export class JsonApiError {
    id: string;

    code?: string;
    title?: string;
    detail?: string;
    source?: JsonApiErrorSource;

    // an error may optionally point to a resource and/or a specific field (attribute or relationship)
    resourceType?: string;
    resourceId?: string;

    fieldName?: string;

    message: string;

    constructor(object: Partial<JsonApiError> = {}, atomicOperations?: JsonApiOperation[]) {
        this.id = generateNewUuid(); // assign a unique internal id to use as :key in v-for loops
        this.code = object.code;
        this.title = object.title;
        this.detail = object.detail;
        this.message = this.getMessage();
        if (object.source) {
            this.source = { pointer: object.source.pointer };
            this.setSourceParts(atomicOperations);
        }
    }

    getMessage() {
        if (this.detail) {
            return this.detail;
        } else if (this.title) {
            return this.title;
        } else if (this.code) {
            return this.code;
        }
        return "Unknown error";
    }

    setSourceParts(atomicOperations: JsonApiOperation[] | undefined) {
        const pointer = this.source?.pointer;
        if (!pointer) {
            return;
        }

        // extract error source parts from the JSON pointer which looks something like this:
        // /data/attributes/name
        // /data/relationships/customer/data
        // /atomic:operations/0/data/attributes/name
        // /atomic:operations/0/data/relationships/customer/data
        // /atomic:operations/0/customer_id  <-- this is an invalid pointer format, but the API sometimes returns it like this (API bug TMS-2622)

        const pattern = /^((\/atomic:operations\/)(?<operationIndex>\d+))?\/(?<prefix>data\/(attributes|relationships)(\/))?(?<fieldName>[^/]+)(?<suffix>\/.+)?$/;
        const matches = pointer.match(pattern);
        const { operationIndex, prefix, fieldName } = matches?.groups || {};

        if (operationIndex !== undefined) {
            const operation = atomicOperations?.[parseInt(operationIndex)];
            if (operation) {
                this.resourceType = operation.resourceType;
                this.resourceId = operation.resourceId;
            }
        }

        let actualFieldName = fieldName;
        if (!prefix && typeof fieldName === "string" && fieldName.endsWith("_id")) {
            // handle invalid pointer format like /atomic:operations/0/customer_id by removing the _id suffix and converting to camelCase
            // (relationship names use camelCase, so cargo_type_id should become cargoType here)
            actualFieldName = camelize(fieldName.slice(0, -3));
        }

        this.fieldName = actualFieldName;
    }

    isForResource<TIdentifier extends { type: string, id: string }>(identifier: TIdentifier) {
        return this.resourceType === identifier.type && this.resourceId === identifier.id;
    }
}
