<template lang="pug">
GenericButton(
    ref="button"
    name="remove"
    icon="cross"
    :title="title"
    type="alternative-ghost"
    size="large"
    v-on:click="blur"
)
</template>
<script setup lang="ts">

defineProps<{
    title: string,
}>();

const button = useTemplateRef("button");

const blur = () => {
    if (button.value) {
        button.value.blur();
    }
};

</script>
<style scoped lang="scss"></style>
