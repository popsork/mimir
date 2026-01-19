<template lang="pug">
.sidebar
    .header
        GenericButton(
            v-if="props.closeable"
            icon="chevron-right"
            size="small"
            type="alternative-ghost"
            :title="$t('general.Close')"
            v-on:click="closeSidebar"
        )
        h2.title {{ props.title }}
    .body
        slot
    .footer(v-if="slots.footer")
        slot(name="footer")
</template>
<script setup lang="ts">
const emit = defineEmits<{
    (e: "close"): void,
}>();

const props = withDefaults(defineProps<{
    title: string,
    closeable?: boolean,
}>(), {
    closeable: true,
});

const slots = useSlots();
const closeSidebar = () => {
    emit("close");
};

</script>
<style scoped lang="scss">
.sidebar {
    height: 100%;
    background-color: $color-background-lighter;
    display: flex;
    flex-direction: column;

    .header {
        @include content-padding;
        display: flex;
        flex-wrap: wrap;
        gap: 0;
        align-items: center;
        padding-top: steps(2);
        padding-bottom: steps(1.5);
        flex: 0 0 auto;

        .title {
            @include large-medium-text;
        }
    }

    .body {
        @include content-padding;
        overflow-y: scroll;
        flex: 1 1 auto;
    }

    .footer {
        @include content-padding;
        flex: 0 0 auto;
    }
}
</style>
