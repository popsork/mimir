<template>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="50" height="50" :data-quantity="quantity">
        <circle cx="120" cy="120" opacity=".6" r="70" />
        <circle cx="120" cy="120" opacity=".3" r="90" />
        <circle cx="120" cy="120" opacity=".2" r="110" />
        <text
            x="50%"
            y="50%"
            dominant-baseline="middle"
            text-anchor="middle"
            class="count"
        >{{ props.count }}
        </text>
    </svg>
</template>
<script setup lang="ts">
import type { ClusterStats } from "@googlemaps/markerclusterer";

const props = defineProps<{
    count: number,
    stats: ClusterStats,
}>();

const quantity = computed(() => props.count > Math.max(10, props.stats.clusters.markers.mean) ? "many" : "few");
</script>
<style scoped lang="scss">
svg {

    &[data-quantity="many"] {
        fill: $color-map-cluster-many;
    }

    &[data-quantity="few"] {
        fill: $color-map-cluster-few;
    }

    .count {
        fill: $color-text-inverted;

        font-family: $font-stack;
        // due to some sizing issues in the map clusterer, this is a completely custom text size
        // the font size is not actually that huge on the screen, as it gets scaled down in the SVG
        @include font-dimensions(64px, 64px, -0.01em);
        font-weight: 500;
    }
}
</style>
