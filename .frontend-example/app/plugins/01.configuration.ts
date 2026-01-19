export default defineNuxtPlugin(async () => {
    // this plugin must be initialized first, so that it immediately loads the (possibly remote) configuration,
    // before any other code tries to access it

    const store = useConfigurationStore();
    await store.initializeConfiguration();

    return {
        provide: {
            configuration: store.configuration
        }
    };
});
