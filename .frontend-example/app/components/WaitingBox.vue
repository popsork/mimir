<template lang="pug">
.waiting-box(v-if="waiting")
    WaitingIndicator
slot(v-else)
</template>
<script setup lang="ts">
const props = defineProps<{
    while?: [WaitingFor, WaiterParams] | WaitingFor | boolean,
}>();

const store = useWaitStore();

const waiting = computed(() => {
    if (typeof props.while === "undefined") {
        // if no waiter name or boolean given in props, always show loading box
        return true;
    }

    if (typeof props.while === "boolean") {
        return props.while;
    }

    if (Array.isArray(props.while)) {
        return store.isWaitingFor(props.while[0], props.while[1]);
    }

    return store.isWaitingFor(props.while);
});

</script>
<style scoped lang="scss">
.waiting-box {
    width: 100%;
    min-height: steps(10);
    display: flex;
    align-items: center;
    justify-content: center;

    :deep(.svg) {
        width: steps(5);
        height: steps(5);
        color: $color-text-highlight;
    }
}
</style>
