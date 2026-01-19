<template lang="pug">
FormSelectField(
    v-model="value"
    name="month"
    :label="$t('schedule_entries.fields.Month')"
    :label-visible="scheduleEntryIndex === 0"
    :options="options"
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
    valueAttribute: "month",
});

const monthValues = {
    January: "1",
    February: "2",
    March: "3",
    April: "4",
    May: "5",
    June: "6",
    July: "7",
    August: "8",
    September: "9",
    October: "10",
    November: "11",
    December: "12",
};

const { t } = useI18n();
const options = computed(() => {
    return Object.entries(monthValues).map(([key, value]) => ({
        label: t(`months.${key}`),
        value: value,
    }));

});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getScheduleEntry,
    fields: ["month"],
});

</script>
<style scoped lang="scss"></style>
