<template lang="pug">
OrderFormTabPanel(name="schedule")
    .rows
        OrderFormScheduleRow(
            v-for="(scheduleEntry, index) in scheduleEntries"
            :key="index"
            ref="rows"
            :index="index"
            :schedule-entry="scheduleEntry"
        )
    OrderFormScheduleAddRowControl(v-on:add="focusLastRow")
</template>
<script setup lang="ts">
import type { ScheduleEntry } from "~/models/ScheduleEntry";

const { form } = storeToRefs(useOrderFormStore());

const scheduleEntries = computed(() => {
    return (form.value.order.scheduleEntries || []) as ScheduleEntry[];
});

const rowRefs = useTemplateRef("rows");

const focusLastRow = async () => {
    await nextTick();

    if (!rowRefs.value || rowRefs.value.length < 1) {
        return;
    }

    const lastRow = rowRefs.value[rowRefs.value.length - 1];
    lastRow!.focus();
};


</script>
<style scoped lang="scss">
fieldset[data-name="schedule"] {
    padding-top: steps(1);

    .rows {
        margin-bottom: steps(2);
    }
}
</style>
