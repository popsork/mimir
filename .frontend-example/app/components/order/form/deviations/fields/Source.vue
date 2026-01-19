<template lang="pug">
FormReadOnlyField(
    :value="valueText"
    name="source"
    :label="$t('deviation_rows.fields.Source')"
    :label-visible="deviationRowIndex === 0"
    :blank-value-visible="rowIsPersisted"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    deviationRowIndex: number,
}>();

const { getDeviationRow } = useOrderFormDeviationRowAccessor(() => props.deviationRowIndex);

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
        // do not display source unless the row has already been saved.
        // this is to match the behaviour of the date and time field,
        return null;
    }
    return row.sourceName;
});


</script>
<style scoped lang="scss"></style>
