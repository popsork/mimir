<template lang="pug">
GenericBadge(v-bind="badgeProps")
</template>
<script setup lang="ts">

const props = defineProps<{
    text: string,
    status: TransportOrderStatusName,
    size?: "large" | "small" | "medium",
}>();

const badgeProps = computed(() => {
    const result = {
        text: props.text,
    } as { text: string, size?: "large" | "small" | "medium", color?: string };

    if (props.size) {
        result.size = props.size;
    }

    const color = getOrderStatusColor(props.status);
    if (color) {
        result.color = color;
    }
    return result;
});

</script>
<style scoped lang="scss"></style>
