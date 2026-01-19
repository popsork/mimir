
import { useAuthenticationStore } from "~/stores/authentication";

// any function that calls JSON API methods using useApi() and may throw unhandled errors from unexpected API responses
// should be wrapped inside this function when defined.

// this automatically handles all 401 responses,
// and displays unhandled errors in an overlay so that the user knows that something went wrong

// wrapper code based on https://stackoverflow.com/a/61212868, see link for more details

type AnyFunction = (...args: any[]) => any;

export function wrapFunctionInApiErrorHandler<Func extends AnyFunction>(fn: Func): ((...args: Parameters<Func>) => Promise<ReturnType<Func>>) {

    return async (...args: Parameters<Func>): Promise<ReturnType<Func>> => {
        return fn(...args).catch((error: any) => {
            if (error && error.isApiError && error.response?.status === HttpStatus.Unauthenticated) {
                // the only case when the API may return a 401 status is when the provided authentication token is invalid,
                // so for any 401 response received to any API request
                // automatically deauthenticate user, clear any API tokens stored in localstorage and force user to log in again
                useAuthenticationStore().performSignOut();
                return;
            }

            if (error && error.isAxiosError && error.code === "ECONNABORTED" && error.message && !error.message.includes("timeout")) {
                // a connection aborted error may happen if the user hits refresh during an API request, e.g. when loading something.
                // in most cases, nothing should be done, because the user is leaving the application,
                // and it is ok to silently abort the request.
                // in case some additional cleanup is needed, it can be added in the specific request handling code

                // axios also sets code to ECONNABORTED when a request times out,
                // so a workaround to differentiate aborted requests from timed out requests is to look for "timeout" in the message
                return;
            }

            if (error && error.isApiError) {
                // for any other API error, store the error (it shows a message to the user)
                const apiStore = useApiStore();
                console.log("Setting API error", JSON.stringify(error));
                apiStore.error = error;
            }

            throw error;
        });
    };
}
