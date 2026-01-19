import { JsonApiErrorCollection } from "~/models/JsonApiErrorCollection";
import type { JsonApiOperation } from "~/models/JsonApiOperation";

export function extractDisplayableJsonApiErrors(
    { error, atomicOperations }: { error: any, atomicOperations?: JsonApiOperation[] }
) {
    const acceptedStatusCodes = [
        HttpStatus.UnprocessableEntity,
        HttpStatus.TooManyRequests,
        HttpStatus.Conflict,
    ];

    if (acceptedStatusCodes.includes(error?.response?.status) && error.response.data?.errors) {
        return JsonApiErrorCollection.fromResponseErrors({
            errors: error.response.data.errors,
            atomicOperations
        });
    }

    return null;
}

