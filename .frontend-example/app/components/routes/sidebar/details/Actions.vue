<template lang="pug">
.footer
    .actions(v-if="routeRecord")
        GenericButton(
            type="secondary"
            :to="routeEditingRoute"
            :disabled="!actionsEnabled"
        ) {{ $t("route.actions.Edit route") }}
        GenericButton(
            :disabled="!actionsEnabled"
            v-on:click="initializeDialog(RouteActionType.UpdateStatus)"
        ) {{ $t("route.actions.Update route status") }}
        GenericButton(
            icon="calendar-inward"
            :disabled="!actionsEnabled"
            v-on:click="initializeDialog(RouteActionType.Plan)"
        ) {{ $t("route.actions.Plan") }}
        GenericButton(
            icon="arrow-outward"
            :disabled="!actionsEnabled"
            v-on:click="initializeDialog(RouteActionType.Dispatch)"
        ) {{ $t("route.actions.Dispatch") }}
</template>
<script setup lang="ts">
const routeActionsStore = useRoutesListActionsStore();
const { initializeDialog } = routeActionsStore;
const { routeRecord } = storeToRefs(routeActionsStore);

const routeEditingRoute = computed(() => {
    return { name: "routes-id", params: { id: routeRecord.value!.id } };
});

const routeListStore = useRoutesListRoutesStore();

const { isSingleRouteSelected } = storeToRefs(routeListStore);

const actionsEnabled = computed(() => {
    return isSingleRouteSelected.value;
});

</script>
<style scoped lang="scss">
.footer {
    @include content-padding;
    flex: 0 0 auto;

    padding-top: steps(2);

    .actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: steps(1);
        justify-content: center;
        margin-bottom: steps(3);

        .button {
            flex: 1;
        }
    }
}
</style>
