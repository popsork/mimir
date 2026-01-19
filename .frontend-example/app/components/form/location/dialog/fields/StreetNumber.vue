<template lang="pug">
FormInputField(
    v-model="form.destination.location.streetNumber"
    name="street-number"
    size="large"
    :label="$t('locations.fields.Street number')"
    :errors="errors"
)
</template>
<script setup lang="ts">

const store = useOrderFormLocationDialogStore();

const { form } = storeToRefs(store);

const errors = computed(() => store.getErrorsForField("street_number"));

</script>
<style scoped lang="scss"></style>
