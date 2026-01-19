<template lang="pug">
.blocked-time-period-menu(v-if="blockedTimePeriod")
    PopoverMenuButton(
        :text="$t('orders.calendar.actions.Remove blocked time period')"
        :highlight="true"
        :waiting="removingItem"
        v-on:click="removeItem"
    )
</template>
<script setup lang="ts">

const props = defineProps<{
    blockedTimePeriodId: string | null,
}>();

const periodsStore = useOrdersCalendarBlockedTimePeriodsStore();

const blockedTimePeriod = computed(() => {
    if (!props.blockedTimePeriodId) {
        return null;
    }

    return periodsStore.getRecordById(props.blockedTimePeriodId);
});

const calendarStore = useOrdersCalendarStore();

const removeItem = async () => {
    if (props.blockedTimePeriodId) {
        await periodsStore.removeRecord(props.blockedTimePeriodId);
    }
    calendarStore.deactivateMenu();
};

const waitStore = useWaitStore();

const removingItem = computed(() => {
    return waitStore.is(WaitingFor.OrdersCalendarBlockedTimePeriodRemoval);
});

</script>
<style scoped lang="scss"></style>
