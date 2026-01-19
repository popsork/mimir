<template lang="pug">
.icon(v-if="icon")
    SvgImage(:name="icon")
</template>
<script setup lang="ts">

const props = defineProps<{
    position: StopPosition,
}>();

const icon = computed(() => {
    switch (props.position) {
        case StopPosition.First:
            return "arrow-start";
        case StopPosition.Last:
            return "arrow-end";
        case StopPosition.Middle:
            return "map-pin";
        default:
            return null;
    }
});

</script>
<style scoped lang="scss">
.icon {
    display: flex;
    width: steps(3);
    justify-content: center;
}
</style>
