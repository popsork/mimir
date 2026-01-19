<template lang="pug">
ul.menu
    li(v-for="link in links" :key="link.to.name" :data-name="link.to.name")
        NuxtLink(:to="link.to" :class="{ 'active': isLinkActive(link.to) }")
            span {{ link.text }}
</template>
<script setup lang="ts">
const { t } = useI18n();

const links = computed(() => {
    return [
        {
            to: { name: "orders" },
            text: t("navigation.pages.Orders")
        },
        {
            to: { name: "invoicing" },
            text: t("navigation.pages.Invoicing")
        },
        {
            to: { name: "self-billing" },
            text: t("navigation.pages.Self billing")
        },
        {
            to: { name: "clients" },
            text: t("navigation.pages.Clients")
        },
        {
            to: { name: "vehicles" },
            text: t("navigation.pages.Vehicles")
        },
        {
            to: { name: "settings" },
            text: t("navigation.pages.Settings")
        },
    ];
});

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

    li {

        a {
            display: flex;
            height: 100%;
            padding: 0 steps(2);
            align-items: center;
            text-decoration: none;
            color: $color-text-lightest;

            &:hover {
                background: $color-background-darker;
            }

            &.active {
                background: $color-background-darker;
                color: $color-text-normal;

            }

        }
    }

}
</style>
