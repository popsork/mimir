<template lang="pug">
FormInputField(
    v-model="value"
    name="name"
    :label="$t('documents.fields.Name')"
    :label-visible="documentIndex === 0"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    documentIndex: number,
}>();

const { getDocument } = useOrderFormDocumentAccessor(() => props.documentIndex);

const { recalculateOrder } = useOrderFormStore();

const { value } = useTextFieldValue({
    recordAccessor: getDocument,
    valueAttribute: "name",
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDocument,
    field: "name",
});

</script>
<style scoped lang="scss"></style>
