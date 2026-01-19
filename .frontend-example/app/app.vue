<template lang="pug">
NConfigProvider(:theme-overrides="motusNaiveUiTheme")
    NMessageProvider
        NuxtLayout
            NuxtPage
            ApiError(v-if="apiError")
        PrimeVueStyleFix
</template>
<script setup lang="ts">
import { motusNaiveUiTheme } from "~/naive-ui.config";

const apiStore = useApiStore();
const apiError = computed(() => apiStore.error);

useAuthenticationStateTracking();

usePrimeVueConfiguration();

</script>
<style scoped lang="scss"></style>
