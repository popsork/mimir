<template lang="pug">
.time-selector
    FormSelectField(
        v-model="firstHour"
        name="first-hour"
        :options="hourOptions"
        :label="t('orders.calendar.parameters.First hour')"
        layout="compact"
        :filterable="true"
        :clearable="false"
        menu-width="fixed"
    )
    FormSelectField(
        v-model="lastHour"
        name="last-hour"
        :options="hourOptions"
        :label="t('orders.calendar.parameters.Last hour')"
        layout="compact"
        :filterable="true"
        :clearable="false"
        menu-width="fixed"
    )
</template>
<script setup lang="ts">
const parametersStore = useOrdersCalendarParametersStore();

const { t } = useI18n();

const { firstHour, lastHour } = storeToRefs(parametersStore);

const hourOptions = computed(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return hours.map((hour) => {
        return {
            value: hour,
            label: hour.toString().padStart(2, "0") + ":00"
        };
    });
});

</script>
<style scoped lang="scss">
.time-selector {
    display: flex;
    gap: steps(1);

    .field {
        width: steps(12);
    }
}
</style>
