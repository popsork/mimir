<template lang="pug">
.page(:data-environment="environment")
    slot
</template>
<script setup lang="ts">

const { environment } = useConfiguration();

useLayoutMetas();

</script>
<style scoped lang="scss"></style>
