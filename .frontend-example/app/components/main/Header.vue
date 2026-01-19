<template lang="pug">
header(ref="header")
    MainHeaderLogo
    MainHeaderMenu
    MainHeaderSearch
    MainHeaderExternalLinks
    LocaleSwitch
    template(v-if="userAuthenticated")
        MainHeaderUser
        MainHeaderSignOut
</template>
<script setup lang="ts">

useElementHeightTracking("pageHeader", useTemplateRef("header"));

const { userAuthenticated } = storeToRefs(useAuthenticationStore());


</script>
<style scoped lang="scss">
header {
    display: flex;
    height: steps(6);
    @include content-padding;

    background-color: $color-background-light;
    border-bottom: 1px solid $color-border-normal;

    .logo {
        margin-right: steps(3);
    }

    .search {
        margin-left: steps(3);
    }

    .help {
        margin-left: auto;
    }

    .locale-switch,
    .user {
        margin-left: steps(5);
    }

    .sign-out {
        margin-left: steps(3);
    }
}
</style>
