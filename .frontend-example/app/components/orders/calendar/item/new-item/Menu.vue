<template lang="pug">
.new-item-menu
    PopoverMenuButton(
        v-for="option in reasonOptions"
        :key="option.value"
        :disabled="addingItem"
        :waiting="addingItemReason(option.value)"
        :text="option.label"
        v-on:click="addNewItem(option.value)"
    )
    p.error(v-if="reasonsMissing") {{ $t("blocked_time_periods.messages.No blocked time reasons defined") }}
</template>
<script setup lang="ts">

const reasonsStore = useOrdersCalendarBlockedTimeReasonsStore();
const { blockedTimeReasons, blockedTimeReasonsLoaded } = storeToRefs(reasonsStore);

const reasonOptions = computed(() => {
    return blockedTimeReasons.value.map((reason) => {
        return {
            value: reason.id,
            label: reason.name
        };
    });
});

const reasonsMissing = computed(() => {
    return blockedTimeReasonsLoaded.value && reasonOptions.value.length < 1;
});

const calendarStore = useOrdersCalendarStore();

const { menu } = storeToRefs(calendarStore);

const periodsStore = useOrdersCalendarBlockedTimePeriodsStore();

const addableItemReasonId = ref<string | null>(null);

const addNewItem = async (reasonId: string) => {
    if (!menu.value.unitId || !menu.value.start || !menu.value.end) {
        return;
    }

    addableItemReasonId.value = reasonId;

    await periodsStore.addNewRecord({
        unitId: menu.value.unitId,
        reasonId,
        startsAt: menu.value.start,
        endsAt: menu.value.end
    });

    calendarStore.deactivateMenu();
};

const waitStore = useWaitStore();

const addingItem = computed(() => {
    return waitStore.is(WaitingFor.OrdersCalendarBlockedTimePeriodCreation);
});

const addingItemReason = (reasonId: string) => {
    return addingItem.value && addableItemReasonId.value === reasonId;
};


</script>
<style scoped lang="scss">
.error {
    position: relative;
    display: flex;
    padding: steps(0.5) steps(1.5);
    color: $color-text-error;
    @include normal-medium-text;
}
</style>

