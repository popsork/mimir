<template lang="pug">
FormReadOnlyField(
    :value="valueText"
    name="longitude"
    size="medium"
    layout="compact"
    :label="$t('locations.fields.Longitude')"
    :errors="errors"
)
</template>
<script setup lang="ts">

const store = useOrderFormLocationDialogStore();

const { form } = storeToRefs(store);

const valueText = computed(() => {
    const value = form.value.destination.location.longitude;
    if (!value) {
        return null;
    }
    return value.toString();
});

const errors = computed(() => store.getErrorsForField("longitude"));

</script>
<style scoped lang="scss"></style>
