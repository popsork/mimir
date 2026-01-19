<template lang="pug">
OrderFormHeaderFieldset(:title="title" name="main")
    .fields
        OrderFormHeaderFieldsTemplateName(v-if="shouldShowTemplateNameField")
        OrderFormHeaderFieldsCustomer
        OrderFormHeaderFieldsContactPerson
        OrderFormHeaderFieldsAgreement
        OrderFormHeaderFieldsProject
</template>
<script setup lang="ts">

const store = useOrderFormStore();

const { form, orderIsNew, orderIsTemplate } = storeToRefs(store);

const { t } = useI18n();

const title = computed(() => {
    if (orderIsNew.value) {
        return t("order.fieldsets.New order");
    }

    if (orderIsTemplate.value) {
        return t("order.fieldsets.Template");
    }

    return t("order.fieldsets.Order", { number: form.value.order.number });
});

const shouldShowTemplateNameField = computed(() => {
    return !orderIsNew.value && orderIsTemplate.value;
});

</script>
<style scoped lang="scss">
fieldset {
    .field {
        margin-bottom: steps(1);
    }
}
</style>
