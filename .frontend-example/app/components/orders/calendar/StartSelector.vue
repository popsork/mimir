<template lang="pug">
ButtonGroup(data-name="first-date")
    GroupButton(
        v-for="option in firstDateOptions"
        :key="option.name"
        :selected="option.selected"
        v-on:click="setFirstDate(option.value)"
    ) {{ option.label }}
</template>
<script setup lang="ts">
import { isSameDay } from "date-fns";

const { t } = useI18n();

const parametersStore = useOrdersCalendarParametersStore();

const { firstDate } = storeToRefs(parametersStore);

const firstDateOptions = computed(() => {
    const yesterday = parametersStore.getYesterday();
    const lastMonday = parametersStore.getLastMonday();

    return [
        {
            name: "yesterday",
            value: CalendarStart.Yesterday,
            label: t("orders.calendar.parameters.Yesterday"),
            selected: isSameDay(yesterday, firstDate.value) && !isSameDay(lastMonday, firstDate.value)
        },
        {
            name: "last-monday",
            value: CalendarStart.LastMonday,
            label: t("orders.calendar.parameters.Last Monday"),
            selected: isSameDay(lastMonday, firstDate.value)
        }
    ];
});


const setFirstDate = (start: CalendarStart) => {
    parametersStore.setFirstDate(start);
};

</script>
<style scoped lang="scss"></style>
