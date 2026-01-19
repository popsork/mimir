<template lang="pug">
dl
    OrdersSidebarSummaryItem(
        v-for="(item, index) in items"
        :key="index"
        :label="item.label"
        :value="item.value"
    )
</template>
<script setup lang="ts">
defineProps<{
    items: { label: string, value: string | number | null }[],
}>();

</script>
<style scoped lang="scss">
dl {
    @include block-list;
    display: flex;
    gap: steps(1);
    @include content-padding;
    padding-top: steps(1);
    padding-bottom: steps(1);

    .item {
        flex: 1 1;
    }
}
</style>
