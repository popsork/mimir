<template lang="pug">
FormDateField(
    v-model="value"
    type="datetime"
    name="active-from"
    :label="$t('schedule_entries.fields.Active from')"
    :label-visible="scheduleEntryIndex === 0"
    :errors="errors"
    v-on:change="recalculateOrder"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    scheduleEntryIndex: number,
}>();

const { getScheduleEntry } = useOrderFormScheduleEntryAccessor(() => props.scheduleEntryIndex);

const { recalculateOrder } = useOrderFormStore();

const { value } = useTextFieldValue({
    recordAccessor: getScheduleEntry,
    valueAttribute: "activeFrom",
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getScheduleEntry,
    fields: ["active_from"],
});

</script>
<style scoped lang="scss"></style>
