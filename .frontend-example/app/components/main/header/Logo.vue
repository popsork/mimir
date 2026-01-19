<template lang="pug">
.logo
    NuxtLink(:to="{ name: 'index' }")
        img(src="~/assets/images/logo.png" alt="")
        span.text {{ $t('general.MOTUS TMS') }}
</template>
<script setup lang="ts">

</script>
<style scoped lang="scss">
.logo {
    @include logo-text;

    a {
        display: flex;
        height: 100%;

        text-decoration: none;

        align-items: center;

        img {
            height: 30px;
            width: 30px;
            margin-right: steps(1);
        }
    }

}
</style>
