<template lang="pug">
.map.field(data-name="map" :data-expanded="expanded")
    button(class="trigger" type="button" v-on:click="toggleMap")
        span.text {{ $t("locations.dialog.Choose location on a map") }}
        SvgImage(:name="triggerIconName" class="icon")
    .container(v-if="expanded" ref="mapContainer")
</template>
<script setup lang="ts">
const expanded = ref(false);

const toggleMap = () => {
    expanded.value = !expanded.value;
};

const mapContainer = useTemplateRef("mapContainer");

const mapCanBeInitialized = computed(() => {
    return !!mapContainer.value;
});

const triggerIconName = computed(() => {
    return expanded.value ? "chevron-up" : "chevron-down";
});

const { initializeMap } = useFormLocationDialogMap();

const initialize = async () => {
    if (!mapCanBeInitialized.value) {
        return;
    }

    return await initializeMap({ container: mapContainer.value! });
};

watch(mapCanBeInitialized, (canBeInitialized) => {
    if (canBeInitialized) {
        // this will run when the container is ready, meaning that the component has been mounted and expanded
        initialize();
    }
}, { immediate: true });

</script>
<style scoped lang="scss">
.map.field {
    position: relative;
    border: 1px solid $color-border-normal;
    border-radius: $element-border-radius-small;
    padding: 0 steps(1);

    &[data-expanded="true"] {
        padding-bottom: steps(1);
    }

    .trigger {
        @include clickable-button;
        display: flex;
        height: steps(4);
        width: 100%;
        align-items: center;
        justify-content: space-between;

        .text {
            @include normal-medium-text;
            color: $color-text-highlight;
        }
    }

    .container {
        height: steps(36);
    }
}
</style>
<style lang="scss">
.form-location-dialog-map-place-search {
    margin-top: steps(1);
    margin-right: steps(1);
    background-color: $color-background-lightest;
    border: none;
    @include dialog-shadow;
    color-scheme: light;
}
</style>
