<template lang="pug">
h3.header
    SvgImage(:name="icon" class="icon")
    div.content
        slot(name="content")
    div.actions
        slot(name="actions")
</template>
<script setup lang="ts">

defineProps<{
    icon: string,
}>();

</script>
<style scoped lang="scss">
.header {
    display: flex;
    align-items: center;
    gap: steps(0.5);

    :deep(.icon) {
        // inverted background color used in non-background context
        // because the icon needds to match the inverted background of the number element next to it
        color: $color-background-inverted;
    }

    .content {
        display: flex;
        align-items: center;
        gap: steps(0.5);
    }

    .actions {
        margin-left: steps(2);
    }

}
</style>
