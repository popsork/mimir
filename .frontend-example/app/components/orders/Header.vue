<template lang="pug">
MainSecondaryHeader(class="orders-header")
    OrdersHeaderMenu
    GenericButton(type="primary" size="small" icon="plus" :to="{ name: 'orders-new' }") {{ $t("orders.actions.Create new order") }}
    OrdersListHeaderTools(v-if="shouldShowListTools")
    OrdersMapHeaderTools(v-if="shouldShowMapTools")
    OrdersCalendarHeaderTools(v-if="shouldShowCalendarTools")
    RoutesHeaderTools(v-if="shouldShowRouteTools")
    OrdersTemplatesHeaderTools(v-if="shouldShowTemplateTools")
</template>
<script setup lang="ts">
const route = useRoute();

const shouldShowListTools = computed(() => {
    return route.name === "orders-list" && route.query.view;
});

const shouldShowMapTools = computed(() => {
    return route.name === "orders-map" && route.query.view;
});

const shouldShowCalendarTools = computed(() => {
    return route.name === "orders-calendar" && route.query.view;
});

const shouldShowRouteTools = computed(() => {
    return route.name === "routes-list";
});

const shouldShowTemplateTools = computed(() => {
    return route.name === "order-templates-list";
});

const actionsStore = useOrderActionStore();
actionsStore.loadActionsIfNeeded();

</script>
<style scoped lang="scss">
.orders-header {
    > .menu {
        margin-right: steps(1);
    }

    > .tools {
        margin-left: auto;
    }

    .button {
        margin-right: steps(2);
    }
}
</style>
