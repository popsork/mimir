export const useApiStore = defineStore("api", () => {
    const error: Ref<any> = ref(null);

    const clearError = () => {
        error.value = null;
    };

    return {
        error,
        clearError
    };
});
