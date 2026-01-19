<template lang="pug">
InvoicingProcessHeaderSection(:title="$t('invoicing.process.sections.Journal')" name="journal")
    InvoicingProcessHeaderFieldGroup(v-for="account in accountValues" :key="account.name" name="account")
        FormReadOnlyField(
            :value="account.value"
            name="account"
            :label="account.name"
            size="large"
            layout="compact"
        )

</template>
<script setup lang="ts">

const accountValues = [
    { name: "Example Account 1", value: localizeCurrencyAmount(1234.56) },
    { name: "Example Account 2", value: localizeCurrencyAmount(3456.78) },
];



</script>
<style scoped lang="scss"></style>
