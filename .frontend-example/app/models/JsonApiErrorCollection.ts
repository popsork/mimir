import type { BaseModel } from "~/models/BaseModel";
import type { JsonApiOperation } from "~/models/JsonApiOperation";
import { JsonApiError } from "~/models/JsonApiError";


export class JsonApiErrorCollection extends Array<JsonApiError> {
    public forResourceTypes(resourceTypes: string[]) {
        return JsonApiErrorCollection.fromArray(this.filter(error => error.resourceType && resourceTypes.includes(error.resourceType)));
    }

    public forRecord<TIdentifier extends { type: string, id: string }>(record: BaseModel<TIdentifier> | null) {
        if (!record) {
            return new JsonApiErrorCollection();
        }
        const identifier = record.getApiResourceIdentifier();
        return this.forResource(identifier);
    }

    public exceptForRecord<TIdentifier extends { type: string, id: string }>(record: BaseModel<TIdentifier> | null) {
        if (!record) {
            return this;
        }
        const identifier = record.getApiResourceIdentifier();
        return JsonApiErrorCollection.fromArray(this.filter(error => !error.isForResource(identifier)));
    }

    public forResource<TIdentifier extends { type: string, id: string }>(identifier: TIdentifier) {
        return JsonApiErrorCollection.fromArray(this.filter(error => error.isForResource(identifier)));
    }

    public withoutResource() {
        return JsonApiErrorCollection.fromArray(this.filter(error => !error.resourceType && !error.resourceId));
    }

    public forFields(fieldNames: string[]) {
        return JsonApiErrorCollection.fromArray(this.filter(error => error.fieldName && fieldNames.includes(error.fieldName)));
    }

    public forField(fieldName: string) {
        return this.forFields([fieldName]);
    }

    public withoutField() {
        return JsonApiErrorCollection.fromArray(this.filter(error => !error.fieldName));
    }

    public exceptForFields(fieldNames: string[]) {
        return JsonApiErrorCollection.fromArray(this.filter(error => !fieldNames.includes(error.fieldName as string)));
    }

    public remapFields(fieldMap: Record<string, string>) {
        return JsonApiErrorCollection.fromArray(this.map((error) => {
            const clonedInstance = clone(error);
            if (clonedInstance.fieldName && fieldMap[clonedInstance.fieldName]) {
                clonedInstance.fieldName = fieldMap[clonedInstance.fieldName];
            }
            return clonedInstance;
        }));
    }

    public append(errors: JsonApiErrorCollection) {
        return JsonApiErrorCollection.fromArray(this.concat(errors));
    }

    static fromArray(errors: JsonApiError[]) {
        const collection = new JsonApiErrorCollection();
        errors.forEach((error) => {
            collection.push(error);
        });
        return collection;
    }

    static fromResponseErrors(
        { errors, atomicOperations }:
        { errors: Partial<JsonApiError>[], atomicOperations?: JsonApiOperation[] }
    ) {
        const errorArray = errors.map(responseError => new JsonApiError(responseError, atomicOperations));
        return this.fromArray(errorArray);
    }
}
