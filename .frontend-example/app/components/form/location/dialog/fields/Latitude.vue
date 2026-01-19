<template lang="pug">
FormReadOnlyField(
    :value="valueText"
    name="latitude"
    size="medium"
    layout="compact"
    :label="$t('locations.fields.Latitude')"
    :errors="errors"
)

</template>
<script setup lang="ts">

const store = useOrderFormLocationDialogStore();

const { form } = storeToRefs(store);

const valueText = computed(() => {
    const value = form.value.destination.location.latitude;
    if (!value) {
        return null;
    }
    return value.toString();
});

const errors = computed(() => store.getErrorsForField("latitude"));

</script>
<style scoped lang="scss"></style>
