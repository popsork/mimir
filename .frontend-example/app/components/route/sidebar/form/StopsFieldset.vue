<template lang="pug">
fieldset(data-name="stops")
    .header
        h3 {{ stopsHeadingText }}

        GenericButton(
            :title="$t('route.actions.Add stop')"
            type="alternative-ghost"
            size="small"
            icon="plus"
            v-on:click="showDialog"
        )

    VueDraggable(v-model="plannedRouteStopIds" v-bind="draggableProps" v-on:start="onDragStart" v-on:end="onDragEnd")
        TransitionGroup(type="transition" tag="div" :name="!dragging ? 'fade' : undefined" class="stops")
            template(v-if="plannedRouteStopIds.length")
                RouteSidebarFormStop(
                    v-for="routeStopId in plannedRouteStopIds"
                    :key="routeStopId"
                    :route-stop-id="routeStopId"
                )
            template(v-else)
                RouteSidebarNoItemsMessage
                    p {{ $t('route.messages.Click a pin or drag a stop to start planning') }}

    h3(class="unplanned-stops") {{ $t('route.headings.Unplanned stops') }}

    VueDraggable(v-model="unplannedRouteStopIds" v-bind="draggableProps" v-on:start="onDragStart" v-on:end="onDragEnd")
        TransitionGroup(type="transition" tag="div" :name="!dragging ? 'fade' : undefined" class="stops")
            template(v-if="unplannedRouteStopIds.length")
                RouteSidebarFormStop(
                    v-for="routeStopId in unplannedRouteStopIds"
                    :key="routeStopId"
                    :route-stop-id="routeStopId"
                )
            template(v-else)
                RouteSidebarNoItemsMessage(v-if="!unplannedRouteStopIds.length")
                    SvgImage(class="icon" name="circled-tick")
                    p {{ $t('route.messages.All stops planned') }}

    RouteAddStopDialog(v-if="shouldShowDialog")
</template>
<script setup lang="ts">
import { VueDraggable } from "vue-draggable-plus";

const formStore = useRouteFormStore();
const { routeRecord } = storeToRefs(formStore);

const stopsStore = useRouteFormRouteStopsStore();
const addStopStore = useRouteAddStopStore();
const { plannedRouteStopIds, unplannedRouteStopIds } = storeToRefs(stopsStore);
const { shouldShowDialog } = storeToRefs(addStopStore);

const { t } = useI18n();
const stopsHeadingText = computed(() => {
    const parts = [
        t("route.headings.Planned route")
    ];

    const timePart = totalRouteTimeText.value;
    if (timePart) {
        parts.push(`: ${timePart}`);
    }

    return parts.join("");
});

const totalRouteTimeText = computed(() => {
    const totalTime = routeRecord.value?.getTotalTimeInMinutes();
    if (!totalTime) {
        return null;
    }

    return localizeDuration(totalTime);
});

const dragging = ref(false);
const draggableProps = computed(() => {
    return {
        animation: 150,
        target: ".stops",
        handle: ".sorting-handle",
        draggable: ".route-stop", // to prevent the no-items messages from being draggable as well
        swapThreshold: 0.3,
        group: "stops"
    };
});

const onDragStart = () => {
    dragging.value = true;
};

const onDragEnd = () => {
    nextTick(() => {
        dragging.value = false;
    });
};

const showDialog = () => {
    shouldShowDialog.value = true;
};

</script>
<style scoped lang="scss">
fieldset {
    display: flex;
    flex-direction: column;
    gap: steps(1);

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    h3 {
        color: $color-text-normal;
        @include normal-medium-text;

        &.unplanned-stops {
            border-top: 2px solid $color-border-normal;
            padding-top: steps(2);
        }
    }

    .stops {
        display: flex;
        flex-direction: column;
        gap: steps(1);
    }
}
</style>
