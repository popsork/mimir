<template lang="pug">
FormInputField(
    v-model="form.destination.location.postalCode"
    name="postal-code"
    size="large"
    :label="$t('locations.fields.Postal code')"
    :errors="errors"
)
</template>
<script setup lang="ts">

const store = useOrderFormLocationDialogStore();

const { form } = storeToRefs(store);

const errors = computed(() => store.getErrorsForField("postal_code"));

</script>
<style scoped lang="scss"></style>
