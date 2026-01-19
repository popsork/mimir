<template lang="pug">
FormInputField(
    v-model="value"
    type="integer"
    name="day"
    :label="$t('schedule_entries.fields.Day')"
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

const { value } = useNumberFieldValue({
    recordAccessor: getScheduleEntry,
    valueAttribute: "day",
    precision: 0
});


const { errors } = useOrderFormFieldErrors({
    recordAccessor: getScheduleEntry,
    fields: ["day"],
});

</script>
<style scoped lang="scss"></style>
