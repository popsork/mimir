<template lang="pug">
.back-link
    GenericButton(
        :to="invoicesListRoute"
        type="ghost"
        size="medium"
        icon="arrow-left"
        icon-placement="before"
    ) {{ $t('invoicing.process.invoice.actions.Back to list') }}
</template>
<script setup lang="ts">

const route = useRoute();

const invoicesListRoute = computed(() => {
    return {
        name: route.name,
        params: route.params,
        query: undefined
    };
});

</script>
<style scoped lang="scss">
.back-link {
    display: flex;
    justify-content: flex-start;
}
</style>
