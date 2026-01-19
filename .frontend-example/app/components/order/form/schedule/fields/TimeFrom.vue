<template lang="pug">
FormTimeField(
    v-model="value"
    name="time-from"
    :label="$t('schedule_entries.fields.Time from')"
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
    valueAttribute: "timeFrom",
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getScheduleEntry,
    fields: ["time_from"],
});

</script>
<style scoped lang="scss"></style>
