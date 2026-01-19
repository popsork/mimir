<template lang="pug">
.active-tab-content(:style="{ height: `${availableHeight}px` }" :data-name="activeTabName")
    component(:is="activeTabContentComponent" v-if="activeTabContentComponent")
</template>
<script setup lang="ts">
import {
    OrderFormTransport,
    OrderFormSpecification,
    OrderFormDebitRows,
    OrderFormGoods,
    OrderFormDocuments,
    OrderFormDeviations,
    OrderFormHistory,
    OrderFormSchedule,
} from "#components";

const props = defineProps<{
    tab: OrderFormTabName,
}>();

const activeTabName = computed(() => {
    return props.tab;
});

const activeTabContentComponent = computed(() => {
    switch (activeTabName.value) {
        case OrderFormTabName.Transport: return OrderFormTransport;
        case OrderFormTabName.Specification: return OrderFormSpecification;
        case OrderFormTabName.DebitRows: return OrderFormDebitRows;
        case OrderFormTabName.Goods: return OrderFormGoods;
        case OrderFormTabName.Documents: return OrderFormDocuments;
        case OrderFormTabName.Deviations: return OrderFormDeviations;
        case OrderFormTabName.History: return OrderFormHistory;
        case OrderFormTabName.Schedule: return OrderFormSchedule;
    }

    return null;
});

const { heights } = storeToRefs(useDimensionsStore());

const reservedHeight = computed(() => {
    return heights.value.pageHeader +
        heights.value.orderFormHeader +
        heights.value.orderFormTabSelector +
        heights.value.orderFormFooter;
});

const { height: windowHeight } = useWindowSize({ includeScrollbar: true, type: "inner" });

const availableHeight = computed(() => windowHeight.value - reservedHeight.value);

</script>
<style scoped lang="scss">
.active-tab-content {
    display: flex;
    flex-direction: column;
    gap: steps(1.5);

    @include content-padding;
    padding-top: steps(1.5);
    padding-bottom: steps(2);

}
</style>
