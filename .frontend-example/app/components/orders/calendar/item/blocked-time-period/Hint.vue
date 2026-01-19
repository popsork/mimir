<template lang="pug">
.blocked-time-period-hint(v-if="period")
    h4.title {{ title }}
    p.times {{ timePeriodText }}
    p.working-time {{ workingTimeText }}
</template>
<script setup lang="ts">

const props = defineProps<{
    blockedTimePeriodId: string | null,
}>();

const blockedTimePeriodsStrore = useOrdersCalendarBlockedTimePeriodsStore();

const period = computed(() => {
    if (!props.blockedTimePeriodId) {
        return null;
    }
    return blockedTimePeriodsStrore.getRecordById(props.blockedTimePeriodId);
});

const title = computed(() => {
    if (!period.value) {
        return "";
    }
    return period.value.reasonName;
});

const timePeriodText = computed(() => {
    if (!period.value) {
        return "";
    }
    return getTimePeriodText(period.value.startsAt, period.value.endsAt);
});

const { t } = useI18n();

const workingTimeText = computed(() => {
    return (period.value?.isWorkingTime) ? t("blocked_time_periods.Working time") : t("blocked_time_periods.Non-working time");
});


</script>
<style scoped lang="scss">
.blocked-time-period-hint {
    .title {
        @include normal-medium-text;
        color: $color-text-normal;
    }

    .times {
        @include normal-text;
        color: $color-text-lighter;
    }
}
</style>
