<template lang="pug">
FormInputField(
    v-model="value"
    name="day-of-month"
    :label="$t('schedule_entries.fields.Day of month')"
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
    valueAttribute: "dayOfMonth",
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getScheduleEntry,
    fields: ["day_of_month"],
});

</script>
<style scoped lang="scss"></style>
