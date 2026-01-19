<template lang="pug">
OrdersSidebarOverviewSection(
    v-if="customerInfo"
    :title="$t('orders.sidebar.customer_info.Customer info')"
    :items="items"
)
</template>
<script setup lang="ts">
const { t } = useI18n();

const detailsSidebarStore = useOrdersDetailsSidebarStore();
const { customerInfo } = storeToRefs(detailsSidebarStore);

const items = computed(() => {
    if (!customerInfo.value) {
        return [];
    }
    return [
        {
            name: "short-name",
            label: t("orders.sidebar.customer_info.Short name"),
            labelVisible: false,
            value: customerInfo.value.shortName,
        },
        {
            name: "name",
            label: t("orders.sidebar.customer_info.Name"),
            labelVisible: false,
            value: customerInfo.value.name
        },
        {
            name: "number",
            label: t("orders.sidebar.customer_info.Customer number"),
            value: customerInfo.value.number
        },
        {
            name: "subcustomer-name",
            label: t("orders.sidebar.customer_info.Subcustomer name"),
            value: customerInfo.value.subcustomerName
        }
    ];
});

</script>
<style scoped lang="scss"></style>
