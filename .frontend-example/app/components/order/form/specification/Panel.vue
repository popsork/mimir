<template lang="pug">
OrderFormTabPanel(name="specification")
    .rows
        OrderFormSpecificationRow(
            v-for="(specificationRow, index) in specificationRows"
            :key="index"
            ref="rows"
            :index="index"
            :specification-row="specificationRow"
        )
    OrderFormSpecificationAddRowControl( v-on:add="focusLastRow")
</template>
<script setup lang="ts">
import type { SpecificationRow } from "~/models/SpecificationRow";

const { form } = storeToRefs(useOrderFormStore());

const specificationRows = computed(() => {
    return (form.value.order.specificationRows || []) as SpecificationRow[];
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
fieldset[data-name="specification"] {
    padding-top: steps(1);

    .rows {
        margin-bottom: steps(2);
    }
}
</style>
