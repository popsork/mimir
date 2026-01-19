<template lang="pug">
.logo
    NuxtLink(:to="{ name: 'index' }")
        img(src="~/assets/images/logo.png" :alt="$t('general.MOTUS TMS')")
</template>
<script setup lang="ts">

</script>
<style scoped lang="scss">
.logo {
    width: steps(7);
    height: steps(7);
}
</style>
