<template lang="pug">
FormReadOnlyField(
    :value="valueText"
    name="date-and-time"
    :label="$t('deviation_rows.fields.Date and time')"
    :label-visible="deviationRowIndex === 0"
    :blank-value-visible="false"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    deviationRowIndex: number,
}>();

const { getDeviationRow } = useOrderFormDeviationRowAccessor(() => props.deviationRowIndex);

const { value } = useTextFieldValue({
    recordAccessor: getDeviationRow,
    valueAttribute: "createdAt",
});

const { form } = storeToRefs(useOrderFormStore());

const rowIsPersisted = computed(() => {
    const row = getDeviationRow();
    if (!row) {
        return false;
    }
    return !form.value.relationshipChanges.DeviationRow.addedIds.includes(row.id);
});

const valueText = computed(() => {
    const row = getDeviationRow();
    if (!row) {
        return null;
    }
    if (!rowIsPersisted.value) {
        // do not display date and time unless the row has already been saved.
        // this is to avoid showing an incorrect date and time that keeps changing with each dry-run
        // when newly added rows are not fully saved yet
        return null;
    }
    return formatSystemTimeZoneTime(value.value);
});


</script>
<style scoped lang="scss"></style>
