<template lang="pug">
GenericTableCellLink(:to="invoiceRoute")
    slot
</template>
<script setup lang="ts">
import type { Invoice } from "~/models/Invoice";

const props = defineProps<{
    invoice: Invoice,
}>();

const route = useRoute();

const invoiceRoute = computed(() => {
    return {
        name: route.name,
        params: route.params,
        query: {
            invoiceId: props.invoice.id
        },
    };
});


</script>
<style scoped lang="scss"></style>


