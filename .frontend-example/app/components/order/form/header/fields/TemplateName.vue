<template lang="pug">
FormInputField(
    v-model="order.templateName"
    name="template-name"
    :label="$t('order.fields.Template name')"
    :errors="errors"
)
</template>
<script setup lang="ts">

const { order } = storeToRefs(useOrderFormStore());

const recordAccessor = () => order.value;

const { errors } = useOrderFormFieldErrors({
    recordAccessor,
    field: "template_name",
});


</script>
<style scoped lang="scss"></style>
