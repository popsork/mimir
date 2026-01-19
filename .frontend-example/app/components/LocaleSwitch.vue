<template lang="pug">
ul.locale-switch
    li(v-for="locale in locales" :key="locale" :class="{ active: getCurrentLocale() === locale }")
        button(type="button" v-on:click="setLocale(locale)") {{ $t(`navigation.locales.${locale}`) }}
</template>
<script setup lang="ts">

const locales = Object.values(SiteLocale);

const i18nStore = useI18nStore();

const setLocale = (locale: SiteLocale) => {
    i18nStore.setLocale(locale);
};

</script>
<style scoped lang="scss">
.locale-switch {
    @include block-list;
    display: flex;
    align-items: center;
    gap: steps(1);

    button {
        @include normal-text;
        @include clickable-button;
    }

    .active {
        button {
            @include normal-strong-text;
        }
    }

}
</style>
