<template lang="pug">
MainSecondaryHeader(class="invoicing-header")
    InvoicingHeaderMenu
    GenericButton(type="primary" size="small" icon="plus" v-on:click="showInvoicingDialog") {{ $t("invoicing.orders.actions.Invoice by profile") }}
    InvoicingOrdersHeaderTools(v-if="shouldShowTools")
</template>
<script setup lang="ts">
const route = useRoute();

const shouldShowTools = computed(() => {
    return !!route.query.view;
});

const invoicingStore = useInvoicingOrdersInvoicingStore();

const showInvoicingDialog = () => {
    invoicingStore.initializeInvoicingByProfile();
};

</script>
<style scoped lang="scss">
.invoicing-header {
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
