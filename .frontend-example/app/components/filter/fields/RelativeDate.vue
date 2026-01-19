<template lang="pug">
.date-filter
    FilterFieldsRelativeDateValue(v-model="daysInPast" data-name="days-in-past" sign="-")
    FilterFieldsRelativeDateControllers(
        :increment-enabled="incrementingDaysInPastEnabled"
        :decrement-enabled="decrementingDaysInPastEnabled"
        v-on:increment="adjustDaysInPast(1)"
        v-on:decrement="adjustDaysInPast(-1)"
    )
    FilterFieldsRelativeDateTodayButton(:selected="todaySelected" v-on:click="reset")
    FilterFieldsRelativeDateControllers(
        :increment-enabled="incrementingDaysInFutureEnabled"
        :decrement-enabled="decrementingDaysInFutureEnabled"
        v-on:increment="adjustDaysInFuture(1)"
        v-on:decrement="adjustDaysInFuture(-1)"
    )
    FilterFieldsRelativeDateValue(v-model="daysInFuture" data-name="days-in-future" sign="+" )
</template>
<script setup lang="ts">
const INITIAL_DAYS_IN_PAST = 0;
const INITIAL_DAYS_IN_FUTURE = 0;

const daysInPast = defineModel<number | null>("daysInPast", { required: true });
const daysInFuture = defineModel<number | null>("daysInFuture", { required: true });

const daysInPastAreSet = computed(() => daysInPast.value !== null);
const daysInFutureAreSet = computed(() => daysInFuture.value !== null);

const reset = () => {
    daysInPast.value = INITIAL_DAYS_IN_PAST;
    daysInFuture.value = INITIAL_DAYS_IN_FUTURE;
};

const adjustDaysInPast = (amount: number) => {
    if (!daysInPastAreSet.value) {
        daysInPast.value = INITIAL_DAYS_IN_PAST;
        return;
    }
    daysInPast.value! += amount;
};

const adjustDaysInFuture = (amount: number) => {
    if (!daysInFutureAreSet.value) {
        daysInFuture.value = INITIAL_DAYS_IN_FUTURE;
        return;
    }
    daysInFuture.value! += amount;
};

const incrementingDaysInPastEnabled = computed(() => {
    return !daysInPastAreSet.value || daysInPast.value! < 0;
});

const decrementingDaysInPastEnabled = computed(() => {
    return daysInPastAreSet.value;
});

const incrementingDaysInFutureEnabled = computed(() => {
    return daysInFutureAreSet.value;
});

const decrementingDaysInFutureEnabled = computed(() => {
    return !daysInFutureAreSet.value || daysInFuture.value! > 0;
});

const todaySelected = computed(() => daysInPast.value === 0 && daysInFuture.value === 0);
</script>
<style scoped lang="scss">
.date-filter {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: steps(1);

    height: steps(3.5);
    background: $color-background-lightest;

    border: 1px solid $color-border-normal;
    border-radius: steps(4);
    padding: 1px steps(1.5);

    margin: 0 0 steps(1);
}
</style>
