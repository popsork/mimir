<template lang="pug">
FormInputField(
    v-model="value"
    name="notes"
    :label="$t('specification_rows.fields.Notes')"
    :label-visible="specificationRowIndex === 0"
    :errors="errors"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    specificationRowIndex: number,
}>();

const { getSpecificationRow } = useOrderFormSpecificationRowAccessor(() => props.specificationRowIndex);

const { value } = useTextFieldValue({
    recordAccessor: getSpecificationRow,
    valueAttribute: "notes",
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getSpecificationRow,
    field: "notes",
});

</script>
<style scoped lang="scss"></style>
