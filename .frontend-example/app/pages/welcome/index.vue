<template lang="pug">
.welcome.page
    WelcomeHeading
    WelcomePasswordForm
    WelcomeOtherMethods
</template>
<script setup lang="ts">
definePageMeta({
    layout: "welcome",
    anonymousAccess: true,
    authenticatedAccess: false
});


</script>
<style scoped lang="scss">
.welcome.page {
    width: steps(37);
    padding-bottom: steps(12);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
}
</style>
