<template lang="pug">
.persistence-indicator(
    :data-persisted="persisted"
    :title="persistenceIndicatorLabel"
)
    SvgImage(class="icon" name="circled-tick")
</template>
<script setup lang="ts">
const props = defineProps<{
    persisted: boolean,
}>();

const { t } = useI18n();

const persistenceIndicatorLabel = computed(() => {
    return props.persisted
        ? t("locations.messages.Using a stored destination")
        : t("locations.messages.Destination not stored");
});

</script>
<style scoped lang="scss">
.persistence-indicator {
    display: flex;
    align-items: center;
    width: steps(2);
    height: steps(2);

    :deep(.icon) {
        &,
        &.svg {
            vertical-align: top;
        }
    }

    &[data-persisted="true"] {
        color: $color-location-accuracy-high; // must match the color of the accuracy indicator when accuracy is high
    }

    &[data-persisted="false"] {
        color: $color-text-disabled; // must match the color of the accuracy indicator when accuracy is not set
    }
}
</style>
