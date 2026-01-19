<template lang="pug">
OrdersSidebarOverviewSection(
    v-if="orderInfo"
    :title="$t('orders.sidebar.order_info.Order info')"
    :items="items"
)
</template>
<script setup lang="ts">
const { t } = useI18n();

const detailsSidebarStore = useOrdersDetailsSidebarStore();
const { orderInfo } = storeToRefs(detailsSidebarStore);

const items = computed(() => {
    if (!orderInfo.value) {
        return [];
    }
    return [
        {
            name: "number",
            label: t("orders.sidebar.order_info.Number"),
            value: orderInfo.value.number
        },
        {
            name: "waybill",
            label: t("orders.sidebar.order_info.Waybill"),
            value: orderInfo.value.waybill
        },
        {
            name: "markings",
            label: t("orders.sidebar.order_info.Markings"),
            value: orderInfo.value.markings
        },
        {
            name: "status",
            label: t("orders.sidebar.order_info.Status"),
            value: orderInfo.value.status
        },
        {
            name: "sender-reference",
            label: t("orders.sidebar.order_info.Sender reference"),
            value: orderInfo.value.senderReference
        },
        {
            name: "recipient-reference",
            label: t("orders.sidebar.order_info.Recipient reference"),
            value: orderInfo.value.recipientReference
        }
    ];
});


</script>
<style scoped lang="scss"></style>
