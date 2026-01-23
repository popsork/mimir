export default defineI18nConfig(() => {
    return {
        fallbackLocale: "en",
        missing: (locale: string, key: string) => {
            console.warn(`Translation key "${key}" missing in locale "${locale}"`);
        },
    };
});
