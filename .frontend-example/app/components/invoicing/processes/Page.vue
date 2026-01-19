<template lang="pug">
.invoicing-processes.page(:data-type="type")
    InvoicingHeader
    .body(:style="{ height: `${availableHeight}px` }")
        InvoicingProcessesTable(:processes="processes")
</template>
<script setup lang="ts">
import type { InvoicingProcess } from "~/models/InvoicingProcess";

defineProps<{
    type: "active" | "finished",
    processes: InvoicingProcess[],
}>();

const { height: windowHeight } = useWindowSize({ includeScrollbar: true, type: "inner" });

const { heights } = storeToRefs(useDimensionsStore());

const totalHeaderHeight = computed(() => {
    return heights.value.pageHeader + heights.value.secondaryPageHeader;
});

const availableHeight = computed(() => windowHeight.value - totalHeaderHeight.value);

</script>
<style scoped lang="scss">
.invoicing-processes {
    display: flex;
    flex-direction: column;
    height: 100%;

    .body {
        overflow-y: auto;
        scrollbar-gutter: stable;
        position: relative;
        padding-left: steps(2.5);
    }
}
</style>
