import { defineNuxtPlugin } from "#app";
import { Loader, type Library } from "@googlemaps/js-api-loader";

export default defineNuxtPlugin(() => {
    const configuration = useConfiguration();

    const loader = new Loader({
        apiKey: configuration.googleApiKey || "",
        language: getCurrentLocale(),
        version: "weekly",
    });

    return {
        provide: {
            loadGoogleMaps: async ({ libraries }: { libraries: Library[] }) => {
                await loader.load();

                const libraryPromises = libraries.map((name) => {
                    return google.maps.importLibrary(name);
                });
                return await Promise.all(libraryPromises);
            }
        }
    };
});
