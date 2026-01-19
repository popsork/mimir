<template lang="pug">
span(
    v-if="imageContent"
    class="svg"
    :class="props.class"
    :data-name="name"
    aria-hidden="true"
    focusable="false"
    :title="alt"
    v-html="imageContent"
)
span.alt(v-if="alt") {{ alt }}
</template>
<script setup lang="ts">
const props = defineProps<{
    name: string,
    alt?: string,
    class?: string | string[],
}>();

const imagesStore = useImagesStore();
const imageContent = computed(() => props.name && imagesStore.svg[props.name]);
</script>
<style scoped lang="scss">
.alt {
    @include visually-hidden;
}
</style>



