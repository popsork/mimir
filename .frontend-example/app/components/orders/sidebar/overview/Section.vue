<template lang="pug">
.section
    .title(v-if="title") {{ props.title }}
    dl
        OrdersSidebarOverviewItem(
            v-for="item in items"
            :key="item.name"
            v-bind="item"
        )
</template>
<script setup lang="ts">
import type { OrdersSidebarOverviewSectionItem } from "~/components/orders/sidebar/overview/Item.vue";

const props = defineProps<{
    title?: string,
    items: OrdersSidebarOverviewSectionItem[],
}>();

</script>
<style scoped lang="scss">
.section {
    display: flex;
    flex-direction: column;
    margin-bottom: steps(1.5);

    .title {
        @include normal-medium-text;
        color: $color-text-normal;
        margin-bottom: steps(0.5);
    }
    dl {
        @include block-list;
        display: grid;
        grid-template-columns: 1fr 1fr;
        column-gap: steps(1);
        row-gap: 2px;
    }
}
</style>
