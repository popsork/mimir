import { useLocalStorage, StorageSerializers } from "@vueuse/core";

export const useI18nStore = defineStore("i18n", () => {
    const { $i18n } = useNuxtApp();

    const localStorageLocale = useLocalStorage("locale", null, { serializer: StorageSerializers.string });

    const storedLocale = computed(() => {
        const locale = localStorageLocale.value;
        if (locale && Object.values(SiteLocale).includes(locale as SiteLocale)) {
            return locale as SiteLocale;
        }
        return null;
    });

    const initializeLocale = () => {
        const locale = storedLocale.value;
        if (locale) {
            $i18n.setLocale(locale);
        }
    };

    const setLocale = (locale: SiteLocale) => {
        $i18n.setLocale(locale);
        localStorageLocale.value = locale;
    };

    return {
        initializeLocale,
        setLocale
    };
});
