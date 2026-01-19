<template lang="pug">
FormInputField(
    v-model="value"
    name="notes"
    :label="$t('stops.fields.Notes')"
    layout="compact"
    :errors="errors"
)
</template>
<script setup lang="ts">

const props = defineProps<{
    stopIndex: number,
}>();

const { getStop } = useOrderFormStopAccessor(() => props.stopIndex);

const { value } = useTextFieldValue({
    recordAccessor: getStop,
    valueAttribute: "notes",
});

const { errors } = useOrderFormFieldErrors({
    recordAccessor: getStop,
    field: "notes"
});

</script>
<style scoped lang="scss"></style>
