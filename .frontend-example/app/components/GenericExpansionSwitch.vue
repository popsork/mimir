<template lang="pug">
button.expansion-switch(type="button" v-on:click="toggleExpansion")
    SvgImage(class="icon" :name="iconName" :alt="title")
</template>
<script setup lang="ts">

const expanded = defineModel<boolean>();

const toggleExpansion = (event: MouseEvent) => {
    expanded.value = !expanded.value;
    event.stopPropagation();
};

const iconName = computed(() => {
    return expanded.value ? "chevron-down" : "chevron-right";
});

const { t } = useI18n();
const title = computed(() => {
    return expanded.value ? t("general.Collapse") : t("general.Expand");
});


</script>
<style scoped lang="scss">
button {
    @include clickable-button;

    :deep(.icon) {
        &,
        svg {
            width: steps(2.5);
            height: steps(2.5);
        }
    }
}
</style>
