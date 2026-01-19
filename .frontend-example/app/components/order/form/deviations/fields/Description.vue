<template lang="pug">
FormInputField(
    v-model="value"
    name="description"
    :label="$t('deviation_rows.fields.Description')"
    :label-visible="deviationRowIndex === 0"
    :errors="errors"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    deviationRowIndex: number,
}>();

const { getDeviationRow } = useOrderFormDeviationRowAccessor(() => props.deviationRowIndex);

const { value } = useTextFieldValue({
    recordAccessor: getDeviationRow,
    valueAttribute: "description",
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getDeviationRow,
    field: "description",
});

</script>
<style scoped lang="scss"></style>
