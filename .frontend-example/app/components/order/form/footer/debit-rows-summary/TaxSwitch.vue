<template lang="pug">
FormSwitchField(
    v-model="withTax"
    name="with-tax"
    layout="inline"
    label-position="before"
    :label="$t('order.summaries.debit_rows.fields.Show totals with tax')"
)
</template>
<script setup lang="ts">


const withTax = defineModel<boolean>();

</script>
<style scoped lang="scss"></style>
