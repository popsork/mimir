<template lang="pug">
OrdersSidebarOverviewSection(v-if="instructions" :items="items")
</template>
<script setup lang="ts">
const { t } = useI18n();

const detailsSidebarStore = useOrdersDetailsSidebarStore();
const { instructions } = storeToRefs(detailsSidebarStore);

const items = computed(() => {
    if (!instructions.value) {
        return [];
    }
    return [
        {
            name: "planner-instructions",
            label: t("orders.sidebar.instructions.Transport management instructions"),
            value: instructions.value.plannerInstructions,
            multiline: true,
        },
        {
            name: "driver-instructions",
            label: t("orders.sidebar.instructions.Driver instructions"),
            value: instructions.value.driverInstructions,
            multiline: true,
        }
    ];
});

</script>
<style scoped lang="scss">
.section {
    :deep(.item) {
        grid-column: span 2;
        margin-bottom: steps(1.5);

        &,
        dt,
        dd {
            display: block;
        }

        dt {
            margin-bottom: steps(0.5);
        }
    }

}
</style>
