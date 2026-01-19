<template lang="pug">
.authentication-callback.page
    WaitingIndicator
</template>
<script setup lang="ts">
definePageMeta({
    layout: "welcome",
    anonymousAccess: true,
    authenticatedAccess: false
});

const route = useRoute();

const store = useAuthenticationStore();

const code = String(route.query.code);


onMounted(async () => {
    // this needs to be put inside a mounted hook in order to correctly handle API errors.
    // the wrapper inside of this code which displays any unexpected API errors, rethrows the unexpected error,
    // and if it happens directly in the setup function scope, nuxt throws a global error and displays nothing.
    // wrapping this in an onMounted hook helps with that.

    await store.processExternalAuthenticationCode({ code });

    // if the authentication succeeded, redirecting to index will then redirect the signed in user to an internal page.
    // if the authentication failed, redirecting to index will show the welcome page and will display an error message
    goToRoute({ name: "index" });
});


</script>
<style scoped lang="scss">
.authentication-callback.page {
    .waiting-indicator {
        width: steps(4);
        height: steps(4);
    }
}
</style>
