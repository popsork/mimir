// these keys will be taken from remote configuration when NUXT_PUBLIC_CONFIGURATION_PATH is set,
// but can be overriden by local .env variables, using the NUXT_PUBLIC_ prefix, e.g., NUXT_PUBLIC_SITE_ORIGIN

// when adding new keys here, make sure to add them in nuxt.config.ts under public runtimeConfig as well
const configurationKeys = [
    "environment",
    "siteOrigin",
    "configurationPath",
    "apiOrigin",
    "sentryDsn",
    "sentryTracesSampleRate",
    "systemTimeZone",
    "reverbAppKey",
    "reverbHost",
    "reverbPort",
    "reverbScheme",
    "reverbAuthOrigin",
    "googleApiKey",
    "googleMapId",
    "ordersMapCenterLat",
    "ordersMapCenterLng",
    "ordersMapInitialZoomLevel",
    "formLocationDialogMapCenterLat",
    "formLocationDialogMapCenterLng",
    "formLocationDialogMapInitialZoomLevel",
] as const;

type ConfigurationKey = (typeof configurationKeys)[number];

export type Configuration = {
    [K in ConfigurationKey]: string | undefined;
};

export const useConfigurationStore = defineStore("configuration", () => {
    const defaultConfiguration: Partial<Configuration> = {
        siteOrigin: window.location.origin,
        apiOrigin: window.location.origin,
        reverbHost: window.location.hostname,
        reverbAuthOrigin: window.location.origin,
        systemTimeZone: "Europe/Stockholm",

        ordersMapCenterLat: "59.2753",
        ordersMapCenterLng: "15.2134",
        ordersMapInitialZoomLevel: "8",
        formLocationDialogMapCenterLat: "59.2753",
        formLocationDialogMapCenterLng: "15.2134",
        formLocationDialogMapInitialZoomLevel: "8",
    };
    console.log("Default configuration", defaultConfiguration);

    const runtimeConfig = useRuntimeConfig();
    const localConfiguration = runtimeConfig.public;
    console.log("Local configuration", localConfiguration);


    // these two special keys can only come from local configuration
    const configuration = {
        siteOrigin: localConfiguration.siteOrigin || defaultConfiguration.siteOrigin,
        configurationPath: localConfiguration.configurationPath
    } as Configuration; // assert complete Configuration type, even though at this point it is still Partial<Configuration>

    let configurationInitialized = false;

    const getRemoteConfiguration = async () => {
        const result = {} as Partial<Configuration>;

        if (!configuration.configurationPath) {
            return result;
        }

        const configurationUrl = `${configuration.siteOrigin}/${configuration.configurationPath}`;

        const response = await fetch(configurationUrl);

        if (!response.ok) {
            throw new Error(`Could not load configuration from URL: ${configurationUrl} - Status: ${response.status}`);
        }

        const json = await response.json();

        // transform received keys from NUXT_PUBLIC_XXX_YYY env variable format to xxxYyy which is used internally
        for (const key in json) {
            const transformedKey = camelize(key.replace(/^NUXT_PUBLIC_/, ""));
            if (!configurationKeys.includes(transformedKey as ConfigurationKey)) {
                console.error(`Unrecognized configuration key found in remote config: ${key}`);
                break;
            }
            result[transformedKey as ConfigurationKey] = json[key];
        }
        return result;
    };

    const initializeConfiguration = async () => {
        if (configurationInitialized) {
            return;
        }

        const remoteConfiguration = await getRemoteConfiguration();
        console.log("Remote configuration", remoteConfiguration);

        configurationKeys.filter(key => !["siteOrigin", "configurationPath"].includes(key)).forEach((key) => {
            if (key in defaultConfiguration) {
                console.log(key, defaultConfiguration[key], "found in defaultConfiguration");
                configuration[key] = defaultConfiguration[key];
            }

            // allow default values to be overridden by remote values
            if (key in remoteConfiguration) {
                console.log(key, remoteConfiguration[key], "found in remoteConfiguration");
                configuration[key] = remoteConfiguration[key];
            }

            // allow everything to be overriden by local .env values.
            // nuxt initializes all public runtimeConfig values as blank strings,
            // even if those keys are not present in .env at all,
            // so we need to treat empty strings as undefined here
            if (key in localConfiguration && localConfiguration[key] !== "") {
                console.log(key, localConfiguration[key], "found in localConfiguration");
                configuration[key] = localConfiguration[key];
            }
        });

        console.log("Combined final configuration", configuration);
        configurationInitialized = true;
    };

    return {
        initializeConfiguration,
        configuration
    };
});
