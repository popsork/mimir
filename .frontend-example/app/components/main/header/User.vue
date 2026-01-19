<template lang="pug">
.user(v-if="user")
    p.name {{ user.name }}
</template>
<script setup lang="ts">

const store = useAuthenticationStore();
const { user } = storeToRefs(store);


</script>
<style scoped lang="scss">
.user {
    display: flex;
    align-items: center;
    .name {
        @include normal-medium-text;
    }
}
</style>
