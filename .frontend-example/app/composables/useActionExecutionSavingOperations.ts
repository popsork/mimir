import type { ActionExecution } from "~/models/ActionExecution";
import { JsonApiOperation } from "~/models/JsonApiOperation";

export const useActionExecutionSavingOperations = (actionExecutions: ActionExecution[]) => {

    const buildOperations = (actionExecutions: ActionExecution[]) => {
        const operations = [] as JsonApiOperation[];

        actionExecutions.forEach((actionExecution) => {
            operations.push(new JsonApiOperation({
                type: JsonApiOperationType.Add,
                resource: actionExecution.toApiRequestResource()
            }));
        });

        return operations;
    };

    return buildOperations(actionExecutions);
};
