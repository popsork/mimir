<template lang="pug">
FormInputField(
    v-model="form.destination.location.city"
    name="city"
    size="large"
    :label="$t('locations.fields.City')"
    :errors="errors"
)
</template>
<script setup lang="ts">

const store = useOrderFormLocationDialogStore();

const { form } = storeToRefs(store);

const errors = computed(() => store.getErrorsForField("city"));

</script>
<style scoped lang="scss"></style>
