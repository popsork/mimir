<template lang="pug">
MainSecondaryHeader(class="self-billing-header")
    SelfBillingHeaderMenu
    SelfBillingOrdersHeaderTools(v-if="shouldShowTools")
</template>
<script setup lang="ts">
const route = useRoute();

const shouldShowTools = computed(() => {
    return !!route.query.view;
});


</script>
<style scoped lang="scss">
.self-billing-header {
    > .menu {
        margin-right: steps(1);
    }

    > .tools {
        margin-left: auto;
    }

    .button {
        margin-right: steps(2);
    }
}
</style>
