<template lang="pug">
FormInputField(
    v-model="form.destination.location.country"
    name="country"
    size="large"
    :label="$t('locations.fields.Country')"
    :errors="errors"
)
</template>
<script setup lang="ts">

const store = useOrderFormLocationDialogStore();

const { form } = storeToRefs(store);

const errors = computed(() => store.getErrorsForField("country"));

</script>
<style scoped lang="scss"></style>
