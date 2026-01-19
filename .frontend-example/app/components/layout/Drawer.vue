<template lang="pug">
NDrawer( v-model:show="show" v-bind="drawerProps")
    NDrawerContent(:native-scrollbar="false" :closable="false")
        template(v-if="$slots.header" v-slot:header)
            slot(name="header")
        slot
        template(v-if="$slots.footer" v-slot:footer)
            slot(name="footer")
</template>
<script setup lang="ts">
const props = withDefaults(defineProps<{
    name?: string,
    resizable?: boolean,
    containerNode?: HTMLElement | null,
    width?: number | string,
}>(), {
    width: 380
});

const show = defineModel<boolean>("show");

const drawerProps = computed(() => {
    return {
        resizable: props.resizable,
        to: props.containerNode ?? undefined,
        "default-width": props.width,
        "min-width": props.resizable ? props.width : undefined,
        "max-width": 460,
        "trap-focus": false,
        "block-scroll": false,
        "show-mask": false,
        "mask-closable": false,
    };
});

</script>
<style scoped lang="scss">
.n-drawer-content {
    background-color: $color-background-lighter;
    :deep(.n-drawer-header) {
        padding: steps(1) steps(2);
    }
    :deep(.n-drawer-footer) {
        background-color: $color-background-lightest;
        display: block;
        padding: steps(2);
    }
}
</style>
