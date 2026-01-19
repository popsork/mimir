<template lang="pug">
.actions(:class="{ 'available': !showingSaveAsTemplateDialog }")
    .primary
        GenericButton(type="secondary" v-on:click="cancel") {{ $t("general.Cancel") }}
        GenericButton(
            type="primary"
            button-type="submit"
            icon="ticked-circle"
            :waiting-for="WaitingFor.OrderFormOrderSaving"
        ) {{ savingLabelText }}
    .secondary
        template(v-if="orderDeletable")
            GenericButton(
                type="dangerous-ghost"
                data-name="delete"
                v-on:click="showDeleteOrderDialog"
            ) {{ deletionLabelText }}
            OrderFormDeleteDialog
        template(v-if="orderSaveableAsTemplate")
            GenericButton(
                type="tertiary"
                data-name="save-as-template"
                v-on:click="showSaveAsTemplateDialog"
            ) {{ $t("order.actions.Save as template") }}
            OrderFormSaveAsTemplateDialog
</template>
<script lang="ts" setup>

function cancel() {
    goBackOrToRoute({ name: "orders" });
}

const store = useOrderFormStore();

const { order, orderIsNew, orderIsTemplate } = storeToRefs(store);

const { t } = useI18n();

const savingLabelText = computed(() => {
    return orderIsTemplate.value ? t("order.actions.Save template") : t("order.actions.Save order");
});

const deletionLabelText = computed(() => {
    return orderIsTemplate.value ? t("order.actions.Delete template") : t("order.actions.Delete order");
});

const orderDeleteStore = useOrderDeleteStore();

const showDeleteOrderDialog = () => {
    orderDeleteStore.initializeDeleteOrderDialog(order.value.id);
};

const orderDeletable = computed(() => !orderIsNew.value);

const saveAsTemplateStore = useOrderFormSaveAsTemplateStore();

const { shouldShowDialog: showingSaveAsTemplateDialog } = storeToRefs(saveAsTemplateStore);

const showSaveAsTemplateDialog = () => {
    saveAsTemplateStore.initializeSaveAsTemplateDialog();
};

const orderSaveableAsTemplate = computed(() => {
    // currently, only new orders can be saved as templates.
    // creating a template from an existing order will involve cloning the existing order,
    // and there's a separate task for that TMS-2592
    return orderIsNew.value;
});



</script>
<style lang="scss" scoped>
.actions {
    display: flex;
    flex-direction: column;
    gap: steps(1);
    justify-content: flex-end;

    &:not(.available) {
        // when "save as template" dialog is open, hide all action buttons,
        // because the dialog modifies the order state while it is saving
        // which leads to changing button labels and button waiting states in the main footer
        // and that would be confusing to the user
        visibility: hidden;
    }


    .primary,
    .secondary {
        display: flex;
        flex-direction: row;
        align-self: end;
        gap: steps(1);
    }

    .primary {
        .button {
            min-width: steps(11);
        }
    }
}
</style>
