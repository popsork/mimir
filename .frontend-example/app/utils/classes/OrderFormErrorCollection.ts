import { JsonApiError } from "~/models/JsonApiError";
import { JsonApiErrorCollection } from "~/models/JsonApiErrorCollection";

export class OrderFormErrorCollection {

    protected errors: JsonApiErrorCollection;
    protected resourceErrors!: JsonApiErrorCollection;
    protected specialErrors!: JsonApiErrorCollection;

    constructor(errors: JsonApiErrorCollection) {
        this.errors = errors;
        this.processErrors();
    }

    processErrors(): void {
        const resourceErrors = [] as JsonApiError[];
        const specialErrors = [] as JsonApiError[];

        const { $i18n } = useNuxtApp();
        const t = $i18n.t;

        this.errors.forEach((error) => {
            if (error.code === "auto-plan-not-possible") {
                const message = [
                    t("order.messages.Auto-planning failed"),
                    error.detail
                ].filter(Boolean).join(": ");

                specialErrors.push(new JsonApiError({ detail: message }));
                return;
            }
            if (error.code === "optimistic-locking") {
                const message = [
                    t("order.messages.A newer version of this order has been detected"),
                    t("order.messages.Changes cannot be saved"),
                    t("general.error.Please reload the page"),
                ].join(". ");
                specialErrors.push(new JsonApiError({ detail: message }));
                return;
            }
            resourceErrors.push(error);
        });

        this.resourceErrors = JsonApiErrorCollection.fromArray(resourceErrors);
        this.specialErrors = JsonApiErrorCollection.fromArray(specialErrors);
    }

    getAllErrors(): JsonApiErrorCollection {
        return this.errors;
    }

    getResourceErrors(): JsonApiErrorCollection {
        return this.resourceErrors;
    }

    getSpecialErrors(): JsonApiErrorCollection {
        return this.specialErrors;
    }

}
