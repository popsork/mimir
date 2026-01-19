<template lang="pug">
MainContainer
    WelcomeHeader
    LocaleSwitch
    main
        slot
</template>
<script setup lang="ts">
usePageTitle();

useHead({
    bodyAttrs: {
        class: "scrollable"
    },
});

</script>
<style scoped lang="scss">
.page {
    flex: 1;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: $color-background-light;

    .locale-switch {
        position: absolute;
        right: steps(2);
        top: steps(2);
    }
    main {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
    }

    footer {
        margin-top: auto;
    }
}
</style>
