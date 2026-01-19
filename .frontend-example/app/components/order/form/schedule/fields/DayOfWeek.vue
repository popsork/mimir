<template lang="pug">
FormSelectField(
    ref="field"
    v-model="value"
    name="day-of-week"
    :label="$t('schedule_entries.fields.Day of week')"
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

// these values should correspond to app/Enums/DayOfWeek.php
const dayValues = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 7,
};

const value = computed({
    get: () => {
        const record = getScheduleEntry();
        if (!record) {
            return null;
        }
        return record.dayOfWeek;
    },
    set: (value: number | null) => {
        const record = getScheduleEntry();
        if (!record || value !== null && !Object.values(dayValues).includes(value)) {
            return;
        }

        record.dayOfWeek = value;
    }
});

const { t } = useI18n();
const options = computed(() => {
    return Object.entries(dayValues).map(([key, value]) => ({
        label: t(`days_of_week.${key}`),
        value: value,
    }));

});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getScheduleEntry,
    fields: ["day_of_week"],
});

const field = useTemplateRef("field");

const focus = () => {
    if (field.value) {
        field.value.focus();
    }
};
defineExpose({
    focus
});

</script>
<style scoped lang="scss"></style>
