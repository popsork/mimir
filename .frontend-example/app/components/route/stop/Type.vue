<template lang="pug">
.route-stop-type {{ typeLabel }}
</template>
<script setup lang="ts">
import type { RouteStop } from "~/models/RouteStop";

const props = defineProps<{
    routeStop: RouteStop,
}>();

const typeLabel = computed(() => {
    switch (props.routeStop?.routeStopType) {
        case RouteStopType.Pickup:
            return "P";
        case RouteStopType.Delivery:
            return "D";
        case RouteStopType.Manual:
            return "S";
        default:
            return null;
    }
});

</script>
<style scoped lang="scss">
.route-stop-type {
    background: $color-background-inverted-highlight;
    color: $color-text-inverted;
    border-radius: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    $size: steps(2.5);

    height: $size;
    width: $size;

    @include normal-medium-text;
}
</style>
