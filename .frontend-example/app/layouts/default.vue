<template lang="pug">
MainContainer
    MainHeader
    main
        slot
</template>
<script setup lang="ts">
usePageTitle();
</script>
<style scoped lang="scss">
.page {
    flex: 1;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    main {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
}
</style>
