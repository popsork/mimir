<template lang="pug">
ButtonGroup(data-name="day-navigation")
    GroupButton(
        icon="chevron-left"
        :title="t('orders.calendar.parameters.One day back')"
        v-on:click="adjustFirstDate(-1)"
    )
    GroupButton(
        icon="chevron-right"
        :title="t('orders.calendar.parameters.One day forward')"
        v-on:click="adjustFirstDate(1)"
    )
</template>
<script setup lang="ts">
const { t } = useI18n();

const parametersStore = useOrdersCalendarParametersStore();

const adjustFirstDate = (daysOffset: number) => {
    parametersStore.adjustFirstDate(daysOffset);
};

</script>
<style scoped lang="scss"></style>
