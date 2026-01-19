import { useSeoMeta } from "#imports";

export const usePageTitle = (
    { translation, parts }:
    { translation?: string, parts?: ComputedRef<string | string[]> } = {}
) => {
    const { t } = useI18n();

    const basePart = computed(() => t("general.MOTUS TMS"));

    const titleParts = computed(() => {
        const result = [] as string[];

        if (parts && parts.value) {
            if (Array.isArray(parts.value)) {
                result.push(...parts.value);
            } else {
                result.push(parts.value);
            }
        }

        if (translation) {
            result.push(t(translation));
        }

        result.push(basePart.value);
        return result;
    });

    const title = computed(() => {
        return titleParts.value.join(" | ");
    });

    useSeoMeta({
        title: () => title.value
    });
};
