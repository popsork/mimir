<template lang="pug">
FormInputField(
    v-model="value"
    name="hour"
    :label="$t('schedule_entries.fields.Hour')"
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
    valueAttribute: "hour",
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getScheduleEntry,
    fields: ["hour"],
});

</script>
<style scoped lang="scss"></style>
