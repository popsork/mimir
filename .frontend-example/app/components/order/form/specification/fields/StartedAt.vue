<template lang="pug">
FormDateField(
    ref="field"
    v-model="value"
    name="started-at"
    type="datetime"
    :label="$t('specification_rows.fields.Started at')"
    :label-visible="specificationRowIndex === 0"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    specificationRowIndex: number,
}>();

const { getSpecificationRow } = useOrderFormSpecificationRowAccessor(() => props.specificationRowIndex);

const { recalculateOrder } = useOrderFormStore();

const { value } = useTextFieldValue({
    recordAccessor: getSpecificationRow,
    valueAttribute: "startedAt",
});

const field = useTemplateRef("field");

const focus = () => {
    if (field.value) {
        field.value.focus();
    }
};
defineExpose({
    focus
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getSpecificationRow,
    field: "started_at",
});

</script>
<style scoped lang="scss"></style>
