<template lang="pug">
FormInputField(
    v-model="form.destination.location.streetName"
    name="street-name"
    size="large"
    :label="$t('locations.fields.Street name')"
    :errors="errors"
)
</template>
<script setup lang="ts">

const store = useOrderFormLocationDialogStore();

const { form } = storeToRefs(store);

const errors = computed(() => store.getErrorsForField("street_name"));

</script>
<style scoped lang="scss"></style>
