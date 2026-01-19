import * as Sentry from "@sentry/nuxt";
import { defineNuxtPlugin } from "#app";
import { ERROR_404_MESSAGE_PATTERN } from "~/constants/errors";

export default defineNuxtPlugin(() => {
    const configuration = useConfiguration();

    if (!configuration.sentryDsn) {
        return;
    }

    const tracesSampleRate = (configuration.sentryTracesSampleRate) ? parseFloat(configuration.sentryTracesSampleRate) : 1.0;
    const apiOrigin = configuration.apiOrigin!;

    Sentry.init({
        dsn: configuration.sentryDsn,
        tracePropagationTargets: [
            apiOrigin // attach Sentry tracing header data to requests to our API origin
        ],
        integrations: [
            Sentry.browserTracingIntegration(),
        ],
        tracesSampleRate,
        environment: configuration.environment,
        ignoreErrors: [ERROR_404_MESSAGE_PATTERN],
        beforeSend(event, hint) {
            if (event.exception && hint?.originalException) {
                const originalError: any = hint.originalException;

                if (originalError.isAxiosError && originalError.config) {
                    const errorConfig = originalError.config;

                    const axiosDetails = {
                        baseURL: errorConfig.baseURL,
                        url: errorConfig.url,
                        method: errorConfig.method,
                        data: errorConfig.data,
                        message: originalError.message
                    };

                    const breadcrumb = {
                        type: "error",
                        category: "custom",
                        message: "AxiosError details",
                        data: axiosDetails,
                        level: "error",
                    } as Sentry.Breadcrumb;

                    event.breadcrumbs ??= [];
                    event.breadcrumbs?.push(breadcrumb);
                }
            }

            if (event.exception) {
                console.error(`[Sending exception to Sentry]: (${hint.originalException})`, { event, hint });
            }

            return event;
        },
    });

    return {
        provide: {
            sentry: Sentry,
            sentrySetContext: (n: any, context: any) => Sentry.setContext(n, context),
            sentrySetUser: (user: any) => Sentry.setUser(user),
            sentrySetTag: (tagName: any, value: any) => Sentry.setTag(tagName, value),
            sentryAddBreadcrumb: (breadcrumb: any) => Sentry.addBreadcrumb(breadcrumb),
        }
    };
});
