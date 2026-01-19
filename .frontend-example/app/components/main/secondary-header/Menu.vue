<template lang="pug">
ul.menu
    li(v-for="link in links" :key="link.to.name" :data-name="link.to.name")
        NuxtLink(:to="link.to" :class="{ 'active': isLinkActive(link.to) }")
            SvgImage(v-if="link.icon" :name="link.icon")
            span {{ link.text }}
</template>
<script setup lang="ts">

defineProps<{
    links: {
        to: { name: string },
        icon: string | null,
        text: string,
    }[],
}>();

const currentRoute = useRoute();

const isLinkActive = (to: { name: string }) => {
    return isRouteActive(to, currentRoute);
};


</script>
<style scoped lang="scss">
.menu {
    @include block-list;
    @include normal-medium-text;

    display: flex;
    height: 100%;
    padding-top: steps(1);

    li {
        a {
            @include tab;

            height: 100%;
            border-bottom: 4px solid transparent; // offset to better match the designs

            &:hover:not(.active) {
                background: $color-background-darker;
            }

            &.active {
                background: $color-background-lightest;
            }

            &:deep(.svg) {
                margin-right: steps(0.5);
            }
        }
    }
}
</style>
