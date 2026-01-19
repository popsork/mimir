<template lang="pug">
.header
    GenericButton(
        icon="chevron-right"
        size="small"
        type="alternative-ghost"
        :title="$t('general.Close')"
        v-on:click="closeSidebar"
    )
    h2.title {{ title }}
</template>
<script setup lang="ts">
defineProps<{
    title: string,
}>();

const sidebarStore = useRoutesListSidebarStore();

const closeSidebar = () => {
    sidebarStore.closeSidebar();
};

</script>
<style scoped lang="scss">
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
</style>
