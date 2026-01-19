<template lang="pug">
fieldset(data-name="schedule-entry" :data-id="scheduleEntry.id" :data-index="index")
    .fields
        fieldset(data-name="cron")
            OrderFormScheduleFieldsDayOfWeek(ref="firstField" :schedule-entry-index="index")
            OrderFormScheduleFieldsMonth(:schedule-entry-index="index")
            OrderFormScheduleFieldsDayOfMonth(:schedule-entry-index="index")

            OrderFormScheduleFieldsHour(:schedule-entry-index="index")
            OrderFormScheduleFieldsMinute(:schedule-entry-index="index")

        fieldset(data-name="pickup-and-delivery")
            OrderFormScheduleFieldsTimeFrom(:schedule-entry-index="index")
            OrderFormScheduleFieldsTimeTill(:schedule-entry-index="index")
            OrderFormScheduleFieldsDay(:schedule-entry-index="index")

        fieldset(data-name="offset")
            OrderFormScheduleFieldsOffsetDays(:schedule-entry-index="index")

        fieldset(data-name="active-period")
            OrderFormScheduleFieldsActiveFrom(:schedule-entry-index="index")
            OrderFormScheduleFieldsActiveTill(:schedule-entry-index="index")

        OrderFormScheduleRemoveButton(:schedule-entry-index="index")

    FormErrors(:errors="rowErrors")
</template>
<script setup lang="ts">
import type { ScheduleEntry, ScheduleEntryApiResourceFieldName } from "~/models/ScheduleEntry";

const props = defineProps<{
    index: number,
    scheduleEntry: ScheduleEntry,
}>();

const firstField = useTemplateRef("firstField");

const focus = () => {
    if (firstField.value) {
        firstField.value.focus();
    }
};
defineExpose({
    focus
});


const { form } = storeToRefs(useOrderFormStore());

const usedFieldNames: ScheduleEntryApiResourceFieldName[] = [
    "day_of_week",
    "month",
    "day_of_month",
    "hour",
    "minute",
    "time_from",
    "time_till",
    "day",
    "offset_days",
    "active_from",
    "active_till",
];

const rowErrors = computed(() => form.value.errors.forRecord(props.scheduleEntry).exceptForFields(usedFieldNames));

</script>
<style scoped lang="scss">
fieldset[data-name="schedule-entry"] {
    &[data-index="0"] {
        :deep(> .fields > .field) > .label {
            margin-bottom: steps(0.5);
        }
    }

    &:not([data-index="0"]) {
        border-top: 1px solid $color-border-normal;
    }

    $group-gap: steps(4);
    $field-gap: steps(1);
    $row-padding: 6px;

    .fields {
        display: flex;
        gap: $group-gap;
        align-items: flex-start;

        padding: $row-padding 0;

        & > fieldset {
            flex: 0 1 auto;
            width: auto;

            display: flex;
            gap: $field-gap;

            align-items: flex-start;

            .field {
                flex: 0 1 steps(18);
                width: steps(18);

                &[data-name="day-of-week"],
                &[data-name="month"] {
                    flex-basis: steps(13);
                    width: steps(13);
                }

                &[data-name="day-of-month"],
                &[data-name="hour"],
                &[data-name="minute"],
                &[data-name="time-from"],
                &[data-name="time-till"],
                &[data-name="day"],
                &[data-name="offset-days"] {
                    flex-basis: steps(11);
                    width: steps(11);
                }

            }
        }

    }



    .button[data-name="remove"] {
        // prevent button from stretching the fieldset height
        margin: #{$row-padding * -1} 0 #{$row-padding * -1} auto;
    }

    &[data-index="0"] {
        .button[data-name="remove"] {
            $label-height: steps(2.5);
            margin-top: #{$row-padding * -1 + $label-height};
        }
    }

    .errors {
        padding-bottom: steps(1);
    }
}
</style>
