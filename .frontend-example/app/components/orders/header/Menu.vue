<template lang="pug">
MainSecondaryHeaderMenu(:links="links")
</template>
<script setup lang="ts">
const { t } = useI18n();

const links = computed(() => {
    return [
        {
            to: { name: "orders-list" },
            icon: "list",
            text: t("navigation.pages.orders.List")
        },
        {
            to: { name: "orders-calendar" },
            icon: "calendar",
            text: t("navigation.pages.orders.Calendar")
        },
        {
            to: { name: "orders-map" },
            icon: "map",
            text: t("navigation.pages.orders.Map")
        },
        {
            to: { name: "routes-list" },
            icon: "route",
            text: t("navigation.pages.Routes")
        },
        {
            to: { name: "order-templates-list" },
            icon: "template",
            text: t("navigation.pages.Templates")
        },
    ];
});

</script>
<style scoped lang="scss"></style>
