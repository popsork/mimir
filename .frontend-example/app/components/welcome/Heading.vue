<template lang="pug">
h1.heading {{ $t('welcome.Welcome back') }}
</template>
<script setup lang="ts">

</script>
<style scoped lang="scss">
.heading {
    @include normal-title;
    margin: steps(4) 0;
    text-align: center;
}
</style>
