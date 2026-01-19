<template lang="pug">
FormTimeField(
    v-model="value"
    name="time-till"
    :label="$t('schedule_entries.fields.Time till')"
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
    valueAttribute: "timeTill",
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getScheduleEntry,
    fields: ["time_till"],
});

</script>
<style scoped lang="scss"></style>
