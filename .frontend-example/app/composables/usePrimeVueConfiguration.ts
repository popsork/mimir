import { en_GB as primeVueEnLocale } from "primelocale/js/en_GB.js";
import { sv as primeVueSvLocale } from "primelocale/js/sv.js";
import { usePrimeVue } from "primevue/config";

export const usePrimeVueConfiguration = () => {

    const primevue = usePrimeVue();

    // track locale changes and update global PrimeVue locale accordingly
    const { locale } = useI18n();
    watch(locale, (newLocale) => {
        switch (newLocale) {
            case SiteLocale.SV:
                primevue.config.locale = primeVueSvLocale;
                break;
            default:
                primevue.config.locale = primeVueEnLocale;
                break;
        }
    }, { immediate: true });


};

