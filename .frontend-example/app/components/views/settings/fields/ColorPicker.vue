<template lang="pug">
.color-picker(:style="colorPickerStyle")
    FormPopoverField(:show-arrow="false" :label="$t('views.view_settings.fields.Tab color')" placement="bottom-start" class="popover")
        template(v-slot:popover)
            .color-grid
                button.color(
                    v-for="color in availableColors"
                    :key="color"
                    :title="$t('views.view_settings.fields.Select')"
                    :style="{ 'background-color': color }"
                    :class="color === colorValue ? 'active' : ''"
                    v-on:click="selectColor(color)"
                )
</template>
<script setup lang="ts">
const colorValue = defineModel<string | null>();

const colorPickerStyle = computed(() => {
    if (!colorValue.value) {
        return undefined;
    }

    return {
        "--trigger-button-background-color": colorValue.value
    };
});

const availableColors = computed(() => {
    return [
        "#EEEEF0",
        "#B2E7F3",
        "#B7EBC1",
        "#BBD2F6",
        "#F8EF87",
        "#D7F4DD",
        "#DADCE1",
        "#DAB1DC",
        "#DFEAFB",
        "#F0B2B2",
        "#F3DCF4",
        "#FCC5C5",
        "#FCD4D4",
        "#FDD8A0",
        "#FEECCD",
    ];
});

const selectColor = (color: string) => {
    colorValue.value = color;
};
</script>
<style scoped lang="scss">
.color-picker {
    --trigger-button-background-color: #{$color-background-light};

    .popover {
        :deep(.trigger) {
            width: steps(4.5);
            height: steps(4.5);
            border: 1px solid $color-border-darker;
            border-radius: steps(0.5);
            cursor: pointer;
            background-color: var(--trigger-button-background-color);
        }
    }
}

.color-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: steps(1);
}

.color {
    width: steps(4.5);
    height: steps(4.5);
    border: 1px solid transparent;
    border-radius: steps(0.5);
    cursor: pointer;

    &:hover {
        border-color: $color-border-normal;
    }

    &.active {
        border-color: $color-border-darker;
    }
}
</style>
