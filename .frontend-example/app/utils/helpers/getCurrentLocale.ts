import type { WritableComputedRef } from "vue";
import type { Locale } from "vue-i18n";

export function getCurrentLocale(): SiteLocale {
    const { $i18n } = useNuxtApp();
    // type definition says that "locale" in $i18n returns a string, but it actually returns a computed ref
    const locale = $i18n.locale as WritableComputedRef<Locale>;
    return locale.value as SiteLocale;
}
