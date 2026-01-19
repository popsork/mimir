import { ApiClient } from "~/utils/classes/ApiClient";

export default defineNuxtPlugin(() => {
    return {
        provide: {
            apiClient: new ApiClient()
        }
    };
});
