<template lang="pug">
.accuracy-indicator(
    :data-accuracy="accuracyValue"
    :title="accuracyLabel"
    :class="{ 'has-label': showLabel }"
)
    SvgImage(class="icon" name="target")
    .label(v-if="showLabel")
        span {{ accuracyLabel }}
</template>
<script setup lang="ts">

const props = defineProps<{
    accuracy: LocationAccuracy | null,
    showLabel?: boolean,
}>();

const { t } = useI18n();

const accuracyValue = computed(() => {
    if (!props.accuracy) {
        return "not-set";
    }
    return props.accuracy;
});


const accuracyLabel = computed(() => {
    if (!props.accuracy) {
        return t("locations.messages.Location not set");
    }
    return [
        t("locations.fields.Accuracy"),
        t(`locations.accuracies.${props.accuracy}`)
    ].join(": ");
});

</script>
<style scoped lang="scss">
.accuracy-indicator {
    display: flex;
    gap: steps(1);
    align-items: center;
    height: steps(2);

    &:not(.has-label) {

        width: steps(2);
    }

    &[data-accuracy="not-set"] {
        color: $color-text-disabled;
    }

    &[data-accuracy="low"],
    &[data-accuracy="very_low"] {
        color: $color-location-accuracy-low;
    }

    &[data-accuracy="moderate"] {
        color: $color-location-accuracy-moderate;
    }

    &[data-accuracy="high"],
    &[data-accuracy="manual"] {
        color: $color-location-accuracy-high
    }

    &.has-label {
        .icon {
            position: relative;
            top: -1px;
        }
    }

    .label {
        @include small-text;
        color: $color-text-lightest;
    }

}
</style>
