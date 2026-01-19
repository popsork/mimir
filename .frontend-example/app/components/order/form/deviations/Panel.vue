<template lang="pug">
OrderFormTabPanel(name="deviations")
    .rows
        OrderFormDeviationsRow(
            v-for="(deviationRow, index) in deviationRows"
            :key="index"
            ref="rows"
            :index="index"
            :deviation-row="deviationRow"
        )
    OrderFormDeviationsAddRowControl(v-on:add="focusLastRow")
</template>
<script setup lang="ts">
import type { DeviationRow } from "~/models/DeviationRow";

const { form } = storeToRefs(useOrderFormStore());

const deviationRows = computed(() => {
    return (form.value.order.deviationRows || []) as DeviationRow[];
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
fieldset[data-name="deviations"] {
    padding-top: steps(1);

    .rows {
        margin-bottom: steps(2);
    }
}
</style>
