<template lang="pug">
.sidebar
    .header
        h2.title {{ $t('route.headings.Route') }}
    .body
        template(v-if="routeStopsExist")
            RouteSidebarForm
        template(v-else)
            RouteSidebarNoItemsMessage
                p {{ $t('route.messages.No items to plan') }}
    .footer
        .actions
            GenericButton(
                type="primary"
                button-type="submit"
                form="route-form"
                icon="ticked-circle"
                :waiting-for="WaitingFor.RouteFormRouteSaving"
                :disabled="!savingIsEnabled"
            ) {{ $t("general.Save") }}
</template>
<script setup lang="ts">
const store = useRouteFormStore();

const { routeRecord, savingIsEnabled } = storeToRefs(store);

const routeStops = computed(() => {
    if (!routeRecord.value.routeStops) {
        return [];
    }
    return routeRecord.value.routeStops;
});

const routeStopsExist = computed(() => {
    return routeStops.value.length > 0;
});

</script>
<style scoped lang="scss">
.sidebar {
    height: 100%;
    background-color: $color-background-lighter;
    display: flex;
    flex-direction: column;

    .header {
        @include content-padding;
        display: flex;
        flex-wrap: wrap;
        gap: 0;
        align-items: center;
        padding-top: steps(2);
        padding-bottom: steps(1.5);
        flex: 0 0 auto;

        .title {
            @include large-medium-text;
        }
    }

    .body {
        @include content-padding;
        overflow-y: scroll;
        flex: 1 1 auto;
    }

    .footer {
        @include content-padding;
        flex: 0 0 auto;

        padding-top: steps(2);

        .actions {
            display: flex;
            gap: steps(1);
            justify-content: center;
            margin-bottom: steps(3);

            .button {
                flex: 1;
            }
        }

    }
}
</style>
