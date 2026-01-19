import { useLocalStorage, StorageSerializers } from "@vueuse/core";
import { ExternalAuthenticationSession, type ExternalAuthenticationSessionApiResponseResource } from "~/models/ExternalAuthenticationSession";
import { JsonApiError } from "~/models/JsonApiError";
import { JsonApiErrorCollection } from "~/models/JsonApiErrorCollection";
import { PasswordAuthenticationSession, type PasswordAuthenticationSessionApiResponseResource } from "~/models/PasswordAuthenticationSession";
import { PersonalAccessToken, type PersonalAccessTokenApiResponseResource } from "~/models/PersonalAccessToken";
import type { User } from "~/models/User";

export const useAuthenticationStore = defineStore("authentication", () => {
    // nuxt does not allow using useI18n() composable here for some reason, need to go via useNuxtApp().
    // this is probably because of where this store gets initialized in the app lifecycle.
    const { $i18n } = useNuxtApp();
    const t = $i18n.t;

    const { siteOrigin, apiOrigin } = useConfiguration();

    // configuration is not reactive, so these are also not computed refs
    const siteOriginUrl = (siteOrigin) ? new URL(siteOrigin) : null;
    const apiOriginUrl = (apiOrigin) ? new URL(apiOrigin) : null;

    const siteHostName = siteOriginUrl?.hostname || null;
    const apiHostName = apiOriginUrl?.hostname || null;

    const httpIsActive = siteOriginUrl?.protocol === "https:" && apiOriginUrl?.protocol === "https:";

    const getCookieDomain = () => {
        if (siteHostName === apiHostName) {
            return undefined; // hostnames match, so cookie can be set for current domain
        }

        // if hostnames don't match (currentlly possible only in local development environments),
        // return the common part of both hostnames for the cookie domain,

        // e.g., "motus-tms-frontend.localtest.me" and "motus-tms.localtest.me" will return "localtest.me"

        const siteParts = (siteHostName || "").split(".").reverse();
        const apiParts = (apiHostName || "").split(".").reverse();

        const minNumberOfParts = Math.min(siteParts.length, apiParts.length);
        const commonParts = [];
        for (let i = 0; i < minNumberOfParts; i++) {
            if (siteParts[i] === apiParts[i]) {
                commonParts.push(siteParts[i]);
            } else {
                break;
            }
        }

        if (commonParts.length < 1) {
            throw new Error("Cannot determine cookie domain because site and API origins do not share a common domain part");
        }

        return commonParts.reverse().join(".");
    };

    const cookieTokenId = useCookie(
        "personal-access-token-id", { domain: getCookieDomain(), sameSite: true, secure: httpIsActive }
    );

    const cookieTokenValue = useCookie(
        "personal-access-token-value", { domain: getCookieDomain(), sameSite: true, secure: httpIsActive }
    );

    const getPersonalAccessTokenFromLocalStorage = () => {
        const id = cookieTokenId.value;
        const value = cookieTokenValue.value;
        if (id && value) {
            return new PersonalAccessToken({ id, value });
        }
        return null;
    };

    const getDefaultValues = () => {
        return {
            personalAccessToken: getPersonalAccessTokenFromLocalStorage(),

            // this is the instance of the signed in user
            user: null as User | null,

            // this is false only during inital app load, while the token from localstorage (if it exists) is being checked against server
            userAuthenticationStateIsKnown: false,

            passwordForm: {
                email: "",
                password: "",
                errors: new JsonApiErrorCollection()
            },

            externalAuthenticationForm: {
                errors: new JsonApiErrorCollection()
            }
        };
    };


    const defaults = getDefaultValues();
    const personalAccessToken = ref(defaults.personalAccessToken);
    const user = ref(defaults.user);
    const userAuthenticationStateIsKnown = ref(defaults.userAuthenticationStateIsKnown);
    const passwordForm = ref(defaults.passwordForm);
    const externalAuthenticationForm = ref(defaults.externalAuthenticationForm);


    const loadCurrentUser = wrapFunctionInApiErrorHandler(async () => {
        if (personalAccessToken.value) {
            try {
                const apiResponse = await useApi().getPersonalAccessToken(personalAccessToken.value.id);

                const tokenResource = apiResponse.data as PersonalAccessTokenApiResponseResource;
                // construct new token instance to include the additional attributes received from API
                const receivedToken = PersonalAccessToken.fromApiResponse(tokenResource);
                // assign the secret value from the existing token, since it is not returned from the API
                receivedToken.value = personalAccessToken.value.value;
                personalAccessToken.value = receivedToken;

                setUser(receivedToken.user!); // in a successful response, the user is always included
            } catch (error) {
                const supportedErrors = [
                    HttpStatus.Unauthenticated,
                    HttpStatus.Forbidden,
                    HttpStatus.NotFound,

                    // temporarily allow 500 errors until TMS-912 is implemented.
                    // to avoid locking users out permanently in case an earlier token gets deleted in the database.
                    // this should be removed once the API is fixed.
                    HttpStatus.InternalServerError
                ];

                if (supportedErrors.includes(error?.response?.status)) {
                    // these errors mean that the token is invalid and user should be signed out
                    reset();
                } else if (error && error.isAxiosError && error.code === "ECONNABORTED") {
                    // a connection aborted error may happen if the user hits refresh during page load,
                    // while his token is being verified.
                    // in that case, the axios request gets aborted and throws an error.
                    // clear the user to be in the correct state, but do not reset the token in localstorage,
                    // because the user is already leaving the page (via refresh)
                    // and the token should be retried again on the upcoming page load
                    clearUser();
                } else {
                    // any other errors get rethrown, also clearing the user, but not the token,
                    // so that the user does not get signed out accidentally
                    clearUser();
                    throw error;
                }
            } finally {
                userAuthenticationStateIsKnown.value = true;
            }
        } else {
            clearUser();
            userAuthenticationStateIsKnown.value = true;
        }
    });

    const performPasswordSignIn = wrapFunctionInApiErrorHandler(async () => {
        try {
            const apiResponse = await useApi().createPasswordAuthenticationSession({
                email: passwordForm.value.email,
                password: passwordForm.value.password
            });
            const session = PasswordAuthenticationSession.fromApiResponse(apiResponse.data as PasswordAuthenticationSessionApiResponseResource);
            signUserInFromAuthenticationSession(session);
            clearForms();
            return true;
        } catch (error) {
            const displayableErrors = extractDisplayableJsonApiErrors({ error });
            if (displayableErrors) {
                passwordForm.value.errors = displayableErrors;
            } else {
                clearPasswordFormErrors();
                throw error;
            }
        }
    });

    const localStorageExternalAuthenticationSessionId = useLocalStorage(
        "current-external-authentication-session-id",
        null,
        { serializer: StorageSerializers.string }
    );

    const initiateExternalAuthenticationSession = wrapFunctionInApiErrorHandler(async (
        { authority, callbackUrl }: { authority : ExternalAuthenticationAuthority, callbackUrl: string }
    ) => {
        try {
            localStorageExternalAuthenticationSessionId.value = null;
            const apiResponse = await useApi().createExternalAuthenticationSession({ authority, callbackUrl });

            const session = ExternalAuthenticationSession.fromApiResponse(apiResponse.data as ExternalAuthenticationSessionApiResponseResource);

            if (session) {
                // external authenticators do not return any meta data to the callback url,
                // so the session's ID needs to be preserved in localstorage,
                // so that session can be retrieved on the authentication callback page
                // when the client returns with the code
                localStorageExternalAuthenticationSessionId.value = session.id;
            }

            clearExternalAuthenticationFormErrors();
            return session;
        } catch (error) {
            const displayableErrors = extractDisplayableJsonApiErrors({ error });
            if (displayableErrors) {
                externalAuthenticationForm.value.errors = displayableErrors;
            } else {
                clearExternalAuthenticationFormErrors();
                throw error;
            }
        }
    });

    const processExternalAuthenticationCode = wrapFunctionInApiErrorHandler(async ({ code } : { code: string }) => {
        try {
            const sessionId = localStorageExternalAuthenticationSessionId.value;

            if (!sessionId) {
                setExternalAuthenticationFormError(t("welcome.errors.Authentication session was not found"));
                return;
            }

            const apiResponse = await useApi().updateExternalAuthenticationSession({
                id: sessionId, code
            });
            const session = ExternalAuthenticationSession.fromApiResponse(apiResponse.data as ExternalAuthenticationSessionApiResponseResource);
            signUserInFromAuthenticationSession(session);
            clearForms();
            localStorageExternalAuthenticationSessionId.value = null; // only allow using the same session once
        } catch (error) {
            const displayableErrors = extractDisplayableJsonApiErrors({ error });
            if (displayableErrors) {
                externalAuthenticationForm.value.errors = displayableErrors;
            } else {
                clearExternalAuthenticationFormErrors();
                throw error;
            }
        }
    });

    const signUserInFromAuthenticationSession = (session: PasswordAuthenticationSession | ExternalAuthenticationSession) => {
        // we can assume that the session status is AuthenticationStatus.Successful
        // because any other status scenario should have been returned as a non-2XX response from the API
        // and therefore would have been caught by the error handler

        // successful session responses will always include a token which will include a user
        const token = session.personalAccessToken!;
        const user = token.user!;

        setPersonalAccessToken(token);
        setUser(user);
    };

    const setPersonalAccessToken = (token: PersonalAccessToken) => {
        personalAccessToken.value = token;
        cookieTokenId.value = token.id;
        cookieTokenValue.value = token.value;
    };

    const clearPersonalAccessToken = () => {
        personalAccessToken.value = getDefaultValues().personalAccessToken;
        cookieTokenId.value = null;
        cookieTokenValue.value = null;
    };

    const setUser = (u: User) => {
        user.value = u;
        userAuthenticationStateIsKnown.value = true;
    };
    const clearUser = () => {
        user.value = getDefaultValues().user;
        userAuthenticationStateIsKnown.value = true;
    };

    const clearPasswordForm = () => {
        passwordForm.value = getDefaultValues().passwordForm;
    };

    const clearPasswordFormErrors = () => {
        passwordForm.value.errors = new JsonApiErrorCollection();
    };

    const clearExternalAuthenticationForm = () => {
        externalAuthenticationForm.value = getDefaultValues().externalAuthenticationForm;
    };

    const setExternalAuthenticationFormError = (message: string) => {
        // for authentication errors which are detectable before the API call,
        // simulate the structure as if the error was returned from the API
        externalAuthenticationForm.value.errors = JsonApiErrorCollection.fromArray([
            new JsonApiError({
                detail: message
            })
        ]);
    };

    const clearExternalAuthenticationFormErrors = () => {
        externalAuthenticationForm.value.errors = new JsonApiErrorCollection();
    };

    const clearForms = () => {
        clearPasswordForm();
        clearExternalAuthenticationForm();
    };

    const reset = () => {
        clearForms();

        clearPersonalAccessToken();
        clearUser();
    };

    const userAuthenticated = computed(() => {
        return !!user.value;
    });

    const userAuthenticationState = computed(() => {
        return (userAuthenticationStateIsKnown.value) ? userAuthenticated.value : undefined;
    });

    const performSignOut = wrapFunctionInApiErrorHandler(async () => {
        try {
            if (personalAccessToken.value) {
                await useApi().destroyPersonalAccessToken(personalAccessToken.value.id);
            }
        } catch (error) {
            if (error?.response?.status === HttpStatus.NotFound) {
                // a non-existent token is an ok result, because the token may have already been deleted,
                // so silence the error and ignore it
            } else {
                throw error;
            }
        } finally {
            reset();
        }
    });

    return {
        passwordForm,
        externalAuthenticationForm,

        personalAccessToken,
        user,
        userAuthenticationStateIsKnown,
        userAuthenticationState,
        userAuthenticated,

        loadCurrentUser,

        performPasswordSignIn,
        initiateExternalAuthenticationSession,
        processExternalAuthenticationCode,

        performSignOut,

        clearPasswordForm,
        clearExternalAuthenticationForm

    };
});
