export const useOrderFormSaveAsTemplateStore = defineStore("order-form-save-as-template", () => {

    const formStore = useOrderFormStore();

    const { order } = storeToRefs(formStore);

    const getDefaultValues = () => {
        return {
            shouldShowDialog: false,
            form: {
                templateName: null as string | null,
            },
        };
    };

    const defaults = getDefaultValues();
    const shouldShowDialog = ref(defaults.shouldShowDialog);
    const form = ref(defaults.form);

    // this function is intentionally not wrapped in API error handler and also has no custom catch block,
    // because that is handled by the saveOrder() function in the form store
    const performSavingAsTemplate = async () => {
        let savingOk = false;

        order.value.isTemplate = true;
        order.value.templateName = form.value.templateName;

        try {
            savingOk = !!(await formStore.saveOrder());
            return savingOk;
        } finally {
            if (!savingOk) {
                order.value.isTemplate = false;
                order.value.templateName = null;
            }
        }
    };

    const initializeSaveAsTemplateDialog = () => {
        shouldShowDialog.value = true;
    };

    const reset = () => {
        const defaults = getDefaultValues();
        form.value = defaults.form;
        shouldShowDialog.value = defaults.shouldShowDialog;
    };

    return {
        shouldShowDialog,
        form,

        initializeSaveAsTemplateDialog,
        performSavingAsTemplate,
        reset
    };
});
