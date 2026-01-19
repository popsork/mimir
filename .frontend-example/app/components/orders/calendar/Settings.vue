<template lang="pug">
.settings
    PopoverDialog(ref="dialog" :title="t('orders.calendar.actions.Card settings')" v-on:open="onDialogOpen")
        template(v-slot:trigger)
            GenericButton(
                ref="trigger"
                icon="cog"
                size="small"
                type="alternative-ghost"
                :title="t('orders.calendar.actions.Card settings')"
            )
        GenericForm(id="set-attributes" v-on:submit.prevent="setAttributes")
            .attributes
                FormCheckboxField(
                    v-for="option in attributeOptions"
                    :key="option.value"
                    v-model="internalSelectedAttributes"
                    name="attributes[]"
                    :value="option.value"
                    :label="option.label"
                    size="small"
                )
        template(v-slot:actions)
            GenericButton(
                type="ghost"
                size="small"
                v-on:click="closeDialog"
            ) {{ t("general.Cancel") }}
            GenericButton(
                type="primary"
                size="small"
                button-type="submit"
                form="set-attributes"
                :disabled="!submissionAllowed"
            ) {{ t("general.Save") }}

</template>
<script setup lang="ts">
const { t } = useI18n();

const attributesStore = useOrdersCalendarOrderAttributesStore();

const { availableAttributes, selectedAttributes } = storeToRefs(attributesStore);

const attributeOptions = computed(() => {
    return availableAttributes.value.map((attribute) => {
        return {
            value: attribute,
            label: t(`orders.attributes.${attribute}`)
        };
    });
});

const internalSelectedAttributes = ref([] as OrdersCalendarOrderAttribute[]);

const initializeSelectedAttributes = () => {
    internalSelectedAttributes.value = selectedAttributes.value;
};

initializeSelectedAttributes();

const submissionAllowed = computed(() => {
    return internalSelectedAttributes.value.length > 0;
});

const setAttributes = () => {
    if (!submissionAllowed.value) {
        return;
    }

    attributesStore.setSelectdAttributes(internalSelectedAttributes.value);
    closeDialog();
};

const onDialogOpen = () => {
    initializeSelectedAttributes();
    blurTrigger();
};

const trigger = useTemplateRef("trigger");

const blurTrigger = () => {
    if (trigger.value) {
        trigger.value.blur();
    }
};

const dialog = useTemplateRef("dialog");

const closeDialog = () => {
    if (dialog.value) {
        dialog.value.close();
    }
};



</script>
<style scoped lang="scss">
form {
    padding: steps(0.5) 0;

    .attributes {
        .field[data-type="checkbox"]:not(:last-child) {
            margin-bottom: steps(0.5);
        }
    }
}
</style>
