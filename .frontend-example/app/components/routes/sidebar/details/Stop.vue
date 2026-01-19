<template lang="pug">
li.route-stop(
    v-if="routeStop"
    :data-id="routeStop.id"
)
    RouteStopType(:route-stop="routeStop")
    .info
        .name {{ stopName }}
    .additional
        .city {{ stopCity }}
        .estimated-arrival {{ estimatedArrivalText }}
</template>
<script setup lang="ts">
import type { RouteStop } from "~/models/RouteStop";
const { t } = useI18n();

const props = defineProps<{
    routeStop: RouteStop,
}>();

const stopName = computed(() => {
    return props.routeStop?.name || t("route.Untitled stop");
});

const stopCity = computed(() => {
    return props.routeStop?.city || t("route.Unknown city");
});

const estimatedArrivalText = computed(() => {
    return formatSystemTimeZoneTime(props.routeStop?.estimatedArrivalAt ?? null, { includeDate: false });
});

</script>
<style scoped lang="scss">
li.route-stop {
    @include small-text;

    position: relative;
    display: flex;
    align-items: center;
    margin: 0;
    padding: steps(1);
    gap: steps(1);

    .route-stop-type {
        position: relative;
    }

    .info {
        display: flex;
        flex-direction: column;
        gap: steps(0.5);
        flex: 1;

        .name {
            @include normal-medium-text;
        }
    }

    .additional {
        text-align: right;
    }
}
</style>
