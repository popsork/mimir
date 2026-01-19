import { useActiveElement } from "@vueuse/core";

export const useFocusTracking = () => {
    const activeElement = useActiveElement();

    const textareaFocused = computed(() => activeElement.value?.tagName === "TEXTAREA");

    const inputFocused = computed(() => activeElement.value?.tagName === "INPUT");

    const typeableFieldFocused = computed(() => {
        return textareaFocused.value || inputFocused.value;
    });

    return {
        inputFocused,
        typeableFieldFocused,
    };
};
