<template lang="pug">
ButtonGroup(data-name="number-of-days")
    GroupButton(
        v-for="option in dayOptions"
        :key="option.value"
        :selected="option.selected"
        v-on:click="setNumberOfDays(option.value)"
    ) {{ option.label }}
</template>
<script setup lang="ts">

const { t } = useI18n();


const parametersStore = useOrdersCalendarParametersStore();
const { numberOfDays } = storeToRefs(parametersStore);

const dayOptions = computed(() => {
    return [3, 5, 7].map((value) => {
        return {
            value,
            label: t("orders.calendar.parameters.N days", { number: value }),
            selected: value === numberOfDays.value
        };
    });
});


const setNumberOfDays = (value: number) => {
    numberOfDays.value = value;
};

</script>
<style scoped lang="scss"></style>
