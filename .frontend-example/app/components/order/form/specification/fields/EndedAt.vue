<template lang="pug">
FormDateField(
    v-model="value"
    name="ended-at"
    type="datetime"
    :label="$t('specification_rows.fields.Ended at')"
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
    valueAttribute: "endedAt",
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getSpecificationRow,
    field: "ended_at",
});

</script>
<style scoped lang="scss"></style>
