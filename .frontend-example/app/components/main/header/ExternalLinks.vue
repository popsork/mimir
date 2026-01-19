<template lang="pug">
    .external-links
        NuxtLink(to="https://info.motuslogistik.se/" target="_blank") {{ $t("navigation.Help") }}
        NuxtLink(:to="adminUrl") {{ $t("navigation.Admin") }}
</template>
<script setup lang="ts">
const { apiOrigin } = useConfiguration();
const adminUrl = apiOrigin + "/admin";
</script>
<style scoped lang="scss">
.external-links {
    display: flex;
    gap: steps(5);
    flex-grow: 1;
    justify-content: flex-end;
    align-items: center;

    a {
        @include normal-text;
        @include clickable-button;
    }
}
</style>
