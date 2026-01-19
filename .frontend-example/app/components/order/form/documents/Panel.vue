<template lang="pug">
OrderFormTabPanel(name="documents")
    .rows
        OrderFormDocumentsRow(
            v-for="(document, index) in documents"
            :key="index"
            ref="rows"
            :index="index"
            :document="document"
        )
    OrderFormDocumentsAddRowControl(v-on:add="focusLastRow")
</template>
<script setup lang="ts">
import type { DocumentModel } from "~/models/DocumentModel";

const { form } = storeToRefs(useOrderFormStore());

const documents = computed(() => {
    return (form.value.order.documents || []) as DocumentModel[];
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
fieldset[data-name="documents"] {
    padding-top: steps(1);

    .rows {
        margin-bottom: steps(2);
    }
}
</style>
