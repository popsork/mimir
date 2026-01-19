<template lang="pug">
.sign-out
    GenericButton(type="ghost" icon="exit" v-on:click="signOut()") {{ $t('navigation.actions.Log out') }}
</template>
<script setup lang="ts">

const authenticationStore = useAuthenticationStore();
const signOut = () => {
    authenticationStore.performSignOut();
};

</script>
<style scoped lang="scss">
.sign-out {
    display: flex;
    align-items: center;
}
</style>
