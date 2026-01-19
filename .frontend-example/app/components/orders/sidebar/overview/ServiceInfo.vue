<template lang="pug">
OrdersSidebarOverviewSection(
    v-if="serviceInfo"
    :title="$t('orders.sidebar.service_info.Service info')"
    :items="items"
)
</template>
<script setup lang="ts">
const { t } = useI18n();

const detailsSidebarStore = useOrdersDetailsSidebarStore();
const { serviceInfo } = storeToRefs(detailsSidebarStore);

const items = computed(() => {
    if (!serviceInfo.value) {
        return [];
    }
    return [
        {
            name: "operation",
            label: t("orders.sidebar.service_info.Operation"),
            value: serviceInfo.value.operation
        },
        {
            name: "service",
            label: t("orders.sidebar.service_info.Service"),
            value: serviceInfo.value.service
        },
        {
            name: "start",
            label: t("orders.sidebar.service_info.Start"),
            value: serviceInfo.value.start
        },
        {
            name: "end",
            label: t("orders.sidebar.service_info.End"),
            value: serviceInfo.value.end
        }
    ];
});

</script>
<style scoped lang="scss"></style>
