<template lang="pug">
ModalDialog(v-if="shouldShowDialog" :title="dialogTitle" v-on:open="focusFirstField" v-on:cancel="close")
    GenericForm(id="invoice" :data-mode="formMode" v-on:submit.prevent="startInvoicing")
        InvoicingOrdersInvoicingFieldsInvoicingProfile(v-if="invoicingByProfile" ref="profileField")
        InvoicingOrdersInvoicingFieldsInvoicingDate
        InvoicingOrdersInvoicingFieldsBookkeepingDate
        FormErrors(:errors="errors")
    template(v-slot:actions)
        GenericButton(
            type="ghost"
            v-on:click="close"
        ) {{ $t("general.Cancel") }}
        GenericButton(
            type="primary"
            button-type="submit"
            form="invoice"
            icon="arrow-outward"
            :waiting-for="WaitingFor.InvoicingProcessCreation"
        ) {{ actionText }}
</template>
<script setup lang="ts">

const { t } = useI18n();

const dialogTitle = computed(() => {
    return t("invoicing.dialog.Invoicing");
});
const actionText = computed(() => {
    return t("invoicing.dialog.actions.Invoice");
});


const invoicingStore = useInvoicingOrdersInvoicingStore();
const { form, formMode, invoicingByProfile, invoicingByOrders } = storeToRefs(invoicingStore);

const shouldShowDialog = computed(() => {
    return invoicingByProfile.value || invoicingByOrders.value;
});

const close = () => {
    invoicingStore.reset();
};

const { showMessage } = useFloatingMessage();

const startInvoicing = async () => {
    const createdInvoicingProcess = await invoicingStore.startInvoicing();
    if (createdInvoicingProcess) {
        close();
        showMessage({
            type: FloatingMessageType.Success,
            text: t("invoicing.dialog.messages.Invoicing process created successfully")
        });
    }
};

const profileField = useTemplateRef("profileField");

const focusFirstField = () => {
    if (profileField.value) {
        profileField.value.focus();
    }
};

const displayedErrorFields = computed(() => {
    const fields = ["invoice_date", "bookkeeping_date"];

    if (invoicingByProfile.value) {
        fields.push("invoiceProfile");
    }

    return fields;
});

const errors = computed(() => form.value.errors.exceptForFields(displayedErrorFields.value));

</script>
<style scoped lang="scss">
form {
    width: $default-dialog-width;

    .field {
        margin-bottom: steps(2);

        &[data-name="bookkeeping-date"] {
            margin-bottom: steps(2.5);
        }
    }

}
</style>
