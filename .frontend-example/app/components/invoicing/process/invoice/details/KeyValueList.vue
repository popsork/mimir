<template lang="pug">
dl.list(:style="{ 'columns': columns }")
    div(v-for="(item, index) in values" :key="index" :class="getItemClass(index)")
        dt {{ item.label }}
        dd {{ item.value }}
</template>
<script setup lang="ts">

const props = defineProps<{
    values: {
        label: string,
        value: string | number | null | undefined,
    }[],
    columns: number,
    breakAfterItems?: number | number[],
}>();

const breakAfterItemIndexes = computed(() => {
    if (!props.breakAfterItems) {
        return [];
    }
    const itemNumbers = (!Array.isArray(props.breakAfterItems) ? [props.breakAfterItems] : props.breakAfterItems);

    const indices = itemNumbers.map(num => num - 1);

    return indices;
});

const shouldBreakAfterIndex = (index: number) => {
    return breakAfterItemIndexes.value.includes(index);
};

const getItemClass = (index: number) => {
    return {
        "last-in-column": shouldBreakAfterIndex(index),
    };
};

</script>
<style scoped lang="scss">
.list {
    @include block-list;

    > div {
        break-inside: avoid;
        margin-bottom: steps(1);

        &.last-in-column {
            // at the time of writing, this is not supported by Firefox, so there it falls back to auto-breaking the columns
            break-after: column;
        }

        > dt {
            @include small-text;
        }

        > dd {
            @include normal-medium-text;
            white-space: pre-line;
        }
    }
}
</style>
