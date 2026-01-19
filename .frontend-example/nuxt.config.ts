import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import { SiteLocale } from "./app/enums/SiteLocale";
import { OrderFormTabName } from "./app/enums/OrderFormTabName";
import { InvoicingProcessTabName } from "./app/enums/InvoicingProcessTabName";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: "2025-05-23",

    future: {
        compatibilityVersion: 4
    },

    devtools: { enabled: false },
    ssr: false,
    spaLoadingTemplate: false,

    typescript: {
        shim: false,
        strict: true,
        typeCheck: true
    },

    devServer: {
        host: process.env.NUXT_DEV_SERVER_HOST
    },

    runtimeConfig: {
        public: {
            // 1) all of these can be overriden via .env with NUXT_PUBLIC_ prefixes, e.g., NUXT_PUBLIC_SITE_ORIGIN
            // 2) when adding new keys here, make sure to add them in stores/configuration.ts as well
            environment: undefined,

            siteOrigin: undefined,
            configurationPath: undefined,

            apiOrigin: undefined,

            sentryDsn: undefined,
            sentryTracesSampleRate: undefined,

            systemTimeZone: undefined,

            reverbAppKey: undefined,
            reverbHost: undefined,
            reverbPort: undefined,
            reverbScheme: undefined,
            reverbAuthOrigin: undefined,

            googleApiKey: undefined,
            googleMapId: undefined,
            ordersMapCenterLat: undefined,
            ordersMapCenterLng: undefined,
            ordersMapInitialZoomLevel: undefined,

            formLocationDialogMapCenterLat: undefined,
            formLocationDialogMapCenterLng: undefined,
            formLocationDialogMapInitialZoomLevel: undefined,
        }
    },

    imports: {
        dirs: [
            "constants/**/*.ts",
            "composables/**/*.ts",
            "enums/**/*.ts",
            "stores/**/*.ts",
            "utils/**/*.ts",
            "types/**/*.ts"
        ]
    },

    css: [
        "@/assets/styles/app.scss"
    ],

    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    api: "modern-compiler",
                    silenceDeprecations: [ "import" ],
                    additionalData: '@use "~/assets/styles/environment" as *;'
                },
            },
        },
        build: {
            sourcemap: true,
        },
        plugins: [
            AutoImport({
                imports: [
                    {
                        "naive-ui": [
                            "useDialog",
                            "useMessage",
                            "useNotification",
                            "useLoadingBar"
                        ]
                    },
                    {
                        "pinia-orm": [
                            "useRepo"
                        ]
                    }
                ]
            }),
            Components({
                resolvers: [NaiveUiResolver()]
            })
        ]

    },

    modules: [
        [
            "@pinia/nuxt",
            {
                autoImports: ["defineStore", "acceptHMRUpdate"],
            }
        ],
        [
            "@pinia-orm/nuxt",
            {

            }
        ],
        [
            "@nuxtjs/i18n",
            {
                locales: Object.values(SiteLocale).map((locale) => {
                    return {
                        code: locale,
                        file: `${locale}.json`
                    };
                }),
                detectBrowserLanguage: false,
                defaultLocale: SiteLocale.SV,
                customRoutes: "page",
                strategy: "no_prefix"
            }
        ],
        [
            "@nuxtjs/stylelint-module",
            {
                fix: true,
                chokidar: true
            },
        ],
        "nuxtjs-naive-ui",
        [
            "@primevue/nuxt-module",
            {
                autoImport: true,
                components: {
                    prefix: "prime",
                    // these require additional @primevue/forms and quill packages,
                    // and since we're not using them, we can exclude them so that they don't get imported/initialized
                    exclude: ["Form", "FormField", "Editor", "Chart"]
                },

                // importing a theme like Aura automatically defines around 2600 CSS variables at the :root level,
                // which slows down devtools significantly.
                // since we don't use the theme fully and still override a lot of styles,
                // it is better to not use a theme at all, and just put all needed variables in the components themselves.
                // note that this is not the same as `unstyled: true`, which would not only remove the css variables,
                // but also the css rules provided by PrimeVue, and that's not what we need,
                // as some of our custom styling for PrimeVue components only define the variables used by PrimeVue
                // without overriding the rules.
                options: {

                }
            }
        ],
        "@nuxt/eslint",
        "@vueuse/nuxt",
    ],
    hooks: {
        "pages:extend"(pages) {
            const orderTabNames = Object.values(OrderFormTabName);

            const orderFormRoute = pages.find(page => page.path === "/orders/:id()/:tab?");
            if (orderFormRoute) {
                const orderFormTabPattern = orderTabNames.join("|");

                // restrict allowed tab names
                orderFormRoute.path = `/orders/:id/:tab(${orderFormTabPattern})?`;

                // add a new order route using the same page file
                pages.push({
                    name: "orders-new",
                    path: `/orders/new/:tab(${orderFormTabPattern})?`,
                    file: orderFormRoute.file,
                    meta: { activeTopLevelRouteName: "orders" },
                });
            }

            const routeRoute = pages.find(page => page.path === "/routes/:id()");
            if (routeRoute) {
                // add a new route route using the same page file
                pages.push({
                    name: "routes-new",
                    path: `/routes/new`,
                    file: routeRoute.file,
                    meta: { activeTopLevelRouteName: "orders", activeSecondLevelRouteName: "routes-list" },
                });
            }

            const invoicingProcessTabNames = Object.values(InvoicingProcessTabName);

            const invoicingProcessRoute = pages.find(page => page.path === "/invoicing/processes/:id()/:tab?");
            if (invoicingProcessRoute) {
                const invoicingProcessTabPattern = invoicingProcessTabNames.join("|");

                // restrict allowed tab names
                invoicingProcessRoute.path = `/invoicing/processes/:id/:tab(${invoicingProcessTabPattern})?`;
            }

        }
    }
});
